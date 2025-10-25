'use client';

import { VideoWorkspaceProvider } from '@/contexts/VideoWorkspaceContext';
import FormatConverterWorkspace from '@/components/tools/FormatConverterWorkspace';

export default function FormatConverterPage() {
  return (
    <VideoWorkspaceProvider>
      <FormatConverterWorkspace />
    </VideoWorkspaceProvider>
  );
}
