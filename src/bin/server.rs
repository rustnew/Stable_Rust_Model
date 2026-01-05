use std::{net::SocketAddr, path::PathBuf};

use anyhow::{Context, Result};
use axum::{
    extract::{Multipart, State},
    http::{HeaderValue, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use image::{imageops::FilterType, ImageReader};
use serde::Serialize;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};

use tract_onnx::prelude::*;
use tract_onnx::prelude::{TypedRunnableModel, TypedModel};

#[derive(Clone)]
struct AppConfig {
    image_height: usize,
    image_width: usize,
    num_classes: usize,
}

#[derive(Clone)]
struct OnnxState {
    cfg: AppConfig,
    model: TypedRunnableModel<TypedModel>,
}

#[derive(Serialize)]
struct PredictResponse {
    class: String,
    probabilities: [f32; 2],
}

#[tokio::main]
async fn main() -> Result<()> {
    // Inference config must match training
    let cfg = AppConfig {
        image_height: 128,
        image_width: 128,
        num_classes: 2,
    };

    let model_path = PathBuf::from("./malaria-model.onnx");
    let model = load_onnx_model(&model_path, &cfg)?;

    let state = OnnxState { cfg, model };

    // CORS: allow localhost:3000
    let cors = CorsLayer::new()
        .allow_origin(HeaderValue::from_static("http://localhost:3000"))
        .allow_methods([Method::POST, Method::OPTIONS, Method::GET])
        .allow_headers(Any);

    let router = Router::new()
        .route("/health", get(|| async { "ok" }))
        .route("/predict", post(predict))
        .with_state(state)
        .layer(cors);

    let addr: SocketAddr = "0.0.0.0:8080".parse().unwrap();
    println!("API listening on http://{}", addr);
    let listener = TcpListener::bind(addr).await.expect("bind");
    axum::serve(listener, router).await.context("Server error")?;

    Ok(())
}

fn load_onnx_model(path: &PathBuf, cfg: &AppConfig) -> Result<TypedRunnableModel<TypedModel>> {
    let model = tract_onnx::onnx()
        .model_for_path(path)
        .with_context(|| format!("Failed to read ONNX at {}", path.display()))?
        .with_input_fact(0, InferenceFact::dt_shape(f32::datum_type(), tvec!(1, 3, cfg.image_height as i64, cfg.image_width as i64)))?
        .into_optimized()?
        .into_runnable()?;
    Ok(model)
}

async fn predict(State(state): State<OnnxState>, mut multipart: Multipart) -> impl IntoResponse {
    // Pull first part named 'image'
    let mut image_bytes: Option<Vec<u8>> = None;
    while let Ok(Some(field)) = multipart.next_field().await {
        if field.name() == Some("image") {
            match field.bytes().await {
                Ok(b) => { image_bytes = Some(b.to_vec()); break; }
                Err(e) => return (StatusCode::BAD_REQUEST, format!("Invalid image upload: {}", e)).into_response(),
            }
        }
    }

    let image_bytes = match image_bytes { Some(b) => b, None => return (StatusCode::BAD_REQUEST, "No 'image' field provided").into_response() };

    // Decode and preprocess to CHW f32 [0,1]
    let chw = match preprocess_bytes(&image_bytes, state.cfg.image_height, state.cfg.image_width) {
        Ok(v) => v,
        Err(e) => return (StatusCode::BAD_REQUEST, format!("Preprocess failed: {}", e)).into_response(),
    };

    // Build ONNX input tensor [1, 3, H, W]
    let input: Tensor = tract_ndarray::Array4::from_shape_vec(
        (1, 3, state.cfg.image_height, state.cfg.image_width),
        chw,
    )
    .unwrap()
    .into();

    // Run inference
    let result = state.model.run(tvec!(input.into()));
    let outputs = match result { Ok(o) => o, Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("ONNX run failed: {}", e)).into_response() };
    let output = outputs[0].to_array_view::<f32>().unwrap(); // shape [1, 2]
    let logits_dyn = output.index_axis(tract_ndarray::Axis(0), 0).to_owned();
    let logits_vec: Vec<f32> = logits_dyn.iter().copied().collect();

    // Softmax
    let probs_vec = softmax(&logits_vec);
    let probs = [probs_vec[0], probs_vec[1]];
    let class_idx = if probs[1] >= probs[0] { 1 } else { 0 };
    let class = if class_idx == 1 { "Parasitized" } else { "Uninfected" };

    Json(PredictResponse { class: class.to_string(), probabilities: probs }).into_response()
}

fn preprocess_bytes(bytes: &[u8], target_height: usize, target_width: usize) -> Result<Vec<f32>> {
    let img = ImageReader::new(std::io::Cursor::new(bytes))
        .with_guessed_format()
        .context("Unsupported image format")?
        .decode()
        .context("Failed to decode image")?
        .resize_exact(target_width as u32, target_height as u32, FilterType::Triangle)
        .to_rgb8();

    let raw = img.into_raw();
    let frame = target_height * target_width;
    let mut chw = vec![0.0f32; frame * 3];
    for (i, pix) in raw.chunks_exact(3).enumerate() {
        chw[i] = pix[0] as f32 / 255.0;
        chw[i + frame] = pix[1] as f32 / 255.0;
        chw[i + frame * 2] = pix[2] as f32 / 255.0;
    }
    Ok(chw)
}

fn softmax(v: &[f32]) -> Vec<f32> {
    let max = v.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
    let exps: Vec<f32> = v.iter().map(|x| (*x - max).exp()).collect();
    let sum: f32 = exps.iter().sum();
    exps.into_iter().map(|e| e / sum).collect()
}
