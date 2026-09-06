import React from 'react';
import { 
  Type, 
  Palette, 
  Layout, 
  Sparkles, 
  Sliders, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Check,
  Box
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

  return (
    <div className="w-80 border-l border-dark-700/60 bg-dark-900/80 flex flex-col h-full min-h-0 z-10 overflow-y-auto p-4 space-y-5 select-none">
      {/* Title */}
      <div className="flex items-center space-x-2 pb-2 border-b border-dark-700/60">
        <Sparkles className="w-4 h-4 text-brand-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Caption Styling & Presets
        </h2>
      </div>

      {/* Style Presets Grid */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Style Presets
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
                    ? 'bg-brand-600/20 border-brand-500 text-white shadow-glow'
                    : 'bg-dark-850 hover:bg-dark-800 border-dark-700/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{key}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </div>
                {/* Mini Preview Chip */}
                <div 
                  className="text-[10px] px-1.5 py-0.5 rounded truncate inline-block max-w-full font-bold"
                  style={{
                    backgroundColor: p.hasBackgroundBox ? p.backgroundColor : 'rgba(0,0,0,0.6)',
                    color: p.textColor,
                    textTransform: p.textTransform,
                  }}
                >
                  Aa Caption
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Type className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-semibold uppercase tracking-wide">Typography</span>
        </div>

        {/* Font Family */}
        <div>
          <label className="text-[10px] text-slate-400 block mb-1">Font Family</label>
          <select
            value={style.fontFamily}
            onChange={(e) => updateProp('fontFamily', e.target.value)}
            className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="Inter, sans-serif">Inter</option>
            <option value="Montserrat, sans-serif">Montserrat</option>
            <option value="Outfit, sans-serif">Outfit</option>
            <option value="Bebas Neue, sans-serif">Bebas Neue</option>
            <option value="Roboto, sans-serif">Roboto</option>
            <option value="Roboto Mono, monospace">Roboto Mono</option>
            <option value="Georgia, serif">Georgia</option>
          </select>
        </div>

        {/* Font Size & Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Size</span>
              <span className="font-mono text-slate-300">{style.fontSize}px</span>
            </div>
            <input
              type="range"
              min={16}
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
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="400">Regular (400)</option>
              <option value="600">SemiBold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">ExtraBold (800)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
        </div>

        {/* Text Transform & Letter Spacing */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Case</label>
            <select
              value={style.textTransform}
              onChange={(e) => updateProp('textTransform', e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
            >
              <option value="none">Normal</option>
              <option value="uppercase">UPPERCASE</option>
              <option value="capitalize">Capitalize</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Spacing</span>
              <span className="font-mono text-slate-300">{style.letterSpacing}px</span>
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

      {/* Colors & Appearance Section */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Palette className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-semibold uppercase tracking-wide">Color & Outline</span>
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
            <span className="font-mono text-xs text-slate-400">{style.textColor}</span>
          </div>
        </div>

        {/* Text Outline Width */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Outline Stroke</span>
            <span className="font-mono text-slate-300">{style.outlineWidth}px</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={0}
              max={6}
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

        {/* Shadow Blur */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Shadow Glow</span>
            <span className="font-mono text-slate-300">{style.shadowBlur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={style.shadowBlur}
            onChange={(e) => updateProp('shadowBlur', parseInt(e.target.value))}
            className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
        </div>
      </div>

      {/* Background Box Section */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Box className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-semibold uppercase tracking-wide">Background Box</span>
          </div>
          <input
            type="checkbox"
            checked={style.hasBackgroundBox}
            onChange={(e) => updateProp('hasBackgroundBox', e.target.checked)}
            className="w-4 h-4 rounded accent-brand-500 cursor-pointer"
          />
        </div>

        {style.hasBackgroundBox && (
          <div className="space-y-2.5 bg-dark-850 p-2.5 rounded-xl border border-dark-700/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Box Color</span>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={style.backgroundColor}
                  onChange={(e) => updateProp('backgroundColor', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="font-mono text-[11px] text-slate-400">{style.backgroundColor}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Box Opacity</span>
                <span className="font-mono text-slate-300">{Math.round(style.backgroundOpacity * 100)}%</span>
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
                  max={20}
                  value={style.backgroundPadding}
                  onChange={(e) => updateProp('backgroundPadding', parseInt(e.target.value))}
                  className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">Radius ({style.borderRadius}px)</span>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={style.borderRadius}
                  onChange={(e) => updateProp('borderRadius', parseInt(e.target.value))}
                  className="w-full h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Position & Alignment */}
      <div className="space-y-3 pt-2 border-t border-dark-700/60 pb-6">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Layout className="w-3.5 h-3.5 text-brand-400" />
          <span className="text-xs font-semibold uppercase tracking-wide">Position & Alignment</span>
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

        {/* Position */}
        <div className="grid grid-cols-4 gap-1.5 text-[11px] font-medium">
          {['top', 'middle', 'bottom', 'custom'].map((pos) => (
            <button
              key={pos}
              onClick={() => updateProp('position', pos)}
              className={`py-1.5 rounded-lg border capitalize transition ${
                style.position === pos
                  ? 'bg-brand-600/20 border-brand-500 text-brand-300 shadow-glow'
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
              <span className="font-mono text-slate-300">{style.verticalPositionPercent}%</span>
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
