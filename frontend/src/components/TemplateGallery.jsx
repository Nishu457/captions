import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, Flame, Zap, Star, Mic, TrendingUp, Sparkles } from 'lucide-react';
import { STYLE_PRESETS, PRESET_CATEGORIES } from '../utils/captionStyles';
import {
  getWordAnimState,
  getDisplayText,
  PREVIEW_SAMPLE_WORDS,
  getPreviewTime,
} from '../engine/animationEngine';

// ─────────────────────────────────────────────────────────────────────────────
// LIVE PREVIEW CARD
// Renders a mini animated caption preview using the real animation engine.
// ─────────────────────────────────────────────────────────────────────────────
function PresetPreviewCard({ preset, isSelected, onSelect, isHovered }) {
  const [loopMs, setLoopMs]     = useState(0);
  const animRef                 = useRef(null);
  const startRef                = useRef(null);
  const isActive                = isSelected || isHovered;

  // Animate only when hovered or selected — saves CPU
  useEffect(() => {
    if (!isActive) {
      setLoopMs(600); // freeze at a nice mid-state
      return;
    }
    let rafId;
    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      setLoopMs(now - startRef.current);
      rafId = requestAnimationFrame(tick);
    };
    startRef.current = null;
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  const currentTime = getPreviewTime(loopMs);
  const sampleWords = PREVIEW_SAMPLE_WORDS;

  // Compute which words should be visible and their state
  const wordStates = sampleWords.map((word, idx) => {
    const state = getWordAnimState(word, currentTime, preset, 0, idx);
    const displayText = getDisplayText(word, idx, preset, currentTime >= word.start && currentTime <= word.end, word.isEmphasized);
    return { word, state, displayText };
  });

  const isLeftAlign = preset.alignment === 'left' || preset.position === 'left-chest';

  const categoryIcon = {
    Trending: <TrendingUp className="w-3 h-3" />,
    Premium:  <Star className="w-3 h-3" />,
    Dynamic:  <Zap className="w-3 h-3" />,
    Podcast:  <Mic className="w-3 h-3" />,
  }[preset.category] || <Sparkles className="w-3 h-3" />;

  const categoryColor = {
    Trending: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    Premium:  'text-violet-400 bg-violet-400/10 border-violet-400/30',
    Dynamic:  'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    Podcast:  'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  }[preset.category] || 'text-slate-400 bg-slate-400/10 border-slate-400/30';

  return (
    <div
      ref={animRef}
      onClick={() => onSelect(preset)}
      className={`
        relative rounded-2xl border cursor-pointer overflow-hidden group
        transition-all duration-300 select-none
        ${isSelected
          ? 'bg-gradient-to-b from-dark-850 to-brand-950/40 border-brand-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] ring-1 ring-brand-500/50'
          : 'bg-dark-900/90 border-dark-700/70 hover:border-dark-500 hover:bg-dark-850'
        }
      `}
    >
      {/* Category + selection badge */}
      <div className="flex items-center justify-between px-3 pt-3 pb-0">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border tracking-wider uppercase ${categoryColor}`}>
          {categoryIcon}
          {preset.category}
        </span>
        {isSelected && (
          <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center text-white shadow">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}
      </div>

      {/* ── LIVE ANIMATED PREVIEW ─────────────────────────────────────────── */}
      <div
        className="mx-3 mt-2 mb-0 h-28 rounded-xl overflow-hidden relative flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #0a0c14 0%, #111827 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40 pointer-events-none" />

        {/* Caption Preview — uses the real engine */}
        <div
          className="w-full flex flex-col px-4"
          style={{
            fontFamily: preset.fontFamily || 'Poppins, sans-serif',
            alignItems: isLeftAlign ? 'flex-start' : 'center',
            textAlign:  isLeftAlign ? 'left' : 'center',
          }}
        >
          {/* All words on one preview line (compressed) */}
          <div className="flex flex-wrap items-baseline justify-center gap-x-1">
            {wordStates.map(({ word, state, displayText }, idx) => {
              const isEmp = Boolean(word.isEmphasized);
              const baseFontSize = Math.min(20, (preset.fontSize || 32) * 0.58);
              const empScale    = isEmp && preset.highlightType === 'spotlight'
                ? Math.min(1.8, preset.activeWordScale || 1.5)
                : 1.0;
              const fontSize    = `${Math.round(baseFontSize * empScale)}px`;

              // Pill style
              if (state.background && state.background !== 'transparent') {
                return (
                  <span
                    key={idx}
                    style={{
                      color:        state.color,
                      fontSize,
                      fontWeight:   '800',
                      background:   state.background,
                      padding:      '1px 7px',
                      borderRadius: `${preset.activeWordBgRadius || 6}px`,
                      opacity:      Math.max(state.opacity ?? 1, 0.1),
                      transform:    state.transform || 'none',
                      transition:   state.transition,
                      textShadow:   'none',
                      willChange:   'transform, opacity',
                    }}
                  >
                    {displayText}
                  </span>
                );
              }

              return (
                <span
                  key={idx}
                  style={{
                    color:            state.color,
                    fontSize,
                    fontWeight:       isEmp ? (preset.heroFontWeight || '900') : (preset.fontWeight || '700'),
                    opacity:          Math.max(state.opacity ?? 1, 0.1),
                    transform:        state.transform || 'none',
                    transition:       state.transition,
                    textShadow:       state.textShadow,
                    WebkitTextStroke: state.WebkitTextStroke,
                    filter:           state.filter || 'none',
                    willChange:       'transform, opacity, color',
                    textTransform:    preset.textTransform || 'none',
                  }}
                >
                  {displayText}
                </span>
              );
            })}
          </div>

          {/* Background box indicator */}
          {preset.hasBackgroundBox && (
            <div
              className="mt-1 px-2 py-0.5 rounded text-[8px] font-semibold"
              style={{
                backgroundColor: (() => {
                  const hex = preset.backgroundColor || '#000';
                  const r = parseInt(hex.slice(1, 3), 16) || 0;
                  const g = parseInt(hex.slice(3, 5), 16) || 0;
                  const b = parseInt(hex.slice(5, 7), 16) || 0;
                  return `rgba(${r},${g},${b},${preset.backgroundOpacity || 0.7})`;
                })(),
                borderRadius: `${preset.borderRadius || 6}px`,
                color: preset.textColor,
                opacity: 0.6,
              }}
            >
              BG box enabled
            </div>
          )}
        </div>

        {/* "Playing" indicator when animated */}
        {isActive && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-[8px] text-brand-400 font-semibold tracking-wider">LIVE</span>
          </div>
        )}
      </div>

      {/* ── Preset Name & Tagline ──────────────────────────────────────────── */}
      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[11px] font-bold text-white tracking-wide leading-tight">
            {preset.presetName}
          </h3>
          {preset.hasNeonGlow && (
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400/60 shrink-0" />
          )}
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {preset.tagline || 'Professional caption preset'}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-1.5">
          {(preset.tags || []).slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-dark-800 text-slate-500 border border-dark-700/60"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Apply button — shown on hover */}
      <div className={`
        absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6
        bg-gradient-to-t from-dark-900 to-transparent
        transition-all duration-200
        ${isHovered && !isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'}
      `}>
        <button
          onClick={e => { e.stopPropagation(); onSelect(preset); }}
          className="w-full py-1.5 rounded-lg text-[10px] font-bold bg-brand-600 hover:bg-brand-500 text-white transition shadow-glow"
        >
          Apply Preset
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE GALLERY
// ─────────────────────────────────────────────────────────────────────────────
export default function TemplateGallery({ currentStyle, onSelectTemplate }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredKey, setHoveredKey]         = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');

  const categoryIcons = {
    All:      <Sparkles className="w-3 h-3" />,
    Trending: <TrendingUp className="w-3 h-3" />,
    Premium:  <Star className="w-3 h-3" />,
    Dynamic:  <Zap className="w-3 h-3" />,
    Podcast:  <Mic className="w-3 h-3" />,
  };

  const allPresets = Object.entries(STYLE_PRESETS);

  const filteredPresets = allPresets.filter(([key, p]) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch   = !searchQuery || (
      p.presetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesCategory && matchesSearch;
  });

  const handleSelect = useCallback((preset) => {
    onSelectTemplate(preset);
  }, [onSelectTemplate]);

  return (
    <div className="space-y-4 select-none">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search presets..."
          className="w-full bg-dark-800 border border-dark-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {PRESET_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold
              transition-all duration-150
              ${activeCategory === cat
                ? 'bg-brand-600 text-white shadow-glow'
                : 'bg-dark-800 text-slate-400 hover:text-slate-200 hover:bg-dark-700 border border-dark-700'
              }
            `}
          >
            {categoryIcons[cat]}
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-[10px] text-slate-500">
          {filteredPresets.length} preset{filteredPresets.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Preset cards grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredPresets.map(([key, preset]) => {
          const isSelected = currentStyle?.presetName === preset.presetName;
          const isHovered  = hoveredKey === key;
          return (
            <div
              key={key}
              onMouseEnter={() => setHoveredKey(key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <PresetPreviewCard
                preset={preset}
                isSelected={isSelected}
                isHovered={isHovered}
                onSelect={handleSelect}
              />
            </div>
          );
        })}

        {filteredPresets.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            No presets match your search.
          </div>
        )}
      </div>
    </div>
  );
}
