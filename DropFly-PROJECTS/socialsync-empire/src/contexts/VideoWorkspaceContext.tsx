'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

export interface VideoFile {
  file: File;
  url: string;
  name: string;
  size: number;
  duration?: number;
  originalUrl?: string; // For downloaded videos
}

export interface VideoProcessingStep {
  id: string;
  type: 'crop' | 'trim' | 'watermark' | 'subtitle' | 'compress' | 'convert';
  name: string;
  parameters: any;
  applied: boolean;
  timestamp: number;
}

export interface VideoWorkspaceState {
  // Current video
  currentVideo: VideoFile | null;

  // Processing steps applied to the video
  processingSteps: VideoProcessingStep[];

  // Current preview state
  previewUrl: string | null;
  isProcessing: boolean;

  // Video metadata
  videoMetadata: {
    originalDimensions?: { width: number; height: number };
    duration?: number;
    format?: string;
    bitrate?: number;
  };
}

interface VideoWorkspaceContextType {
  // State
  workspace: VideoWorkspaceState;

  // Video management
  loadVideo: (video: VideoFile) => void;
  clearVideo: () => void;

  // Processing steps
  addProcessingStep: (step: Omit<VideoProcessingStep, 'id' | 'timestamp'>) => void;
  removeProcessingStep: (stepId: string) => void;
  toggleProcessingStep: (stepId: string) => void;
  updateProcessingStep: (stepId: string, parameters: any) => void;

  // Preview and export
  generatePreview: () => Promise<void>;
  exportFinalVideo: (storageConfig?: any) => Promise<void>;

  // Utility
  hasVideo: () => boolean;
  getAppliedSteps: () => VideoProcessingStep[];
  canExport: () => boolean;
}

const VideoWorkspaceContext = createContext<VideoWorkspaceContextType | undefined>(undefined);

export function VideoWorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<VideoWorkspaceState>({
    currentVideo: null,
    processingSteps: [],
    previewUrl: null,
    isProcessing: false,
    videoMetadata: {}
  });

  const loadVideo = (video: VideoFile) => {
    // Clean up previous video URL if it exists
    if (workspace.currentVideo?.url && workspace.currentVideo.url !== video.url) {
      URL.revokeObjectURL(workspace.currentVideo.url);
    }

    setWorkspace(prev => ({
      ...prev,
      currentVideo: video,
      processingSteps: [], // Reset processing steps for new video
      previewUrl: video.url, // Initially use original video as preview
      videoMetadata: {
        duration: video.duration
      }
    }));
  };

  const clearVideo = () => {
    if (workspace.currentVideo?.url) {
      URL.revokeObjectURL(workspace.currentVideo.url);
    }
    if (workspace.previewUrl && workspace.previewUrl !== workspace.currentVideo?.url) {
      URL.revokeObjectURL(workspace.previewUrl);
    }

    setWorkspace({
      currentVideo: null,
      processingSteps: [],
      previewUrl: null,
      isProcessing: false,
      videoMetadata: {}
    });
  };

  const addProcessingStep = (step: Omit<VideoProcessingStep, 'id' | 'timestamp'>) => {
    const newStep: VideoProcessingStep = {
      ...step,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    setWorkspace(prev => ({
      ...prev,
      processingSteps: [...prev.processingSteps, newStep]
    }));

    return newStep.id;
  };

  const removeProcessingStep = (stepId: string) => {
    setWorkspace(prev => ({
      ...prev,
      processingSteps: prev.processingSteps.filter(step => step.id !== stepId)
    }));
  };

  const toggleProcessingStep = (stepId: string) => {
    setWorkspace(prev => ({
      ...prev,
      processingSteps: prev.processingSteps.map(step =>
        step.id === stepId ? { ...step, applied: !step.applied } : step
      )
    }));
  };

  const updateProcessingStep = (stepId: string, parameters: any) => {
    setWorkspace(prev => ({
      ...prev,
      processingSteps: prev.processingSteps.map(step =>
        step.id === stepId ? { ...step, parameters: { ...step.parameters, ...parameters } } : step
      )
    }));
  };

  const generatePreview = async () => {
    if (!workspace.currentVideo) return;

    setWorkspace(prev => ({ ...prev, isProcessing: true }));

    try {
      const appliedSteps = workspace.processingSteps.filter(step => step.applied);

      if (appliedSteps.length === 0) {
        // No processing steps, use original video
        setWorkspace(prev => ({
          ...prev,
          previewUrl: prev.currentVideo!.url,
          isProcessing: false
        }));
        return;
      }

      // Send processing steps to backend for preview generation
      const formData = new FormData();
      formData.append('video', workspace.currentVideo.file);
      formData.append('steps', JSON.stringify(appliedSteps));
      formData.append('preview', 'true'); // Flag for preview mode (lower quality/faster)

      const response = await fetch('/api/process-video-pipeline', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        const previewUrl = URL.createObjectURL(blob);

        // Clean up previous preview URL
        if (workspace.previewUrl && workspace.previewUrl !== workspace.currentVideo.url) {
          URL.revokeObjectURL(workspace.previewUrl);
        }

        setWorkspace(prev => ({
          ...prev,
          previewUrl,
          isProcessing: false
        }));
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      setWorkspace(prev => ({ ...prev, isProcessing: false }));
      throw error;
    }
  };

  const exportFinalVideo = async (storageConfig?: any) => {
    if (!workspace.currentVideo) return;

    setWorkspace(prev => ({ ...prev, isProcessing: true }));

    try {
      const appliedSteps = workspace.processingSteps.filter(step => step.applied);

      const formData = new FormData();
      formData.append('video', workspace.currentVideo.file);
      formData.append('steps', JSON.stringify(appliedSteps));
      formData.append('preview', 'false'); // Full quality export

      if (storageConfig) {
        formData.append('storageConfig', JSON.stringify(storageConfig));
      }

      const response = await fetch('/api/process-video-pipeline', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        if (storageConfig && storageConfig.provider !== 'local') {
          // Cloud storage - just show success message
          const result = await response.json();
          alert(`Video exported successfully to ${storageConfig.provider}!\n${result.message || ''}`);
        } else {
          // Local download
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `${workspace.currentVideo.name.split('.')[0]}_processed.mp4`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      } else {
        throw new Error('Failed to export video');
      }
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    } finally {
      setWorkspace(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const hasVideo = () => workspace.currentVideo !== null;

  const getAppliedSteps = () => workspace.processingSteps.filter(step => step.applied);

  const canExport = () => hasVideo() && getAppliedSteps().length > 0;

  const contextValue: VideoWorkspaceContextType = {
    workspace,
    loadVideo,
    clearVideo,
    addProcessingStep,
    removeProcessingStep,
    toggleProcessingStep,
    updateProcessingStep,
    generatePreview,
    exportFinalVideo,
    hasVideo,
    getAppliedSteps,
    canExport
  };

  return (
    <VideoWorkspaceContext.Provider value={contextValue}>
      {children}
    </VideoWorkspaceContext.Provider>
  );
}

export function useVideoWorkspace() {
  const context = useContext(VideoWorkspaceContext);
  if (context === undefined) {
    throw new Error('useVideoWorkspace must be used within a VideoWorkspaceProvider');
  }
  return context;
}