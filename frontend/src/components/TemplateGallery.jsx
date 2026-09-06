import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Flame, Zap, Play } from 'lucide-react';
import { STYLE_PRESETS } from '../utils/captionStyles';

export default function TemplateGallery({ currentStyle, onSelectTemplate }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [animStep, setAnimStep] = useState(1); // 0, 1, 2 for cycling sample words

  // Looping animation step for live animated previews inside every card
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimStep((prev) => (prev + 1) % 3);
    }, 900);
    return () => clearInterval(interval);
  }, []);

  const sampleWords = [
    { word: 'the', isEmp: false },
    { word: 'BUMBLEBEE', isEmp: true },
    { word: 'cannot fly', isEmp: false }
  ];

  const filters = ['All', 'Trending', 'Spotlight', 'Neon', 'Clean'];

  const filteredKeys = Object.keys(STYLE_PRESETS).filter((key) => {
    if (activeFilter === 'All') return true;
    const preset = STYLE_PRESETS[key];
    if (activeFilter === 'Trending') return preset.tags?.includes('Trending') || preset.tags?.includes('Viral');
    if (activeFilter === 'Spotlight') return preset.highlightType === 'spotlight' || preset.spotlightCase === 'uppercase';
    if (activeFilter === 'Neon') return preset.hasNeonGlow;
    if (activeFilter === 'Clean') return preset.tags?.includes('Clean') || preset.tags?.includes('Minimal');
    return true;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition ${
              activeFilter === f
                ? 'bg-brand-600 text-white shadow-glow'
                : 'bg-dark-800 text-slate-400 hover:text-slate-200 hover:bg-dark-750'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 gap-3.5">
        {filteredKeys.map((key) => {
          const p = STYLE_PRESETS[key];
          const isSelected = currentStyle.presetName === p.presetName;

          return (
            <div
              key={key}
              onClick={() => onSelectTemplate(p)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between overflow-hidden group ${
                isSelected
                  ? 'bg-gradient-to-b from-dark-850 to-brand-950/40 border-brand-500 shadow-glow ring-1 ring-brand-500/50'
                  : 'bg-dark-900/90 hover:bg-dark-850 border-dark-700/80 hover:border-dark-600'
              }`}
            >
              {/* Top Tags Bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  {(p.tags || ['Dynamic']).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-dark-950/80 text-slate-300 border border-dark-700 tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white shadow">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* LIVE ANIMATED PREVIEW BOX */}
              <div className="h-28 rounded-xl bg-black/60 border border-dark-800/80 p-3 flex flex-col justify-center overflow-hidden my-1 relative">
                {/* Visual Words Preview */}
                <div 
                  className={`transition-all duration-200 flex flex-col ${
                    p.alignment === 'left' || p.position === 'left-chest' ? 'items-start pl-4 text-left' : 'items-center text-center'
                  }`}
                  style={{ fontFamily: p.fontFamily }}
                >
                  {p.presetName === 'Hero Spotlight' ? (
                    <>
                      <span 
                        className="text-[13px] text-white font-semibold transition-all duration-150"
                        style={{ opacity: animStep >= 0 ? 1 : 0 }}
                      >
                        get
                      </span>

                      {/* Main Spotlight Word */}
                      <span
                        className="inline-block transition-all duration-200 tracking-wider font-black leading-none my-0.5"
                        style={{
                          fontSize: '24px',
                          color: '#3091F7',
                          textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 16px rgba(48,145,247,0.5)',
                          transform: animStep >= 1 ? 'scale(1.02)' : 'scale(0.96)',
                          opacity: animStep >= 1 ? 1 : 0.4,
                        }}
                      >
                        MOTIVATED
                      </span>

                      <span 
                        className="text-[12px] text-slate-200 font-semibold transition-all duration-150"
                        style={{ opacity: animStep >= 2 ? 1 : 0.3 }}
                      >
                        start something
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[12px] text-slate-300 font-medium">
                        {p.spotlightCase === 'uppercase' && animStep === 0 ? 'THE' : 'the'}
                      </span>

                      {/* Main Spotlight Word */}
                      <span
                        className={`inline-block transition-all duration-150 tracking-wider ${
                          animStep === 1 ? 'scale-110 font-black' : 'scale-100 font-extrabold'
                        }`}
                        style={{
                          fontSize: `${Math.min(30, p.fontSize - 4)}px`,
                          textShadow: (animStep === 1 && p.hasNeonGlow)
                            ? `0 0 10px ${p.neonColor || '#3091F7'}, 0 0 20px ${p.neonColor || '#3091F7'}`
                            : (p.hasShadow ? '0 2px 8px rgba(0,0,0,0.9)' : 'none'),
                          backgroundColor: (animStep === 1 && p.highlightType === 'pill') ? (p.activeWordBackground || '#10FF70') : 'transparent',
                          color: (animStep === 1 && p.highlightType === 'pill') ? '#000000' : ((animStep === 1 || p.highlightType === 'spotlight') ? (p.activeWordColor || '#3091F7') : p.textColor),
                          padding: (animStep === 1 && p.highlightType === 'pill') ? '1px 8px' : '0px',
                          borderRadius: (animStep === 1 && p.highlightType === 'pill') ? '6px' : '0px',
                          textTransform: (p.spotlightCase === 'uppercase' || p.textTransform === 'uppercase') ? 'uppercase' : 'none',
                        }}
                      >
                        BUMBLEBEE
                      </span>

                      <span className="text-[12px] text-slate-300 font-medium">
                        {p.textTransform === 'uppercase' ? 'CANNOT FLY' : 'cannot fly'}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Tagline */}
              <div className="mt-3">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    {p.presetName}
                  </h3>
                  {p.hasNeonGlow && <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {p.tagline || 'Modern social video dynamic caption style'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
