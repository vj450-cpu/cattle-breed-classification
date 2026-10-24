"""
PashuDrishti AI: Indigenous Cattle Breed Vision & Explainability Platform
Hugging Face Spaces Gradio Application.
"""

import os
import io
import base64
from PIL import Image
import gradio as gr
import torch

try:
    import spaces
except ImportError:
    class _MockSpaces:
        @staticmethod
        def GPU(fn=None, duration=60):
            if fn is None:
                return lambda f: f
            return fn
    spaces = _MockSpaces()

from app.model import CattleBreedModel
from app.breed_data import CATTLE_CLASSES, get_cattle_profile

# Global model instance
_model = None

def ensure_weights_file():
    weights_path = os.path.join(os.path.dirname(__file__), "app", "weights", "best_cattle_model.pth")
    if os.path.exists(weights_path) and os.path.getsize(weights_path) > 10 * 1024 * 1024:
        return weights_path

    dev_path = r"C:\Users\Vijay\best_cattle_model.pth"
    if os.path.exists(dev_path):
        return dev_path

    url = "https://github.com/vj450-cpu/cattle-breed-classification/raw/main/app/weights/best_cattle_model.pth"
    print(f"[Space Startup] Fetching 94.5MB ConvNeXt-Small weights from {url}...")
    os.makedirs(os.path.dirname(weights_path), exist_ok=True)
    import urllib.request
    urllib.request.urlretrieve(url, weights_path)
    print(f"[Space Startup] Weights downloaded successfully: {os.path.getsize(weights_path)} bytes")
    return weights_path

def get_model():
    global _model
    if _model is None:
        weights_path = ensure_weights_file()
        _model = CattleBreedModel(weights_path=weights_path)
    return _model

def b64_to_pil(b64_str: str) -> Image.Image:
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
    data = base64.b64decode(b64_str)
    return Image.open(io.BytesIO(data))

@spaces.GPU
def predict_cattle_breed(image, colormap="jet", blend_alpha=0.52):
    if image is None:
        return {}, None, None, "", ""
    
    try:
        model = get_model()
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to_device(device)
        res = model.analyze(image, colormap=colormap, alpha=blend_alpha)
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        print(f"[Inference Error]: {err_msg}")
        try:
            model = get_model()
            model.to_device(torch.device("cpu"))
            res = model.analyze(image, colormap=colormap, alpha=blend_alpha)
        except Exception as e2:
            print(f"[Fatal Inference Error]: {traceback.format_exc()}")
            return {}, None, None, f"### ⚠️ Diagnostics Alert\nAn issue occurred during inference: `{str(e2)}`", f"### 🔬 Traceback\n```\n{err_msg}\n```"
    
    primary = res["primary_prediction"]
    top_cands = res["top_candidates"]
    explain = res["explainability"]
    vis = res["visualizations"]
    
    # Format labels dictionary for gr.Label
    labels = {c["breed_name"].replace("_", " "): float(c["confidence"]) / 100.0 for c in top_cands[:5]}
    
    # Convert overlay and pure heatmap base64 to PIL Image
    overlay_img = b64_to_pil(vis["overlay_b64"])
    heatmap_img = b64_to_pil(vis["heatmap_b64"])
    
    # Anatomical Markdown
    attn = explain["anatomical_attention"]
    attn_md = f"""### 🔬 Tri-Zone Anatomical Attention Receptive Fields
- 👑 **Horns & Cranial Forehead:** `{attn['horns_and_forehead']}%`
- 👁️ **Facial Contours, Eyes & Muzzle:** `{attn['face_eyes_muzzle']}%`
- 🛡️ **Thoracic Hump, Dewlap & Frame:** `{attn['hump_dewlap_body']}%`

> **Dominant Receptive Focus:** **{explain['dominant_region']}**  
> {explain['attention_description']}
"""

    # Breed Profile Markdown
    traits = primary.get("traits", {})
    lookalikes = primary.get("distinguishing_vs", [])
    
    diff_text = ""
    for d in lookalikes:
        diff_text += f"- **vs {d['vs']}:** {d['difference']}\n"
    if not diff_text:
        diff_text = "- Distinctive cranial curvature and horn spacing separate this breed from lookalikes."

    profile_md = f"""## 🐂 Primary Prediction: {primary['breed_name']} ({primary['confidence']}%)

- 🥛 **Primary Purpose:** {primary['purpose']}
- 📍 **Native Origin:** {primary['origin']}
- ⏳ **Typical Lifespan:** {primary['lifespan']}
- 🍯 **Milk Production:** {primary['milk_yield']}
- 🌿 **Temperament:** {', '.join(primary.get('temperament', ['Hardy', 'Agile']))}

### 🧬 Distinctive Morphological Markers
- **Horns:** {traits.get('horns', 'N/A')}
- **Forehead:** {traits.get('forehead', 'N/A')}
- **Ears:** {traits.get('ears', 'N/A')}
- **Hump & Dewlap:** {traits.get('hump_dewlap', 'N/A')}
- **Coat:** {traits.get('coat', 'N/A')}

### ⚖️ Lookalike Breed Differentiation
{diff_text}
"""
    return labels, overlay_img, heatmap_img, attn_md, profile_md

