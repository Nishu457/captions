import React, { useRef, useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Clock, 
  Layers 
} from 'lucide-react';
import { formatSeconds } from '../utils/captionStyles';

export default function Timeline({ 
  duration = 60, 
  currentTime = 0, 
  captions = [], 
  onSeekTo, 
  onUpdateCaptions 
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(40); // Pixels per second
  const [draggingCap, setDraggingCap] = useState(null); // { id, type: 'start' | 'end' | 'move', initialX, initialVal }
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Total width of the timeline based on duration and zoom
  const timelineWidth = Math.max(800, (duration || 60) * zoom);

  // Calculate ticks for ruler
  const tickInterval = zoom >= 60 ? 1 : zoom >= 30 ? 2 : 5; // seconds per tick
  const ticks = [];
  const maxSec = Math.ceil(duration || 60);
  for (let s = 0; s <= maxSec; s += tickInterval) {
    ticks.push(s);
  }

  const handleTimelineClick = (e) => {
    if (!containerRef.current || draggingCap) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const newTime = Math.max(0, Math.min(duration, clickX / zoom));
    onSeekTo(newTime);
  };

  const handleMouseDown = (e, capId, type) => {
    e.stopPropagation();
    const cap = captions.find(c => c.id === capId);
    if (!cap) return;

    setDraggingCap({
      id: capId,
      type: type,
      startX: e.clientX,
      initialStart: cap.start,
      initialEnd: cap.end,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingCap) return;

      const deltaX = e.clientX - draggingCap.startX;
      const deltaTime = deltaX / zoom;

      const updated = captions.map((c) => {
        if (c.id !== draggingCap.id) return c;

        if (draggingCap.type === 'start') {
          const newStart = Math.max(0, Math.min(c.end - 0.2, draggingCap.initialStart + deltaTime));
          return { ...c, start: Math.round(newStart * 100) / 100 };
        } else if (draggingCap.type === 'end') {
          const newEnd = Math.max(c.start + 0.2, Math.min(duration, draggingCap.initialEnd + deltaTime));
          return { ...c, end: Math.round(newEnd * 100) / 100 };
        } else if (draggingCap.type === 'move') {
          const capLen = draggingCap.initialEnd - draggingCap.initialStart;
          const newStart = Math.max(0, Math.min(duration - capLen, draggingCap.initialStart + deltaTime));
          return {
            ...c,
            start: Math.round(newStart * 100) / 100,
            end: Math.round((newStart + capLen) * 100) / 100,
          };
        }
        return c;
      });

      onUpdateCaptions(updated);
    };

    const handleMouseUp = () => {
      if (draggingCap) {
        setDraggingCap(null);
      }
    };

    if (draggingCap) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingCap, zoom, captions, duration, onUpdateCaptions]);

  // Keep playhead in view if auto-scrolling
  useEffect(() => {
    if (containerRef.current && !draggingCap) {
      const playheadX = currentTime * zoom;
      const scrollLeft = containerRef.current.scrollLeft;
      const clientWidth = containerRef.current.clientWidth;
      if (playheadX > scrollLeft + clientWidth - 100 || playheadX < scrollLeft) {
        containerRef.current.scrollLeft = playheadX - 100;
      }
    }
  }, [currentTime, zoom]);

  return (
    <div className="h-44 border-t border-dark-700/60 bg-dark-900 flex flex-col shrink-0 select-none z-20">
      {/* Timeline Header Bar */}
      <div className="h-8 px-4 border-b border-dark-700/60 bg-dark-850 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Layers className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-semibold uppercase tracking-wider text-slate-300">Timeline</span>
          <span className="font-mono text-slate-400 text-[11px] ml-3">
            {formatSeconds(currentTime)} / {formatSeconds(duration)}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom(Math.max(15, zoom - 10))}
            className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-white"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-500 w-10 text-center">{zoom}px/s</span>
          <button
            onClick={() => setZoom(Math.min(120, zoom + 10))}
            className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-white"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Ruler and Tracks Container */}
      <div 
        ref={containerRef}
        onClick={handleTimelineClick}
        className="flex-1 overflow-x-auto overflow-y-hidden relative cursor-pointer bg-dark-950/60"
      >
        <div 
          className="relative h-full"
          style={{ width: `${timelineWidth}px` }}
        >
          {/* Ruler Ticks */}
          <div className="h-6 border-b border-dark-700/40 bg-dark-900/40 relative">
            {ticks.map((sec) => (
              <div
                key={sec}
                className="absolute top-0 flex flex-col items-start"
                style={{ left: `${sec * zoom}px` }}
              >
                <div className="h-2 w-[1px] bg-dark-600" />
                <span className="text-[9px] font-mono text-slate-500 mt-0.5 ml-1">
                  {sec}s
                </span>
              </div>
            ))}
          </div>

          {/* Caption Blocks Track */}
          <div className="h-24 relative pt-3 px-2">
            {captions.map((cap) => {
              const left = cap.start * zoom;
              const width = Math.max(18, (cap.end - cap.start) * zoom);
              const isActive = currentTime >= cap.start && currentTime <= cap.end;

              return (
                <div
                  key={cap.id}
                  onMouseDown={(e) => handleMouseDown(e, cap.id, 'move')}
                  className={`absolute top-3 h-14 rounded-lg px-2 py-1.5 cursor-grab active:cursor-grabbing border transition-colors flex flex-col justify-between overflow-hidden group ${
                    isActive
                      ? 'bg-brand-600/30 border-brand-500 text-white shadow-glow'
                      : 'bg-dark-800/80 hover:bg-dark-800 border-dark-600/70 text-slate-200'
                  }`}
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                  }}
                >
                  {/* Text preview */}
                  <span className="text-[11px] font-medium truncate pointer-events-none select-none">
                    {cap.text}
                  </span>

                  {/* Timing label */}
                  <span className="text-[9px] font-mono text-slate-400 pointer-events-none select-none">
                    {(cap.end - cap.start).toFixed(1)}s
                  </span>

                  {/* Left Resize Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, cap.id, 'start')}
                    className="absolute left-0 inset-y-0 w-2 hover:w-3 bg-transparent hover:bg-brand-400/50 cursor-ew-resize transition-all"
                  />

                  {/* Right Resize Handle */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, cap.id, 'end')}
                    className="absolute right-0 inset-y-0 w-2 hover:w-3 bg-transparent hover:bg-brand-400/50 cursor-ew-resize transition-all"
                  />
                </div>
              );
            })}
          </div>

          {/* Red Playhead Indicator */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-rose-500 z-30 pointer-events-none"
            style={{ left: `${currentTime * zoom}px` }}
          >
            <div className="w-3 h-3 bg-rose-500 rotate-45 -translate-x-1.5 -translate-y-1 shadow-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
