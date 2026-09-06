import React from 'react';
import { 
  Type, 
  Palette, 
  Layout, 
  Sparkles, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Check,
  Box,
  Flame,
  Zap,
  Play
} from 'lucide-react';
import { STYLE_PRESETS } from '../utils/captionStyles';

export default function StylePanel({ style, onUpdateStyle }) {
  const handlePresetSelect = (presetKey) => {
    const preset = STYLE_PRESETS[presetKey];
    if (preset) {
      onUpdateStyle({ ...preset });
    }
  };

  const updateProp = (key, val) => {
    onUpdateStyle({ ...style, [key]: val });
  };

  const neonColors = [
    { label: 'Cyan', color: '#00F0FF' },
    { label: 'Lime', color: '#10FF70' },
    { label: 'Pink', color: '#FF007F' },
    { label: 'Purple', color: '#818CF8' },
    { label: 'Gold', color: '#FFB800' },
    { label: 'Yellow', color: '#FFE600' },
  ];

  const animationOptions = [
    { id: 'pop', label: 'Pop & Punch', icon: Zap },
    { id: 'bounce', label: 'Bounce', icon: Play },
    { id: 'zoom', label: 'Zoom Punch', icon: Sparkles },
    { id: 'fade', label: 'Smooth Fade', icon: Flame },
    { id: 'none', label: 'Static', icon: Layout },
  ];

  return (
    <div className="w-84 border-l border-dark-700/60 bg-dark-900/90 flex flex-col h-full min-h-0 z-10 overflow-y-auto p-4 space-y-5 select-none custom-scrollbar">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-dark-700/60">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-brand-500 to-accent-cyan flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Caption & Neon Studio
          </h2>
        </div>
      </div>

      {/* Style Presets Grid */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Viral Presets</span>
          <span className="text-[9px] text-brand-400 font-normal">Hormozi & Neon</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(STYLE_PRESETS).map((key) => {
            const p = STYLE_PRESETS[key];
            const isSelected = style.presetName === p.presetName;
            return (
              <button
                key={key}
                onClick={() => handlePresetSelect(key)}
                className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-brand-600/25 border-brand-400 text-white shadow-glow'
                    : 'bg-dark-850 hover:bg-dark-800 border-dark-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold truncate pr-1">{key}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-400 shrink-0" />}
                </div>

                {/* Visual Neon/Punchy Preview Pill */}
                <div 
                  className="text-[10px] px-2 py-0.5 rounded truncate inline-block max-w-full font-black tracking-wider transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: p.hasBackgroundBox ? p.backgroundColor : 'rgba(0,0,0,0.7)',
                    color: p.textColor,
                    textTransform: p.textTransform,
                    boxShadow: p.hasNeonGlow ? `0 0 10px ${p.neonColor}` : 'none',
                    border: p.hasNeonGlow ? `1px solid ${p.neonColor}` : 'none',
                  }}
                >
                  Aa Caption
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. DYNAMIC ENTRANCE ANIMATIONS */}
      <div className="space-y-2.5 pt-2 border-t border-dark-700/60">
        <div className="flex items-center space-x-1.5 text-slate-200">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wide">Caption Animation</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {animationOptions.map((opt) => {
            const isSelected = style.animationPreset === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => updateProp('animationPreset', opt.id)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 transition ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-glow'
                    : 'bg-dark-850 border-dark-700 text-slate-400 hover:bg-dark-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. NEON GLOW EFFECTS STUDIO */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-slate-200">
            <Flame className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-xs font-bold uppercase tracking-wide">Neon Glow Aura</span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(style.hasNeonGlow)}
            onChange={(e) => updateProp('hasNeonGlow', e.target.checked)}
            className="w-4 h-4 rounded accent-cyan-400 cursor-pointer"
          />
        </div>

        {style.hasNeonGlow && (
          <div className="space-y-3 bg-dark-850/80 p-3 rounded-xl border border-cyan-500/30">
            {/* Quick Neon Swatches */}
            <div>
              <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">Neon Bloom Palette</span>
              <div className="flex items-center space-x-1.5">
                {neonColors.map((n) => (
                  <button
                    key={n.color}
                    onClick={() => updateProp('neonColor', n.color)}
                    style={{ backgroundColor: n.color, boxShadow: `0 0 8px ${n.color}` }}
                    className={`w-6 h-6 rounded-full border transition hover:scale-110 ${
                      style.neonColor === n.color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent'
                    }`}
                    title={n.label}
                  />
                ))}
                <input
                  type="color"
                  value={style.neonColor || '#00F0FF'}
                  onChange={(e) => updateProp('neonColor', e.target.value)}
                  className="w-6 h-6 rounded-full cursor-pointer bg-transparent border-0 ml-1"
                />
              </div>
            </div>

            {/* Neon Intensity / Blur Slider */}
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Bloom Radius</span>
                <span className="font-mono text-cyan-400">{style.neonIntensity || 20}px</span>
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
          </div>
        )}
      </div>

      {/* 3. TYPOGRAPHY */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center space-x-1.5 text-slate-200">
          <Type className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wide">Typography</span>
        </div>

        {/* Font Family */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1 font-medium">Display Font</label>
          <select
            value={style.fontFamily}
            onChange={(e) => updateProp('fontFamily', e.target.value)}
            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500 font-semibold"
          >
            <option value="Montserrat, sans-serif">Montserrat (Punchy & Bold)</option>
            <option value="Anton, sans-serif">Anton (Impactful MrBeast Vibe)</option>
            <option value="Outfit, sans-serif">Outfit (Modern TikTok / Reels)</option>
            <option value="Syne, sans-serif">Syne (High-Fashion & Trend)</option>
            <option value="Poppins, sans-serif">Poppins (Smooth Rounded)</option>
            <option value="Russo One, sans-serif">Russo One (Cyberpunk)</option>
            <option value="Bebas Neue, sans-serif">Bebas Neue (Tall Cinematic)</option>
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
              min={18}
              max={68}
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

        {/* Text Case & Letter Spacing */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Case</label>
            <select
              value={style.textTransform}
              onChange={(e) => updateProp('textTransform', e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="uppercase">UPPERCASE (Punchy)</option>
              <option value="none">Normal Case</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Spacing</span>
              <span className="font-mono text-slate-200">{style.letterSpacing}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.2}
              value={style.letterSpacing}
              onChange={(e) => updateProp('letterSpacing', parseFloat(e.target.value))}
              className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>
        </div>
      </div>

      {/* 4. COLOR & THICK OUTLINE */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center space-x-1.5 text-slate-200">
          <Palette className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wide">Color & Stroke</span>
        </div>

        {/* Text Color */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-300">Text Color</span>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={style.textColor}
              onChange={(e) => updateProp('textColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="font-mono text-xs text-slate-300 font-semibold">{style.textColor}</span>
          </div>
        </div>

        {/* Outline Stroke Width */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Outline Stroke</span>
            <span className="font-mono text-slate-200">{style.outlineWidth}px</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={0}
              max={8}
              value={style.outlineWidth}
              onChange={(e) => updateProp('outlineWidth', parseInt(e.target.value))}
              className="flex-1 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <input
              type="color"
              value={style.outlineColor}
              onChange={(e) => updateProp('outlineColor', e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
        </div>
      </div>

      {/* 5. BACKGROUND PILL / BOX */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-slate-200">
            <Box className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wide">Background Box</span>
          </div>
          <input
            type="checkbox"
            checked={Boolean(style.hasBackgroundBox)}
            onChange={(e) => updateProp('hasBackgroundBox', e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
          />
        </div>

        {style.hasBackgroundBox && (
          <div className="space-y-2.5 bg-dark-850 p-3 rounded-xl border border-dark-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Box Color</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={style.backgroundColor}
                  onChange={(e) => updateProp('backgroundColor', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="font-mono text-[11px] text-slate-300">{style.backgroundColor}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Box Opacity</span>
                <span className="font-mono text-slate-200">{Math.round(style.backgroundOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={style.backgroundOpacity}
                onChange={(e) => updateProp('backgroundOpacity', parseFloat(e.target.value))}
                className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Padding ({style.backgroundPadding}px)</span>
                <input
                  type="range"
                  min={2}
                  max={24}
                  value={style.backgroundPadding}
                  onChange={(e) => updateProp('backgroundPadding', parseInt(e.target.value))}
                  className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Corner Radius ({style.borderRadius}px)</span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={style.borderRadius}
                  onChange={(e) => updateProp('borderRadius', parseInt(e.target.value))}
                  className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. POSITION & ALIGNMENT */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60 pb-6">
        <div className="flex items-center space-x-1.5 text-slate-200">
          <Layout className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-bold uppercase tracking-wide">Positioning</span>
        </div>

        {/* Alignment */}
        <div className="flex items-center bg-dark-850 p-1 rounded-xl border border-dark-700/60">
          {[
            { id: 'left', icon: AlignLeft },
            { id: 'center', icon: AlignCenter },
            { id: 'right', icon: AlignRight },
          ].map((align) => {
            const Icon = align.icon;
            const isSelected = style.alignment === align.id;
            return (
              <button
                key={align.id}
                onClick={() => updateProp('alignment', align.id)}
                className={`flex-1 py-1.5 flex items-center justify-center rounded-lg transition ${
                  isSelected ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Position Buttons */}
        <div className="grid grid-cols-4 gap-1.5 text-[11px] font-semibold">
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
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Vertical Position</span>
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
  );
}
