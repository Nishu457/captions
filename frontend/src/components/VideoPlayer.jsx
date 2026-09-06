import React, { useRef, useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  UploadCloud 
} from 'lucide-react';
import CaptionOverlay from './CaptionOverlay';
import { formatSeconds } from '../utils/captionStyles';

export default function VideoPlayer({ 
  videoUrl, 
  captions = [], 
  style, 
  currentTime, 
  onTimeUpdate, 
  onOpenUpload 
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Sync external currentTime (e.g. from clicking caption list or timeline)
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.35) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      onTimeUpdate(newTime);
    }
  };

  const skipTime = (seconds) => {
    if (videoRef.current) {
      const nextTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = nextTime;
      onTimeUpdate(nextTime);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const handleRateChange = (rate) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  // Find currently active caption for real-time overlay
  const activeCaption = captions.find(
    (c) => currentTime >= c.start && currentTime <= c.end
  );

  return (
    <div 
      ref={containerRef}
      className="relative flex-1 flex flex-col items-center justify-center bg-dark-950 p-4 min-h-0 overflow-hidden select-none"
    >
      {videoUrl ? (
        <div className="relative w-full h-full max-h-[75vh] flex flex-col items-center justify-center">
          {/* Main Video Surface */}
          <div className="relative inline-block max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl bg-black border border-dark-700/60 group">
            <video
              ref={videoRef}
              src={videoUrl}
              onClick={togglePlay}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              className="max-w-full max-h-[65vh] object-contain cursor-pointer"
            />

            {/* Captions Rendered Over Video */}
            <CaptionOverlay activeCaption={activeCaption} style={style} currentTime={currentTime} />

            {/* Big center play icon on pause */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-brand-600/80 backdrop-blur-md flex items-center justify-center text-white shadow-glow hover:scale-110 active:scale-95 transition-all opacity-80 hover:opacity-100"
              >
                <Play className="w-8 h-8 ml-1 fill-white" />
              </button>
            )}
          </div>

          {/* Player Controls Bar */}
          <div className="w-full max-w-4xl mt-3 glass-panel rounded-xl px-4 py-2.5 flex flex-col space-y-2">
            {/* Scrubber Range */}
            <div className="flex items-center space-x-3">
              <span className="text-[11px] font-mono text-slate-400 w-16 text-right">
                {formatSeconds(currentTime).split('.')[0]}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.05}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:h-2 transition-all"
              />
              <span className="text-[11px] font-mono text-slate-400 w-16">
                {formatSeconds(duration).split('.')[0]}
              </span>
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between">
              {/* Play / Skip Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => skipTime(-5)}
                  title="Rewind 5s"
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-300 hover:text-white transition"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition active:scale-95"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 ml-0.5 fill-white" />}
                </button>
                <button
                  onClick={() => skipTime(5)}
                  title="Forward 5s"
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-300 hover:text-white transition"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-1 ml-3 group">
                  <button 
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-300 hover:text-white"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                </div>
              </div>

              {/* Speed & Fullscreen */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-dark-800 rounded-lg p-0.5 border border-dark-700 text-xs">
                  {[0.75, 1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleRateChange(rate)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                        playbackRate === rate
                          ? 'bg-brand-600 text-white shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={toggleFullscreen}
                  title="Toggle Fullscreen"
                  className="p-1.5 rounded-lg hover:bg-dark-700 text-slate-300 hover:text-white transition"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div 
          onClick={onOpenUpload}
          className="w-full max-w-lg p-12 rounded-2xl border-2 border-dashed border-dark-700 hover:border-brand-500/60 bg-dark-900/50 hover:bg-dark-900/80 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all">
            <UploadCloud className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">Import Media to Begin</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-6">
            Drag & drop your video or audio file here to generate accurate GPU-accelerated captions.
          </p>
          <button className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition">
            Choose Video File
          </button>
        </div>
      )}
    </div>
  );
}
