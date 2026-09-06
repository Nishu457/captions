import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchGPUStatus = async () => {
  const res = await api.get('/api/system/gpu');
  return res.data;
};

export const fetchFFmpegStatus = async () => {
  const res = await api.get('/api/system/ffmpeg');
  return res.data;
};

export const uploadMedia = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percent);
      }
    },
  });
  return res.data;
};

export const startTranscription = async (payload) => {
  const res = await api.post('/api/transcription/start', payload);
  return res.data;
};

export const getJobStatus = async (jobId) => {
  const res = await api.get(`/api/transcription/status/${jobId}`);
  return res.data;
};

export const splitCaptionApi = async (captions, captionId, splitTime, splitTextIndex) => {
  const res = await api.post('/api/captions/split', captions, {
    params: { captionId, splitTime, splitTextIndex },
  });
  return res.data.captions;
};

export const mergeCaptionsApi = async (captions, firstCaptionId, secondCaptionId) => {
  const res = await api.post('/api/captions/merge', captions, {
    params: { firstCaptionId, secondCaptionId },
  });
  return res.data.captions;
};

export const exportSubtitles = async (format, captions, style) => {
  const response = await api.post(
    '/api/export/subtitles',
    { format, captions, style },
    { responseType: 'blob' }
  );

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `captions.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const burnVideo = async (videoFilename, captions, style) => {
  const res = await api.post('/api/export/burn-video', {
    format: 'mp4',
    videoFilename,
    captions,
    style,
  });
  return res.data;
};
