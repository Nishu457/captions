import React from 'react';

export default function CaptionOverlay({ activeCaption, style, currentTime = 0 }) {
  if (!activeCaption || !activeCaption.text) {
    return null;
  }

  // Calculate position
  let topPosition = '85%';
  if (style.position === 'top') {
    topPosition = '14%';
  } else if (style.position === 'middle') {
    topPosition = `${style.verticalPositionPercent || 58}%`;
  } else if (style.position === 'custom') {
    topPosition = `${style.verticalPositionPercent}%`;
  }

  let textAlign = 'center';
  let justifyContent = 'center';
  if (style.alignment === 'left') {
    textAlign = 'left';
    justifyContent = 'flex-start';
  } else if (style.alignment === 'right') {
    textAlign = 'right';
    justifyContent = 'flex-end';
  }

  // Text stroke / outline
  const textStroke = style.outlineWidth > 0 
    ? `${style.outlineWidth}px ${style.outlineColor || '#000'}` 
    : 'none';

  // Base shadow
  const baseShadow = style.hasShadow
    ? `${style.shadowOffsetX || 2}px ${style.shadowOffsetY || 3}px ${style.shadowBlur || 10}px ${style.shadowColor || 'rgba(0,0,0,0.9)'}`
    : 'none';

  // Hex to RGBA conversion helper
  const hexToRgba = (hex, alpha) => {
    if (!hex) return 'transparent';
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return 'transparent';
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const backgroundColor = style.hasBackgroundBox
    ? hexToRgba(style.backgroundColor, style.backgroundOpacity)
    : 'transparent';

  const boxBorder = style.hasBackgroundBox && style.hasNeonGlow
    ? `1px solid ${style.neonColor || '#00F0FF'}`
    : 'none';

  const boxGlowShadow = style.hasBackgroundBox && style.hasNeonGlow
    ? `0 0 16px ${hexToRgba(style.neonColor || '#00F0FF', 0.45)}`
    : 'none';

  // Words list
  const words = activeCaption.words && activeCaption.words.length > 0 
    ? activeCaption.words 
    : [];

  // Group words by pre-computed balanced lines if available
  let lineGroups = [words];
  if (activeCaption.lines && activeCaption.lines.length === 2 && words.length >= 3) {
    const line1Count = activeCaption.lines[0].trim().split(/\s+/).length;
    lineGroups = [
      words.slice(0, line1Count),
      words.slice(line1Count)
    ];
  }

  const renderWord = (w, index) => {
    const rawText = w.word.trim();
    const isCurrent = currentTime >= w.start && currentTime <= w.end;
    const isEmp = Boolean(w.isEmphasized);
    const isPassed = currentTime > w.end;
    const isFuture = currentTime < w.start;

    // Upper Dynamic & Spotlight Casing rules
    let displayText = rawText;
    if (style.presetName === 'Upper Dynamic' || style.highlightType === 'spotlight') {
      if (isCurrent || isEmp) {
        displayText = rawText.toUpperCase();
      } else if (style.normalWordCase === 'sentence') {
        displayText = index === 0 ? rawText.charAt(0).toUpperCase() + rawText.slice(1).toLowerCase() : rawText.toLowerCase();
      }
    } else if (style.textTransform === 'uppercase') {
      displayText = rawText.toUpperCase();
    }

    // Color calculation
    let wordColor = style.textColor || '#FFFFFF';
    let wordScale = 1.0;
    let wordShadow = baseShadow;
    let wordBg = 'transparent';
    let wordRadius = 0;
    let wordPadding = '0px';

    if (isCurrent) {
      wordColor = style.activeWordColor || '#00B4D8';
      wordScale = style.activeWordScale || 1.15;

      // Neon aura on active word
      if (style.hasNeonGlow) {
        const nc = style.neonColor || '#00F0FF';
        const ni = style.neonIntensity || 20;
        wordShadow = `0 0 8px ${nc}, 0 0 ${ni}px ${nc}, ${baseShadow}`;
      }

      // Highlight Pill template
      if (style.highlightType === 'pill') {
        wordBg = style.activeWordBackground || '#10FF70';
        wordColor = style.activeWordColor || '#000000';
        wordRadius = `${style.activeWordBgRadius || 8}px`;
        wordPadding = '2px 8px';
      }
    } else if (isEmp) {
      // Standby emphasis keyword
      wordColor = style.activeWordColor || '#00B4D8';
      wordScale = 1.08;
      if (style.hasNeonGlow) {
        wordShadow = `0 0 10px ${style.neonColor || '#00B4D8'}, ${baseShadow}`;
      }
    } else if (style.highlightType === 'reveal' && isFuture) {
      // Typewriter progressive reveal
      wordColor = 'rgba(255, 255, 255, 0.2)';
    }

    return (
      <span
        key={`${w.start}_${w.word}_${index}`}
        className="inline-block transition-all duration-100 ease-out mx-[3px] select-none"
        style={{
          color: wordColor,
          transform: `scale(${wordScale})`,
          textShadow: wordShadow,
          backgroundColor: wordBg,
          borderRadius: wordRadius,
          padding: wordPadding,
          WebkitTextStroke: textStroke,
          fontWeight: (isCurrent || isEmp) ? '900' : style.fontWeight,
        }}
      >
        {displayText}
      </span>
    );
  };

  return (
    <div 
      className="absolute inset-x-0 pointer-events-none z-10 flex px-6 select-none"
      style={{
        top: topPosition,
        transform: 'translateY(-50%)',
        justifyContent,
      }}
    >
      <div
        key={activeCaption.id}
        className="max-w-[92%] inline-block transition-all duration-75 text-center"
        style={{
          fontFamily: style.fontFamily,
          fontSize: `${style.fontSize}px`,
          backgroundColor: backgroundColor,
          padding: style.hasBackgroundBox 
            ? `${style.backgroundPadding}px ${Math.round(style.backgroundPadding * 1.6)}px` 
            : '0px',
          borderRadius: `${style.borderRadius}px`,
          border: boxBorder,
          boxShadow: boxGlowShadow,
          letterSpacing: `${style.letterSpacing}px`,
          lineHeight: style.lineSpacing,
          textAlign: textAlign,
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {words.length > 0 ? (
          lineGroups.map((group, lineIdx) => (
            <div key={lineIdx} className="leading-tight my-0.5">
              {group.map((w, wIdx) => renderWord(w, lineIdx * 10 + wIdx))}
            </div>
          ))
        ) : (
          <span style={{ color: style.textColor, textShadow: baseShadow, WebkitTextStroke: textStroke }}>
            {activeCaption.text}
          </span>
        )}
      </div>
    </div>
  );
}
