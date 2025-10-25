'use client';

import { VideoWorkspaceProvider } from '@/contexts/VideoWorkspaceContext';
import SocialCropperWorkspace from '@/components/tools/SocialCropperWorkspace';

export default function SocialCropperPage() {
  return (
    <VideoWorkspaceProvider>
      <SocialCropperWorkspace />
    </VideoWorkspaceProvider>
  );
}
