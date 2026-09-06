import React, { useState, useCallback } from 'react';
import {
  Sparkles, Palette, Type, Layout, Zap, Flame,
  AlignLeft, AlignCenter, AlignRight, Sliders,
  RotateCcw, Monitor, Mic, Star, TrendingUp
} from 'lucide-react';
import TemplateGallery from './TemplateGallery';
import { SAFE_AREA_PRESETS } from '../utils/captionStyles';

const TABS = [
  { id: 'presets',      label: 'Presets',    Icon: Sparkles },
  { id: 'typography',   label: 'Type',       Icon: Type },
  { id: 'appearance',  label: 'Appearance', Icon: Palette },
  { id: 'animation',   label: 'Animation',  Icon: Zap },
  { id: 'layout',      label: 'Layout',     Icon: Layout },
  { id: 'emphasis',    label: 'Emphasis',   Icon: Sliders },
];

const FONTS = [
  { value: 'Poppins, sans-serif',       label: 'Poppins' },
  { value: 'Montserrat, sans-serif',    label: 'Montserrat' },
  { value: 'Anton, sans-serif',         label: 'Anton' },
  { value: 'Outfit, sans-serif',        label: 'Outfit' },
  { value: 'Syne, sans-serif',          label: 'Syne' },
  { value: 'Russo One, sans-serif',     label: 'Russo One' },
  { value: 'Bebas Neue, sans-serif',    label: 'Bebas Neue' },
  { value: 'Inter, sans-serif',         label: 'Inter' },
  { value: 'Roboto Mono, monospace',    label: 'Roboto Mono' },
];

const HIGHLIGHT_MODES = [
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'karaoke',   label: 'Karaoke' },
  { id: 'pill',      label: 'Pill Track' },
  { id: 'neon',      label: 'Neon Bloom' },
  { id: 'scale',     label: 'Scale Bounce' },
  { id: 'glitch',    label: 'Glitch' },
  { id: 'reveal',    label: 'Reveal' },
];

const ANIMATION_ENTRANCES = [
  { id: 'fade',     label: 'Fade In ✨' },
  { id: 'scale-in', label: 'Scale In 🚀' },
  { id: 'slide-up', label: 'Slide Up ⬆' },
  { id: 'bounce',   label: 'Bounce ⚡' },
  { id: 'elastic',  label: 'Elastic 🌀' },
  { id: 'spring',   label: 'Spring 🎯' },
  { id: 'pop',      label: 'Pop 💥' },
  { id: 'none',     label: 'Static ⏸' },
];

const ANIMATION_ACTIVE = [
  { id: 'color',       label: 'Color Change' },
  { id: 'scale-color', label: 'Scale + Color' },
  { id: 'scale',       label: 'Scale Only' },
  { id: 'bounce-up',   label: 'Bounce Up' },
  { id: 'glow-pulse',  label: 'Glow Pulse' },
  { id: 'pill-track',  label: 'Pill Track' },
  { id: 'none',        label: 'None' },
];

const EASING_OPTIONS = [
  { id: 'premium',   label: 'Premium (Recommended)' },
  { id: 'bounce',    label: 'Bounce' },
  { id: 'elastic',   label: 'Elastic' },
  { id: 'spring',    label: 'Spring' },
  { id: 'easeOut',   label: 'Ease Out' },
  { id: 'easeInOut', label: 'Ease In-Out' },
  { id: 'linear',    label: 'Linear' },
];

