import React, { useState } from 'react';
import { 
  Sparkles, 
  Palette, 
  Type, 
  Layout, 
  Zap, 
  Flame, 
  Box, 
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Layers
} from 'lucide-react';
import TemplateGallery from './TemplateGallery';

export default function StylePanel({ style, onUpdateStyle, onResegmentDensity }) {
  const [activeTab, setActiveTab] = useState('templates'); // 'templates', 'word', 'animation', 'typography'

  const updateProp = (key, val) => {
    onUpdateStyle({ ...style, [key]: val });
  };

  const handleSelectTemplate = (template) => {
    onUpdateStyle({ ...template });
    if (template.density && onResegmentDensity) {
      onResegmentDensity(template.density);
    }
  };

  const spotlightColors = [
    { label: 'Electric Blue', color: '#00B4D8' },
    { label: 'Neon Yellow', color: '#FFE600' },
    { label: 'Lime Green', color: '#10FF70' },
    { label: 'Hot Pink', color: '#FF007F' },
    { label: 'Amber Gold', color: '#FFB800' },
    { label: 'Cyan Glow', color: '#00F0FF' },
  ];

  return (
    <div className="w-88 border-l border-dark-700/60 bg-dark-900/95 flex flex-col h-full min-h-0 z-10 overflow-hidden select-none">
      {/* Studio Header */}
      <div className="p-3 border-b border-dark-700/60 bg-dark-900 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Template & Style Studio
            </h2>
            <p className="text-[10px] text-brand-400 font-semibold">
              Current: {style.presetName || 'Custom Style'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-dark-700/60 bg-dark-850/80 p-1 text-[11px] font-bold shrink-0">
        {[
          { id: 'templates', label: 'Templates' },
          { id: 'word', label: 'Spotlight & Color' },
          { id: 'animation', label: 'Animation & Glow' },
          { id: 'typography', label: 'Typography' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg transition text-center ${
              activeTab === t.id
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {activeTab === 'templates' && (
          <TemplateGallery
            currentStyle={style}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {activeTab === 'word' && (
          <div className="space-y-4">
            {/* Active Word Spotlight Color */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Spotlight / Active Word Color
              </label>
              <div className="flex items-center space-x-2">
                {spotlightColors.map((sc) => (
                  <button
                    key={sc.color}
                    onClick={() => updateProp('activeWordColor', sc.color)}
                    style={{ backgroundColor: sc.color, boxShadow: `0 0 8px ${sc.color}` }}
                    className={`w-7 h-7 rounded-full border transition hover:scale-110 ${
                      style.activeWordColor === sc.color ? 'border-white scale-110 ring-2 ring-white/60' : 'border-transparent'
                    }`}
                    title={sc.label}
                  />
                ))}
                <input
                  type="color"
                  value={style.activeWordColor || '#00B4D8'}
                  onChange={(e) => updateProp('activeWordColor', e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                />
              </div>
            </div>

            {/* Active Word Scale */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                <span>Active Word Scale</span>
                <span className="font-mono text-cyan-400">{Math.round((style.activeWordScale || 1.15) * 100)}%</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={1.4}
                step={0.02}
                value={style.activeWordScale || 1.15}
                onChange={(e) => updateProp('activeWordScale', parseFloat(e.target.value))}
                className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Highlight Style Mode */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Word Highlight Mode
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                {[
                  { id: 'spotlight', label: 'Upper Spotlight' },
                  { id: 'karaoke', label: 'Dynamic Karaoke' },
                  { id: 'pill', label: 'Background Pill' },
                  { id: 'neon', label: 'Neon Bloom' },
                  { id: 'scale', label: 'Scale Bounce' },
                  { id: 'reveal', label: 'Progressive Reveal' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => updateProp('highlightType', mode.id)}
                    className={`py-2 px-2 rounded-xl border transition ${
                      style.highlightType === mode.id
                        ? 'bg-brand-600 text-white border-brand-500 shadow-glow'
                        : 'bg-dark-850 border-dark-700 text-slate-400 hover:bg-dark-800'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Normal Text Color & Stroke */}
            <div className="pt-2 border-t border-dark-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300 font-semibold">Base Text Color</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={style.textColor || '#FFFFFF'}
                    onChange={(e) => updateProp('textColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="font-mono text-xs text-slate-400">{style.textColor}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                  <span>Outline Stroke ({style.outlineWidth || 0}px)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={0}
                    max={6}
                    value={style.outlineWidth || 0}
                    onChange={(e) => updateProp('outlineWidth', parseInt(e.target.value))}
                    className="flex-1 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <input
                    type="color"
                    value={style.outlineColor || '#000000'}
                    onChange={(e) => updateProp('outlineColor', e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'animation' && (
          <div className="space-y-4">
            {/* Dynamic Animation Presets */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Entrance Animation
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                {[
                  { id: 'pop', label: 'Pop & Punch 🚀' },
                  { id: 'bounce', label: 'Micro Bounce ⚡' },
                  { id: 'zoom', label: 'Zoom Impact 💥' },
                  { id: 'fade', label: 'Smooth Fade 🌊' },
                  { id: 'glitch', label: 'Glitch Cyber 👾' },
                  { id: 'none', label: 'Static ⏸' },
                ].map((anim) => (
                  <button
                    key={anim.id}
                    onClick={() => updateProp('animationPreset', anim.id)}
                    className={`py-2 px-2.5 rounded-xl border transition ${
                      style.animationPreset === anim.id
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-glow'
                        : 'bg-dark-850 border-dark-700 text-slate-400 hover:bg-dark-800'
                    }`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Neon Glow Section */}
            <div className="pt-2 border-t border-dark-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-cyan-400" />
                  Neon Bloom Aura
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(style.hasNeonGlow)}
                  onChange={(e) => updateProp('hasNeonGlow', e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
                />
              </div>

              {style.hasNeonGlow && (
                <div className="space-y-2.5 bg-dark-850 p-3 rounded-xl border border-cyan-500/30">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Bloom Radius</span>
                    <span className="font-mono text-cyan-300">{style.neonIntensity || 20}px</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={45}
                    value={style.neonIntensity || 20}
                    onChange={(e) => updateProp('neonIntensity', parseInt(e.target.value))}
                    className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-4">
            {/* Font Family */}
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                Display Font
              </label>
              <select
                value={style.fontFamily}
                onChange={(e) => updateProp('fontFamily', e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-bold"
              >
                <option value="Montserrat, sans-serif">Montserrat (Bold Punchy)</option>
                <option value="Anton, sans-serif">Anton (MrBeast Vibe)</option>
                <option value="Outfit, sans-serif">Outfit (TikTok / Reels)</option>
                <option value="Syne, sans-serif">Syne (High Trend)</option>
                <option value="Poppins, sans-serif">Poppins (Smooth Rounded)</option>
                <option value="Russo One, sans-serif">Russo One (Cyberpunk)</option>
                <option value="Bebas Neue, sans-serif">Bebas Neue (Tall Cinema)</option>
                <option value="Inter, sans-serif">Inter (Clean Neutral)</option>
              </select>
            </div>

            {/* Font Size & Weight */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Size</span>
                  <span className="font-mono text-slate-200">{style.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={64}
                  value={style.fontSize}
                  onChange={(e) => updateProp('fontSize', parseInt(e.target.value))}
                  className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Weight</label>
                <select
                  value={style.fontWeight}
                  onChange={(e) => updateProp('fontWeight', e.target.value)}
                  className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
                >
                  <option value="600">SemiBold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">ExtraBold (800)</option>
                  <option value="900">Black / Ultra (900)</option>
                </select>
              </div>
            </div>

            {/* Position */}
            <div className="pt-2 border-t border-dark-700/60 space-y-2">
              <label className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                Screen Position
              </label>
              <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                {['top', 'middle', 'bottom', 'custom'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => updateProp('position', pos)}
                    className={`py-1.5 rounded-lg border capitalize transition ${
                      style.position === pos
                        ? 'bg-brand-600/25 border-brand-400 text-brand-300 shadow-glow'
                        : 'bg-dark-850 border-dark-700 text-slate-400 hover:bg-dark-800'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              {style.position === 'custom' && (
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Vertical % from top</span>
                    <span className="font-mono text-slate-200">{style.verticalPositionPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={95}
                    value={style.verticalPositionPercent}
                    onChange={(e) => updateProp('verticalPositionPercent', parseInt(e.target.value))}
                    className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