# Custom CSS for rich aesthetics matching PashuDrishti AI dark/amber theme
custom_css = """
body, .gradio-container {
    background-color: #0b0f19 !important;
    color: #f3f4f6 !important;
    font-family: 'Inter', -apple-system, sans-serif !important;
}
.gradio-header {
    text-align: center;
    border-bottom: 1px solid rgba(245, 158, 11, 0.2);
    padding-bottom: 16px;
    margin-bottom: 24px;
}
.btn-primary {
    background: linear-gradient(135deg, #f59e0b, #d97706) !important;
    color: #000 !important;
    font-weight: 700 !important;
    border: none !important;
    border-radius: 8px !important;
}
"""

with gr.Blocks(title="PashuDrishti AI: 50-Breed Cattle Vision", css=custom_css, theme=gr.themes.Base()) as demo:
    gr.HTML("""
    <div style="text-align: center; padding: 20px 10px; margin-bottom: 15px; border-bottom: 1px solid rgba(245,158,11,0.25);">
        <h1 style="color: #f59e0b; margin: 0; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px;">
            🐂 PashuDrishti AI: Indigenous Cattle Vision
        </h1>
        <p style="color: #9ca3af; margin: 8px 0 0; font-size: 1.05rem;">
            50 Indigenous & Dairy Cattle Breeds Classifier • ConvNeXt-Small 384px • Grad-CAM Visual Explainability
        </p>
    </div>
    """)
    
    with gr.Tabs():
        with gr.TabItem("🔍 Vision Classifier & Grad-CAM"):
            with gr.Row():
                with gr.Column(scale=1):
                    input_image = gr.Image(type="pil", label="Upload Cattle Specimen Photo")
                    with gr.Row():
                        colormap_dd = gr.Dropdown(
                            choices=["jet", "viridis", "plasma", "inferno"],
                            value="jet",
                            label="Grad-CAM Colormap"
                        )
                        alpha_slider = gr.Slider(
                            minimum=0.1,
                            maximum=1.0,
                            value=0.52,
                            step=0.02,
                            label="Heatmap Alpha Blend"
                        )
                    
                    btn_predict = gr.Button("⚡ Analyze Specimen & Synthesize Grad-CAM", variant="primary", elem_classes=["btn-primary"])
                    
                    # Bundled preset samples
                    sample_dir = os.path.join(os.path.dirname(__file__), "app", "static", "samples")
                    example_imgs = [
                        [os.path.join(sample_dir, "gir_sample.jpg"), "jet", 0.52],
                        [os.path.join(sample_dir, "kangayam_sample.jpg"), "jet", 0.52],
                        [os.path.join(sample_dir, "ongole_sample.jpg"), "jet", 0.52],
                        [os.path.join(sample_dir, "sahiwal_sample.jpg"), "jet", 0.52],
                        [os.path.join(sample_dir, "hallikar_sample.jpg"), "jet", 0.52],
                        [os.path.join(sample_dir, "punganur_sample.jpg"), "jet", 0.52],
                        [os.path.join(sample_dir, "vechur_sample.jpg"), "jet", 0.52],
                        [os.path.join(sample_dir, "kankrej_sample.jpg"), "jet", 0.52]
                    ]
                    available_examples = [ex for ex in example_imgs if os.path.exists(ex[0])]
                    if available_examples:
                        gr.Examples(
                            examples=available_examples,
                            inputs=[input_image, colormap_dd, alpha_slider],
                            label="Click to Test Bundled Indigenous Breed Presets"
                        )
                        
                with gr.Column(scale=1):
                    out_label = gr.Label(num_top_classes=5, label="Top-5 Model Predictions")
                    with gr.Tabs():
                        with gr.TabItem("Grad-CAM Attention Overlay"):
                            out_overlay = gr.Image(type="pil", label="Grad-CAM Attention Overlay")
                        with gr.TabItem("Pure Heatmap"):
                            out_heatmap = gr.Image(type="pil", label="Normalized Feature Heatmap")
                    
                    out_attention_md = gr.Markdown(label="Anatomical Receptive Attention")
                    out_profile_md = gr.Markdown(label="Breed Profile & Diagnostics")
            
            btn_predict.click(
                fn=predict_cattle_breed,
                inputs=[input_image, colormap_dd, alpha_slider],
                outputs=[out_label, out_overlay, out_heatmap, out_attention_md, out_profile_md]
            )

        with gr.TabItem("ℹ️ Architecture & Methodology"):
            gr.Markdown("""
### 🧠 Deep Learning Architecture: ConvNeXt-Small (384×384 Bicubic)
- **Parameters:** 50,223,666 parameters trained across 50 NBAGR-registered and dairy cattle classes.
- **Explainability:** Stage 4 analytical gradient-weighted class activation mapping (Grad-CAM) pinpointing cranial horn orientation, domed forehead contours, and thoracic hump ratios.
- **Accuracy:** 82.62% Validation Accuracy on fine-grained indigenous cattle benchmarks.
- **Repository:** [https://github.com/vj450-cpu/cattle-breed-classification](https://github.com/vj450-cpu/cattle-breed-classification)
- **Live Demo App (`G084_Website.url`)**: Hosted on Hugging Face Spaces with 16 GB RAM.
""")

if __name__ == "__main__":
    demo.queue().launch()
