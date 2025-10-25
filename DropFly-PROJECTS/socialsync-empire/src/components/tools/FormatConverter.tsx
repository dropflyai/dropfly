'use client';

import { useState } from 'react';
import { FileVideo, Settings, Info } from 'lucide-react';

interface FormatConverterProps {
  videoFile: File;
  onProcess: (options: ConversionOptions) => void;
}

export interface ConversionOptions {
  outputFormat: 'mp4' | 'mov' | 'avi' | 'webm' | 'mkv';
  codec: 'h264' | 'h265' | 'vp9' | 'av1';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  resolution: 'original' | '720p' | '1080p' | '1440p' | '4k';
  framerate: 'original' | '24' | '30' | '60';
}

const formatDetails = {
  mp4: {
    name: 'MP4',
    description: 'Most compatible format',
    codecs: ['h264', 'h265'],
    icon: '🎬'
  },
  mov: {
    name: 'MOV',
    description: 'Apple QuickTime format',
    codecs: ['h264', 'h265'],
    icon: '🍎'
  },
  webm: {
    name: 'WebM',
    description: 'Web-optimized format',
    codecs: ['vp9', 'av1'],
    icon: '🌐'
  },
  avi: {
    name: 'AVI',
    description: 'Windows Media format',
    codecs: ['h264'],
    icon: '🪟'
  },
  mkv: {
    name: 'MKV',
    description: 'Open-source container',
    codecs: ['h264', 'h265', 'vp9', 'av1'],
    icon: '📦'
  }
};

const codecDetails = {
  h264: { name: 'H.264 (AVC)', description: 'Universal compatibility', icon: '⚡' },
  h265: { name: 'H.265 (HEVC)', description: '50% smaller files', icon: '🗜️' },
  vp9: { name: 'VP9', description: 'Google codec, web-friendly', icon: '🌐' },
  av1: { name: 'AV1', description: 'Next-gen compression', icon: '🚀' }
};

export default function FormatConverter({ videoFile, onProcess }: FormatConverterProps) {
  const [options, setOptions] = useState<ConversionOptions>({
    outputFormat: 'mp4',
    codec: 'h264',
    quality: 'high',
    resolution: 'original',
    framerate: 'original'
  });

  // Filter codecs based on selected format
  const availableCodecs = formatDetails[options.outputFormat].codecs;

  // Update codec if current codec is not available for selected format
  const handleFormatChange = (format: ConversionOptions['outputFormat']) => {
    const newFormatCodecs = formatDetails[format].codecs;
    const newCodec = newFormatCodecs.includes(options.codec)
      ? options.codec
      : newFormatCodecs[0] as ConversionOptions['codec'];

    setOptions(prev => ({
      ...prev,
      outputFormat: format,
      codec: newCodec
    }));
  };

  const estimateFileSize = () => {
    const originalSizeMB = videoFile.size / (1024 * 1024);
    let multiplier = 1;

    // Quality multiplier
    switch (options.quality) {
      case 'low': multiplier *= 0.3; break;
      case 'medium': multiplier *= 0.6; break;
      case 'high': multiplier *= 0.9; break;
      case 'lossless': multiplier *= 2; break;
    }

    // Codec multiplier
    switch (options.codec) {
      case 'h264': multiplier *= 1; break;
      case 'h265': multiplier *= 0.5; break;
      case 'vp9': multiplier *= 0.6; break;
      case 'av1': multiplier *= 0.4; break;
    }

    return (originalSizeMB * multiplier).toFixed(1);
  };

  return (
    <div className="space-y-4">
      {/* Current File Info */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FileVideo size={16} />
          Current File
        </h4>
        <div className="text-sm text-gray-400 space-y-1">
          <p>Name: {videoFile.name}</p>
          <p>Size: {(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
          <p>Type: {videoFile.type || 'Unknown'}</p>
        </div>
      </div>

      {/* Format Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Output Format</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(formatDetails).map(([key, format]) => (
            <button
              key={key}
              onClick={() => handleFormatChange(key as ConversionOptions['outputFormat'])}
              className={`p-3 rounded-lg text-left transition ${
                options.outputFormat === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{format.icon}</span>
                <div>
                  <div className="font-medium">{format.name}</div>
                  <div className="text-xs opacity-80">{format.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Codec Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Video Codec</label>
        <div className="space-y-2">
          {availableCodecs.map((codecKey) => {
            const codec = codecDetails[codecKey as keyof typeof codecDetails];
            return (
              <button
                key={codecKey}
                onClick={() => setOptions(prev => ({ ...prev, codec: codecKey as ConversionOptions['codec'] }))}
                className={`w-full p-3 rounded-lg text-left transition ${
                  options.codec === codecKey
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{codec.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{codec.name}</div>
                    <div className="text-xs opacity-80">{codec.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality Settings */}
      <div>
        <label className="block text-sm font-medium mb-2">Quality</label>
        <select
          value={options.quality}
          onChange={(e) => setOptions(prev => ({
            ...prev,
            quality: e.target.value as ConversionOptions['quality']
          }))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
        >
          <option value="low">Low (Smaller file)</option>
          <option value="medium">Medium (Balanced)</option>
          <option value="high">High (Recommended)</option>
          <option value="lossless">Lossless (Largest file)</option>
        </select>
      </div>

      {/* Resolution */}
      <div>
        <label className="block text-sm font-medium mb-2">Resolution</label>
        <select
          value={options.resolution}
          onChange={(e) => setOptions(prev => ({
            ...prev,
            resolution: e.target.value as ConversionOptions['resolution']
          }))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
        >
          <option value="original">Keep Original</option>
          <option value="720p">720p HD</option>
          <option value="1080p">1080p Full HD</option>
          <option value="1440p">1440p 2K</option>
          <option value="4k">4K Ultra HD</option>
        </select>
      </div>

      {/* Frame Rate */}
      <div>
        <label className="block text-sm font-medium mb-2">Frame Rate</label>
        <select
          value={options.framerate}
          onChange={(e) => setOptions(prev => ({
            ...prev,
            framerate: e.target.value as ConversionOptions['framerate']
          }))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
        >
          <option value="original">Keep Original</option>
          <option value="24">24 FPS (Cinema)</option>
          <option value="30">30 FPS (Standard)</option>
          <option value="60">60 FPS (Smooth)</option>
        </select>
      </div>

      {/* Estimated Output */}
      <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
        <h4 className="font-medium mb-2 flex items-center gap-2 text-blue-400">
          <Info size={16} />
          Estimated Output
        </h4>
        <div className="text-sm text-gray-300 space-y-1">
          <p>Format: {formatDetails[options.outputFormat].name} (.{options.outputFormat})</p>
          <p>Codec: {codecDetails[options.codec].name}</p>
          <p>Estimated Size: ~{estimateFileSize()} MB</p>
          <p>Quality: {options.quality}</p>
        </div>
      </div>

      {/* Convert Button */}
      <button
        onClick={() => onProcess(options)}
        className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition"
      >
        Convert Video
      </button>
    </div>
  );
}