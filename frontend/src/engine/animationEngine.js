/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ANIMATION ENGINE — Pure-JS module
 *
 * Computes per-word animation states from a preset config + current timestamp.
 * Used by BOTH CaptionOverlay (preview) AND the ASS export renderer so they
 * are always visually consistent.
 *
 * All computation is stateless — given the same inputs, the same output is
 * returned. Memoisation happens at the call site (e.g. React useMemo).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { EASING_CURVES } from '../utils/captionStyles';

// ─────────────────────────────────────────────────────────────────────────────
// EASING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Return the CSS transition string for a given easing key and duration */
export function getCSSTransition(easingKey = 'premium', durationMs = 200, properties = 'all') {
  const curve = EASING_CURVES[easingKey] || EASING_CURVES.premium;
  return `${properties} ${durationMs}ms ${curve}`;
}

/** Return the raw CSS cubic-bezier string */
export function getEasingCurve(easingKey = 'premium') {
  return EASING_CURVES[easingKey] || EASING_CURVES.premium;
}

// ─────────────────────────────────────────────────────────────────────────────
// WORD STATE COMPUTATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the full CSS-ready state for a single word token.
 *
 * @param {Object} word           — WordItem { word, start, end, isEmphasized }
 * @param {number} currentTime    — Current playback time in seconds
 * @param {Object} preset         — Full preset config (from STYLE_PRESETS)
 * @param {number} captionStart   — Start time of the parent caption segment
 * @param {number} wordIndex      — Word index within the segment
 * @returns {WordAnimState}
 */
