import React, { useState, useEffect, useCallback } from 'react';
import TopBar from './components/TopBar';
import SidebarNav from './components/SidebarNav';
import VideoPlayer from './components/VideoPlayer';
import CaptionEditor from './components/CaptionEditor';
import StylePanel from './components/StylePanel';
import Timeline from './components/Timeline';
import UploadModal from './components/UploadModal';
import ProgressModal from './components/ProgressModal';
import ExportModal from './components/ExportModal';

import { STYLE_PRESETS, getDefaultPreset } from './utils/captionStyles';
import { 
  fetchGPUStatus, 
  uploadMedia, 
  startTranscription, 
  getJobStatus,
  resegmentCaptionsApi
} from './services/api';

export default function App() {
  // Project State
  const [projectTitle, setProjectTitle] = useState('My Caption Project');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoFilename, setVideoFilename] = useState(null);
  const [duration, setDuration] = useState(60);
  const [currentTime, setCurrentTime] = useState(0);
  
  // Captions and Styling
  const [captions, setCaptions] = useState([]);
  const [style, setStyle] = useState(() => getDefaultPreset());

  // UI State
  const [activeTab, setActiveTab] = useState('captions'); // 'captions', 'styles', 'upload', 'export'
  const [gpuStatus, setGpuStatus] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isProgressOpen, setIsProgressOpen] = useState(false);
  const [progressData, setProgressData] = useState(null);

  // Fetch GPU Status on startup
  const loadGPUInfo = useCallback(async () => {
    try {
      const data = await fetchGPUStatus();
      setGpuStatus(data);
    } catch (err) {
      console.warn('Could not query GPU status:', err);
    }
  }, []);

  useEffect(() => {
    loadGPUInfo();
    const interval = setInterval(loadGPUInfo, 10000);
    return () => clearInterval(interval);
  }, [loadGPUInfo]);

  // Handle Tab Selection from Sidebar
  const handleSelectTab = (tabId) => {
    if (tabId === 'upload') {
      setIsUploadOpen(true);
    } else if (tabId === 'export') {
      setIsExportOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  // Reset to New Project
  const handleNewProject = () => {
    if (captions.length > 0 && !window.confirm('Create a new project? Current captions will be reset.')) {
      return;
    }
    setProjectTitle('Untitled Project');
    setVideoUrl(null);
    setVideoFilename(null);
    setCaptions([]);
    setCurrentTime(0);
    setDuration(60);
    setStyle(getDefaultPreset());
  };

  // Re-segment captions dynamically on density change
  const handleResegmentDensity = async (newDensity) => {
    setStyle((prev) => ({ ...prev, density: newDensity }));
    if (captions.length === 0) return;
    try {
      const updated = await resegmentCaptionsApi(captions, newDensity);
      if (updated && updated.length > 0) {
        setCaptions(updated);
      }
    } catch (err) {
      console.error('Failed to resegment captions:', err);
    }
  };

  // Start Upload & Transcription Workflow
  const handleStartProcess = async ({ file, model, language, align }) => {
    setIsUploadOpen(false);
    setIsProgressOpen(true);
    setProgressData({
      status: 'processing',
      step: 'Uploading...',
      progressPercent: 5,
      message: `Uploading ${file.name}...`,
    });

    try {
      // 1. Upload media
      const uploadRes = await uploadMedia(file, (percent) => {
        setProgressData((prev) => ({
          ...prev,
          step: 'Uploading...',
          progressPercent: Math.min(20, Math.round(percent * 0.2)),
          message: `Uploading media file: ${percent}%`,
        }));
      });

      const uploadedName = uploadRes.filename;
      setVideoFilename(uploadedName);
      setVideoUrl(uploadRes.videoUrl);
      setProjectTitle(file.name.replace(/\.[^/.]+$/, ''));
      if (uploadRes.metadata?.duration) {
        setDuration(uploadRes.metadata.duration);
      }

      // 2. Start GPU Transcription Job
      setProgressData({
        status: 'processing',
        step: 'Processing...',
        progressPercent: 25,
        message: 'Initializing audio extraction and WhisperX inference...',
      });

      const jobStart = await startTranscription({
        filename: uploadedName,
        model,
        language,
        align,
        batchSize: gpuStatus?.recommendedBatchSize || 8,
      });

      const jobId = jobStart.jobId;

      // 3. Listen via Server-Sent Events (with fallback to polling)
      let eventSource;
      try {
        eventSource = new EventSource(`/api/transcription/stream/${jobId}`);
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setProgressData(data);

            if (data.status === 'completed') {
              eventSource.close();
              if (data.result?.captions) {
                setCaptions(data.result.captions);
              }
              setTimeout(() => {
                setIsProgressOpen(false);
                setActiveTab('captions');
              }, 800);
            } else if (data.status === 'failed') {
              eventSource.close();
            }
          } catch (e) {
            console.error('SSE JSON parse error:', e);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          // Fallback to polling
          pollJobStatus(jobId);
        };
      } catch (err) {
        pollJobStatus(jobId);
      }

    } catch (err) {
      setProgressData({
        status: 'failed',
        step: 'Failed',
        progressPercent: 0,
        error: err.response?.data?.detail || err.message || 'Upload failed',
      });
    }
  };

  // Fallback Poller for job status
  const pollJobStatus = async (jobId) => {
    const interval = setInterval(async () => {
      try {
        const job = await getJobStatus(jobId);
        setProgressData(job);

        if (job.status === 'completed') {
          clearInterval(interval);
          if (job.result?.captions) {
            setCaptions(job.result.captions);
          }
          setTimeout(() => {
            setIsProgressOpen(false);
            setActiveTab('captions');
          }, 800);
        } else if (job.status === 'failed') {
          clearInterval(interval);
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-dark-950 text-slate-100 select-none">
      {/* 1. TOP BAR */}
      <TopBar
        projectTitle={projectTitle}
        gpuStatus={gpuStatus}
        onNewProject={handleNewProject}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onRefreshGPU={loadGPUInfo}
      />

      {/* 2. MAIN WORKSPACE */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Left Navigation Icon Bar */}
        <SidebarNav activeTab={activeTab} onSelectTab={handleSelectTab} />

        {/* Captions Editor Panel (Shown when activeTab === 'captions') */}
        {activeTab === 'captions' && (
          <CaptionEditor
            captions={captions}
            currentTime={currentTime}
            onUpdateCaptions={setCaptions}
            onSeekTo={setCurrentTime}
            currentDensity={style.density || 'balanced'}
            onResegmentDensity={handleResegmentDensity}
          />
        )}

        {/* Main Video Preview Area */}
        <VideoPlayer
          videoUrl={videoUrl}
          captions={captions}
          style={style}
          currentTime={currentTime}
          onTimeUpdate={setCurrentTime}
          onOpenUpload={() => setIsUploadOpen(true)}
        />

        {/* Style Panel (Shown when activeTab === 'styles') */}
        {activeTab === 'styles' && (
          <StylePanel
            style={style}
            onUpdateStyle={setStyle}
            onResegmentDensity={handleResegmentDensity}
          />
        )}
      </div>

      {/* 3. VISUAL TIMELINE AT BOTTOM */}
      <Timeline
        duration={duration}
        currentTime={currentTime}
        captions={captions}
        onSeekTo={setCurrentTime}
        onUpdateCaptions={setCaptions}
      />

      {/* 4. MODALS */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onStartProcess={handleStartProcess}
        gpuStatus={gpuStatus}
      />

      <ProgressModal
        isOpen={isProgressOpen}
        progressData={progressData}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        captions={captions}
        style={style}
        videoFilename={videoFilename}
      />
    </div>
  );
}
