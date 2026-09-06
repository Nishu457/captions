import React, { useMemo } from 'react';
import {
  getWordAnimState,
  getDisplayText,
  getWordFontSize,
  getWordFontWeight,
  getCSSTransition,
} from '../engine/animationEngine';

/**
 * CaptionOverlay — Renders the active caption segment over the video.
 *
 * Uses the shared animationEngine so preview and export are visually
 * consistent. Word-level animation state is memoised per currentTime
 * to avoid expensive recalculation every React render.
 */
export default function CaptionOverlay({ activeCaption, style, currentTime = 0 }) {
  if (!activeCaption || !activeCaption.text) return null;

  const preset = style;

  // ── Positioning ──────────────────────────────────────────────────────────
  const isLeftChest =
    preset.position === 'left-chest' ||
    (preset.alignment === 'left' && preset.horizontalPercent !== undefined);

  let containerStyle = {
    top:       `${preset.verticalPositionPercent || 65}%`,
    transform: 'translateY(-50%)',
    width:     '100%',
    left:      0,
    right:     0,
    display:   'flex',
    justifyContent: 'center',
  };

  if (isLeftChest) {
    containerStyle = {
      top:        `${preset.verticalPositionPercent || 58}%`,
      left:       `${preset.horizontalPercent ?? 22}%`,
      transform:  'translateY(-50%)',
      maxWidth:   `${preset.maxWidthPercent || 68}%`,
      display:    'flex',
      justifyContent: 'flex-start',
    };
  } else if (preset.alignment === 'right') {
    containerStyle.justifyContent = 'flex-end';
  }

  const textAlign = isLeftChest ? 'left' : (preset.alignment || 'center');

  // ── Background box ───────────────────────────────────────────────────────
  const hexToRgba = (hex, alpha) => {
    if (!hex) return 'transparent';
    let clean = hex.replace('#', '');
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    const num = parseInt(clean, 16);
    if (isNaN(num)) return 'transparent';
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  };

  const bgColor = preset.hasBackgroundBox
    ? hexToRgba(preset.backgroundColor, preset.backgroundOpacity)
    : 'transparent';

  const boxBorder = preset.hasBackgroundBox && preset.hasNeonGlow
    ? `1px solid ${preset.neonColor || '#3091F7'}`
    : 'none';

  const boxGlow = preset.hasBackgroundBox && preset.hasNeonGlow
    ? `0 0 16px ${hexToRgba(preset.neonColor || '#3091F7', 0.4)}`
    : 'none';

  // ── Word groups / line layout ─────────────────────────────────────────────
  const words = activeCaption.words?.length ? activeCaption.words : [];

  const lineGroups = useMemo(() => {
    if (!words.length) return [[]];
    if (activeCaption.lines?.length >= 2 && words.length >= 2) {
      const groups = [];
      let currIdx = 0;
      for (const lineText of activeCaption.lines) {
        const count = lineText.trim().split(/\s+/).length;
        if (count > 0) {
          groups.push(words.slice(currIdx, currIdx + count));
          currIdx += count;
        }
      }
      if (currIdx < words.length) {
        if (groups.length) groups[groups.length - 1] = groups[groups.length - 1].concat(words.slice(currIdx));
        else groups.push(words.slice(currIdx));
      }
      return groups;
    }
    // 3-tier split fallback if emphasis detected
    if (words.length >= 3) {
      const empIdx = words.findIndex(w => w.isEmphasized);
      if (empIdx !== -1) {
        const groups = [];
        if (empIdx > 0) groups.push(words.slice(0, empIdx));
        groups.push(words.slice(empIdx, empIdx + 1));
        if (empIdx + 1 < words.length) groups.push(words.slice(empIdx + 1));
        return groups;
      }
    }
    return [words];
  }, [words, activeCaption.lines]);

  // ── Render a single word span ─────────────────────────────────────────────
  const renderWord = (word, wordIdxInLine, lineIdx, isHeroLine) => {
    const isCurrent = currentTime >= word.start && currentTime <= word.end;
    const isEmp     = Boolean(word.isEmphasized) || isHeroLine;
    const wordKey   = `${word.start}_${word.word}_${lineIdx}_${wordIdxInLine}`;

    const animState = getWordAnimState(
      { ...word, isEmphasized: isEmp },
      currentTime,
      preset,
      activeCaption.start || 0,
      wordIdxInLine
    );

    const displayText = getDisplayText(
      { ...word, isEmphasized: isEmp },
      wordIdxInLine,
      preset,
      isCurrent,
      isEmp
    );

    const fontSize   = getWordFontSize({ ...word, isEmphasized: isEmp }, preset, isCurrent);
    const fontWeight = getWordFontWeight({ ...word, isEmphasized: isEmp }, preset);

    // Pill highlight mode (Dynamic Highlight preset)
    if (isCurrent && preset.highlightType === 'pill' && preset.activeWordBackground) {
      return (
        <span
          key={wordKey}
          className="inline-block select-none"
          style={{
            backgroundColor: preset.activeWordBackground,
            color: '#000000',
            fontWeight: '800',
            fontSize,
            padding: '2px 10px',
            borderRadius: `${preset.activeWordBgRadius || 8}px`,
            marginLeft: wordIdxInLine === 0 ? '0' : '5px',
            marginRight: '4px',
            opacity: animState.opacity,
            transform: animState.transform,
            transition: animState.transition,
          }}
        >
          {displayText}
        </span>
      );
    }

    return (
      <span
        key={wordKey}
        className="inline-block select-none leading-none align-baseline"
        style={{
          color:            animState.color,
          fontSize,
          fontWeight,
          opacity:          animState.opacity,
          transform:        animState.transform,
          transformOrigin:  animState.transformOrigin || 'center bottom',
          textShadow:       animState.textShadow,
          WebkitTextStroke: animState.WebkitTextStroke,
          filter:           animState.filter || 'none',
          letterSpacing:    isEmp && preset.highlightType === 'spotlight'
            ? '1.5px'
            : `${preset.letterSpacing || 0.5}px`,
          marginLeft:  wordIdxInLine === 0 ? '0' : '5px',
          marginRight: '4px',
          transition:  animState.transition,
          willChange:  'transform, opacity, color',
          background:  animState.background || 'transparent',
          padding:     animState.padding || '0',
          borderRadius:animState.borderRadius || '0',
        }}
      >
        {displayText}
      </span>
    );
  };

  return (
    <div
      className="absolute pointer-events-none z-10 px-4 select-none"
      style={containerStyle}
    >
      <div
        key={activeCaption.id}
        className="inline-flex flex-col"
        style={{
          fontFamily:          preset.fontFamily || 'Poppins, sans-serif',
          backgroundColor:     bgColor,
          padding:             preset.hasBackgroundBox
            ? `${preset.backgroundPadding}px ${Math.round(preset.backgroundPadding * 1.6)}px`
            : '0px',
          borderRadius:        `${preset.borderRadius || 0}px`,
          border:              boxBorder,
          boxShadow:           boxGlow,
          textAlign,
          alignItems:          textAlign === 'left' ? 'flex-start' : (textAlign === 'right' ? 'flex-end' : 'center'),
          whiteSpace:          'normal',
          wordBreak:           'break-word',
          WebkitFontSmoothing: 'antialiased',
          lineHeight:          preset.lineSpacing || 1.2,
        }}
      >
        {words.length > 0 ? (
          lineGroups.map((group, lineIdx) => {
            const isHeroLine =
              group.some(w => w.isEmphasized) &&
              (group.length <= 2 || (lineGroups.length === 3 && lineIdx === 1));
            return (
              <div
                key={lineIdx}
                className="leading-none my-1 flex flex-wrap items-baseline"
                style={{
                  justifyContent: textAlign === 'left' ? 'flex-start' : (textAlign === 'right' ? 'flex-end' : 'center'),
                }}
              >
                {group.map((w, wIdx) => renderWord(w, wIdx, lineIdx, isHeroLine))}
              </div>
            );
          })
        ) : (
          // Fallback: no word timestamps
          <span
            style={{
              color:            preset.textColor,
              fontSize:         `${preset.fontSize}px`,
              fontWeight:       preset.fontWeight,
              textShadow:       preset.hasShadow
                ? `${preset.shadowOffsetX || 0}px ${preset.shadowOffsetY || 4}px ${preset.shadowBlur || 16}px ${preset.shadowColor || 'rgba(0,0,0,0.65)'}`
                : 'none',
              WebkitTextStroke: preset.outlineWidth > 0
                ? `${preset.outlineWidth}px ${preset.outlineColor || '#000'}`
                : 'none',
            }}
          >
            {activeCaption.text}
          </span>
        )}
      </div>
    </div>
  );
}
