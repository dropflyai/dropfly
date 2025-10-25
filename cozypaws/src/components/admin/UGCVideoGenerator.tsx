'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface UGCVideoGeneratorProps {
  sku: string;
  productImage: string;
}

export function UGCVideoGenerator({ sku, productImage }: UGCVideoGeneratorProps) {
  const [petType, setPetType] = useState<string>('dog');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress('Uploading image...');

    try {
      const imageResponse = await fetch(productImage);
      const imageBlob = await imageResponse.blob();
      const imageFile = new File([imageBlob], 'product.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('sku', sku);
      formData.append('imageFile', imageFile);
      formData.append('pet_type', petType);

      setProgress('Generating video with Higgsfield WAN 2.5 (product placement preset)...');

      const response = await fetch('/api/higgs-ugc', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.status === 202) {
        toast.info('Video generation started!', {
          description: `Job ID: ${data.jobId}. Check status at ${data.checkUrl}`,
          duration: 5000,
        });
        setProgress('Processing in background... (5-10s typical)');

        const checkJobStatus = async () => {
          const statusRes = await fetch(`/api/higgs-ugc/status/${data.jobId}`);
          const statusData = await statusRes.json();

          if (statusData.status === 'completed') {
            toast.success('Video ready!');
            window.location.reload();
          } else if (statusData.status === 'failed') {
            toast.error('Generation failed');
            setProgress('');
          } else {
            setTimeout(checkJobStatus, 2000);
          }
        };

        setTimeout(checkJobStatus, 2000);
      } else if (response.ok) {
        toast.success('Video generated successfully!', {
          description: '1080p video with audio + SFX saved to product.',
          duration: 3000,
        });
        setProgress('Completed!');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('Failed to generate video', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      setProgress('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
      <h3 className="text-base font-semibold text-gray-900">Generate UGC Video</h3>
      <p className="mt-1 text-sm text-gray-600">
        Create AI-generated lifestyle video for this product
      </p>

      <div className="mt-4">
        <label htmlFor="pet-type" className="block text-sm font-medium text-gray-700">
          Pet Type
        </label>
        <select
          id="pet-type"
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
          disabled={isGenerating}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm px-3 py-2 border disabled:opacity-50"
        >
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="corgi">Corgi</option>
          <option value="kitten">Kitten</option>
          <option value="puppy">Puppy</option>
          <option value="small pet">Small Pet</option>
        </select>
      </div>

      {progress && (
        <div className="mt-4 rounded-lg bg-blue-50 p-3 border border-blue-200">
          <div className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm text-blue-800">{progress}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Generate Video
          </>
        )}
      </button>

      <p className="mt-3 text-xs text-gray-500">
        Higgsfield WAN 2.5 with product placement preset. 1080p, 10s, native audio + SFX. Generation: 5-10s. 2 free/day + unlimited on $9 tier.
      </p>
    </div>
  );
}
