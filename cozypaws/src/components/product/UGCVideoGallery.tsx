'use client';

import { useState } from 'react';

interface UGCVideo {
  url: string;
  pet_type: string;
  created_at: string;
  job_id: string;
}

interface UGCVideoGalleryProps {
  videos: UGCVideo[];
}

export function UGCVideoGallery({ videos }: UGCVideoGalleryProps) {
  const [selectedVideo, setSelectedVideo] = useState<number>(0);

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-gray-900">See It In Action</h2>
      <p className="mt-1 text-sm text-gray-600">
        Watch how this product looks in a real home setting
      </p>

      <div className="mt-6">
        <div className="aspect-[9/16] max-w-sm mx-auto overflow-hidden rounded-lg bg-gray-100">
          <video
            key={videos[selectedVideo].url}
            src={videos[selectedVideo].url}
            controls
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {videos.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {videos.map((video, index) => (
              <button
                key={video.job_id}
                onClick={() => setSelectedVideo(index)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedVideo === index
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {video.pet_type}
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 text-center">
          <p className="text-xs text-gray-500">
            AI-generated lifestyle video • {new Date(videos[selectedVideo].created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
