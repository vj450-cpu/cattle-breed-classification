import os
import sys
import json
import base64
from PIL import Image

# Ensure repository root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from app.model import CattleBreedModel

def main():
    print("[1/3] Loading ConvNeXt-Small model...")
    model = CattleBreedModel()
    
    samples_dir = os.path.join(BASE_DIR, "app", "static", "samples")
    precomputed_dir = os.path.join(samples_dir, "precomputed")
    os.makedirs(precomputed_dir, exist_ok=True)

    sample_files = [
        "gir_sample.jpg", "kangayam_sample.jpg", "ongole_sample.jpg", "sahiwal_sample.jpg",
        "hallikar_sample.jpg", "punganur_sample.jpg", "vechur_sample.jpg", "kankrej_sample.jpg"
    ]

    precomputed_db = {}
    print("[2/3] Computing predictions and Grad-CAM receptive fields...")

    for s in sample_files:
        img_path = os.path.join(samples_dir, s)
        if not os.path.exists(img_path):
            print(f"  Warning: missing {s}")
            continue
        
        img = Image.open(img_path).convert("RGB")
        res = model.analyze(img)
        base_name = os.path.splitext(s)[0]
        
        overlay_filename = f"{base_name}_overlay.jpg"
        heatmap_filename = f"{base_name}_heatmap.jpg"
        
        # Save overlay & heatmap images directly
        with open(os.path.join(precomputed_dir, overlay_filename), "wb") as f:
            f.write(base64.b64decode(res["visualizations"]["overlay_b64"].split(",")[1]))
            
        with open(os.path.join(precomputed_dir, heatmap_filename), "wb") as f:
            f.write(base64.b64decode(res["visualizations"]["heatmap_b64"].split(",")[1]))
            
        precomputed_db[s] = {
            "primary_prediction": res["primary_prediction"],
            "top_candidates": res["top_candidates"],
            "selected_class_index": res["selected_class_index"],
            "explainability": res["explainability"],
            "overlay_path": f"samples/precomputed/{overlay_filename}",
            "heatmap_path": f"samples/precomputed/{heatmap_filename}",
            "sample_path": f"samples/{s}",
            "visualizations": {
                "original_b64": res["visualizations"]["original_b64"],
                "overlay_b64": res["visualizations"]["overlay_b64"],
                "heatmap_b64": res["visualizations"]["heatmap_b64"]
            }
        }
        pred_name = res["primary_prediction"]["breed_name"]
        conf = res["primary_prediction"]["confidence"]
        print(f"  Processed {s} -> {pred_name} ({conf}%)")

    json_path = os.path.join(precomputed_dir, "preset_data.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(precomputed_db, f, indent=2)

    print(f"[3/3] Successfully wrote {len(precomputed_db)} presets to {json_path}!")

if __name__ == "__main__":
    main()
