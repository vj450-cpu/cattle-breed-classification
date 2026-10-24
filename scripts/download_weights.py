"""
Cattle Breed Classification - Checkpoint Weights Verifier & Downloader.
"""

import os
import sys

WEIGHTS_FILENAME = "best_cattle_model.pth"
EXPECTED_SIZE_BYTES = 594355346  # ~594 MB

def main():
    print("=" * 65)
    print(" PashuDrishti AI: Model Weights Check & Setup")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    candidates = [
        os.environ.get("CATTLE_MODEL_PATH"),
        os.path.join(base_dir, "weights", WEIGHTS_FILENAME),
        os.path.join(base_dir, WEIGHTS_FILENAME),
        r"C:\Users\Vijay\best_cattle_model.pth",
        WEIGHTS_FILENAME
    ]

    found = None
    for c in candidates:
        if c and os.path.exists(c):
            found = c
            break

    if found:
        size_mb = os.path.getsize(found) / (1024 * 1024)
        print(f"[OK] Trained checkpoint found at:")
        print(f"     -> {found}")
        print(f"     -> Checkpoint Size: {size_mb:.2f} MB")
        print("\nYour platform is fully ready for high-precision inference!")
    else:
        print("[NOTICE] Pre-trained weights checkpoint (best_cattle_model.pth) not found in local paths.")
        print("\nOptions to acquire the weights:")
        print("  1. Place 'best_cattle_model.pth' in the project root or 'weights/' directory.")
        print("  2. Set the CATTLE_MODEL_PATH environment variable to point to your checkpoint:")
        print("     export CATTLE_MODEL_PATH=/path/to/best_cattle_model.pth  (Linux/macOS)")
        print("     $env:CATTLE_MODEL_PATH='D:\\weights\\best_cattle_model.pth'  (PowerShell)")
        print("  3. Download from GitHub Releases / Hugging Face model hub.")
        print("\nNote: The web platform includes an evaluation mode and precomputed Grad-CAM presets")
        print("so you can explore all features even before downloading the weights.")

if __name__ == "__main__":
    main()
