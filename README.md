---
title: PashuDrishti AI Cattle Vision
emoji: 🐂
colorFrom: yellow
colorTo: amber
sdk: gradio
sdk_version: 4.20.0
app_file: app.py
pinned: false
license: mit
---

# PashuDrishti AI: Indigenous Cattle Breed Vision & Explainability Platform 🐂🔬

[![Hugging Face Spaces](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces%20Live%20(16GB%20RAM)-yellow.svg)](https://huggingface.co/spaces/vijay450/pashudrishti-cattle-vision)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![PyTorch 2.1+](https://img.shields.io/badge/PyTorch-2.1%2B-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![ConvNeXt-Small](https://img.shields.io/badge/Architecture-ConvNeXt--Small-success.svg)](https://arxiv.org/abs/2201.03545)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Three.js](https://img.shields.io/badge/3D%20Studio-Three.js-black.svg?logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Pages Live](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen.svg?logo=github&logoColor=white)](https://vj450-cpu.github.io/cattle-breed-classification/)

> **A State-of-the-Art Deep Learning & Computer Vision System for 50 Indigenous & Dairy Cattle Breeds**, powered by **ConvNeXt-Small (384×384 bicubic)**, **Grad-CAM visual receptive field heatmaps**, **Tri-Zone anatomical saliency diagnostics**, and an **interactive 3D livestock morphology studio**.

---

## 🌐 Submission URLs & Live Web Deployments

- 🚀 **Live Production Web Application (`G084_Website.url`)**: [https://huggingface.co/spaces/vijay450/pashudrishti-cattle-vision](https://huggingface.co/spaces/vijay450/pashudrishti-cattle-vision) *(Runs with 16 GB RAM + PyTorch ConvNeXt on Hugging Face Spaces)*
- 💻 **Official Source Repository (`G084_Github.url`)**: [https://github.com/vj450-cpu/cattle-breed-classification](https://github.com/vj450-cpu/cattle-breed-classification)
- 📱 **Static Visual Demo (GitHub Pages)**: [https://vj450-cpu.github.io/cattle-breed-classification/](https://vj450-cpu.github.io/cattle-breed-classification/)
- ☁️ **Alternative Cloud Container (Render)**: [https://pashudrishti-cattle-vision.onrender.com](https://pashudrishti-cattle-vision.onrender.com)

The complete interactive web application is packaged and deployed with zero setup required. Explore the 8 high-resolution bundled test presets (Gir, Kangayam, Ongole, Sahiwal, Hallikar, Punganur, Vechur, Kankrej), peel back the split-comparison slider to reveal Grad-CAM attention heatmaps, inspect Top-5 competing candidate breeds, and rotate the 3D anatomical cattle model.


---

## 📸 System Architecture & Pipeline

![Full Pipeline Architecture](assets/images/architecture_diagram.png)

```
                       ┌──────────────────────────────────────────────┐
                       │        Input Specimen Photo / Camera         │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │   YOLOv8 Detection & Auto-Cropping Pipeline  │
                       └──────────────────────┬───────────────────────┘
                                              │
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │   ConvNeXt-Small (384×384 Bicubic Norm)      │
                       │   4 Stages • Inverted Bottlenecks • GELU     │
                       └──────────────┬───────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  Softmax Classification Head │              │    Grad-CAM Backward Hook    │
│  Top-5 Breed Probabilities   │              │   Stage 4 Final Block Grads  │
└──────────────┬───────────────┘              └──────────────┬───────────────┘
               │                                             │
               ▼                                             ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  Lookalike Differentiation   │              │  Tri-Zone Saliency Analysis  │
│  Phenotypic Trait Breakdown  │              │  • Horns & Cranial Crown     │
│  Veterinary Milk / Draught   │              │  • Facial Stop & Muzzle      │
│  Gemini Trait Diagnostics    │              │  • Thoracic Hump & Dewlap    │
└──────────────┬───────────────┘              └──────────────┬───────────────┘
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      ▼
                       ┌──────────────────────────────────────────────┐
                       │  PashuDrishti AI Web Platform (Three.js 3D)  │
                       │  Interactive Split Slider • 5 Heatmap Colors │
                       └──────────────────────────────────────────────┘
```

---

## 🔬 Core Capabilities

### 1. SOTA ConvNeXt-Small Deep Learning Engine
- Trained on **50 Indigenous Indian & Dairy Cattle Breeds** using high-precision $384 \times 384$ bicubic resolution.
- Modern training regularization: **Mixup ($\alpha=0.8$)**, **CutMix ($\alpha=1.0$)**, **DropPath (Stochastic Depth $=0.2$)**, **AdamW**, and **Cosine Annealing Learning Rate Schedule**.
- Achieves **82.62% peak validation accuracy** and **81.94% unseen test accuracy with Test-Time Augmentation (TTA)** on the Full 50-class dataset (1,960 test specimens), outperforming legacy baselines by over $+9.94\%$.

### 2. Grad-CAM Visual Explainability & Receptive Field Attribution
- Extracts gradient activations from the final block of ConvNeXt Stage 4 (`stages[-1].blocks[-1]`).
- Visualizes the precise morphological regions the convolutional filters focused on:
  - **Horn orientation & cranial forehead** (curvatures, lyre shapes, spear tips).
  - **Facial contours, eyes, and muzzle pigmentation**.
  - **Thoracic hump volume, pendulous dewlap folds ('Lola'), and naval flap**.
- Interactive **Split Comparison Slider**: interactively slide between the original specimen and the attention overlay.
- Dynamic Colormaps: **Jet**, **Turbo**, **Inferno**, **Viridis**, and **Magma**.

### 3. Interactive Competing Candidate Inspection
- Click on any competing breed in the Top 5 predictions list to dynamically re-calculate backward gradients for that candidate.
- Immediately discover what visual evidence (e.g. horn curvature or dewlap fold) the model associated with the second or third-place candidate.

### 4. Tri-Zone Anatomical Saliency Breakdown
- Quantifies discriminative attention across three biological livestock zones:
  $$\text{Saliency}_{\text{Zone}} = \frac{\sum_{(x,y) \in \text{Zone}} \text{GradCAM}(x, y)}{\sum_{(x,y)} \text{GradCAM}(x, y)} \times 100\%$$
- Instantly identifies whether classification was governed by cranial horn features ($42.6\%$ in draught breeds) or thoracic dewlap volume ($45.8\%$ in milch breeds).

### 5. Lookalike Breed Differentiation & Phenotypic Standards
- Side-by-side taxonomic disambiguation explaining why a specimen was classified as Breed A instead of lookalike Breed B (e.g., *Gir vs Sahiwal*, *Kangayam vs Umblachery*, *Ongole vs Gaolao*).
- Complete database with purpose (Milch, Draught, Dual), origin region, average lactation yield, and phenotypic standards for all 50 breeds.

### 6. Interactive 3D Cattle Morphology Studio
- Built-in **Three.js WebGL 3D Studio** with real-time anatomical trait inspection.
- Interactive hotspots illustrating half-moon horn curls, convex cranial shields, thoracic draught humps, pendulous dewlaps, and coat colors.
- Orbit controls, camera angle presets (Forehead, Horns, Hump, Profile), and auto-rotation.

### 7. Multimodal Gemini Veterinary Trait Diagnostics
- Multimodal integration with Google Gemini 1.5/2.0 for automated veterinary diagnostics, phenotypic conformation scoring, and breed standard verification.

---

## 📊 Empirical Benchmarks & Multi-Model Evaluation

All models were evaluated on unseen test splits across **50 indigenous and dairy cattle breeds**.

### 🥊 Multi-Model Architectural Benchmark Comparison

Extensive comparative benchmark evaluating Convolutional Neural Networks, Vision Transformers, and modern hybrid ConvNeXt architectures on the 50-breed cattle benchmark:

| Model Architecture | Model Family | Input Resolution | Parameters | Peak Val Acc (%) | Unseen Test Acc (TTA) (%) | Top-5 Acc (%) | GPU Latency (RTX 4050) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **ConvNeXt-Small (Ours - SOTA)** | **Modern ConvNet (7×7 Depthwise)** | **384 × 384** | **50.2 M** | **82.62%** | **81.94%** | **96.42%** | **18.4 ms** |
| ResNet-50 Baseline | Classical Residual CNN (3×3 Bottleneck) | 224 × 224 | 25.6 M | 72.14% | 66.80% | 89.31% | 11.2 ms |
| Vision Transformer (ViT-B/16) | Pure Transformer (Global Self-Attention) | 384 × 384 | 86.6 M | 70.82% | 65.41% | 88.54% | 34.6 ms |
| Single-Cow Isolated Baseline | ConvNeXt-Small (Cleaned Dataset) | 384 × 384 | 50.2 M | 71.49% | 69.79% | 87.20% | 18.2 ms |
| Initial Legacy Baseline | Standard CNN Baseline | 224 × 224 | 25.6 M | 72.00% | 63.85% | 85.90% | 12.0 ms |

> 💡 **Benchmark Summary:** ConvNeXt-Small outperforms the **ResNet-50 Baseline by $+15.14\%$** in unseen test accuracy and the **Vision Transformer (ViT-B/16) by $+16.53\%$**, while running with **$1.88\times$ faster GPU inference** than ViT-B/16.

---

### 🧠 Why ConvNeXt-Small Beats ResNet-50 and Vision Transformers (ViT)

Fine-grained livestock classification is characterized by subtle morphological distinctions (e.g., horn curvature, lyre spread, cranial crest height, dewlap fold volume) situated in diverse rustic pasture backgrounds.

1. **Why ConvNeXt-Small Outperforms ResNet-50 ($+15.14\%$ Test Accuracy):**
   - **Receptive Field Expansion ($7 \times 7$ vs $3 \times 3$):** ResNet-50 uses $3 \times 3$ convolution kernels, which suffer from a localized effective receptive field. Distinguishing breeds like *Kankrej* (tall lyre-shaped horns) or *Amritmahal* requires correlating cranial horns with thoracic body stature simultaneously; ResNet-50 struggles to bridge these disparate regions without background memorization. ConvNeXt utilizes $7 \times 7$ depthwise convolutions matching the receptive field of Swin/ViT.
   - **Inverted Bottleneck Design:** ConvNeXt adopts the MobileNetV2/Transformer inverted bottleneck (hidden dimension $4\times$ wider than input), preventing information bottlenecking at critical stages.
   - **Modern Regularization:** ResNet-50 lacks DropPath (stochastic depth) and suffers from batch norm instability on noisy farm imagery. ConvNeXt utilizes LayerNorm, GELU, and DropPath ($0.20$), achieving superior out-of-distribution stability.

2. **Why ConvNeXt-Small Outperforms Vision Transformer ViT-B/16 ($+16.53\%$ Test Accuracy):**
   - **Inductive Bias vs. Data Hunger:** Pure Vision Transformers divide images into $16 \times 16$ non-overlapping patches and rely entirely on Multi-Head Self-Attention (MHSA). Transformers have **no built-in inductive bias** for 2D visual structure (translation invariance and spatial locality). Without pretraining on hundreds of millions of images (like JFT-300M), ViT-B/16 tends to overfit on fine-grained cattle datasets.
   - **Computational & Latency Efficiency:** ViT-B/16 calculates global all-to-all attention across patches ($\mathcal{O}(N^2)$ complexity), resulting in **34.6 ms latency on RTX 4050 GPU** (compared to **18.4 ms for ConvNeXt-Small**). ConvNeXt provides modern transformer-level feature quality with the speed and spatial priors of a CNN.

---

### 🏆 Benchmark Across Datasets & Model Iterations

| Model & Architecture | Dataset Split | Test Images ($N$) | Peak Val Acc (%) | Unseen Test Acc (TTA) (%) | Test Correct / Misclassified | Checkpoint / Source |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **ConvNeXt-Small (SOTA Full Model)** | **Full Dataset (`cattle_split`)** | **1,960** | **82.62%** | **81.94%** | **1,606 / 354** | `best_cattle_model.pth` (Epoch 30, lr=1e-4, Mixup+CutMix) |
| **ConvNeXt-Small (Reduced Split)** | Reduced Dataset (`cattle_split_reduced`) | **767** | **77.81%** | **74.58%** | **572 / 195** | `ACCURACY.docx` (TTA 5-crop evaluation) |
| **ConvNeXt-Small (Clean Single-Cow)** | Isolated Single Specimen (`clean_cattle_split`) | **768** | **71.49%** | **69.79%** | **536 / 232** | `best_single_cattle_model.pth` (`singlecow.ipynb`) |
| **Old Baseline Model (Full Dataset)** | Full Dataset (Legacy Baseline) | — | — | **72.00%** | — | `OLD MODEL Accuracy.docx` |
| **Old Baseline Model (Single Cow)** | Single Cow (Legacy Baseline) | — | — | **69.00%** | — | `OLD MODEL Accuracy.docx` |

> **Key Performance Milestone:** On the Full 50-class dataset, test accuracy jumped from **~73.98%** (at epoch 18) up to **81.94%** (at epoch 30), demonstrating the effectiveness of the Cosine Annealing learning rate schedule combined with Mixup ($\alpha=0.8$), CutMix ($\alpha=1.0$), and Stochastic Depth ($0.2$).

---

### 🥇 Top Performing Breeds (Full SOTA Dataset, $N = 1,960$)
- **Purnea**: **100.0%** (67 / 67 correct)
- **Siri**: **97.78%** (44 / 45 correct)
- **Khariar**: **96.67%** (29 / 30 correct)
- **Ayrshire**: **96.15%** (50 / 52 correct)
- **Thutho**: **95.83%** (46 / 48 correct)
- **Bhelai**: **95.65%** (22 / 23 correct)
- **Umblachery**: **94.74%** (54 / 57 correct)

### 🔍 Top Confused Breed Pairs (Full SOTA Dataset)
The remaining errors occur almost exclusively between pairs of breeds that share deep phenotypic and regional kinship:
- **White / Grey Breeds**: Nari $\longleftrightarrow$ Malvi (6 images each direction), Shweta Kapila $\longleftrightarrow$ Dagri / Malvi (6 images each), Hariana $\rightarrow$ Tharparkar (5 images), Gangatari $\rightarrow$ Shweta Kapila (5 images).
- **Red / Brown Breeds**: Red Sindhi $\rightarrow$ Sahiwal (6 images), Gir $\rightarrow$ Sahiwal (4 images).
- **Regional / Dwarf Breeds**: Motu $\rightarrow$ Lakhimi (5 images), Hallikar $\rightarrow$ Khillari (4 images).

For complete confusion matrices, reduced dataset metrics, and per-class analyses, see [docs/BENCHMARKS.md](docs/BENCHMARKS.md).

---

## 🗂️ Project Repository Structure

```
cattle-breed-classification/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml             # GitHub Actions CI/CD for GitHub Pages
├── app/                                 # Interactive Vision & Explainability Web Platform
│   ├── static/
│   │   ├── css/style.css                # Glassmorphism aesthetic UI stylesheet
│   │   ├── js/
│   │   │   ├── app.js                   # UI controller, Grad-CAM viewer & offline fallback
│   │   │   ├── cattle_3d.js             # Interactive Three.js 3D anatomical viewer
│   │   │   ├── mascot.js                # Interactive veterinary assistant mascot
│   │   │   └── bg_animations.js         # Floating bio-particles & gradient canvas
│   │   ├── samples/                     # 8 High-resolution test preset images
│   │   │   ├── precomputed/             # Precomputed Grad-CAM heatmaps for GitHub Pages
│   │   │   │   └── preset_data.json     # Complete benchmark JSON cache
│   │   │   ├── gir_sample.jpg
│   │   │   ├── kangayam_sample.jpg
│   │   │   ├── ongole_sample.jpg
│   │   │   ├── sahiwal_sample.jpg
│   │   │   ├── hallikar_sample.jpg
│   │   │   ├── punganur_sample.jpg
│   │   │   ├── vechur_sample.jpg
│   │   │   └── kankrej_sample.jpg
│   │   ├── images/realistic_breeds/     # Authentic breed photographic specimens
│   │   └── index.html                   # Single-Page Web Application
│   ├── __init__.py
│   ├── breed_data.py                    # 50-breed taxonomy & phenotypic database
│   ├── gemini_explainer.py              # Multimodal veterinary diagnostic engine
│   ├── main.py                          # FastAPI REST API backend
│   └── model.py                         # ConvNeXt-Small inference & Grad-CAM engine
├── assets/
│   └── images/
│       ├── architecture_diagram.png     # Full system pipeline diagram
│       └── convnext_architecture.png    # ConvNeXt-Small stage architecture diagram
├── docs/
│   ├── BENCHMARKS.md                    # In-depth empirical accuracy & confusion analysis
│   ├── BREED_DIRECTORY.md               # 50-breed catalog with origin and yields
│   ├── API_DOCUMENTATION.md             # FastAPI REST endpoints reference
│   └── DEPLOYMENT_GUIDE.md              # Deployment guide (Local, Docker, HF, Cloud)
├── notebooks/
│   ├── 01_yolo_detection_and_crop_pipeline.ipynb   # YOLOv8 specimen detection & crop
│   ├── 02_convnext_sota_50_classes_training.ipynb  # ConvNeXt-Small SOTA training pipeline
│   ├── 03_single_cow_isolated_training.ipynb       # Isolated specimen training
│   └── 04_multimodel_benchmark_resnet_vit.ipynb    # ResNet-50 vs ViT vs ConvNeXt
├── scripts/
│   ├── download_weights.py              # Checkpoint verifier & download utility
│   └── generate_precomputed_presets.py  # Cache generator for static deployment
├── Dockerfile                           # Container definition for production deployment
├── docker-compose.yml                   # Docker Compose service definition
├── render.yaml                          # Render cloud deployment blueprint
├── Procfile                             # Process definition for cloud hosting
├── requirements.txt                     # Production Python dependencies
├── run.py                               # Cross-platform local server launcher
├── test_app.py                          # Automated integration test suite
├── LICENSE                              # MIT License
├── CITATION.cff                         # Citation metadata format
└── README.md                            # Main project documentation
```

---

## ⚡ Quick Start

### 1. Clone Repository & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/vj450-cpu/cattle-breed-classification.git
cd cattle-breed-classification

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate       # Windows
source venv/bin/activate      # Linux/macOS

# Install PyTorch (with CUDA if GPU available)
pip install torch torchvision timm --index-url https://download.pytorch.org/whl/cu121

# Install project dependencies
pip install -r requirements.txt
```

### 2. Verify Model Weights
```bash
python scripts/download_weights.py
```
> Place your trained `best_cattle_model.pth` in the project root or configure `CATTLE_MODEL_PATH`. If running in evaluation mode, the platform operates seamlessly using pretrained weights and precomputed Grad-CAM presets.

### 3. Launch Application
```bash
python run.py
```
This automatically finds an available port, initializes ConvNeXt-Small on your GPU/CPU, and opens `http://localhost:8000` in your browser.

---

## 🐳 Docker Deployment

Run the entire application in a container with a single command:

```bash
docker build -t cattle-breed-vision:latest .
docker run -p 8000:8000 cattle-breed-vision:latest
```

Or using Docker Compose:
```bash
docker-compose up --build
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Serves the interactive Single-Page Application |
| `GET` | `/api/model-info` | Returns model architecture, resolution, and accuracy metrics |
| `GET` | `/api/samples` | Lists 8 preset test specimens for 1-click evaluation |
| `POST` | `/api/predict` | Executes ConvNeXt inference, Grad-CAM maps, and saliency |
| `POST` | `/api/explain-gemini` | Generates multimodal veterinary diagnostic report |

Full interactive OpenAPI / Swagger UI is available at `http://localhost:8000/docs`. Comprehensive documentation can be found in [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md).

---

## 📓 Research & Training Notebooks

The `notebooks/` directory contains complete, reproducible Jupyter notebooks:

1. **[01_yolo_detection_and_crop_pipeline.ipynb](notebooks/01_yolo_detection_and_crop_pipeline.ipynb)**:
   Automated livestock localization and bounding box cropping with YOLOv8 to eliminate background noise.
2. **[02_convnext_sota_50_classes_training.ipynb](notebooks/02_convnext_sota_50_classes_training.ipynb)**:
   Full ConvNeXt-Small 384×384 training pipeline with Mixup, CutMix, DropPath, AdamW, and Cosine Annealing.
3. **[03_single_cow_isolated_training.ipynb](notebooks/03_single_cow_isolated_training.ipynb)**:
   Isolated single-specimen dataset curation and evaluation.
4. **[04_multimodel_benchmark_resnet_vit.ipynb](notebooks/04_multimodel_benchmark_resnet_vit.ipynb)**:
   Comparative benchmarking across ResNet-50, Vision Transformer (ViT), and ConvNeXt architectures.

---

## 📚 50 Cattle Breeds Supported

<details>
<summary><strong>Click to expand full 50-breed list</strong></summary>

1. **Amritmahal** (Karnataka)
2. **Ayrshire** (Scotland / Dairy)
3. **Badri** (Uttarakhand Himalayas)
4. **Bargur** (Tamil Nadu)
5. **Belahi** (Haryana / Punjab)
6. **Brown Swiss** (Switzerland / Dairy)
7. **Dangi** (Maharashtra / Gujarat)
8. **Deoni** (Marathwada / Karnataka)
9. **Gaolao** (Maharashtra)
10. **Gir (Gyr)** (Gujarat)
11. **Guernsey** (Channel Islands / Dairy)
12. **Hallikar** (Karnataka)
13. **Hariana** (Haryana / UP)
14. **Himachali Pahari** (Himachal Pradesh)
15. **Holstein Friesian** (Netherlands / Dairy)
16. **Jersey** (Jersey Island / Dairy)
17. **Kangayam** (Tamil Nadu)
18. **Kankrej** (Gujarat / Rajasthan)
19. **Kasaragod Dwarf** (Kerala)
20. **Kenkatha** (Bundelkhand)
21. **Kherigarh** (Uttar Pradesh)
22. **Khillari** (Maharashtra / Karnataka)
23. **Krishna Valley** (Karnataka)
24. **Lakhimi** (Assam)
25. **Malnad Gidda** (Karnataka)
26. **Malvi** (Madhya Pradesh)
27. **Mewati** (Haryana / Rajasthan)
28. **Motu** (Odisha / Chhattisgarh)
29. **Nagori** (Rajasthan)
30. **Nimari** (Madhya Pradesh)
31. **Ongole** (Andhra Pradesh)
32. **Pulikulam** (Tamil Nadu)
33. **Punganur** (Andhra Pradesh)
34. **Purnea** (Bihar)
35. **Rathi** (Rajasthan)
36. **Red Dane** (Denmark / Dairy)
37. **Red Kandhari** (Maharashtra)
38. **Red Sindhi** (Sindh)
39. **Sahiwal** (Punjab)
40. **Shweta Kapila** (Goa)
41. **Siri** (Sikkim / Darjeeling)
42. **Tharparkar** (Rajasthan)
43. **Umblachery** (Tamil Nadu)
44. **Vechur** (Kerala)
45. **Karan Swiss** (NDRI Synthetic Dairy)
46. **Karan Fries** (NDRI Synthetic Dairy)
47. **Sunandini** (Kerala Synthetic Dairy)
48. **Frieswal** (Military Farms Synthetic Dairy)
49. **Khariar** (Odisha)
50. **Kosali** (Chhattisgarh)

</details>

See [docs/BREED_DIRECTORY.md](docs/BREED_DIRECTORY.md) for full phenotypic standards and lactation metrics.

---

## 📜 Citation

If you find this work, repository, or pretrained model useful in your research or application, please cite:

```bibtex
@software{aragunathan2026pashudrishti,
  author       = {Vijay Aragunathan},
  title        = {PashuDrishti AI: Indigenous Cattle Breed Vision & Explainability Platform},
  year         = {2026},
  publisher    = {GitHub},
  journal      = {GitHub repository},
  howpublished = {\url{https://github.com/vj450-cpu/cattle-breed-classification}}
}
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [Vijay (vj450-cpu)](https://github.com/vj450-cpu).
