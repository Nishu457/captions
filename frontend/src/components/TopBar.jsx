import React from 'react';
import { 
  Sparkles, 
  Cpu, 
  HardDrive, 
  UploadCloud, 
  Download, 
  FolderPlus,
  RefreshCw
} from 'lucide-react';

export default function TopBar({ 
  projectTitle, 
  gpuStatus, 
  onNewProject, 
  onOpenUpload, 
  onOpenExport, 
  onRefreshGPU 
}) {
  const isCuda = gpuStatus?.cudaAvailable;
  const gpuName = gpuStatus?.gpuName || 'GPU Hardware';

  return (
    <header className="h-14 border-b border-dark-700/60 bg-dark-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-400 flex items-center justify-center shadow-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-1.5">
              CAPTION STUDIO <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30 font-semibold tracking-normal">AI</span>
            </h1>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-dark-700"></div>

        {/* Project Name */}
        <div className="flex items-center text-xs text-slate-300 font-medium">
          <span className="text-slate-400 mr-1.5 font-normal">Project:</span>
          <span className="truncate max-w-[200px] text-white hover:text-brand-400 transition cursor-default">
            {projectTitle || 'Untitled Project'}
          </span>
        </div>
      </div>

      {/* GPU Hardware Status Pill */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={onRefreshGPU}
          title="Click to refresh GPU telemetry"
          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition ${
            isCuda 
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/60' 
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-950/60'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isCuda ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <Cpu className="w-3.5 h-3.5" />
          <span>
            {isCuda ? `${gpuName} (CUDA Active)` : 'CPU Mode (CUDA Offline)'}
          </span>
          {isCuda && gpuStatus?.totalVramGb ? (
            <span className="text-[11px] text-emerald-400/70 border-l border-emerald-500/30 pl-1.5 ml-1">
              {gpuStatus.vramAllocatedGb ?? 0}/{gpuStatus.totalVramGb} GB
            </span>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onNewProject}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600/60 transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-400" />
            <span>New</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600/60 transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
            <span>Import</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </header>
  );
}
