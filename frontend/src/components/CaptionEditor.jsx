import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Scissors, 
  Merge, 
  Search, 
  Clock, 
  Play,
  Star,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatSeconds, parseTimestamp } from '../utils/captionStyles';

export default function CaptionEditor({ 
  captions = [], 
  currentTime, 
  onUpdateCaptions, 
  onSeekTo,
  currentDensity = 'balanced',
  onResegmentDensity
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
    const updated = captions.map((c) => {
      if (c.id === id) {
        // Also update word objects if word count matches
        const newWords = newText.trim().split(/\s+/);
        let updatedWords = c.words || [];
        if (updatedWords.length === newWords.length) {
          updatedWords = updatedWords.map((w, idx) => ({ ...w, word: newWords[idx] }));
        }
        return { ...c, text: newText, words: updatedWords };
      }
      return c;
    });
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

  const toggleWordEmphasis = (capId, wordIndex) => {
    const updated = captions.map((c) => {
      if (c.id === capId && c.words && c.words[wordIndex]) {
        const nextWords = [...c.words];
        nextWords[wordIndex] = {
          ...nextWords[wordIndex],
          isEmphasized: !nextWords[wordIndex].isEmphasized
        };
        return { ...c, words: nextWords };
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

    let splitPoint = currentTime;
    if (splitPoint <= target.start || splitPoint >= target.end) {
      splitPoint = target.start + (target.end - target.start) / 2;
    }
    splitPoint = Math.round(splitPoint * 1000) / 1000;

    const words = target.words || [];
    let wordsA = [];
    let wordsB = [];

    if (words.length >= 2) {
      const mid = Math.ceil(words.length / 2);
      wordsA = words.slice(0, mid);
      wordsB = words.slice(mid);
    }

    const newA = {
      id: `${target.id}_1`,
      start: target.start,
      end: splitPoint,
      text: wordsA.length > 0 ? wordsA.map(w => w.word).join(' ') : 'Part 1',
      words: wordsA,
    };
    const newB = {
      id: `${target.id}_2`,
      start: splitPoint,
      end: target.end,
      text: wordsB.length > 0 ? wordsB.map(w => w.word).join(' ') : 'Part 2',
      words: wordsB,
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
      words: [...(current.words || []), ...(next.words || [])],
    };

    const updated = [...captions];
    updated.splice(index, 2, merged);
    onUpdateCaptions(updated);
  };

  const handleAddCaption = () => {
    const lastCap = captions[captions.length - 1];
    const newStart = lastCap ? lastCap.end + 0.1 : 0;
    const newCap = {
      id: `cap_${Date.now().toString().slice(-4)}`,
      start: Math.round(newStart * 1000) / 1000,
      end: Math.round((newStart + 2.0) * 1000) / 1000,
      text: 'New phrase',
      words: [
        { word: 'New', start: newStart, end: newStart + 1.0, isEmphasized: false },
        { word: 'phrase', start: newStart + 1.0, end: newStart + 2.0, isEmphasized: true }
      ]
    };
    onUpdateCaptions([...captions, newCap]);
  };

  const filteredCaptions = captions.filter(c =>
    c.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-96 border-r border-dark-700/60 bg-dark-900/80 flex flex-col h-full min-h-0 z-10 select-none">
      {/* Search & Actions Header */}
      <div className="p-3 border-b border-dark-700/60 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            Phrases ({captions.length})
          </span>
          <button
            onClick={handleAddCaption}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-600/20 text-brand-400 border border-brand-500/30 hover:bg-brand-600/30 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Caption Density Selector */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
            <span className="uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" />
              Density Mode
            </span>
            <span className="text-brand-400">
              {currentDensity === 'compact' ? '2-4 words' : currentDensity === 'balanced' ? '3-6 words' : '5-8 words'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-dark-850 p-1 rounded-xl border border-dark-700/60">
            {['compact', 'balanced', 'relaxed'].map((d) => (
              <button
                key={d}
                onClick={() => onResegmentDensity && onResegmentDensity(d)}
                className={`py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                  currentDensity === d
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
          />
        </div>
      </div>

      {/* Captions List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 custom-scrollbar">
        {filteredCaptions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            {captions.length === 0 
              ? 'No captions generated yet. Upload media to start.' 
              : 'No phrases match your search.'}
          </div>
        ) : (
          filteredCaptions.map((cap, idx) => {
            const isActive = currentTime >= cap.start && currentTime <= cap.end;
            const words = cap.words || [];

            return (
              <div
                key={cap.id}
                ref={isActive ? activeItemRef : null}
                className={`p-3 rounded-xl transition-all duration-150 border relative group ${
                  isActive
                    ? 'bg-dark-800/90 border-brand-500/80 shadow-glow'
                    : 'bg-dark-850/70 hover:bg-dark-800/60 border-dark-700/60'
                }`}
              >
                {/* Header: Time & Actions */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-400">
                    <button
                      onClick={() => onSeekTo(cap.start)}
                      title="Jump to phrase"
                      className="hover:text-brand-400 flex items-center transition"
                    >
                      <Play className="w-2.5 h-2.5 mr-0.5 fill-current" />
                      <span>{formatSeconds(cap.start).split('.')[0]}</span>
                    </button>
                    <span>→</span>
                    <span>{formatSeconds(cap.end).split('.')[0]}</span>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({(cap.end - cap.start).toFixed(1)}s)
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleSplit(cap.id)}
                      title="Split phrase"
                      className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-brand-400 transition"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                    {idx < filteredCaptions.length - 1 && (
                      <button
                        onClick={() => handleMerge(idx)}
                        title="Merge with next phrase"
                        className="p-1 rounded hover:bg-dark-700 text-slate-400 hover:text-indigo-400 transition"
                      >
                        <Merge className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(cap.id)}
                      title="Delete phrase"
                      className="p-1 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Phrase Text Input */}
                <input
                  type="text"
                  value={cap.text}
                  onChange={(e) => handleTextChange(cap.id, e.target.value)}
                  className="w-full bg-dark-900/70 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-100 border border-dark-700 focus:border-brand-500/80 focus:outline-none transition"
                />

                {/* WORD-LEVEL TIMING & EMPHASIS PILLS */}
                {words.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-dark-700/50">
                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Words (Click to Spotlight / Emphasize):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {words.map((w, wIdx) => {
                        const isWordActive = currentTime >= w.start && currentTime <= w.end;
                        return (
                          <button
                            key={wIdx}
                            onClick={() => toggleWordEmphasis(cap.id, wIdx)}
                            title={`Word: ${w.word} (${w.start.toFixed(2)}s - ${w.end.toFixed(2)}s). Click to toggle emphasis.`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center space-x-1 transition border ${
                              w.isEmphasized
                                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                                : isWordActive
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                : 'bg-dark-900 border-dark-700 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            <span>{w.word}</span>
                            {w.isEmphasized && <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
