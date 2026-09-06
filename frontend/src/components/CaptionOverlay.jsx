import React from 'react';

export default function CaptionOverlay({ activeCaption, style }) {
  if (!activeCaption || !activeCaption.text) {
    return null;
  }

  // Calculate position styles
  let topPosition = '85%';
  if (style.position === 'top') {
    topPosition = '12%';
  } else if (style.position === 'middle') {
    topPosition = '58%';
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
    ? `${style.outlineWidth}px ${style.outlineColor}` 
    : 'none';

  // Neon Glow & Shadow Calculation
  const neonColor = style.neonColor || '#00F0FF';
  const neonIntensity = style.neonIntensity || 20;

  let computedTextShadow = 'none';
  if (style.hasNeonGlow) {
    // Multi-stage neon bloom with high radiant glow
    computedTextShadow = `
      0 0 6px ${neonColor}, 
      0 0 ${Math.round(neonIntensity * 0.7)}px ${neonColor}, 
      0 0 ${neonIntensity}px ${neonColor}, 
      0 0 ${Math.round(neonIntensity * 1.5)}px ${neonColor}
    `;
  } else if (style.hasShadow) {
    computedTextShadow = `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`;
  }

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

  // Neon box glow border
  const boxBorder = style.hasBackgroundBox && style.hasNeonGlow
    ? `1px solid ${neonColor}`
    : 'none';

  const boxGlowShadow = style.hasBackgroundBox && style.hasNeonGlow
    ? `0 0 15px ${hexToRgba(neonColor, 0.45)}, inset 0 0 10px ${hexToRgba(neonColor, 0.15)}`
    : 'none';

  // Animation class based on style.animationPreset
  let animClass = '';
  if (style.animationPreset === 'pop') {
    animClass = 'anim-pop';
  } else if (style.animationPreset === 'bounce') {
    animClass = 'anim-bounce';
  } else if (style.animationPreset === 'fade') {
    animClass = 'anim-fade';
  } else if (style.animationPreset === 'zoom') {
    animClass = 'anim-zoom';
  }

  return (
    <div 
      className="absolute inset-x-0 pointer-events-none z-10 flex px-6 select-none"
      style={{
        top: topPosition,
        transform: 'translateY(-50%)',
        justifyContent,
      }}
    >
      {/* Key is bound to caption id so animations trigger dynamically on every phrase change */}
      <div
        key={activeCaption.id}
        className={`max-w-[92%] inline-block transition-transform duration-75 ${animClass}`}
        style={{
          fontFamily: style.fontFamily,
          fontSize: `${style.fontSize}px`,
          fontWeight: style.fontWeight,
          color: style.textColor,
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
          textTransform: style.textTransform,
          WebkitTextStroke: textStroke,
          textShadow: computedTextShadow,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {activeCaption.text}
      </div>
    </div>
  );
}
