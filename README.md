### Samples
#### Sample 1
![](./docs/sample_2.png)

Find more samples here [samples](./docs/samples.md)

### Installation
```bash
# Clone the repository
git clone https://github.com/username/malaria-detection-cnn
cd malaria-detection-cnn

# Build in release mode
cargo build --release

# Prepare data folders
mkdir -p data/{Parasitized,Uninfected}
# Place the images in the corresponding folders
```

### Data Structure
```
data/
├── Parasitized/          # 13,779 infected images
│   ├── cell_1.png
│   ├── cell_2.png
│   └── ...
└── Uninfected/           # 13,779 healthy images
    ├── cell_1.png  
    ├── cell_2.png
    └── ...
```

### Start Training
```bash
# Balanced mode (recommended)
cargo run --release

# Debug mode (development)
cargo run

# Unit tests
cargo test

# Benchmark
cargo bench
```

## 📁 Project Structure

```
Burn_malaria_model_2/
├── Cargo.toml                 # Rust configuration
├── Cargo.lock                 # Dependency lockfile
├── src/
│   ├── main.rs                # Main entry point
│   ├── config/
│   │   └── model_config.rs    # Hyperparameters configuration
│   ├── model/
│   │   └── malaria_cnn.rs     # CNN architecture
│   ├── data/
│   │   └── dataset.rs         # Dataset and batcher
│   └── training/
│       └── trainer.rs         # Training logic
├── data/                      # Dataset (to create)
│   ├── Parasitized/
│   └── Uninfected/
└── malaria-model-balanced/    # Saved models (auto-generated)
```

## 🎓 Learnings and Insights

### ✅ Technical Wins
1. **Rust Performance**: 50–100x faster than equivalent Python
2. **Memory Optimization**: Efficient handling of 27,558 images
3. **Stable Convergence**: BatchNorm and adaptive learning rate
4. **Quality Preserved**: ~90% of original accuracy with 98% less time

### 🚧 Challenges Faced
1. **Initial Training Time**: 4 days estimated → optimization needed
2. **Memory Management**: Cache vs performance trade-off
3. **Rust Compilation**: Borrow checker learning curve
4. **Data Loading**: Parallelization and I/O optimization

### 🔧 Implemented Solutions
1. **Dimension Reduction**: 128×128 → 80×80 (quality preserved)
2. **Lightweight Architecture**: ~70% fewer parameters
3. **Smart Caching**: Partial preloading and parallelization
4. **Batch Processing**: Increased batch size for CPU optimization

## 🔄 Project Evolution

### Phase 1: Initial Prototype
- ✅ Basic CNN architecture
- ✅ Functional data pipeline
- ✅ Basic training operational

### Phase 2: Performance Optimization  
- ✅ Training time reduced (4 days → 4 hours)
- ✅ Memory and compute optimizations
- ✅ Advanced metrics implemented

### Phase 3: Industrialization
- ✅ Modular and maintainable code
- ✅ Externalized configuration
- ✅ Model save/load

## 🔮 Roadmap and Future Improvements

### 🎯 Short Term (1–2 months)
- [ ] Advanced **Data Augmentation** (rotation, flip, contrast)
- [ ] **Cross-Validation** k-fold for robustness
- [ ] **Visualization** of feature maps and attention
- [ ] **REST API** for production inference

### 🚀 Mid Term (3–6 months)  
- [ ] **Transfer Learning** with pre-trained models
- [ ] **Segmentation** of parasites in cells
- [ ] **Multi-Class Classification** (Plasmodium species)
- [ ] **Mobile Deployment** with ONNX/TFLite

### 🔬 Long Term (6+ months)
- [ ] **Federated Learning** for data privacy
- [ ] **Active Learning** for automatic/semi-automatic annotation
- [ ] **LIS/HIS Integration** with hospital systems
- [ ] **Clinical Validation** across multiple centers

## 🏥 Medical and Societal Impact

### Direct Benefits
- **Accelerated Diagnosis**: Minutes → seconds
- **Accessibility**: Rural areas and limited resources
- **Standardization**: Reduced inter-operator variability
- **Reduced Cost**: Automation of routine analyses

### Potential Applications
1. **Telemedicine**: Remote diagnosis
2. **Mass Screening**: Public health campaigns  
3. **Research**: Analysis of large epidemiological datasets
4. **Education**: Learning tool for lab technicians

## 🤝 Contribution

### Contribution Guide
1. **Fork** the repository
2. **Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit**: `git commit -m 'Add amazing feature'`
4. **Push**: `git push origin feature/amazing-feature`
5. **Pull Request**

### Coding Standards
- **Rustfmt** for formatting
- **Clippy** for lint checks
- **Unit Tests** for each module
- **Comprehensive** documentation

### Local Development
```bash
# Install environment components
rustup component add clippy rustfmt

# Code checks
cargo clippy -- -D warnings
cargo fmt --check

# Tests
cargo test
cargo test -- --nocapture  # With output
```

## 📄 License

This project is distributed under the **MIT** license - see [LICENSE](LICENSE) for more details.

### Academic Citation
If you use this code in research, please cite:
```
@software{malaria_detection_2024,
  author = {FOSSOUO WATO MARTIAL},
  title = {Malaria Detection CNN with Burn Framework},
  year = {2024},
  publisher = {GitHub},
  journal = {GitHub repository},
  howpublished = {\url{https://github.com/rustnew/Malaria_model_2}}
}
```

## 🙏 Acknowledgments

- **Burn Team** for the excellent framework
- **Rust Community** for support and resources
- **NIH** for the public blood smear dataset
- **Contributors** who continuously improve the project


### Run the Inference API (Rust)
```bash
# From the project root
MODEL_PATH=./malaria-model.bin cargo run --bin server
# The API listens by default on http://localhost:8080
```

Endpoints:
- `GET /health` → returns `ok`
- `POST /predict` (multipart/form-data, field `image`) → returns `{ class, probabilities }`

### Run the Inference UI (Vite + React)
```bash
cd inference-ui
# Optional: create a .env.local file to configure the API URL
echo "VITE_API_BASE=http://localhost:8080" > .env.local

npm install
npm run dev   # opens http://localhost:5173
```

In the UI, go to the "Analyze" page (top menu) to:
- upload a blood smear image (drag & drop or file selection)
- send the request to the `/predict` API
- view the predicted class (Parasitized / Uninfected) and probabilities

CORS Note: the server allows any origin in development. For production, restrict origins on the server as needed.
