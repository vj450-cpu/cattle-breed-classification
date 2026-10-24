"""
FastAPI Application for Cattle Breed Prediction & Explainability Platform.
"""

import os
import io
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch

from app.model import CattleBreedModel
from app.gemini_explainer import CattleGeminiExplainer
from app.breed_data import CATTLE_CLASSES

app = FastAPI(
    title="PashuDrishti AI: Indigenous Cattle Breed Vision & Explainability Platform",
    description="50 Indigenous & Dairy Cattle Breeds Classifier with ConvNeXt Grad-CAM Explainability",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SAMPLES_DIR = os.path.join(STATIC_DIR, "samples")

_model = None
explainer = CattleGeminiExplainer()

def get_model() -> CattleBreedModel:
    global _model
    if _model is None:
        _model = CattleBreedModel()
    return _model

# Static Files & Subdirectories Mount
for sub_dir in ["css", "js", "samples", "images"]:
    dir_path = os.path.join(STATIC_DIR, sub_dir)
    if os.path.exists(dir_path):
        app.mount(f"/{sub_dir}", StaticFiles(directory=dir_path), name=sub_dir)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def serve_home():
    """Serve the single-page application."""
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Cattle Breed Vision Platform is running. index.html not found."}


@app.get("/api/model-info")
async def get_model_info():
    """Return model architecture and accuracy metrics instantaneously."""
    is_cuda = torch.cuda.is_available()
    return {
        "architecture": "ConvNeXt-Small (convnext_small.fb_in22k_ft_in1k_384)",
        "resolution": "384x384 Bicubic",
        "num_classes": len(CATTLE_CLASSES),
        "classes": CATTLE_CLASSES,
        "validation_accuracy": "82.62%",
        "test_accuracy": "81.94%",
        "device": "cuda:0" if is_cuda else "cpu",
        "cuda_available": is_cuda,
        "status": "online"
    }


@app.get("/api/samples")
async def get_sample_images():
    """Return preset cattle images for 1-click test."""
    samples_data = [
        {"id": "gir_sample.jpg", "breed": "Gir", "region": "Gujarat", "type": "Milch (A2 Milk)"},
        {"id": "kangayam_sample.jpg", "breed": "Kangayam", "region": "Tamil Nadu", "type": "Premier Draught"},
        {"id": "ongole_sample.jpg", "breed": "Ongole", "region": "Andhra Pradesh", "type": "Heavy Draught & Milk"},
        {"id": "sahiwal_sample.jpg", "breed": "Sahiwal", "region": "Punjab", "type": "Premier Milch"},
        {"id": "hallikar_sample.jpg", "breed": "Hallikar", "region": "Karnataka", "type": "Fast Trotting Draught"},
        {"id": "punganur_sample.jpg", "breed": "Punganur", "region": "Andhra Pradesh", "type": "Miniature Cattle"},
        {"id": "vechur_sample.jpg", "breed": "Vechur", "region": "Kerala", "type": "World's Smallest Cattle"},
        {"id": "kankrej_sample.jpg", "breed": "Kankrej", "region": "Gujarat/Rajasthan", "type": "Lyre-Horned Dual Purpose"}
    ]
    return {"samples": samples_data}


@app.post("/api/predict")
async def predict_breed(
    file: Optional[UploadFile] = File(None),
    sample_name: Optional[str] = Form(None),
    target_class_idx: Optional[int] = Form(None),
    colormap: str = Form("jet"),
    alpha: float = Form(0.52)
):
    """
    Run ConvNeXt inference and generate Grad-CAM explainability maps.
    """
    try:
        # Load image from file upload or sample
        if file is not None and file.filename:
            content = await file.read()
            image = Image.open(io.BytesIO(content)).convert("RGB")
        elif sample_name:
            sample_path = os.path.join(SAMPLES_DIR, sample_name)
            if not os.path.exists(sample_path):
                raise HTTPException(status_code=404, detail=f"Sample '{sample_name}' not found.")
            image = Image.open(sample_path).convert("RGB")
        else:
            raise HTTPException(status_code=400, detail="Either 'file' or 'sample_name' must be provided.")

        # Execute ConvNeXt analysis + Grad-CAM
        results = get_model().analyze(
            image=image,
            target_class_idx=target_class_idx,
            colormap=colormap,
            alpha=alpha
        )

        return JSONResponse(content=results)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/explain-gemini")
async def explain_with_gemini(
    file: Optional[UploadFile] = File(None),
    sample_name: Optional[str] = Form(None),
    predicted_breed: str = Form(...),
    confidence: float = Form(...),
    api_key: Optional[str] = Form(None),
    horns_attention: float = Form(33.3),
    face_attention: float = Form(33.3),
    hump_attention: float = Form(33.3)
):
    """
    Produce deep multimodal livestock reasoning using Gemini Vision (or local fallback).
    """
    try:
        if file is not None and file.filename:
            content = await file.read()
            image = Image.open(io.BytesIO(content)).convert("RGB")
        elif sample_name:
            sample_path = os.path.join(SAMPLES_DIR, sample_name)
            image = Image.open(sample_path).convert("RGB")
        else:
            raise HTTPException(status_code=400, detail="Image must be provided.")

        if api_key:
            explainer.update_key(api_key.strip())

        attention_dict = {
            "horns_and_forehead": horns_attention,
            "face_eyes_muzzle": face_attention,
            "hump_dewlap_body": hump_attention
        }

        explanation = explainer.explain(
            image=image,
            predicted_breed=predicted_breed,
            confidence=confidence,
            anatomical_attention=attention_dict,
            top_candidates=[]
        )

        return JSONResponse(content=explanation)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
