'use client';

import { useState } from 'react';
import { Download, Loader2, Link2, CheckCircle, AlertCircle, Play, Settings2 } from 'lucide-react';
import StorageSettings, { StorageConfig } from '../StorageSettings';

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

export default function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('highest');
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [storageConfig, setStorageConfig] = useState<StorageConfig>({
    provider: 'local'
  });

  const supportedPlatforms = [
    { name: 'YouTube', icon: '🎬', color: 'bg-red-500' },
    { name: 'TikTok', icon: '🎵', color: 'bg-black' },
    { name: 'Instagram', icon: '📷', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { name: 'Twitter/X', icon: '𝕏', color: 'bg-gray-800' },
    { name: 'Facebook', icon: '👥', color: 'bg-blue-600' },
    { name: 'Vimeo', icon: '🎥', color: 'bg-blue-500' },
  ];

  const handleGetInfo = async () => {
    if (!url) return;

    setLoading(true);
    setError('');
    setVideoInfo(null);

    try {
      const response = await fetch(`/api/download-video?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get video info');
      }

      setVideoInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!url) return;

    setDownloading(true);
    setError('');

    try {
      // First download the video
      const response = await fetch('/api/download-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          quality: selectedQuality,
          storageConfig: storageConfig
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download video');
      }

      // Handle based on storage provider
      if (storageConfig.provider === 'local') {
        // For local download, create a download link
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = videoInfo?.title || 'video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } else {
        // For cloud storage, just show success message
        const result = await response.json();
        alert(`Video uploaded successfully to ${storageConfig.provider}!\n${result.message || ''}`);
      }
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

  return (
    <div className="space-y-6">
      {/* Storage Settings Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-200">Video Downloader</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg transition-all
            ${showSettings
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }
          `}
        >
          <Settings2 size={16} />
          Storage Settings
        </button>
      </div>

      {/* Storage Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <StorageSettings
            config={storageConfig}
            onConfigChange={setStorageConfig}
          />
        </div>
      )}

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Video URL
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste video URL here..."
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleGetInfo}
            disabled={loading || !url}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Get Info
              </>
            )}
          </button>
        </div>
      </div>

      {/* Supported Platforms */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Supported Platforms
        </label>
        <div className="grid grid-cols-3 gap-2">
          {supportedPlatforms.map((platform) => (
            <div
              key={platform.name}
              className="bg-gray-800 rounded-lg p-3 text-center"
            >
              <div className="text-2xl mb-1">{platform.icon}</div>
              <div className="text-xs text-gray-400">{platform.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Video Info */}
      {videoInfo && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {videoInfo.thumbnail && (
            <div className="relative aspect-video">
              <img
                src={videoInfo.thumbnail}
                alt={videoInfo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
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
                className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Storage Destination Display */}
            <div className="bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Save to:</span>
                <span className="text-sm font-medium text-white">
                  {storageConfig.provider === 'local' ? 'Downloads Folder' :
                   storageConfig.provider === 'googledrive' ? 'Google Drive' :
                   storageConfig.provider === 'dropbox' ? 'Dropbox' :
                   storageConfig.provider === 'airtable' ? 'Airtable' :
                   storageConfig.provider === 'supabase' ? 'Supabase' : 'Unknown'}
                </span>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {storageConfig.provider === 'local' ? 'Downloading...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Download size={18} />
                  {storageConfig.provider === 'local' ? 'Download Video' : `Save to ${
                    storageConfig.provider === 'googledrive' ? 'Google Drive' :
                    storageConfig.provider === 'dropbox' ? 'Dropbox' :
                    storageConfig.provider === 'airtable' ? 'Airtable' :
                    storageConfig.provider === 'supabase' ? 'Supabase' : 'Storage'
                  }`}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-medium text-sm text-gray-300 mb-2">Pro Tips</h4>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• Configure cloud storage in Settings to save directly to the cloud</li>
          <li>• Higher quality videos take longer to download</li>
          <li>• Some platforms may have download restrictions</li>
          <li>• Always respect copyright and content ownership</li>
        </ul>
      </div>
    </div>
  );
}