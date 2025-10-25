'use client';

import { VideoWorkspaceProvider } from '@/contexts/VideoWorkspaceContext';
import ThumbnailGeneratorWorkspace from '@/components/tools/ThumbnailGeneratorWorkspace';

export default function ThumbnailGeneratorPage() {
  return (
    <VideoWorkspaceProvider>
      <ThumbnailGeneratorWorkspace />
    </VideoWorkspaceProvider>
  );
}
