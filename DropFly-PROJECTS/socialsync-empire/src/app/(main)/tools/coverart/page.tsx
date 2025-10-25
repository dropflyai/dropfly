'use client';

import { VideoWorkspaceProvider } from '@/contexts/VideoWorkspaceContext';
import CoverArtWorkspace from '@/components/tools/CoverArtWorkspace';

export default function CoverArtPage() {
  return (
    <VideoWorkspaceProvider>
      <CoverArtWorkspace />
    </VideoWorkspaceProvider>
  );
}
