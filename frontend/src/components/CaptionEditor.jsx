import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Scissors, 
  Merge, 
  Search, 
  Clock, 
  Play,
  ArrowDown
} from 'lucide-react';
import { formatSeconds, parseTimestamp } from '../utils/captionStyles';

export default function CaptionEditor({ 
  captions = [], 
  currentTime, 
  onUpdateCaptions, 
  onSeekTo 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const activeItemRef = useRef(null);

  // Auto-scroll to active caption during playback
  useEffect(() => {
    const active = captions.find(c => currentTime >= c.start && currentTime <= c.end);
    if (active && active.id !== selectedId) {
      setSelectedId(active.id);
    }
  }, [currentTime, captions]);

  const handleTextChange = (id, newText) => {
    const updated = captions.map((c) =>
      c.id === id ? { ...c, text: newText } : c
    );
    onUpdateCaptions(updated);
  };

  const handleTimeChange = (id, field, value) => {
    const parsed = parseTimestamp(value);
    const updated = captions.map((c) => {
      if (c.id === id) {
        return { ...c, [field]: parsed };
      }
      return c;
    });
    onUpdateCaptions(updated);
  };

  const handleDelete = (id) => {
    const updated = captions.filter((c) => c.id !== id);
    onUpdateCaptions(updated);
  };

  const handleSplit = (id) => {
    const target = captions.find(c => c.id === id);
    if (!target) return;

    // Split either at currentTime if within bounds, or midpoint
    let splitPoint = currentTime;
    if (splitPoint <= target.start || splitPoint >= target.end) {
      splitPoint = target.start + (target.end - target.start) / 2;
    }
    splitPoint = Math.round(splitPoint * 1000) / 1000;

    const words = target.text.trim().split(/\s+/);
    const midWord = Math.ceil(words.length / 2);
    const firstText = words.slice(0, midWord).join(' ');
    const secondText = words.slice(midWord).join(' ');

    const newA = {
      id: `${target.id}_1`,
      start: target.start,
      end: splitPoint,
      text: firstText || 'Part 1',
    };
    const newB = {
      id: `${target.id}_2`,
      start: splitPoint,
      end: target.end,
      text: secondText || 'Part 2',
    };

    const updated = [];
    for (const c of captions) {
      if (c.id === id) {
        updated.push(newA, newB);
      } else {
        updated.push(c);
      }
    }
    onUpdateCaptions(updated);
  };

  const handleMerge = (index) => {
    if (index >= captions.length - 1) return;
    const current = captions[index];
    const next = captions[index + 1];

    const merged = {
      id: current.id,
      start: current.start,
      end: next.end,
      text: `${current.text.trim()} ${next.text.trim()}`,
    };

    const updated = [...captions];
    updated.splice(index, 2, merged);
    onUpdateCaptions(updated);
  };

  const handleAddCaption = (index = -1) => {
    const lastCap = captions[captions.length - 1];
    const newStart = lastCap ? lastCap.end + 0.1 : 0;
    const newCap = {
      id: `cap_${Date.now().toString().slice(-4)}`,
      start: Math.round(newStart * 1000) / 1000,
      end: Math.round((newStart + 2.5) * 1000) / 1000,
      text: 'New caption text',
    };

    if (index === -1) {
      onUpdateCaptions([...captions, newCap]);
    } else {
      const updated = [...captions];
      updated.splice(index + 1, 0, newCap);
      onUpdateCaptions(updated);
    }
  };

  const filteredCaptions = captions.filter(c =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-96 border-r border-dark-700/60 bg-dark-900/70 flex flex-col h-full min-h-0 z-10 select-none">
      {/* Search & Actions Header */}
      <div className="p-3 border-b border-dark-700/60 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            Captions ({captions.length})
          </span>
          <button
            onClick={() => handleAddCaption()}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600/20 text-brand-400 border border-brand-500/30 hover:bg-brand-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search captions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Captions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-0">
        {filteredCaptions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {captions.length === 0 
              ? 'No captions generated yet. Upload media to start.' 
              : 'No captions match your search.'}
          </div>
        ) : (
          filteredCaptions.map((cap, idx) => {
            const isActive = currentTime >= cap.start && currentTime <= cap.end;
            return (
              <div
                key={cap.id}
                ref={isActive ? activeItemRef : null}
                className={`p-3 rounded-xl transition-all duration-150 border relative group ${
                  isActive
                    ? 'bg-dark-800/90 border-brand-500/80 shadow-glow'
                    : 'bg-dark-850/60 hover:bg-dark-800/60 border-dark-700/60'
                }`}
              >
                {/* Header row: Time & Quick actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-400">
                    <button
                      onClick={() => onSeekTo(cap.start)}
                      title="Jump video to start"
                      className="hover:text-brand-400 flex items-center transition"
                    >
                      <Play className="w-2.5 h-2.5 mr-0.5 fill-current" />
                      <span>{formatSeconds(cap.start).split('.')[0]}</span>
                    </button>
                    <span>→</span>
                    <span>{formatSeconds(cap.end).split('.')[0]}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleSplit(cap.id)}
                      title="Split caption at playhead"
                      className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-brand-400 transition"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                    {idx < filteredCaptions.length - 1 && (
                      <button
                        onClick={() => handleMerge(idx)}
                        title="Merge with next caption"
                        className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-indigo-400 transition"
                      >
                        <Merge className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cap.id)}
                      title="Delete caption"
                      className="p-1 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Textarea for Caption content */}
                <textarea
                  rows={2}
                  value={cap.text}
                  onChange={(e) => handleTextChange(cap.id, e.target.value)}
                  className="w-full bg-dark-900/60 rounded-lg p-2 text-xs text-slate-100 border border-dark-700 focus:border-brand-500/80 focus:outline-none resize-none transition leading-relaxed"
                />

                {/* Micro timing adjust row */}
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <span>Start:</span>
                    <input
                      type="text"
                      defaultValue={formatSeconds(cap.start)}
                      onBlur={(e) => handleTimeChange(cap.id, 'start', e.target.value)}
                      className="w-20 bg-dark-900/80 rounded px-1.5 py-0.5 border border-dark-700 font-mono text-slate-300 text-center"
                    />
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>End:</span>
                    <input
                      type="text"
                      defaultValue={formatSeconds(cap.end)}
                      onBlur={(e) => handleTimeChange(cap.id, 'end', e.target.value)}
                      className="w-20 bg-dark-900/80 rounded px-1.5 py-0.5 border border-dark-700 font-mono text-slate-300 text-center"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
