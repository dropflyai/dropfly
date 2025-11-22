'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SimpleVideoPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number | null>(null);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [useScript, setUseScript] = useState(false);
  const [script, setScript] = useState('');

  const generateVideo = async () => {
    const inputText = useScript ? script : prompt;

    if (!inputText.trim()) {
      setError(useScript ? 'Please enter a script' : 'Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setTokensUsed(null);

    try {
      const response = await fetch('/api/video/generate-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText,
          duration,
          isScript: useScript
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Video generation failed');
      }

      setVideoUrl(data.videoUrl);
      setTokensUsed(data.tokensUsed);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    "A person talking about productivity tips in a modern office",
    "A chef cooking pasta in a restaurant kitchen",
    "A fitness coach demonstrating a workout routine",
    "A sunset over a beach with waves crashing",
    "A cat playing with a ball of yarn"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Simple Video Generator
          </h1>
          <p className="text-xl text-gray-300">
            Just type what you want. We'll make it happen.
          </p>
          <div className="mt-4">
            <Link
              href="/scripts"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Need a detailed script? Use the Script Generator →
            </Link>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">

          {/* Main Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">

            {/* Mode Toggle */}
            <div className="mb-6 flex items-center justify-between">
              <label className="text-sm font-medium">Input Mode:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUseScript(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    !useScript
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/30 text-gray-400 hover:text-white'
                  }`}
                >
                  Simple Prompt
                </button>
                <button
                  onClick={() => setUseScript(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    useScript
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/30 text-gray-400 hover:text-white'
                  }`}
                >
                  Use Script
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            {!useScript ? (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  What video do you want to create?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your video... (e.g., 'A person explaining AI in a futuristic room')"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all min-h-[120px] resize-none"
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-3">
                  Paste your script here
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Paste your full script here... You can generate one at /scripts"
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all min-h-[200px] resize-none"
                  disabled={loading}
                />
                <Link
                  href="/scripts"
                  className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block"
                >
                  Generate a script →
                </Link>
              </div>
            )}

            {/* Duration Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Video Length
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDuration(5)}
                  disabled={loading}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    duration === 5
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/30 text-gray-300 hover:bg-black/50'
                  }`}
                >
                  5 seconds
                </button>
                <button
                  onClick={() => setDuration(10)}
                  disabled={loading}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    duration === 10
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/30 text-gray-300 hover:bg-black/50'
                  }`}
                >
                  10 seconds
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateVideo}
              disabled={loading || (!useScript && !prompt.trim()) || (useScript && !script.trim())}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Video... (this takes ~30-60 seconds)
                </span>
              ) : (
                'Generate Video (75 tokens)'
              )}
            </button>

            {/* Example Prompts */}
            {!videoUrl && !loading && (
              <div className="mt-6">
                <p className="text-sm text-gray-400 mb-3">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
                      className="px-3 py-1.5 rounded-lg bg-black/30 text-sm text-gray-300 hover:bg-black/50 hover:text-white transition-all border border-white/10"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Success / Video Preview */}
            {videoUrl && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Your Video is Ready!</h3>
                  {tokensUsed && (
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm font-medium">
                      Used {tokensUsed} tokens
                    </span>
                  )}
                </div>

                {/* Video Player */}
                <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <a
                    href={videoUrl}
                    download
                    className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-center transition-all"
                  >
                    Download Video
                  </a>
                  <button
                    onClick={() => {
                      setVideoUrl(null);
                      setError(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all"
                  >
                    Generate Another
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Info Card */}
          <div className="mt-8 bg-blue-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/20">
            <h3 className="text-lg font-bold mb-3">How it works:</h3>
            <ol className="space-y-2 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">1</span>
                <span>Describe your video in plain English</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">2</span>
                <span>Click "Generate Video" and wait ~30-60 seconds</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold">3</span>
                <span>Watch, download, or generate a new one</span>
              </li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}
