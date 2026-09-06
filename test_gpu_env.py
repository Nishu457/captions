"""
Environment Diagnostic Tool for Local AI Auto Caption Generator.
Run this script on either Laptop A or Laptop B to check environment readiness.
"""

import sys
import shutil
import subprocess

def check_environment():
    print("=" * 60)
    print("  LOCAL AI AUTO CAPTION GENERATOR - ENVIRONMENT CHECK")
    print("=" * 60)

    # 1. Python Version
    py_ver = sys.version.split()[0]
    print(f"\n[+] Python Version: {py_ver}")

    # 2. PyTorch & CUDA Check
    print("\n[+] PyTorch & CUDA Status:")
    try:
        import torch
        print(f"    PyTorch Version : {torch.__version__}")
        cuda_avail = torch.cuda.is_available()
        print(f"    CUDA Available  : {cuda_avail}")

        if cuda_avail:
            cuda_ver = torch.version.cuda
            device_count = torch.cuda.device_count()
            device_name = torch.cuda.get_device_name(0)
            vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
            print(f"    CUDA Version    : {cuda_ver}")
            print(f"    GPU Device Count: {device_count}")
            print(f"    GPU Device Name : {device_name}")
            print(f"    Total VRAM      : {vram_gb:.2f} GB")
        else:
            print("    [!] CUDA is not available. PyTorch will use CPU mode.")
    except ImportError:
        print("    [!] PyTorch is NOT installed in this environment.")
        cuda_avail = False

    # 3. WhisperX Check
    print("\n[+] WhisperX Status:")
    try:
        import whisperx
        wx_ver = getattr(whisperx, "__version__", "installed")
        print(f"    WhisperX Version: {wx_ver}")
    except ImportError as e:
        print(f"    [!] WhisperX is NOT installed or has an import issue: {e}")

    # 4. FFmpeg Check
    print("\n[+] FFmpeg Status:")
    ffmpeg_path = shutil.which("ffmpeg")
    if ffmpeg_path:
        print(f"    FFmpeg Binary   : Found at {ffmpeg_path}")
        try:
            res = subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True, timeout=5)
            first_line = res.stdout.splitlines()[0] if res.stdout else "Unknown version"
            print(f"    FFmpeg Info     : {first_line}")
        except Exception as e:
            print(f"    FFmpeg Exec Err : {e}")
    else:
        print("    [!] FFmpeg NOT found in system PATH.")
        print("        Please ensure ffmpeg is installed and added to PATH.")

    print("\n" + "=" * 60)
    if cuda_avail:
        print("  RESULT: GPU Acceleration is ready for inference!")
    else:
        print("  NOTE: If this is Laptop A (Dev), this is expected.")
        print("        If this is Laptop B (GPU), verify the PyTorch CUDA install.")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    check_environment()
