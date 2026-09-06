@echo off
setlocal enabledelayedexpansion

title Local AI Auto Caption Generator - GPU Launcher
color 0B

echo ==============================================================================
echo       LOCAL AI AUTO CAPTION GENERATOR - GPU INFERENCE LAUNCHER
echo ==============================================================================
echo.

:: 1. Check Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Python was not found in system PATH.
    echo Please install Python 3.11 and ensure "Add Python to PATH" is checked.
    echo.
    pause
    exit /b 1
)

:: 2. Run Environment Diagnostics
echo [1/4] Checking Python, PyTorch, CUDA, WhisperX, and FFmpeg...
python test_gpu_env.py
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Environment diagnostics encountered a warning. Continuing...
)

:: 3. Verify / Install Lightweight App Dependencies (Non-destructive)
echo [2/4] Ensuring core web application dependencies are installed...
echo (NOTE: This will NOT overwrite your existing PyTorch or WhisperX)
python -c "import fastapi, uvicorn, pydantic, aiofiles, multipart" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Installing lightweight dependencies (FastAPI, Uvicorn, Aiofiles)...
    pip install -r backend/requirements.txt --no-deps-warning
) else (
    echo Core application dependencies are verified.
)

:: 4. Verify Frontend Distribution
echo.
echo [3/4] Checking Frontend assets...
if exist "frontend\dist\index.html" (
    echo Frontend build found. FastAPI will serve the full web app directly.
) else (
    echo Frontend dist not found. Checking Node.js to build frontend...
    where npm >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Building frontend assets using Vite...
        cd frontend
        call npm install
        call npm run build
        cd ..
    ) else (
        echo [INFO] Node.js not detected. You can run frontend dev server on Laptop A or build it before copying.
    )
)

:: 5. Launch Application
echo.
echo [4/4] Starting FastAPI backend on http://127.0.0.1:8000...
echo.
echo ==============================================================================
echo   APPLICATION READY!
echo   Opening browser at: http://127.0.0.1:8000
echo   Press CTRL+C in this terminal to stop the server.
echo ==============================================================================
echo.

:: Open Browser after a brief delay
start "" http://127.0.0.1:8000

:: Run Uvicorn Server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

pause
