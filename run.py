"""
PashuDrishti AI: Indigenous Cattle Breed Vision & Explainability Platform Launcher
"""

import os
import sys
import socket
import webbrowser
import threading
import time
import uvicorn


def find_free_port(starting_port: int = 8000, max_attempts: int = 20) -> int:
    """Find an open network port starting from starting_port."""
    for port in range(starting_port, starting_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return starting_port


def open_browser(url: str, delay: float = 1.5):
    """Open default web browser after a brief startup delay."""
    time.sleep(delay)
    print(f"[PashuDrishti AI] Opening browser at {url}...")
    webbrowser.open(url)


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, base_dir)

    model_path = r"C:\Users\Vijay\best_cattle_model.pth"
    print("=" * 65)
    print("  PashuDrishti AI: 50-Breed Cattle Vision & Explainability   ")
    print("=" * 65)
    print(f"[*] Base Directory: {base_dir}")
    print(f"[*] Model Weights:  {model_path}")
    print(f"[*] Model Exists:   {os.path.exists(model_path)}")

    port = find_free_port(8000)
    url = f"http://localhost:{port}"
    print(f"[*] Web Server URL: {url}")
    print("=" * 65)

    # Launch browser in background thread
    threading.Thread(target=open_browser, args=(url,), daemon=True).start()

    # Start Uvicorn ASGI server
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=port,
        log_level="info"
    )


if __name__ == "__main__":
    main()
