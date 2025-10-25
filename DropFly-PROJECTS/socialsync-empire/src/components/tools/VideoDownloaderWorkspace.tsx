'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, Link2, CheckCircle, AlertCircle, Settings2, Upload } from 'lucide-react';
import { useVideoWorkspace } from '@/contexts/VideoWorkspaceContext';
import StorageSettings, { StorageConfig } from '../StorageSettings';
import { MobileCard, MobileButton, MobileInput } from '../MobileLayout';

interface VideoInfo {
  title: string;
  author: string;
  duration: string;
  thumbnail: string;
  formats: Array<{
    quality: string;
    container: string;
    size: number;
    hasAudio: boolean;
    hasVideo: boolean;
  }>;
}

export default function VideoDownloaderWorkspace() {
  const { loadVideo, hasVideo } = useVideoWorkspace();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [storageConfig, setStorageConfig] = useState<StorageConfig>({ provider: 'local' });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const supportedPlatforms = [
    { name: 'YouTube', icon: '🎬', color: 'bg-red-500' },
    { name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { name: 'Twitter/X', icon: '𝕏', color: 'bg-gray-800' },
    { name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
    { name: 'Vimeo', icon: '🎥', color: 'bg-blue-500' },
  ];

  const handleGetInfo = async () => {
    if (!url) {
      setError('Please enter a video URL');
      return;
    }

    console.log('Getting info for URL:', url);
    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const apiUrl = `/api/download-video?url=${encodeURIComponent(url)}`;
      console.log('Fetching from:', apiUrl);

      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get video info');
      }

      setVideoInfo(data);
    } catch (err) {
      console.error('Error getting video info:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadToWorkspace = async () => {
    if (!url || !videoInfo) return;

    setDownloading(true);
    setError('');

    try {
      // Download the video
      const response = await fetch('/api/download-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          quality: selectedQuality,
          storageConfig: { provider: 'local' } // Always download locally for workspace
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download video');
      }

      // Convert response to file
      const blob = await response.blob();
      const fileName = `${videoInfo.title?.replace(/[^a-zA-Z0-9-_]/g, '_') || 'video'}.mp4`;
      const file = new File([blob], fileName, { type: 'video/mp4' });

      // Create object URL for the video
      const videoUrl = URL.createObjectURL(blob);

      // Load into workspace
      loadVideo({
        file,
        url: videoUrl,
        name: fileName,
        size: blob.size,
        duration: parseInt(videoInfo.duration) || undefined,
        originalUrl: url
      });

      // Clear the downloader state
      setUrl('');
      setVideoInfo(null);
      setError('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDownloading(false);
    }
  };

  const formatDuration = (seconds: string) => {
    const sec = parseInt(seconds);
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasVideo()) {
    return (
      <div className="text-center py-8">
        <MobileCard className="max-w-md mx-auto">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-400 mb-2">Video Loaded</h3>
          <p className="text-gray-400 text-sm">
            Your video is ready! Use the tools below to edit and enhance it.
          </p>
        </MobileCard>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-2' : ''}`}>
      {/* URL Input */}
      <MobileCard>
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-300">Video URL</h3>

          <MobileInput
            value={url}
            onChange={setUrl}
            placeholder="Paste video URL here..."
            type="url"
          />

          <MobileButton
            onClick={handleGetInfo}
            disabled={loading || !url}
            fullWidth
            className={isMobile ? 'py-4' : ''}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Loading...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Get Info
              </>
            )}
          </MobileButton>
        </div>
      </MobileCard>

      {/* Supported Platforms */}
      <MobileCard>
        <h3 className="text-sm font-medium text-gray-300 mb-3">
          Supported Platforms
        </h3>
        <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {supportedPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-gray-700/50 rounded-xl p-3 text-center border border-gray-600/30"
            >
              <div className="text-2xl mb-2">{platform.icon}</div>
              <div className="text-xs text-gray-300 font-medium">{platform.name}</div>
            </div>
          ))}
        </div>
      </MobileCard>

      {/* Error Display */}
      {error && (
        <MobileCard className="border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </MobileCard>
      )}

      {/* Video Info */}
      {videoInfo && (
        <MobileCard padding="p-0">
          {videoInfo.thumbnail && (
            <div className="relative aspect-video">
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full h-full object-cover rounded-t-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-xl" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {videoInfo.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-300">
                  <span>{videoInfo.author}</span>
                  <span>{formatDuration(videoInfo.duration)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Quality Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quality
              </label>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
              >
                <option value="highest">Highest Quality</option>
                <option value="lowest">Lowest Quality</option>
                {videoInfo.formats
                  .filter(f => f.hasVideo && f.hasAudio && f.quality)
                  .map((format, i) => (
                    <option key={i} value={format.quality}>
                      {format.quality} ({format.container})
                    </option>
                  ))}
              </select>
            </div>

            {/* Download to Workspace Button */}
            <MobileButton
              onClick={handleDownloadToWorkspace}
              disabled={downloading}
              variant="primary"
              fullWidth
              size={isMobile ? 'lg' : 'md'}
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Loading to Workspace...
                </>
              ) : (
                <>
                  <Upload size={18} className="mr-2" />
                  Load to Workspace
                </>
              )}
            </MobileButton>
          </div>
        </MobileCard>
      )}

      {/* Tips */}
      <MobileCard className="bg-gray-800/30">
        <h4 className="font-medium text-sm text-gray-300 mb-3">💡 Workspace Tips</h4>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">•</span>
            <span>Videos loaded here stay in your workspace until you clear them</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-bold">•</span>
            <span>Apply multiple tools without re-uploading</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-bold">•</span>
            <span>Preview changes before final export</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 font-bold">•</span>
            <span>Export to local storage or cloud services</span>
          </li>
        </ul>
      </MobileCard>
    </div>
  );
}