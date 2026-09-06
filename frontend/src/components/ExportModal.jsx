import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  Film, 
  Check, 
  Loader2, 
  FileCode, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { exportSubtitles, burnVideo } from '../services/api';

export default function ExportModal({ 
  isOpen, 
  onClose, 
  captions = [], 
  style, 
  videoFilename 
}) {
  const [activeTab, setActiveTab] = useState('subtitles'); // 'subtitles' | 'video'
  const [selectedFormat, setSelectedFormat] = useState('srt');
  const [isExporting, setIsExporting] = useState(false);
  const [burnResult, setBurnResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleExportSubtitles = async () => {
    try {
      setIsExporting(true);
      setError(null);
      await exportSubtitles(selectedFormat, captions, style);
      setIsExporting(false);
      onClose();
    } catch (err) {
      setIsExporting(false);
      setError(err.response?.data?.detail || err.message || 'Export failed');
    }
  };

  const handleBurnVideo = async () => {
    if (!videoFilename) {
      setError('No source video uploaded to burn subtitles onto.');
      return;
    }
    try {
      setIsExporting(true);
      setError(null);
      setBurnResult(null);
      const res = await burnVideo(videoFilename, captions, style);
      setBurnResult(res);
      setIsExporting(false);
    } catch (err) {
      setIsExporting(false);
      setError(err.response?.data?.detail || err.message || 'Video burning failed');
    }
  };

  const subtitleFormats = [
    { id: 'srt', name: 'SRT Subtitles', ext: '.srt', desc: 'Industry standard for YouTube, Premiere, VLC' },
    { id: 'vtt', name: 'WebVTT', ext: '.vtt', desc: 'Standard format for modern web video players' },
    { id: 'ass', name: 'Advanced SSA (ASS)', ext: '.ass', desc: 'Full styling: font, color, stroke & placement' },
    { id: 'txt', name: 'Plain Transcript', ext: '.txt', desc: 'Raw text transcript without timecodes' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 shadow-2xl border border-dark-600 flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-dark-700/60">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Download className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Export Captions & Video
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-dark-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-dark-850 p-1 rounded-xl border border-dark-700/60 text-xs">
          <button
            onClick={() => { setActiveTab('subtitles'); setError(null); }}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'subtitles'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Subtitle File</span>
          </button>
          <button
            onClick={() => { setActiveTab('video'); setError(null); }}
            className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition ${
              activeTab === 'video'
                ? 'bg-brand-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Burned Video (MP4)</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'subtitles' ? (
          <div className="space-y-3">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Choose Subtitle Format
            </label>
            <div className="space-y-2">
              {subtitleFormats.map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow'
                        : 'bg-dark-850 hover:bg-dark-800 border-dark-700/60 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold">{fmt.name}</span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-dark-700 text-slate-400">
                          {fmt.ext}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{fmt.desc}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleExportSubtitles}
              disabled={isExporting || captions.length === 0}
              className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-glow flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Download {selectedFormat.toUpperCase()}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-dark-850 border border-dark-700/60 text-xs text-slate-300 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Hardcode Subtitles into MP4
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Uses local FFmpeg to render your styled captions directly into the video pixels.
                The output video will display styled captions permanently on any device or player.
              </p>
            </div>

            {burnResult ? (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Video Rendered Successfully!</span>
                </div>
                <p className="text-[11px] text-slate-300 font-mono truncate">
                  File: {burnResult.outputFilename}
                </p>
                <a
                  href={burnResult.downloadUrl}
                  download
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center space-x-2 transition shadow-glow inline-block text-center"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  <span>Download Captioned Video</span>
                </a>
              </div>
            ) : (
              <button
                onClick={handleBurnVideo}
                disabled={isExporting || !videoFilename}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-glow flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering Video with FFmpeg...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Render & Burn Video Now</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