export function getWordAnimState(word, currentTime, preset, captionStart = 0, wordIndex = 0) {
  const anim = preset.animation || {};
  const {
    entrance     = 'fade',
    activeWord   = 'color',
    emphasis     = 'highlight',
    easing       = 'premium',
    duration     = 200,
    delay        = 20,
    scale        = 1.0,
    activeScale  = 1.15,
    opacity      = 0.0,
    translateY   = 0,
    translateX   = 0,
    rotation     = 0,
    blur         = 0,
    intensity    = 0.7,
  } = anim;

  const isCurrent  = currentTime >= word.start && currentTime <= word.end;
  const isFuture   = currentTime < word.start;
  const isPast     = currentTime > word.end;
  const isEmp      = Boolean(word.isEmphasized);

  // ── BASE STATE ──────────────────────────────────────────────────────────
  let state = {
    // Colors
    color:      preset.textColor || '#FFFFFF',
    // Transform
    transform:  'none',
    transformOrigin: 'center bottom',
    // Opacity
    opacity:    1.0,
    // Text shadow
    textShadow: _buildBaseShadow(preset),
    // Text stroke
    WebkitTextStroke: _buildStroke(preset),
    // Background (for pill highlight)
    background: 'transparent',
    padding:    '0',
    borderRadius: '0',
    // Transition
    transition: getCSSTransition(easing, duration),
    // Extra
    filter: 'none',
    fontWeight: preset.fontWeight || '700',
    fontSize: `${preset.fontSize || 32}px`,
    letterSpacing: `${preset.letterSpacing || 0.5}px`,
  };

  // ── FUTURE WORD — ENTRANCE ANIMATION (not yet spoken) ───────────────────
  if (isFuture) {
    // Card-intro: words that start at/near caption start are pre-visible
    const isCardIntro = word.start <= captionStart + 0.15;
    if (!isCardIntro) {
      state = _applyEntranceHidden(state, entrance, opacity, scale, translateY, translateX, rotation, blur);
    }
    return state;
  }

  // ── PAST WORD — slightly dimmed for karaoke style ───────────────────────
  if (isPast && (preset.highlightType === 'karaoke' || activeWord === 'color')) {
    state.color   = _dimColor(preset.textColor || '#FFFFFF', 0.6);
    state.opacity = 0.75;
    state.transition = getCSSTransition(easing, duration);
    return state;
  }

  // ── CURRENT WORD ─────────────────────────────────────────────────────────
  if (isCurrent) {
    state = _applyActiveWordStyle(state, preset, activeWord, activeScale, intensity, easing, duration, isEmp);
  }

  // ── EMPHASIS WORD — additional decoration on top ─────────────────────────
  if (isEmp) {
    state = _applyEmphasisStyle(state, preset, emphasis, intensity, isCurrent);
  }

  return state;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY TEXT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the display text for a word according to the preset casing rules.
 */
export function getDisplayText(word, wordIndex, preset, isCurrent, isEmp) {
  const rawText = word.word.trim();
  const isLineStart = wordIndex === 0;

  if (isEmp || (isCurrent && preset.spotlightCase === 'uppercase') || preset.textTransform === 'uppercase') {
    return rawText.toUpperCase();
  }
  if (preset.normalWordCase === 'sentence') {
    if (rawText.toLowerCase() === 'i') return 'I';
    return isLineStart
      ? rawText.charAt(0).toUpperCase() + rawText.slice(1).toLowerCase()
      : rawText.toLowerCase();
  }
  if (preset.normalWordCase === 'uppercase') {
    return rawText.toUpperCase();
  }
  return rawText;
}

// ─────────────────────────────────────────────────────────────────────────────
// FONT / SIZE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the CSS font-size for a word given the preset.
 * Hero Spotlight preset enlarges the emphasized word dramatically.
 */
export function getWordFontSize(word, preset, isCurrent) {
  const isEmp = Boolean(word.isEmphasized);
  const base  = preset.fontSize || 32;

  if (isEmp && preset.highlightType === 'spotlight') {
    return `${Math.round(base * (preset.activeWordScale || 2.15))}px`;
  }
  return `${base}px`;
}

/**
 * Return the CSS font-weight for a word.
 */
export function getWordFontWeight(word, preset) {
  const isEmp = Boolean(word.isEmphasized);
  if (isEmp && preset.heroFontWeight) return preset.heroFontWeight;
  return preset.fontWeight || '700';
}

// ─────────────────────────────────────────────────────────────────────────────
// SEGMENT-LEVEL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the CSS transition string for the entire caption container
 * (entrance / exit of the whole segment block).
 */
export function getContainerTransition(preset) {
  const { easing = 'premium', duration = 200 } = preset.animation || {};
  return getCSSTransition(easing, Math.round(duration * 0.8), 'opacity, transform');
}

/**
 * Returns the container opacity/transform for showing vs hidden state.
 */
export function getContainerState(isVisible, preset) {
  if (isVisible) return { opacity: 1, transform: 'translateY(0)' };
  const { entrance = 'fade', translateY = 0 } = preset.animation || {};
  if (entrance === 'slide-up') return { opacity: 0, transform: `translateY(${translateY || 12}px)` };
  return { opacity: 0, transform: 'translateY(0)' };
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function _buildBaseShadow(preset) {
  if (!preset.hasShadow) return 'none';
  const { shadowOffsetX = 0, shadowOffsetY = 4, shadowBlur = 16, shadowColor = 'rgba(0,0,0,0.65)' } = preset;
  return `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${shadowColor}`;
}

function _buildStroke(preset) {
  if (!preset.outlineWidth || preset.outlineWidth === 0) return 'none';
  return `${preset.outlineWidth}px ${preset.outlineColor || '#000'}`;
}

function _applyEntranceHidden(state, entrance, opacity, scale, translateY, translateX, rotation, blur) {
  let transform = '';

  switch (entrance) {
    case 'scale-in':
    case 'elastic':
    case 'bounce':
    case 'spring':
    case 'pop':
      transform = `scale(${scale || 0.85})`;
      break;
    case 'slide-up':
      transform = `translateY(${translateY || 12}px) translateX(${translateX || 0}px)`;
      break;
    case 'fade':
    default:
      transform = scale !== 1.0 ? `scale(${scale || 0.96})` : 'none';
      break;
  }

  if (rotation) {
    transform += ` rotate(${rotation}deg)`;
  }

  return {
    ...state,
    opacity:  opacity ?? 0.0,
    transform: transform || 'none',
    filter:   blur ? `blur(${blur}px)` : 'none',
  };
}

function _applyActiveWordStyle(state, preset, activeWord, activeScale, intensity, easing, duration, isEmp) {
  const ac = preset.activeWordColor || '#FFE600';

  switch (activeWord) {
    case 'scale': {
      const sc = activeScale || 1.2;
      return {
        ...state,
        color: ac,
        transform: `scale(${sc})`,
        textShadow: _buildActiveShadow(preset),
        transition: getCSSTransition(easing, duration),
      };
    }

    case 'scale-color': {
      const sc = isEmp
        ? (preset.activeWordScale || activeScale || 1.3)
        : (activeScale || 1.15);
      return {
        ...state,
        color: ac,
        transform: sc !== 1.0 ? `scale(${sc})` : 'none',
        textShadow: _buildActiveShadow(preset),
        transition: getCSSTransition(easing, duration),
      };
    }

    case 'bounce-up': {
      return {
        ...state,
        color: ac,
        transform: `translateY(-${Math.abs(preset.animation?.translateY || 8)}px) scale(${activeScale || 1.1})`,
        textShadow: _buildActiveShadow(preset),
        transition: getCSSTransition(easing, duration),
      };
    }

    case 'glow-pulse': {
      const nc = preset.neonColor || ac;
      const ni = preset.neonIntensity || 14;
      return {
        ...state,
        color: ac,
        textShadow: `0 0 ${ni}px ${nc}, 0 0 ${ni * 2}px ${nc}, ${_buildBaseShadow(preset)}`,
        transition: getCSSTransition(easing, duration),
      };
    }

    case 'pill-track': {
      return {
        ...state,
        color: '#000000',
        background: preset.activeWordBackground || '#10FF70',
        padding: '2px 10px',
        borderRadius: `${preset.activeWordBgRadius || 8}px`,
        fontWeight: '800',
        transition: getCSSTransition(easing, duration),
      };
    }

    case 'color':
    default:
      return {
        ...state,
        color: ac,
        transition: getCSSTransition(easing, duration),
      };
  }
}

function _applyEmphasisStyle(state, preset, emphasis, intensity, isCurrent) {
  const ac = preset.activeWordColor || '#FFE600';
  const nc = preset.neonColor || ac;
  const ni = (preset.neonIntensity || 14) * intensity;

  switch (emphasis) {
    case 'punch':
      return {
        ...state,
        color: isCurrent ? ac : state.color,
        fontWeight: preset.heroFontWeight || '900',
      };

    case 'neon-glow':
      return {
        ...state,
        color: isCurrent ? ac : nc,
        textShadow: `0 0 ${ni}px ${nc}, 0 0 ${ni * 1.5}px ${nc}, ${_buildBaseShadow(preset)}`,
      };

    case 'highlight':
      return {
        ...state,
        color: isCurrent ? ac : state.color,
      };

    case 'bold-pop':
      return {
        ...state,
        fontWeight: '900',
        letterSpacing: `${(preset.letterSpacing || 0.5) + 0.5}px`,
      };

    default:
      return state;
  }
}

function _buildActiveShadow(preset) {
  const base = _buildBaseShadow(preset);
  if (!preset.hasNeonGlow) return base;
  const nc = preset.neonColor || preset.activeWordColor || '#3091F7';
  const ni = preset.neonIntensity || 14;
  return `${base}, 0 0 ${ni}px ${_hexToRgba(nc, 0.5)}`;
}

function _dimColor(hex, amount = 0.6) {
  // Reduce opacity by converting to rgba
  const r = parseInt(hex.slice(1, 3), 16) || 200;
  const g = parseInt(hex.slice(3, 5), 16) || 200;
  const b = parseInt(hex.slice(5, 7), 16) || 200;
  return `rgba(${r}, ${g}, ${b}, ${amount})`;
}

function _hexToRgba(hex, alpha = 1) {
  if (!hex) return 'transparent';
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
  const num = parseInt(clean, 16);
  if (isNaN(num)) return 'transparent';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PREVIEW CARD ENGINE — For TemplateGallery live animated previews
// ─────────────────────────────────────────────────────────────────────────────

/** Sample words used in gallery preview cards */
export const PREVIEW_SAMPLE_WORDS = [
  { word: 'this',     start: 0.0, end: 0.4, isEmphasized: false },
  { word: 'is',       start: 0.4, end: 0.7, isEmphasized: false },
  { word: 'REALLY',   start: 0.7, end: 1.1, isEmphasized: false },
  { word: 'important',start: 1.1, end: 1.8, isEmphasized: true  },
];

/**
 * Get a looping preview time for the gallery card (0.0 → 2.2s loop).
 * @param {number} loopMs — elapsed milliseconds in the current loop
 */
export function getPreviewTime(loopMs) {
  const LOOP_DURATION = 2200;
  return ((loopMs % LOOP_DURATION) / 1000);
}
