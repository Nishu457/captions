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
    topPosition = '50%';
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

  // Text shadow
  const textShadow = style.hasShadow
    ? `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`
    : 'none';

  // Background box color with opacity
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

  return (
    <div 
      className="absolute inset-x-0 pointer-events-none z-10 flex px-8 transition-all duration-75 ease-out"
      style={{
        top: topPosition,
        transform: 'translateY(-50%)',
        justifyContent,
      }}
    >
      <div
        className="max-w-[92%] transition-all duration-75 inline-block"
        style={{
          fontFamily: style.fontFamily,
          fontSize: `${style.fontSize}px`,
          fontWeight: style.fontWeight,
          color: style.textColor,
          backgroundColor: backgroundColor,
          padding: style.hasBackgroundBox ? `${style.backgroundPadding}px ${style.backgroundPadding * 1.5}px` : '0px',
          borderRadius: `${style.borderRadius}px`,
          letterSpacing: `${style.letterSpacing}px`,
          lineHeight: style.lineSpacing,
          textAlign: textAlign,
          textTransform: style.textTransform,
          WebkitTextStroke: textStroke,
          textShadow: textShadow,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {activeCaption.text}
      </div>
    </div>
  );
}
