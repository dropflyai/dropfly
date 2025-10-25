'use client';

import { useState } from 'react';
import { Wand2, Download, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type ImageModel = 'flux-pro' | 'flux-dev' | 'flux-schnell' | 'sdxl' | 'qwen-vl';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5' | '3:2' | '2:3';

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
}

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState<ImageModel>('flux-dev');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [numImages, setNumImages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState('');
  const [tokensUsed, setTokensUsed] = useState(0);

  const models = [
    { id: 'flux-dev', name: 'Flux Dev', cost: '$0.025', speed: 'Fast', quality: 'Great' },
    { id: 'flux-pro', name: 'Flux Pro', cost: '$0.055', speed: 'Medium', quality: 'Best' },
    { id: 'flux-schnell', name: 'Flux Schnell', cost: '$0.003', speed: 'Fastest', quality: 'Good' },
    { id: 'sdxl', name: 'SDXL', cost: '$0.003', speed: 'Fast', quality: 'Good' },
  ];

  const aspectRatios = [
    { id: '1:1', name: 'Square', desc: '1024x1024' },
    { id: '16:9', name: 'Landscape', desc: '1920x1080' },
    { id: '9:16', name: 'Portrait', desc: '1080x1920' },
    { id: '4:5', name: 'Instagram', desc: '1024x1280' },
    { id: '3:2', name: 'Photo', desc: '1536x1024' },
    { id: '2:3', name: 'Vertical', desc: '1024x1536' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedImages([]);

    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negativePrompt: negativePrompt || undefined,
          model,
          aspectRatio,
          numImages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Image generation failed');
      }

      setGeneratedImages(data.images);
      setTokensUsed(data.tokensUsed);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `socialsync-image-${Date.now()}-${index}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                AI Image Generator
              </h1>
              <p className="text-[var(--text-secondary)]">
                Create stunning images with AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card variant="elevated" padding="lg">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--primary-500)]" />
                Generation Settings
              </h2>

              {/* Prompt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A serene mountain landscape at sunset, photorealistic, 8K..."
                  className="w-full h-32 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                />
              </div>

              {/* Negative Prompt */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Negative Prompt (Optional)
                </label>
                <Input
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="blurry, low quality, distorted..."
                />
              </div>

              {/* Model Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Model
                </label>
                <div className="space-y-2">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setModel(m.id as ImageModel)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        model === m.id
                          ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                          : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--primary-500)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-[var(--text-primary)]">{m.name}</span>
                        <span className="text-xs text-[var(--text-tertiary)]">{m.cost}/img</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span>Speed: {m.speed}</span>
                        <span>•</span>
                        <span>Quality: {m.quality}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {aspectRatios.map((ar) => (
                    <button
                      key={ar.id}
                      onClick={() => setAspectRatio(ar.id as AspectRatio)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        aspectRatio === ar.id
                          ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                          : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--primary-500)]/50'
                      }`}
                    >
                      <div className="text-sm font-medium text-[var(--text-primary)]">{ar.name}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">{ar.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Images */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Number of Images ({numImages})
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={numImages}
                  onChange={(e) => setNumImages(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Cost: {numImages} token{numImages > 1 ? 's' : ''}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleGenerate}
                loading={loading}
                disabled={loading || !prompt.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Images
                  </>
                )}
              </Button>

              {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                  {error}
                </div>
              )}

              {tokensUsed > 0 && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-500">
                  ✓ Generated successfully! {tokensUsed} token{tokensUsed > 1 ? 's' : ''} used
                </div>
              )}
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card variant="elevated" padding="lg">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-[var(--primary-500)]" />
                Generated Images
              </h2>

              {generatedImages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-[var(--text-secondary)] mb-2">No images yet</p>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Enter a prompt and click generate to create your first image
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-12 h-12 text-[var(--primary-500)] animate-spin mb-4" />
                  <p className="text-[var(--text-secondary)]">Generating your images...</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-2">This may take 10-30 seconds</p>
                </div>
              )}

              {generatedImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-auto rounded-lg border border-[var(--border)]"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownload(image.url, index)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-[var(--text-tertiary)] text-center">
                        {image.width} × {image.height}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
