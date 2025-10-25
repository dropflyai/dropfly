'use client';

import { VideoWorkspaceProvider } from '@/contexts/VideoWorkspaceContext';
import WatermarkRemoverWorkspace from '@/components/tools/WatermarkRemoverWorkspace';

export default function WatermarkRemoverPage() {
  return (
    <VideoWorkspaceProvider>
      <WatermarkRemoverWorkspace />
    </VideoWorkspaceProvider>
  );
}
