import React from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  FileAudio, 
  Sparkles, 
  Check 
} from 'lucide-react';

export default function ProgressModal({ 
  isOpen, 
  progressData 
}) {
  if (!isOpen || !progressData) return null;

  const { 
    status = 'processing', 
    step = 'Processing...', 
    progressPercent = 0, 
    message = '', 
    error = null 
  } = progressData;

  const steps = [
    { label: 'Upload Media', minPercent: 10 },
    { label: 'Extract Audio (16kHz)', minPercent: 20 },
    { label: 'Load WhisperX (GPU)', minPercent: 40 },
    { label: 'Transcribe Audio', minPercent: 70 },
    { label: 'Align Timestamps', minPercent: 90 },
    { label: 'Ready', minPercent: 100 },
  ];

  const isFailed = status === 'failed';
  const isCompleted = status === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl border border-dark-600 flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            {isFailed ? (
              <AlertCircle className="w-6 h-6 text-rose-400" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {isFailed ? 'Processing Error' : isCompleted ? 'Captions Ready!' : 'Generating Auto Captions'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isFailed ? 'An error occurred during inference' : 'Local GPU acceleration in progress'}
            </p>
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">{step}</span>
            <span className="font-mono text-brand-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-dark-800 rounded-full overflow-hidden p-0.5 border border-dark-700">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isFailed 
                  ? 'bg-rose-500' 
                  : 'bg-gradient-to-r from-brand-600 via-indigo-500 to-emerald-400 shadow-glow'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 italic truncate">
            {message}
          </p>
        </div>

        {/* Step Progress Checklist */}
        <div className="space-y-2 bg-dark-850 p-3 rounded-xl border border-dark-700/60 text-xs">
          {steps.map((s, idx) => {
            const isDone = progressPercent >= s.minPercent || isCompleted;
            const isCurrent = !isDone && progressPercent >= (steps[idx - 1]?.minPercent || 0);

            return (
              <div 
                key={s.label}
                className="flex items-center space-x-2.5 text-[11px]"
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  isDone 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                    : isCurrent
                    ? 'bg-brand-500 text-white animate-pulse'
                    : 'bg-dark-700 text-slate-500'
                }`}>
                  {isDone ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                </div>
                <span className={isDone ? 'text-slate-200 font-medium' : isCurrent ? 'text-brand-300 font-semibold' : 'text-slate-500'}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Error Details */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Inference Failure
            </p>
            <p className="text-[11px] text-rose-200/80 break-words">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
