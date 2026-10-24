# PashuDrishti AI: REST API Reference 📡

The **PashuDrishti AI** backend provides high-performance asynchronous REST endpoints powered by **FastAPI** and **PyTorch CUDA**.

---

## 🚀 Base URL
- **Local Dev Server**: `http://localhost:8000`
- **Docker Container**: `http://localhost:8000`
- **Interactive OpenAPI Docs**: `http://localhost:8000/docs`
- **ReDoc Specifications**: `http://localhost:8000/redoc`

---

## 📌 Endpoint Summary

| Method | Endpoint | Description | Request Type |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Serves the Single-Page Web Application (`index.html`) | None |
| `GET` | `/api/model-info` | Returns model architecture, resolution, and validation accuracy | None |
| `GET` | `/api/samples` | Lists preset test photos with metadata for 1-click evaluation | None |
| `POST` | `/api/predict` | Runs ConvNeXt inference & computes Grad-CAM explainability maps | `multipart/form-data` |
| `POST` | `/api/explain-gemini` | Generates multimodal veterinary trait diagnostic reports via Gemini | `multipart/form-data` |

---

## 📖 Detailed Endpoint Specifications

### 1. `GET /api/model-info`
Retrieves metadata regarding active deep learning checkpoint and hardware device.

#### Response:
```json
{
  "architecture": "ConvNeXt-Small (convnext_small.fb_in22k_ft_in1k_384)",
  "resolution": "384x384 Bicubic",
  "num_classes": 50,
  "validation_accuracy": "82.62%",
  "device": "cuda:0",
  "cuda_available": true,
  "weights_source": "C:\\Users\\Vijay\\best_cattle_model.pth"
}
```

---

### 2. `GET /api/samples`
Returns 8 pre-bundled high-resolution cattle specimen photos for instant evaluation.

#### Response:
```json
{
  "samples": [
    { "id": "gir_sample.jpg", "breed": "Gir", "region": "Gujarat", "type": "Milch (A2 Milk)" },
    { "id": "kangayam_sample.jpg", "breed": "Kangayam", "region": "Tamil Nadu", "type": "Premier Draught" },
    { "id": "ongole_sample.jpg", "breed": "Ongole", "region": "Andhra Pradesh", "type": "Heavy Draught & Milk" }
  ]
}
```

---

### 3. `POST /api/predict`
Executes forward inference, calculates Top-5 classification probabilities, computes backward gradients on ConvNeXt `stages[-1].blocks[-1]`, and extracts anatomical zone saliency scores.

#### Parameters (`multipart/form-data`):
- `file` *(optional, File)*: Input specimen photo (JPG/PNG).
- `sample_name` *(optional, string)*: ID of preset image (e.g. `gir_sample.jpg`).
- `target_class_idx` *(optional, integer)*: Override target class index for competing candidate inspection.
- `colormap` *(optional, string, default: "jet")*: Colormap for heatmap (`jet`, `turbo`, `inferno`, `viridis`, `magma`).
- `alpha` *(optional, float, default: 0.52)*: Blending ratio $[0.0, 1.0]$.

#### Response:
```json
{
  "primary_prediction": {
    "breed_name": "Gir (Gyr)",
    "confidence": 94.24,
    "purpose": "Milch (A2 Milk)",
    "origin": "Kathiawar, Gujarat",
    "lifespan": "15 – 18 years",
    "milk_yield": "2,000 – 3,500 kg per lactation",
    "temperament": "Extremely docile and affectionate",
    "traits": {
      "horns": "Half-moon horns curving backwards, downwards, then sweeping upwards",
      "forehead": "Prominently convex bulging forehead dome",
      "hump": "Large rounded thoracic hump",
      "dewlap": "Voluminous pendulous skin folds cascading down neck"
    },
    "distinguishing_vs": "Unlike Sahiwal which has flat forehead and stumpy conical horns, Gir possesses an iconic convex cranial shield."
  },
  "top_candidates": [
    { "index": 13, "breed_name": "Gir", "confidence": 94.24, "is_selected": true },
    { "index": 38, "breed_name": "Sahiwal", "confidence": 3.12, "is_selected": false },
    { "index": 42, "breed_name": "Red Sindhi", "confidence": 1.15, "is_selected": false }
  ],
  "selected_class_index": 13,
  "explainability": {
    "anatomical_attention": {
      "horns_and_forehead": 46.8,
      "face_eyes_muzzle": 22.4,
      "hump_dewlap_body": 30.8
    },
    "dominant_region": "Horn Orientation & Cranial Forehead",
    "attention_description": "The neural network directed 46.8% of its attention toward the Horn Orientation & Cranial Forehead, confirming distinctive breed phenotypic markers."
  },
  "visualizations": {
    "original_b64": "data:image/jpeg;base64,...",
    "overlay_b64": "data:image/jpeg;base64,...",
    "heatmap_b64": "data:image/jpeg;base64,..."
  }
}
```

---

### 4. `POST /api/explain-gemini`
Generates multimodal veterinary diagnostic analysis using Google Gemini.

#### Parameters (`multipart/form-data`):
- `file` *(optional, File)*: Specimen photo.
- `sample_name` *(optional, string)*: Preset name.
- `breed_name` *(required, string)*: Predicted breed.
- `confidence` *(required, float)*: Confidence percentage.
- `api_key` *(optional, string)*: User-supplied Google Gemini API Key.
