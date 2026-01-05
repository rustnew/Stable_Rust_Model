use std::{net::SocketAddr, path::PathBuf};
use std::env;
use std::sync::Arc;

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

// Burn (CPU backend) for native inference
use burn::{
    prelude::Module,
    record::{BinFileRecorder, FullPrecisionSettings, Recorder},
    tensor::Tensor,
};
use burn_ndarray::{NdArray, NdArrayDevice};

// Local, inference-only model definition (no training deps)
#[path = "./malaria_cnn_infer.rs"]
mod malaria_cnn;
use malaria_cnn::MalariaCNN;

#[derive(Clone)]
struct AppConfig {
    image_height: usize,
    image_width: usize,
    num_classes: usize,
}

#[derive(Clone)]
struct BurnState {
    cfg: AppConfig,
    model_path: PathBuf,
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

    // Allow overriding model path via env var MODEL_PATH; default to Burn checkpoint
    let model_path_str = env::var("MODEL_PATH").unwrap_or_else(|_| "./malaria-model.bin".to_string());
    let model_path = PathBuf::from(&model_path_str);

    // Proactive existence check to provide a clearer error message
    if !model_path.exists() {
        let cwd = std::env::current_dir().ok();
        let hint = "Expected a Burn checkpoint (.bin). Ensure the file exists or set MODEL_PATH to the checkpoint path.";
        let cwd_msg = cwd.map(|p| format!(" Current dir: {}.", p.display())).unwrap_or_default();
        anyhow::bail!(
            "Model checkpoint not found at {}. {}{}",
            model_path.display(),
            hint,
            cwd_msg
        );
    }
    println!("Loading Burn checkpoint from {}", model_path.display());
    // Store only config and path in state to keep it Send + Sync
    let state = BurnState { cfg, model_path };

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

async fn predict(State(state): State<BurnState>, mut multipart: Multipart) -> impl IntoResponse {
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

    // Prepare device and model per request (simple and thread-safe)
    let device = NdArrayDevice::default();

    // Build Burn tensor [1, 3, H, W]
    let input_1d: Tensor<NdArray, 1> = Tensor::<NdArray, 1>::from_floats(chw.as_slice(), &device);
    let input: Tensor<NdArray, 4> = input_1d.reshape([1, 3, state.cfg.image_height, state.cfg.image_width]);

    // Instantiate and load model weights
    let mut model: MalariaCNN<NdArray> = MalariaCNN::new(
        &device,
        3, 16, 32, 64, 128, 64, 2, 0.3,
    );
    let record = match BinFileRecorder::<FullPrecisionSettings>::new().load(state.model_path.clone().into(), &device) {
        Ok(r) => r,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to load checkpoint: {:?}", e)).into_response(),
    };
    model = model.load_record(record);

    let logits: Tensor<NdArray, 2> = model.forward(input);
    let logits_data = logits.into_data();
    let logits_vec: Vec<f32> = match logits_data.to_vec::<f32>() {
        Ok(v) => v,
        Err(e) => return (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to read logits: {:?}", e)).into_response(),
    };

    // Softmax
    let probs_vec = softmax(&logits_vec);
    if probs_vec.len() < 2 {
        return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid model output length").into_response();
    }
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
    if v.is_empty() { return vec![]; }
    let max = v.iter().cloned().fold(f32::NEG_INFINITY, f32::max);
    let exps: Vec<f32> = v.iter().map(|x| (*x - max).exp()).collect();
    let sum: f32 = exps.iter().sum();
    exps.into_iter().map(|e| e / sum).collect()
}
