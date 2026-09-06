import logging
from typing import Dict, Any

logger = logging.getLogger("caption_app.gpu")

class GPUService:
    _instance = None

    def __init__(self):
        self.torch_available = False
        self.cuda_available = False
        self.gpu_name = "N/A"
        self.cuda_version = "N/A"
        self.torch_version = "N/A"
        self.total_vram_gb = 0.0
        self.device = "cpu"
        self.recommended_compute_type = "int8"
        self.recommended_batch_size = 4
        self._inspect_environment()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = GPUService()
        return cls._instance

    def _inspect_environment(self):
        try:
            import torch
            self.torch_available = True
            self.torch_version = torch.__version__
            self.cuda_available = torch.cuda.is_available()

            if self.cuda_available:
                self.device = "cuda"
                self.cuda_version = torch.version.cuda or "N/A"
                self.gpu_name = torch.cuda.get_device_name(0)
                props = torch.cuda.get_device_properties(0)
                self.total_vram_gb = round(props.total_memory / (1024 ** 3), 2)
                
                # float16 is optimal for RTX 3050 (Ampere architecture)
                self.recommended_compute_type = "float16"
                
                # 6GB VRAM tuning
                if self.total_vram_gb <= 6.5:
                    self.recommended_batch_size = 8
                elif self.total_vram_gb <= 8.5:
                    self.recommended_batch_size = 16
                else:
                    self.recommended_batch_size = 24

                logger.info(
                    f"GPU Acceleration ACTIVE: {self.gpu_name} | "
                    f"CUDA {self.cuda_version} | VRAM: {self.total_vram_gb} GB | "
                    f"Compute: {self.recommended_compute_type} | Batch: {self.recommended_batch_size}"
                )
            else:
                self.device = "cpu"
                self.recommended_compute_type = "int8"
                self.recommended_batch_size = 4
                logger.warning("CUDA is not available. System will run on CPU mode.")
        except ImportError:
            self.torch_available = False
            self.device = "cpu"
            self.recommended_compute_type = "int8"
            logger.warning("PyTorch is not installed in this environment.")

    def get_status(self) -> Dict[str, Any]:
        info = {
            "torchAvailable": self.torch_available,
            "torchVersion": self.torch_version,
            "cudaAvailable": self.cuda_available,
            "device": self.device,
            "gpuName": self.gpu_name,
            "cudaVersion": self.cuda_version,
            "totalVramGb": self.total_vram_gb,
            "recommendedComputeType": self.recommended_compute_type,
            "recommendedBatchSize": self.recommended_batch_size,
            "vramAllocatedGb": 0.0,
            "vramReservedGb": 0.0,
        }

        if self.cuda_available:
            try:
                import torch
                info["vramAllocatedGb"] = round(torch.cuda.memory_allocated(0) / (1024 ** 3), 2)
                info["vramReservedGb"] = round(torch.cuda.memory_reserved(0) / (1024 ** 3), 2)
            except Exception:
                pass

        return info

    def empty_cache(self):
        if self.cuda_available:
            try:
                import torch
                torch.cuda.empty_cache()
                import gc
                gc.collect()
                logger.debug("CUDA memory cache cleared.")
            except Exception as e:
                logger.warning(f"Failed to clear CUDA cache: {e}")

gpu_service = GPUService.get_instance()
