'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Square,
  Crop,
  Download,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Settings,
  Zap
} from 'lucide-react';

interface VideoFile {
  file: File;
  url: string;
  name: string;
}

interface AspectRatio {
  id: string;
  name: string;
  ratio: string;
  width: number;
  height: number;
  platforms: string[];
  icon: React.ComponentType<any>;
  color: string;
}

export default function SocialCropper() {
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [dragOver, setDragOver] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const aspectRatios: AspectRatio[] = [
    {
      id: 'instagram_post',
      name: 'Instagram Post',
      ratio: '1:1',
      width: 1080,
      height: 1080,
      platforms: ['Instagram', 'Facebook', 'LinkedIn'],
      icon: Square,
      color: 'from-pink-500 to-purple-600'
    },
    {
      id: 'instagram_story',
      name: 'Instagram Story',
      ratio: '9:16',
      width: 1080,
      height: 1920,
      platforms: ['Instagram', 'TikTok', 'YouTube Shorts'],
      icon: Smartphone,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      ratio: '16:9',
      width: 1920,
      height: 1080,
      platforms: ['YouTube', 'LinkedIn', 'Facebook'],
      icon: Monitor,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      ratio: '9:16',
      width: 1080,
      height: 1920,
      platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
      icon: Smartphone,
      color: 'from-black to-gray-800'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      ratio: '16:9',
      width: 1280,
      height: 720,
      platforms: ['Twitter/X', 'LinkedIn'],
      icon: Monitor,
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      ratio: '1.91:1',
      width: 1200,
      height: 628,
      platforms: ['LinkedIn', 'Facebook'],
      icon: Monitor,
      color: 'from-blue-600 to-blue-700'
    }
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/'));

    if (videoFile) {
      loadVideo(videoFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      loadVideo(file);
    }
  };

  const loadVideo = (file: File) => {
    const url = URL.createObjectURL(file);
    setSelectedVideo({
      file,
      url,
      name: file.name
    });
    setSelectedRatio(aspectRatios[0]); // Default to Instagram Post
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleCropVideo = async () => {
    if (!selectedVideo || !selectedRatio) return;

    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('video', selectedVideo.file);
      formData.append('aspectRatio', JSON.stringify({
        width: selectedRatio.width,
        height: selectedRatio.height,
        x: cropPosition.x,
        y: cropPosition.y
      }));

      const response = await fetch('/api/crop-video', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Download the cropped video
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedVideo.name.split('.')[0]}_${selectedRatio.id}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('Failed to crop video');
      }
    } catch (error) {
      console.error('Error cropping video:', error);
      alert('Failed to crop video. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getPreviewStyle = () => {
    if (!selectedRatio) return {};

    const containerWidth = 400;
    const containerHeight = 300;

    let previewWidth, previewHeight;

    if (selectedRatio.width > selectedRatio.height) {
      // Landscape
      previewWidth = containerWidth;
      previewHeight = (containerWidth * selectedRatio.height) / selectedRatio.width;
    } else {
      // Portrait or Square
      previewHeight = containerHeight;
      previewWidth = (containerHeight * selectedRatio.width) / selectedRatio.height;
    }

    return {
      width: previewWidth,
      height: previewHeight,
      maxWidth: containerWidth,
      maxHeight: containerHeight
    };
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!selectedVideo ? (
        <div
          className={`
            border-2 border-dashed rounded-xl p-12 text-center transition-colors
            ${dragOver
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-gray-600 hover:border-gray-500'
            }
          `}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
          onDrop={handleDrop}
        >
          <Crop className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-xl font-semibold mb-2 text-white">Upload Video to Crop</h3>
          <p className="text-gray-400 mb-6">
            Drag and drop your video file here, or click to browse
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Choose Video File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Video Preview</h3>
            <div className="bg-black rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                src={selectedVideo.url}
                className="w-full h-auto"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                style={getPreviewStyle()}
              />

              {/* Crop Overlay */}
              {selectedRatio && (
                <div
                  className="absolute border-2 border-blue-500 bg-blue-500/10"
                  style={{
                    left: `${cropPosition.x}%`,
                    top: `${cropPosition.y}%`,
                    width: `${(selectedRatio.width / 1920) * 100}%`,
                    height: `${(selectedRatio.height / 1080) * 100}%`,
                    minWidth: '20%',
                    minHeight: '20%'
                  }}
                />
              )}

              {/* Video Controls */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full transition-colors"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                      onClick={resetVideo}
                      className="bg-gray-600 hover:bg-gray-700 p-2 rounded-full transition-colors"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                  <span className="text-xs text-gray-300">{selectedVideo.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Aspect Ratio Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Choose Platform</h3>
            <div className="space-y-3">
              {aspectRatios.map((ratio) => {
                const Icon = ratio.icon;
                const isSelected = selectedRatio?.id === ratio.id;

                return (
                  <button
                    key={ratio.id}
                    onClick={() => setSelectedRatio(ratio)}
                    className={`
                      w-full p-4 rounded-lg border transition-all
                      ${isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-br ${ratio.color} rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{ratio.name}</span>
                          <span className="text-sm text-gray-400">{ratio.ratio}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {ratio.platforms.join(', ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ratio.width} × {ratio.height}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Crop Controls */}
            {selectedRatio && (
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-300">Crop Position</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Horizontal (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={cropPosition.x}
                      onChange={(e) => setCropPosition({ ...cropPosition, x: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Vertical (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={cropPosition.y}
                      onChange={(e) => setCropPosition({ ...cropPosition, y: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCropVideo}
                disabled={processing || !selectedRatio}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Cropping Video...
                  </>
                ) : (
                  <>
                    <Crop size={18} />
                    Crop for {selectedRatio?.name}
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedVideo(null)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Upload Different Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pro Tips */}
      <div className="bg-gray-800/50 rounded-lg p-4">
        <h4 className="font-medium text-sm text-gray-300 mb-2 flex items-center gap-2">
          <Zap size={16} />
          Pro Tips
        </h4>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• Use 9:16 ratio for TikTok, Instagram Reels, and YouTube Shorts</li>
          <li>• Square (1:1) works best for Instagram posts and Facebook</li>
          <li>• 16:9 is ideal for YouTube, LinkedIn, and Twitter videos</li>
          <li>• Adjust crop position to focus on the most important content</li>
          <li>• Consider text placement when cropping for social media</li>
        </ul>
      </div>
    </div>
  );
}