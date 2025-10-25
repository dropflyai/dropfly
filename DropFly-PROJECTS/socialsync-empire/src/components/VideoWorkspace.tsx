'use client';

import { useState, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Settings2,
  FileVideo,
  Loader2,
  CheckCircle,
  X,
  Layers,
  Clock,
  Zap
} from 'lucide-react';
import { useVideoWorkspace } from '@/contexts/VideoWorkspaceContext';
import StorageSettings, { StorageConfig } from './StorageSettings';

interface VideoWorkspaceProps {
  children: React.ReactNode;
}

export default function VideoWorkspace({ children }: VideoWorkspaceProps) {
  const {
    workspace,
    clearVideo,
    generatePreview,
    exportFinalVideo,
    hasVideo,
    getAppliedSteps,
    canExport,
    removeProcessingStep,
    toggleProcessingStep
  } = useVideoWorkspace();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showSteps, setShowSteps] = useState(true);
  const [storageConfig, setStorageConfig] = useState<StorageConfig>({ provider: 'local' });
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const handlePreview = async () => {
    try {
      await generatePreview();
    } catch (error) {
      alert('Failed to generate preview. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      await exportFinalVideo(storageConfig.provider === 'local' ? null : storageConfig);
      setShowExportSettings(false);
    } catch (error) {
      alert('Failed to export video. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Video Preview Section */}
      {hasVideo() && (
        <div className="bg-gray-900/50 border-b border-gray-800/50 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-lg overflow-hidden relative aspect-video">
                <video
                  ref={videoRef}
                  src={workspace.previewUrl || workspace.currentVideo?.url}
                  className="w-full h-full object-contain"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Processing Overlay */}
                {workspace.isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 size={48} className="animate-spin mx-auto mb-4 text-blue-500" />
                      <p className="text-lg font-medium">Processing Video...</p>
                      <p className="text-sm text-gray-400 mt-2">This may take a few moments</p>
                    </div>
                  </div>
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
                    <div className="text-sm text-gray-300">
                      {workspace.currentVideo?.name} • {formatDuration(workspace.videoMetadata.duration)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Info & Actions */}
            <div className="space-y-4">
              {/* Video Info */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <FileVideo size={16} />
                  Video Info
                </h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <div>Size: {formatFileSize(workspace.currentVideo?.size || 0)}</div>
                  <div>Duration: {formatDuration(workspace.videoMetadata.duration)}</div>
                  {workspace.currentVideo?.originalUrl && (
                    <div className="text-xs text-blue-400">
                      Downloaded from: {new URL(workspace.currentVideo.originalUrl).hostname}
                    </div>
                  )}
                </div>
              </div>

              {/* Processing Steps */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-200 flex items-center gap-2">
                    <Layers size={16} />
                    Processing Steps ({getAppliedSteps().length})
                  </h3>
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    {showSteps ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {showSteps && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {workspace.processingSteps.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">
                        No processing steps yet
                      </p>
                    ) : (
                      workspace.processingSteps.map((step) => (
                        <div
                          key={step.id}
                          className={`
                            flex items-center justify-between p-2 rounded border transition-all
                            ${step.applied
                              ? 'border-green-500/30 bg-green-500/10'
                              : 'border-gray-600 bg-gray-700/50'
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleProcessingStep(step.id)}
                              className={`
                                w-4 h-4 rounded border-2 flex items-center justify-center
                                ${step.applied
                                  ? 'border-green-500 bg-green-500'
                                  : 'border-gray-500'
                                }
                              `}
                            >
                              {step.applied && <CheckCircle size={12} className="text-white" />}
                            </button>
                            <span className="text-sm text-gray-300">{step.name}</span>
                          </div>
                          <button
                            onClick={() => removeProcessingStep(step.id)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handlePreview}
                  disabled={workspace.isProcessing || getAppliedSteps().length === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Preview Changes
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowExportSettings(true)}
                    disabled={workspace.isProcessing || !canExport()}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Export
                  </button>
                  <button
                    onClick={() => setShowExportSettings(true)}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <Settings2 size={16} />
                  </button>
                </div>

                <button
                  onClick={clearVideo}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Clear Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Settings Modal */}
      {showExportSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Export Settings</h3>
              <button
                onClick={() => setShowExportSettings(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>

            <StorageSettings
              config={storageConfig}
              onConfigChange={setStorageConfig}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleExport}
                disabled={workspace.isProcessing}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                {workspace.isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Export Video
                  </>
                )}
              </button>
              <button
                onClick={() => setShowExportSettings(false)}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Section */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Tips */}
      {hasVideo() && (
        <div className="border-t border-gray-800/50 p-4">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-xs text-gray-400">
                <p className="font-medium text-gray-300 mb-1">Workflow Tips:</p>
                <p>• Apply multiple tools to your video without re-uploading</p>
                <p>• Use Preview to see changes before exporting</p>
                <p>• Toggle processing steps on/off to compare results</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}