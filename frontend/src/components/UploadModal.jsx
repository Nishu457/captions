import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  X, 
  Cpu, 
  Check, 
  Settings2, 
  FileVideo, 
  FileAudio,
  Sparkles
} from 'lucide-react';

export default function UploadModal({ 
  isOpen, 
  onClose, 
  onStartProcess, 
  gpuStatus 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [model, setModel] = useState('small'); // Optimal for RTX 3050 6GB
  const [language, setLanguage] = useState('auto');
  const [align, setAlign] = useState(true);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    onStartProcess({
      file: selectedFile,
      model,
      language: language === 'auto' ? null : language,
      align,
    });
  };

  const models = [
    { id: 'tiny', name: 'Tiny', desc: 'Fastest, minimal VRAM (<1GB)' },
    { id: 'base', name: 'Base', desc: 'Fast, good for simple speech (~1GB)' },
    { id: 'small', name: 'Small', desc: 'Recommended for RTX 3050 6GB (~2GB)', badge: 'Recommended' },
    { id: 'medium', name: 'Medium', desc: 'High accuracy (~4GB VRAM)' },
    { id: 'large-v3', name: 'Large-v3', desc: 'Maximum precision (~5.5GB VRAM)' },
  ];

  const languages = [
    { code: 'auto', name: 'Auto Detect Language' },
    { code: 'en', name: 'English' },
    { code: 'te', name: 'Telugu (తెలుగు)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-6 shadow-2xl border border-dark-600 flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-700/60">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Import Media & Transcribe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              dragActive 
                ? 'border-brand-500 bg-brand-500/10 scale-[1.01]' 
                : selectedFile
                ? 'border-emerald-500/60 bg-emerald-950/20'
                : 'border-dark-700 hover:border-dark-600 bg-dark-900/50 hover:bg-dark-900/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileVideo className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white max-w-xs truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-brand-400 mb-2" />
                <p className="text-xs font-semibold text-slate-200">
                  Click to browse or drag & drop media here
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports MP4, MOV, MKV, WEBM, MP3, WAV, FLAC, M4A
                </p>
              </>
            )}
          </div>

          {/* Model Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-brand-400" />
                WhisperX Model
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">
                {gpuStatus?.cudaAvailable ? 'RTX 3050 6GB GPU Accelerated' : 'CPU Mode'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {models.map((m) => {
                const isSelected = model === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setModel(m.id)}
                    className={`py-2 px-1 rounded-xl border text-center transition flex flex-col items-center relative ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow'
                        : 'bg-dark-850 border-dark-700/60 text-slate-300 hover:bg-dark-800'
                    }`}
                  >
                    <span className="text-xs font-bold">{m.name}</span>
                    {m.badge && (
                      <span className="text-[8px] mt-0.5 px-1 rounded bg-brand-500/30 text-brand-300 font-medium">
                        {m.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Language & Alignment Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Spoken Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2 bg-dark-850 border border-dark-700/60 rounded-xl p-2.5 cursor-pointer hover:bg-dark-800 transition">
                <input
                  type="checkbox"
                  checked={align}
                  onChange={(e) => setAlign(e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 font-medium">
                  Word Timestamp Alignment
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={!selectedFile}
              className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
                selectedFile
                  ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow'
                  : 'bg-dark-800 text-slate-500 cursor-not-allowed border border-dark-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate GPU Auto Captions</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
