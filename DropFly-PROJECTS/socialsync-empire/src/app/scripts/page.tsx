'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ScriptGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [creatorMode, setCreatorMode] = useState('ugc');
  const [platform, setPlatform] = useState('TikTok');
  const [duration, setDuration] = useState('30-60 seconds');
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const generateScript = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setScript(null);

    try {
      const response = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          creatorMode,
          platform,
          duration
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Script generation failed');
      }

      setScript(data.script);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const copyFullScript = () => {
    if (!script) return;
    const fullText = `${script.hook}\n\n${script.script}\n\n${script.cta}`;
    copyToClipboard(fullText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Script Generator
          </h1>
          <p className="text-xl text-gray-300">
            Create professional video scripts with AI
          </p>
          <div className="mt-4">
            <Link
              href="/video"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              ← Back to Simple Video Generator
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Input Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Configure Your Script</h2>

            {/* Topic */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Video Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'How to use ChatGPT for productivity'"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                disabled={loading}
              />
            </div>

            {/* Creator Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Content Style
              </label>
              <select
                value={creatorMode}
                onChange={(e) => setCreatorMode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                disabled={loading}
              >
                <option value="ugc">UGC / Viral Content</option>
                <option value="educational">Educational</option>
                <option value="entertainment">Entertainment</option>
                <option value="review">Product Review</option>
                <option value="tutorial">Tutorial / How-To</option>
              </select>
            </div>

            {/* Platform */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Target Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                disabled={loading}
              >
                <option value="TikTok">TikTok</option>
                <option value="Instagram">Instagram Reels</option>
                <option value="YouTube">YouTube</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="Facebook">Facebook</option>
              </select>
            </div>

            {/* Duration */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">
                Video Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/20 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                disabled={loading}
              >
                <option value="15-30 seconds">15-30 seconds</option>
                <option value="30-60 seconds">30-60 seconds</option>
                <option value="1-2 minutes">1-2 minutes</option>
                <option value="2-5 minutes">2-5 minutes</option>
                <option value="5-10 minutes">5-10 minutes</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateScript}
              disabled={loading || !topic.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Script...
                </span>
              ) : (
                'Generate Script (7 tokens)'
              )}
            </button>

            {error && (
              <div className="mt-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Generated Script</h2>
              {script && (
                <button
                  onClick={copyFullScript}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all"
                >
                  Copy Full Script
                </button>
              )}
            </div>

            {!script && !loading && (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <p>Your generated script will appear here...</p>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-300">Creating your script...</p>
                </div>
              </div>
            )}

            {script && (
              <div className="space-y-6">
                {/* Hook */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-purple-400">Hook (First 3 seconds)</h3>
                    <button
                      onClick={() => copyToClipboard(script.hook)}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-purple-500/30">
                    <p className="text-white">{script.hook}</p>
                  </div>
                </div>

                {/* Main Script */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-blue-400">Main Script</h3>
                    <button
                      onClick={() => copyToClipboard(script.script)}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-blue-500/30 max-h-64 overflow-y-auto">
                    <p className="text-white whitespace-pre-wrap">{script.script}</p>
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-green-400">Call to Action</h3>
                    <button
                      onClick={() => copyToClipboard(script.cta)}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-green-500/30">
                    <p className="text-white">{script.cta}</p>
                  </div>
                </div>

                {/* Hashtags */}
                {script.hashtags && (
                  <div>
                    <h3 className="font-bold text-pink-400 mb-2">Suggested Hashtags</h3>
                    <div className="flex flex-wrap gap-2">
                      {script.hashtags.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-white/10">
                  <Link
                    href={`/video?script=${encodeURIComponent(JSON.stringify(script))}`}
                    className="block w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-center transition-all"
                  >
                    Use This Script in Video Generator →
                  </Link>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Info Section */}
        <div className="mt-12 max-w-6xl mx-auto bg-blue-500/10 backdrop-blur-lg rounded-2xl p-8 border border-blue-500/20">
          <h3 className="text-2xl font-bold mb-4">How to Use Your Script</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold mb-3">
                1
              </div>
              <h4 className="font-bold mb-2">Generate Script</h4>
              <p className="text-gray-300 text-sm">
                Configure your video topic, style, platform, and duration, then click generate.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold mb-3">
                2
              </div>
              <h4 className="font-bold mb-2">Review & Copy</h4>
              <p className="text-gray-300 text-sm">
                Review the generated hook, script, and CTA. Copy individual sections or the full script.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold mb-3">
                3
              </div>
              <h4 className="font-bold mb-2">Create Video</h4>
              <p className="text-gray-300 text-sm">
                Use the script in the video generator, or record it yourself for authentic UGC content.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
