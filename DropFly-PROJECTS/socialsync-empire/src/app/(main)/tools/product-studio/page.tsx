'use client';

import { useState, useRef } from 'react';
import { Package, Upload, Wand2, Download, Loader2, Sparkles } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

type Style = 'realistic' | 'artistic' | 'minimal';
type Lighting = 'natural' | 'studio' | 'dramatic';

export default function ProductStudioPage() {
  const [productImage, setProductImage] = useState<string>('');
  const [productName, setProductName] = useState('');
  const [backgroundPrompt, setBackgroundPrompt] = useState('');
  const [style, setStyle] = useState<Style>('realistic');
  const [lighting, setLighting] = useState<Lighting>('natural');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string>('');
  const [error, setError] = useState('');
  const [tokensUsed, setTokensUsed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundScenes = [
    'luxury bedroom with morning sunlight',
    'modern minimalist kitchen',
    'cozy living room with fireplace',
    'professional office desk',
    'outdoor patio at sunset',
    'elegant dining table',
    'spa bathroom with candles',
    'contemporary home gym',
  ];

  const styles = [
    { id: 'realistic', name: 'Realistic', desc: 'Photorealistic commercial photography' },
    { id: 'artistic', name: 'Artistic', desc: 'Creative composition with artistic flair' },
    { id: 'minimal', name: 'Minimal', desc: 'Clean aesthetic with simple background' },
  ];

  const lightingOptions = [
    { id: 'natural', name: 'Natural', desc: 'Soft window lighting' },
    { id: 'studio', name: 'Studio', desc: 'Professional studio setup' },
    { id: 'dramatic', name: 'Dramatic', desc: 'Cinematic mood lighting' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProductImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productImage) {
      setError('Please upload a product image');
      return;
    }

    if (!backgroundPrompt.trim()) {
      setError('Please describe the background scene');
      return;
    }

    setLoading(true);
    setError('');
    setResultImage('');

    try {
      const response = await fetch('/api/image/product-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productImage,
          productName: productName || undefined,
          backgroundPrompt,
          style,
          lighting,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Product insertion failed');
      }

      setResultImage(data.image.url);
      setTokensUsed(data.tokensUsed);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;

    try {
      const response = await fetch(resultImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-studio-${Date.now()}.jpg`;
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                Product Studio
              </h1>
              <p className="text-[var(--text-secondary)]">
                Place your products in stunning lifestyle scenes
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
                Product Settings
              </h2>

              {/* Product Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Product Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square border-2 border-dashed border-[var(--border)] rounded-lg hover:border-[var(--primary-500)] transition-all overflow-hidden relative group"
                >
                  {productImage ? (
                    <>
                      <img src={productImage} alt="Product" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-tertiary)]">
                      <Upload className="w-12 h-12 mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </div>
                  )}
                </button>
              </div>

              {/* Product Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Product Name (Optional)
                </label>
                <Input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Wireless headphones, Smart watch..."
                />
              </div>

              {/* Background Scene */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Background Scene
                </label>
                <textarea
                  value={backgroundPrompt}
                  onChange={(e) => setBackgroundPrompt(e.target.value)}
                  placeholder="Describe the lifestyle scene..."
                  className="w-full h-24 px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
                />
                <div className="mt-2 flex flex-wrap gap-1">
                  {backgroundScenes.map((scene, i) => (
                    <button
                      key={i}
                      onClick={() => setBackgroundPrompt(scene)}
                      className="text-xs px-2 py-1 bg-[var(--bg-secondary)] hover:bg-[var(--primary-500)]/10 border border-[var(--border)] hover:border-[var(--primary-500)] rounded text-[var(--text-secondary)] hover:text-[var(--primary-500)] transition-all"
                    >
                      {scene}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Style
                </label>
                <div className="space-y-2">
                  {styles.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id as Style)}
                      className={`w-full p-3 rounded-lg border text-left transition-all ${
                        style === s.id
                          ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                          : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--primary-500)]/50'
                      }`}
                    >
                      <div className="font-medium text-[var(--text-primary)]">{s.name}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lighting */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Lighting
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {lightingOptions.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLighting(l.id as Lighting)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        lighting === l.id
                          ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                          : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--primary-500)]/50'
                      }`}
                    >
                      <div className="text-sm font-medium text-[var(--text-primary)]">{l.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleGenerate}
                loading={loading}
                disabled={loading || !productImage || !backgroundPrompt.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Scene...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Scene (2 tokens)
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
                  ✓ Scene created! {tokensUsed} tokens used
                </div>
              )}
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card variant="elevated" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[var(--primary-500)]" />
                  Product Scene
                </h2>
                {resultImage && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              {!resultImage && !loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center aspect-video bg-[var(--bg-secondary)] rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-primary)] flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-[var(--text-secondary)] mb-2">No scene created yet</p>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Upload a product image and describe a scene to get started
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-16 aspect-video bg-[var(--bg-secondary)] rounded-lg">
                  <Loader2 className="w-12 h-12 text-[var(--primary-500)] animate-spin mb-4" />
                  <p className="text-[var(--text-secondary)]">Creating your product scene...</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-2">This may take 30-60 seconds</p>
                </div>
              )}

              {resultImage && (
                <div className="relative group">
                  <img
                    src={resultImage}
                    alt="Generated product scene"
                    className="w-full h-auto rounded-lg border border-[var(--border)]"
                  />
                </div>
              )}
            </Card>

            {/* Info Card */}
            <Card variant="glass" padding="lg" className="mt-6">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                💡 Pro Tips
              </h3>
              <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                <li>• Use high-quality product images with transparent backgrounds for best results</li>
                <li>• Be specific about the scene - mention time of day, mood, and setting details</li>
                <li>• Try different lighting options to match your brand aesthetic</li>
                <li>• Realistic style works best for e-commerce, artistic for social media</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