const ACCENT_COLORS = [
  { label: 'Electric Blue', color: '#3091F7' },
  { label: 'Neon Yellow',   color: '#FFE600' },
  { label: 'Lime Green',    color: '#10FF70' },
  { label: 'Hot Pink',      color: '#FF007F' },
  { label: 'Amber Gold',    color: '#FFB800' },
  { label: 'Sky Blue',      color: '#38BDF8' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="space-y-2.5 pt-3 border-t border-dark-700/60 first:border-t-0 first:pt-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROP ROW — label + value on same line
// ─────────────────────────────────────────────────────────────────────────────
function PropRow({ label, value, children }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-slate-400 font-medium">{label}</span>
        {value !== undefined && <span className="font-mono text-slate-200">{value}</span>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE BUTTON GRID
// ─────────────────────────────────────────────────────────────────────────────
function ButtonGrid({ options, value, onSelect, cols = 2 }) {
  return (
    <div className={`grid grid-cols-${cols} gap-1.5`}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`py-1.5 px-2 rounded-lg border text-[10px] font-semibold transition text-left ${
            value === opt.id
              ? 'bg-brand-600/25 border-brand-400 text-brand-200'
              : 'bg-dark-850 border-dark-700 text-slate-400 hover:bg-dark-800 hover:text-slate-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RANGE SLIDER
// ─────────────────────────────────────────────────────────────────────────────
function RangeSlider({ min, max, step = 1, value, onChange, unit = '', color = 'accent-brand-500' }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer ${color}`}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE PANEL
// ─────────────────────────────────────────────────────────────────────────────
export default function StylePanel({ style, onUpdateStyle, onResegmentDensity }) {
  const [activeTab, setActiveTab] = useState('presets');
  // Store the "original preset" snapshot for the Reset button
  const [snapshotPreset, setSnapshotPreset] = useState(null);

  const update = useCallback((key, val) => {
    onUpdateStyle({ ...style, [key]: val });
  }, [style, onUpdateStyle]);

  const updateAnim = useCallback((key, val) => {
    onUpdateStyle({
      ...style,
      animation: { ...(style.animation || {}), [key]: val },
    });
  }, [style, onUpdateStyle]);

  const handleSelectTemplate = useCallback((template) => {
    setSnapshotPreset(template);
    onUpdateStyle({ ...template });
    if (template.density && onResegmentDensity) {
      onResegmentDensity(template.density);
    }
  }, [onUpdateStyle, onResegmentDensity]);

  const handleResetToPreset = useCallback(() => {
    if (snapshotPreset) {
      onUpdateStyle({ ...snapshotPreset });
    }
  }, [snapshotPreset, onUpdateStyle]);

  const anim = style.animation || {};

  return (
    <div className="w-[340px] border-l border-dark-700/60 bg-dark-900/98 flex flex-col h-full min-h-0 z-10 overflow-hidden select-none">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="p-3 border-b border-dark-700/60 bg-dark-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-glow">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-100">
              Caption Studio
            </h2>
            <p className="text-[9px] text-brand-400 font-semibold truncate max-w-[180px]">
              {style.presetName || 'Custom Style'}
            </p>
          </div>
        </div>

        {/* Reset to preset */}
        {snapshotPreset && (
          <button
            onClick={handleResetToPreset}
            title="Reset to original preset"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-semibold text-slate-400 hover:text-white hover:bg-dark-800 border border-dark-700 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* ── Navigation tabs ─────────────────────────────────────────────── */}
      <div className="flex border-b border-dark-700/60 bg-dark-850/80 shrink-0 overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 min-w-0 flex flex-col items-center py-2 px-1 text-[9px] font-bold uppercase tracking-wider transition ${
              activeTab === id
                ? 'bg-brand-600 text-white shadow-glow'
                : 'text-slate-500 hover:text-slate-200 hover:bg-dark-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5 mb-0.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">

        {/* ═══ PRESETS TAB ═══════════════════════════════════════════════ */}
        {activeTab === 'presets' && (
          <TemplateGallery
            currentStyle={style}
            onSelectTemplate={handleSelectTemplate}
          />
        )}

        {/* ═══ TYPOGRAPHY TAB ════════════════════════════════════════════ */}
        {activeTab === 'typography' && (
          <div className="space-y-5">
            <Section title="Font Family">
              <select
                value={style.fontFamily}
                onChange={e => update('fontFamily', e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {FONTS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </Section>

            <Section title="Size & Weight">
              <div className="grid grid-cols-2 gap-3">
                <PropRow label="Font Size" value={`${style.fontSize}px`}>
                  <RangeSlider min={18} max={72} value={style.fontSize} onChange={v => update('fontSize', parseInt(v))} />
                </PropRow>
                <div>
                  <p className="text-[11px] text-slate-400 mb-1">Weight</p>
                  <select
                    value={style.fontWeight}
                    onChange={e => update('fontWeight', e.target.value)}
                    className="w-full bg-dark-800 border border-dark-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="400">Regular 400</option>
                    <option value="600">SemiBold 600</option>
                    <option value="700">Bold 700</option>
                    <option value="800">ExtraBold 800</option>
                    <option value="900">Black 900</option>
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Spacing">
              <PropRow label="Letter Spacing" value={`${style.letterSpacing || 0}px`}>
                <RangeSlider min={0} max={5} step={0.1} value={style.letterSpacing || 0} onChange={v => update('letterSpacing', parseFloat(v))} color="accent-cyan-400" />
              </PropRow>
              <PropRow label="Line Height" value={`${style.lineSpacing || 1.2}×`}>
                <RangeSlider min={1.0} max={2.0} step={0.05} value={style.lineSpacing || 1.2} onChange={v => update('lineSpacing', parseFloat(v))} color="accent-cyan-400" />
              </PropRow>
            </Section>

            <Section title="Text Transform">
              <ButtonGrid
                cols={3}
                options={[
                  { id: 'none',      label: 'Normal' },
                  { id: 'uppercase', label: 'UPPER' },
                  { id: 'lowercase', label: 'lower' },
                ]}
                value={style.textTransform || 'none'}
                onSelect={v => update('textTransform', v)}
              />
            </Section>

            <Section title="Caption Density">
              <ButtonGrid
                cols={3}
                options={[
                  { id: 'compact',  label: '3 words' },
                  { id: 'balanced', label: '4–5 words' },
                  { id: 'relaxed',  label: '6–8 words' },
                ]}
                value={style.density || 'balanced'}
                onSelect={v => { update('density', v); onResegmentDensity?.(v); }}
              />
            </Section>
          </div>
        )}

        {/* ═══ APPEARANCE TAB ═══════════════════════════════════════════ */}
        {activeTab === 'appearance' && (
          <div className="space-y-5">
            <Section title="Colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-300 font-medium">Base Text</span>
                  <div className="flex items-center gap-2">
                    <input type="color" value={style.textColor || '#FFFFFF'}
                      onChange={e => update('textColor', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent" />
                    <span className="font-mono text-[10px] text-slate-400">{style.textColor}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400 font-medium mb-2">Active Word Color</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {ACCENT_COLORS.map(sc => (
                      <button
                        key={sc.color}
                        onClick={() => update('activeWordColor', sc.color)}
                        style={{ backgroundColor: sc.color, boxShadow: `0 0 8px ${sc.color}66` }}
                        className={`w-6 h-6 rounded-full border-2 transition hover:scale-110 ${
                          style.activeWordColor === sc.color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent'
                        }`}
                        title={sc.label}
                      />
                    ))}
                    <input type="color" value={style.activeWordColor || '#FFE600'}
                      onChange={e => update('activeWordColor', e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" />
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Stroke / Outline">
              <PropRow label="Stroke Width" value={`${style.outlineWidth || 0}px`}>
                <div className="flex items-center gap-2">
                  <RangeSlider min={0} max={8} value={style.outlineWidth || 0} onChange={v => update('outlineWidth', parseInt(v))} />
                  <input type="color" value={style.outlineColor || '#000000'}
                    onChange={e => update('outlineColor', e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0" />
                </div>
              </PropRow>
            </Section>

            <Section title="Drop Shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-300">Shadow</span>
                <input type="checkbox" checked={Boolean(style.hasShadow)}
                  onChange={e => update('hasShadow', e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer" />
              </div>
              {style.hasShadow && (
                <div className="space-y-2 bg-dark-850 p-3 rounded-xl border border-dark-700">
                  <PropRow label="Blur" value={`${style.shadowBlur || 0}px`}>
                    <RangeSlider min={0} max={40} value={style.shadowBlur || 0} onChange={v => update('shadowBlur', parseInt(v))} />
                  </PropRow>
                  <div className="flex gap-2">
                    <PropRow label="X" value={`${style.shadowOffsetX || 0}`}>
                      <RangeSlider min={-10} max={10} value={style.shadowOffsetX || 0} onChange={v => update('shadowOffsetX', parseInt(v))} />
                    </PropRow>
                    <PropRow label="Y" value={`${style.shadowOffsetY || 0}`}>
                      <RangeSlider min={-10} max={10} value={style.shadowOffsetY || 0} onChange={v => update('shadowOffsetY', parseInt(v))} />
                    </PropRow>
                  </div>
                </div>
              )}
            </Section>

            <Section title="Neon Glow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-cyan-400" /> Neon Bloom
                </span>
                <input type="checkbox" checked={Boolean(style.hasNeonGlow)}
                  onChange={e => update('hasNeonGlow', e.target.checked)}
                  className="w-4 h-4 rounded accent-cyan-400 cursor-pointer" />
              </div>
              {style.hasNeonGlow && (
                <div className="space-y-2 bg-dark-850 p-3 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Glow Color</span>
                    <input type="color" value={style.neonColor || '#3091F7'}
                      onChange={e => update('neonColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
                  </div>
                  <PropRow label="Intensity" value={`${style.neonIntensity || 14}px`}>
                    <RangeSlider min={4} max={50} value={style.neonIntensity || 14}
                      onChange={v => update('neonIntensity', parseInt(v))} color="accent-cyan-400" />
                  </PropRow>
                </div>
              )}
            </Section>

            <Section title="Background Box">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-slate-300">Background Box</span>
                <input type="checkbox" checked={Boolean(style.hasBackgroundBox)}
                  onChange={e => update('hasBackgroundBox', e.target.checked)}
                  className="w-4 h-4 rounded accent-brand-500 cursor-pointer" />
              </div>
              {style.hasBackgroundBox && (
                <div className="space-y-2 bg-dark-850 p-3 rounded-xl border border-dark-700">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">BG Color</span>
                    <input type="color" value={style.backgroundColor || '#000000'}
                      onChange={e => update('backgroundColor', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent" />
                  </div>
                  <PropRow label="Opacity" value={`${Math.round((style.backgroundOpacity || 0.7) * 100)}%`}>
                    <RangeSlider min={0} max={1} step={0.05} value={style.backgroundOpacity || 0.7}
                      onChange={v => update('backgroundOpacity', parseFloat(v))} />
                  </PropRow>
                  <PropRow label="Padding" value={`${style.backgroundPadding || 8}px`}>
                    <RangeSlider min={0} max={30} value={style.backgroundPadding || 8}
                      onChange={v => update('backgroundPadding', parseInt(v))} />
                  </PropRow>
                  <PropRow label="Corner Radius" value={`${style.borderRadius || 0}px`}>
                    <RangeSlider min={0} max={30} value={style.borderRadius || 0}
                      onChange={v => update('borderRadius', parseInt(v))} />
                  </PropRow>
                </div>
              )}
            </Section>

            <Section title="Highlight Mode">
              <ButtonGrid
                cols={2}
                options={HIGHLIGHT_MODES}
                value={style.highlightType || 'karaoke'}
                onSelect={v => update('highlightType', v)}
              />
            </Section>
          </div>
        )}

        {/* ═══ ANIMATION TAB ════════════════════════════════════════════ */}
        {activeTab === 'animation' && (
          <div className="space-y-5">
            <Section title="Word Entrance">
              <ButtonGrid
                cols={2}
                options={ANIMATION_ENTRANCES}
                value={anim.entrance || 'fade'}
                onSelect={v => updateAnim('entrance', v)}
              />
            </Section>

            <Section title="Active Word Animation">
              <ButtonGrid
                cols={2}
                options={ANIMATION_ACTIVE}
                value={anim.activeWord || 'color'}
                onSelect={v => updateAnim('activeWord', v)}
              />
            </Section>

            <Section title="Easing Curve">
              <select
                value={anim.easing || 'premium'}
                onChange={e => updateAnim('easing', e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              >
                {EASING_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </Section>

            <Section title="Timing">
              <div className="space-y-3">
                <PropRow label="Duration" value={`${anim.duration || 200}ms`}>
                  <RangeSlider min={50} max={600} step={10} value={anim.duration || 200}
                    onChange={v => updateAnim('duration', parseInt(v))} color="accent-amber-400" />
                </PropRow>
                <PropRow label="Word Stagger" value={`${anim.delay || 20}ms`}>
                  <RangeSlider min={0} max={100} step={5} value={anim.delay || 20}
                    onChange={v => updateAnim('delay', parseInt(v))} color="accent-amber-400" />
                </PropRow>
              </div>
            </Section>

            <Section title="Entrance Properties">
              <div className="space-y-3">
                <PropRow label="Start Scale" value={`${Math.round((anim.scale || 1.0) * 100)}%`}>
                  <RangeSlider min={0.3} max={1.2} step={0.05} value={anim.scale || 1.0}
                    onChange={v => updateAnim('scale', parseFloat(v))} />
                </PropRow>
                <PropRow label="Start Opacity" value={`${Math.round((anim.opacity || 0) * 100)}%`}>
                  <RangeSlider min={0} max={1} step={0.05} value={anim.opacity || 0}
                    onChange={v => updateAnim('opacity', parseFloat(v))} />
                </PropRow>
                <PropRow label="Translate Y" value={`${anim.translateY || 0}px`}>
                  <RangeSlider min={-30} max={30} value={anim.translateY || 0}
                    onChange={v => updateAnim('translateY', parseInt(v))} />
                </PropRow>
                <PropRow label="Translate X" value={`${anim.translateX || 0}px`}>
                  <RangeSlider min={-30} max={30} value={anim.translateX || 0}
                    onChange={v => updateAnim('translateX', parseInt(v))} />
                </PropRow>
                <PropRow label="Blur" value={`${anim.blur || 0}px`}>
                  <RangeSlider min={0} max={10} value={anim.blur || 0}
                    onChange={v => updateAnim('blur', parseInt(v))} />
                </PropRow>
              </div>
            </Section>

            <Section title="Active Word Scale">
              <PropRow label="Scale" value={`${Math.round((style.activeWordScale || 1.15) * 100)}%`}>
                <RangeSlider min={1.0} max={2.5} step={0.05} value={style.activeWordScale || 1.15}
                  onChange={v => update('activeWordScale', parseFloat(v))} color="accent-cyan-400" />
              </PropRow>
              <PropRow label="Intensity" value={`${Math.round((anim.intensity || 0.7) * 100)}%`}>
                <RangeSlider min={0.1} max={1.0} step={0.05} value={anim.intensity || 0.7}
                  onChange={v => updateAnim('intensity', parseFloat(v))} color="accent-cyan-400" />
              </PropRow>
            </Section>
          </div>
        )}

        {/* ═══ LAYOUT TAB ═══════════════════════════════════════════════ */}
        {activeTab === 'layout' && (
          <div className="space-y-5">
            <Section title="Position">
              <ButtonGrid
                cols={2}
                options={[
                  { id: 'left-chest', label: '📍 Left Chest' },
                  { id: 'middle',     label: '🎯 Center Mid' },
                  { id: 'bottom',     label: '⬇ Bottom' },
                  { id: 'custom',     label: '🖱 Custom' },
                ]}
                value={style.position}
                onSelect={id => {
                  if (id === 'left-chest') {
                    onUpdateStyle({ ...style, position: 'left-chest', horizontalPercent: 22, verticalPositionPercent: 58, alignment: 'left' });
                  } else if (id === 'middle') {
                    onUpdateStyle({ ...style, position: 'middle', alignment: 'center', verticalPositionPercent: 60 });
                  } else if (id === 'bottom') {
                    onUpdateStyle({ ...style, position: 'bottom', alignment: 'center', verticalPositionPercent: 84 });
                  } else {
                    update('position', 'custom');
                  }
                }}
              />
            </Section>

            <Section title="Alignment">
              <div className="flex gap-2">
                {[
                  { id: 'left',   Icon: AlignLeft },
                  { id: 'center', Icon: AlignCenter },
                  { id: 'right',  Icon: AlignRight },
                ].map(({ id, Icon }) => (
                  <button
                    key={id}
                    onClick={() => update('alignment', id)}
                    className={`flex-1 py-2 rounded-lg border flex items-center justify-center transition ${
                      style.alignment === id
                        ? 'bg-brand-600/25 border-brand-400 text-brand-300'
                        : 'bg-dark-850 border-dark-700 text-slate-400 hover:bg-dark-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Custom Position">
              <div className="space-y-3 bg-dark-850 p-3 rounded-xl border border-dark-700">
                <PropRow label="Vertical %" value={`${style.verticalPositionPercent ?? 65}%`}>
                  <RangeSlider min={5} max={95} value={style.verticalPositionPercent ?? 65}
                    onChange={v => update('verticalPositionPercent', parseInt(v))} />
                </PropRow>
                {(style.position === 'left-chest' || style.position === 'custom') && (
                  <PropRow label="Horizontal %" value={`${style.horizontalPercent ?? 50}%`}>
                    <RangeSlider min={5} max={90} value={style.horizontalPercent ?? 50}
                      onChange={v => update('horizontalPercent', parseInt(v))} />
                  </PropRow>
                )}
                <PropRow label="Max Width %" value={`${style.maxWidthPercent ?? 85}%`}>
                  <RangeSlider min={40} max={98} value={style.maxWidthPercent ?? 85}
                    onChange={v => update('maxWidthPercent', parseInt(v))} />
                </PropRow>
              </div>
            </Section>

            <Section title="Safe Area Presets">
              <p className="text-[10px] text-slate-500 mb-2">Snap position to platform-specific safe zones</p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(SAFE_AREA_PRESETS).map(([key, sa]) => (
                  <button
                    key={key}
                    onClick={() => onUpdateStyle({
                      ...style,
                      verticalPositionPercent: sa.recommendedY,
                      maxWidthPercent: sa.maxWidthPercent,
                      position: 'custom',
                      alignment: 'center',
                    })}
                    className="py-2 px-2.5 rounded-xl border border-dark-700 bg-dark-850 hover:bg-dark-800 text-left transition group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Monitor className="w-3 h-3 text-slate-500 group-hover:text-brand-400 transition" />
                      <span className="text-[10px] font-bold text-slate-300">{sa.label}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{sa.ratio} · y={sa.recommendedY}%</span>
                  </button>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ═══ EMPHASIS TAB ═════════════════════════════════════════════ */}
        {activeTab === 'emphasis' && (
          <div className="space-y-5">
            <Section title="Auto-Emphasis">
              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                The engine auto-detects high-impact words (numbers, power words, all-caps) and applies stronger animation to them.
              </p>
              <div className="bg-dark-850 p-3 rounded-xl border border-dark-700 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-300">Emphasis Animation</span>
                </div>
                <ButtonGrid
                  cols={2}
                  options={[
                    { id: 'punch',     label: '💥 Punch' },
                    { id: 'neon-glow', label: '✨ Neon Glow' },
                    { id: 'highlight', label: '🎨 Color Shift' },
                    { id: 'bold-pop',  label: '💪 Bold Pop' },
                    { id: 'none',      label: '⏸ None' },
                  ]}
                  value={anim.emphasis || 'highlight'}
                  onSelect={v => updateAnim('emphasis', v)}
                />
              </div>
            </Section>

            <Section title="Emphasis Color">
              <div className="flex items-center gap-2 flex-wrap">
                {ACCENT_COLORS.map(sc => (
                  <button
                    key={sc.color}
                    onClick={() => update('activeWordColor', sc.color)}
                    style={{ backgroundColor: sc.color, boxShadow: `0 0 8px ${sc.color}66` }}
                    className={`w-7 h-7 rounded-full border-2 transition hover:scale-110 ${
                      style.activeWordColor === sc.color ? 'border-white scale-110 ring-2 ring-white/50' : 'border-transparent'
                    }`}
                    title={sc.label}
                  />
                ))}
                <input type="color" value={style.activeWordColor || '#FFE600'}
                  onChange={e => update('activeWordColor', e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" />
              </div>
            </Section>

            <Section title="Emphasis Intensity">
              <PropRow label="Intensity" value={`${Math.round((anim.intensity || 0.7) * 100)}%`}>
                <RangeSlider min={0.1} max={1.0} step={0.05} value={anim.intensity || 0.7}
                  onChange={v => updateAnim('intensity', parseFloat(v))} color="accent-amber-400" />
              </PropRow>
              <PropRow label="Active Word Scale" value={`${Math.round((style.activeWordScale || 1.15) * 100)}%`}>
                <RangeSlider min={1.0} max={3.0} step={0.05} value={style.activeWordScale || 1.15}
                  onChange={v => update('activeWordScale', parseFloat(v))} color="accent-amber-400" />
              </PropRow>
            </Section>

            <Section title="Manual Word Emphasis">
              <div className="p-3 rounded-xl bg-dark-850 border border-dark-700/60 text-[11px] text-slate-400 leading-relaxed">
                <p className="text-slate-300 font-semibold mb-1">💡 How to mark important words:</p>
                <p>Switch to the <strong className="text-white">Captions</strong> tab, click any word in the caption editor, and toggle the emphasis flag. Emphasized words receive the animation defined above.</p>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}
