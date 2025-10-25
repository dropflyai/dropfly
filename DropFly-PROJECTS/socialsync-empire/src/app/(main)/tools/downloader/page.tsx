'use client';

import { VideoWorkspaceProvider } from '@/contexts/VideoWorkspaceContext';
import VideoDownloaderWorkspace from '@/components/tools/VideoDownloaderWorkspace';

export default function VideoDownloaderPage() {
  return (
    <VideoWorkspaceProvider>
      <VideoDownloaderWorkspace />
    </VideoWorkspaceProvider>
  );
}
