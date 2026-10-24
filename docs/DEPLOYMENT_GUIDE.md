# PashuDrishti AI: Deployment & Production Guide 🚀

This guide provides end-to-end instructions for deploying **PashuDrishti AI** across multiple environments: Local Development, GitHub Pages, Docker Containers, and Cloud Platforms (Hugging Face Spaces, Render, Railway).

---

## 🌐 1. GitHub Pages (Live Interactive Demo Mode)

The web frontend is deployed to GitHub Pages and accessible to anyone worldwide at:
👉 **[https://vj450-cpu.github.io/cattle-breed-classification/](https://vj450-cpu.github.io/cattle-breed-classification/)**

### How it Works:
- **Instant Client Mode**: The 8 bundled test presets (Gir, Kangayam, Ongole, Sahiwal, Hallikar, Punganur, Vechur, Kankrej) load precomputed Grad-CAM receptive field heatmaps, top-5 confidence rankings, anatomical saliency zones, and lookalike breed analyses directly in the browser with 0 latency.
- **Three.js 3D Studio**: Real-time 3D model rotation, zoom, camera presets, and anatomical trait hotspots run 100% in WebGL.
- **Backend Bridge**: If the user starts the local backend (`python run.py`) or enters a deployed cloud backend URL in settings, the web app automatically connects to live ConvNeXt PyTorch CUDA inference for custom image uploads and camera photos!

### Automated Deployment with GitHub Actions:
The repository includes `.github/workflows/deploy-pages.yml` which automatically syncs `app/static` to GitHub Pages upon pushing to `main`.

---

## 💻 2. Local Setup & Execution

### Prerequisites:
- Python 3.10 or 3.11
- NVIDIA GPU with CUDA 12.1+ (optional, runs on CPU automatically if CUDA unavailable)
- Git

### Installation Steps:
```bash
# 1. Clone the repository
git clone https://github.com/vj450-cpu/cattle-breed-classification.git
cd cattle-breed-classification

# 2. Create virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# 3. Install PyTorch (with CUDA if GPU available)
pip install torch torchvision timm --index-url https://download.pytorch.org/whl/cu121

# 4. Install requirements
pip install -r requirements.txt

# 5. Launch the Platform
python run.py
```
This automatically finds an available port (default `8000`), verifies checkpoint weights, and opens your default browser to `http://localhost:8000`.

---

## 🐳 3. Docker Deployment

### Single-Command Build & Run:
```bash
docker build -t cattle-breed-vision:latest .
docker run -p 8000:8000 -v "/path/to/weights:/app/weights" cattle-breed-vision:latest
```

### Using Docker Compose:
```bash
docker-compose up --build -d
```
Access the application at `http://localhost:8000`.

---

## 🤗 4. Hugging Face Spaces Deployment

Hugging Face Spaces offers free 16GB RAM CPU and NVIDIA T4/A10G GPU tiers, making it ideal for deep learning inference.

1. Create a new Space on [Hugging Face Spaces](https://huggingface.co/spaces) with **Docker** or **Gradio/FastAPI** SDK.
2. Push this repository to your Hugging Face Space git remote:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR_HF_USERNAME>/cattle-breed-classification
   git push hf main
   ```
3. Set the secret `CATTLE_MODEL_PATH` or use `scripts/download_weights.py` to pull the checkpoint during build.

---

## ☁️ 5. Render / Railway Cloud Deployment

The repository includes `render.yaml` and `Procfile` for 1-click cloud container deployment:
- **Render**: Connect your GitHub repository, choose **Web Service**, and select Docker Runtime or Python Runtime with start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Railway**: Connect GitHub repository and deploy using the root `Dockerfile`.
