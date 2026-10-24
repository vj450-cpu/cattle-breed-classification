import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("[1] Testing /api/model-info...")
r1 = client.get("/api/model-info")
assert r1.status_code == 200, f"Error: {r1.status_code}"
info = r1.json()
print(f"    Architecture: {info['architecture']}")
print(f"    Classes: {info['num_classes']}")
print(f"    Accuracy: {info['validation_accuracy']}")

print("\n[2] Testing /api/samples...")
r2 = client.get("/api/samples")
assert r2.status_code == 200
samples = r2.json()["samples"]
print(f"    Available test presets: {len(samples)}")
for s in samples[:3]:
    print(f"    - {s['breed']} ({s['type']}, {s['region']})")

print("\n[3] Testing /api/predict with Gir sample...")
r3 = client.post("/api/predict", data={"sample_name": "gir_sample.jpg", "colormap": "jet", "alpha": "0.52"})
assert r3.status_code == 200
data = r3.json()
print(f"    Primary Prediction: {data['primary_prediction']['breed_name']} ({data['primary_prediction']['confidence']}%)")
print(f"    Purpose: {data['primary_prediction']['purpose']}")
print("    Top Candidates:")
for c in data["top_candidates"]:
    print(f"      * {c['breed_name']}: {c['confidence']}%")
print(f"    Attention Zones: {data['explainability']['anatomical_attention']}")
print(f"    Visualizations keys: {list(data['visualizations'].keys())}")
print(f"    Original b64 length: {len(data['visualizations']['original_b64'])}")
print(f"    Overlay b64 length: {len(data['visualizations']['overlay_b64'])}")
print(f"    Heatmap b64 length: {len(data['visualizations']['heatmap_b64'])}")

print("\n[4] Testing Grad-CAM re-calculation for candidate breed (target_class_idx = 31, Sahiwal)...")
r4 = client.post("/api/predict", data={"sample_name": "gir_sample.jpg", "target_class_idx": 31, "colormap": "turbo"})
assert r4.status_code == 200
data4 = r4.json()
print(f"    Re-calculated target: {data4['primary_prediction']['breed_name']}")
print(f"    Re-calculated Attention: {data4['explainability']['anatomical_attention']}")

print("\n================ ALL AUTOMATED TESTS PASSED! ================")
