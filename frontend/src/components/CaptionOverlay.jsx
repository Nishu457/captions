import React from 'react';

export default function CaptionOverlay({ activeCaption, style, currentTime = 0 }) {
  if (!activeCaption || !activeCaption.text) {
    return null;
  }

  const isLeftChest = style.position === 'left-chest' || (style.alignment === 'left' && style.horizontalPercent !== undefined);

  // Positioning
  let containerStyle = {
    top: `${style.verticalPositionPercent || 58}%`,
    transform: 'translateY(-50%)',
    justifyContent: 'center',
    width: '100%',
    left: 0,
    right: 0,
  };

  if (isLeftChest) {
    containerStyle = {
      top: `${style.verticalPositionPercent || 58}%`,
      left: `${style.horizontalPercent ?? 22}%`,
      transform: 'translateY(-50%)',
      justifyContent: 'flex-start',
      width: 'auto',
      maxWidth: `${style.maxWidthPercent || 68}%`,
    };
  } else if (style.position === 'top') {
    containerStyle.top = '14%';
  } else if (style.position === 'custom') {
    containerStyle.top = `${style.verticalPositionPercent}%`;
  } else if (style.position === 'bottom') {
    containerStyle.top = `${style.verticalPositionPercent || 82}%`;
  }

  let textAlign = style.alignment || (isLeftChest ? 'left' : 'center');
  if (style.alignment === 'left') {
    containerStyle.justifyContent = 'flex-start';
  } else if (style.alignment === 'right') {
    containerStyle.justifyContent = 'flex-end';
  }

  // Text stroke / outline
  const textStroke = style.outlineWidth > 0 
    ? `${style.outlineWidth}px ${style.outlineColor || '#000'}` 
    : 'none';

  // Base shadow
  const baseShadow = style.hasShadow
    ? `${style.shadowOffsetX || 0}px ${style.shadowOffsetY || 4}px ${style.shadowBlur || 16}px ${style.shadowColor || 'rgba(0,0,0,0.65)'}`
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
    ? `1px solid ${style.neonColor || '#3091F7'}`
    : 'none';

  const boxGlowShadow = style.hasBackgroundBox && style.hasNeonGlow
    ? `0 0 16px ${hexToRgba(style.neonColor || '#3091F7', 0.45)}`
    : 'none';

  // Words list
  const words = activeCaption.words && activeCaption.words.length > 0 
    ? activeCaption.words 
    : [];

  // Group words into balanced lines / 3-tier hierarchy (Prefix -> Hero -> Suffix)
  let lineGroups = [words];
  if (activeCaption.lines && activeCaption.lines.length >= 2 && words.length >= 2) {
    lineGroups = [];
    let currIdx = 0;
    for (const lineText of activeCaption.lines) {
      const count = lineText.trim().split(/\s+/).length;
      if (count > 0) {
        lineGroups.push(words.slice(currIdx, currIdx + count));
        currIdx += count;
      }
    }
    if (currIdx < words.length) {
      if (lineGroups.length > 0) {
        lineGroups[lineGroups.length - 1] = lineGroups[lineGroups.length - 1].concat(words.slice(currIdx));
      } else {
        lineGroups.push(words.slice(currIdx));
      }
    }
  } else if (words.length >= 3) {
    // Dynamic 3-tier split fallback
    const empIdx = words.findIndex(w => w.isEmphasized);
    if (empIdx !== -1) {
      const prefix = words.slice(0, empIdx);
      const hero = words.slice(empIdx, empIdx + 1);
      const suffix = words.slice(empIdx + 1);
      lineGroups = [];
      if (prefix.length > 0) lineGroups.push(prefix);
      if (hero.length > 0) lineGroups.push(hero);
      if (suffix.length > 0) lineGroups.push(suffix);
    }
  }

  const renderWord = (w, index, isLineHero = false) => {
    const rawText = w.word.trim();
    const isCurrent = currentTime >= w.start && currentTime <= w.end;
    const isEmp = Boolean(w.isEmphasized) || isLineHero;
    const isFuture = currentTime < w.start;

    // Casing rules matching reference video
    let displayText = rawText;
    if (isEmp || (isCurrent && style.spotlightCase === 'uppercase')) {
      displayText = rawText.toUpperCase();
    } else if (style.normalWordCase === 'sentence') {
      if (rawText.toLowerCase() === 'i') {
        displayText = 'I';
      } else {
        displayText = index === 0 ? rawText.charAt(0).toUpperCase() + rawText.slice(1).toLowerCase() : rawText.toLowerCase();
      }
    } else if (style.textTransform === 'uppercase') {
      displayText = rawText.toUpperCase();
    }

    // Colors and shadow
    let wordColor = style.textColor || '#FFFFFF';
    let wordShadow = baseShadow;
    let wordScale = 1.0;
    let wordOpacity = 1.0;
    let wordTransform = 'none';

    // Progressive smooth entrance matching reference video
    if (style.animationPreset === 'smooth-fade') {
      // The hero spotlight word and initial context words are visible immediately on card start
      const isCardIntro = isEmp || (w.start <= (activeCaption.start || 0) + 0.2);
      if (isFuture && !isCardIntro) {
        wordOpacity = 0.0;
        wordTransform = 'translateY(6px) scale(0.96)';
      } else {
        wordOpacity = 1.0;
        wordTransform = isCurrent && isEmp ? 'scale(1.02)' : 'none';
      }
    }

    if (isEmp) {
      // Hero Spotlight keyword
      wordColor = style.activeWordColor || '#3091F7';
      if (style.hasNeonGlow) {
        const nc = style.neonColor || '#3091F7';
        const ni = style.neonIntensity || 14;
        wordShadow = `0 4px 18px rgba(0, 0, 0, 0.7), 0 0 ${ni}px ${hexToRgba(nc, 0.45)}`;
      }
    } else if (isCurrent) {
      wordColor = style.activeWordColor || '#3091F7';
      wordScale = 1.05;
      if (style.highlightType === 'pill') {
        return (
          <span
            key={`${w.start}_${w.word}_${index}`}
            className="inline-block transition-all duration-120 ease-out select-none px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: style.activeWordBackground || '#10FF70',
              color: '#000000',
              fontWeight: '800',
              opacity: wordOpacity,
              transform: wordTransform,
              marginLeft: index === 0 ? '0px' : '4px',
              marginRight: '4px',
            }}
          >
            {displayText}
          </span>
        );
      }
    }

    const heroScaleFactor = isEmp ? (style.activeWordScale || 2.15) : 1.0;
    const computedFontSize = isEmp ? `${Math.round(style.fontSize * heroScaleFactor)}px` : `${style.fontSize}px`;
    const computedFontWeight = isEmp ? (style.heroFontWeight || '900') : (style.fontWeight || '600');

    return (
      <span
        key={`${w.start}_${w.word}_${index}`}
        className="inline-block transition-all duration-120 ease-out select-none leading-none align-baseline"
        style={{
          color: wordColor,
          fontSize: computedFontSize,
          fontWeight: computedFontWeight,
          opacity: wordOpacity,
          transform: wordTransform,
          textShadow: wordShadow,
          WebkitTextStroke: textStroke,
          letterSpacing: isEmp ? '1.5px' : `${style.letterSpacing || 0.5}px`,
          marginLeft: index === 0 ? '0px' : '5px',
          marginRight: '5px',
        }}
      >
        {displayText}
      </span>
    );
  };

  return (
    <div 
      className="absolute pointer-events-none z-10 flex px-4 select-none transition-all duration-100"
      style={containerStyle}
    >
      <div
        key={activeCaption.id}
        className="inline-flex flex-col transition-all duration-100"
        style={{
          fontFamily: style.fontFamily || 'Poppins, sans-serif',
          backgroundColor: backgroundColor,
          padding: style.hasBackgroundBox 
            ? `${style.backgroundPadding}px ${Math.round(style.backgroundPadding * 1.6)}px` 
            : '0px',
          borderRadius: `${style.borderRadius}px`,
          border: boxBorder,
          boxShadow: boxGlowShadow,
          textAlign: textAlign,
          alignItems: textAlign === 'left' ? 'flex-start' : (textAlign === 'right' ? 'flex-end' : 'center'),
          whiteSpace: 'normal',
          wordBreak: 'break-word',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {words.length > 0 ? (
          lineGroups.map((group, lineIdx) => {
            // Check if this line is the hero line (all words emphasized or line 1 of 3)
            const isHeroLine = group.some(w => w.isEmphasized) && (group.length <= 2 || lineGroups.length === 3 && lineIdx === 1);
            return (
              <div 
                key={lineIdx} 
                className="leading-none my-1 flex flex-wrap items-baseline"
                style={{
                  justifyContent: textAlign === 'left' ? 'flex-start' : (textAlign === 'right' ? 'flex-end' : 'center'),
                }}
              >
                {group.map((w, wIdx) => renderWord(w, wIdx, isHeroLine))}
              </div>
            );
          })
        ) : (
          <span 
            style={{ 
              color: style.textColor, 
              fontSize: `${style.fontSize}px`, 
              fontWeight: style.fontWeight,
              textShadow: baseShadow, 
              WebkitTextStroke: textStroke 
            }}
          >
            {activeCaption.text}
          </span>
        )}
      </div>
    </div>
  );
}

