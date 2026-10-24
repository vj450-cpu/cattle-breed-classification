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

## ☁️ 5. Cloud Deployment on Render (Recommended)

Render provides a **free cloud container web service with a permanent HTTPS URL**, making it the best platform for hosting both the FastAPI backend and interactive frontend together without serverless size limits.

### Option A: 1-Click Blueprint Deploy
1. Click the **Deploy to Render** button or visit:
   👉 **[https://render.com/deploy?repo=https://github.com/vj450-cpu/cattle-breed-classification](https://render.com/deploy?repo=https://github.com/vj450-cpu/cattle-breed-classification)**
2. Sign in with GitHub (`vj450-cpu`).
3. Render automatically discovers `render.yaml` and starts building the Docker container.
4. Once built (2–3 minutes), your service is live 24/7 at:
   `https://pashudrishti-cattle-vision.onrender.com` (or your chosen service name).

### Option B: Manual Web Service Setup
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Select your GitHub repository: `vj450-cpu/cattle-breed-classification`.
3. Choose:
   - **Environment**: `Docker`
   - **Region**: Oregon (or nearest)
   - **Branch**: `main`
   - **Plan**: Free
4. Click **Create Web Service**.

---

## ▲ 6. Vercel Deployment (Frontend + Cloud Backend)

If you prefer a `https://<your-name>.vercel.app` domain:

1. Import your GitHub repository on [Vercel](https://vercel.com/new).
2. Set Root Directory to `./` and Framework Preset to `Other`.
3. Vercel automatically deploys the frontend application with global Edge CDN caching.
4. In the app settings on Vercel, enter your deployed Render backend URL (`https://your-service.onrender.com`) in the **Cloud / Local Backend API URL** setting.
5. All classification, camera captures, and Grad-CAM requests from your Vercel site will route seamlessly to your Render cloud backend!

