'use client';

import { useState } from 'react';
import { Sparkles, TrendingUp, Video, Wand2, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';

type CreationMode = 'video' | 'post' | 'ad' | 'repurpose';
type Step = 'mode' | 'input' | 'configure' | 'generate' | 'review';
type VideoStyle = 'cinematic' | 'real' | 'ai-art' | 'animated';
type Platform = 'instagram' | 'tiktok' | 'youtube';
type Duration = '15' | '30' | '60';

export default function CreatePage() {
  const [step, setStep] = useState<Step>('mode');
  const [selectedMode, setSelectedMode] = useState<CreationMode | null>(null);

  // Form state
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<VideoStyle>('cinematic');
  const [platforms, setPlatforms] = useState<Platform[]>(['instagram']);
  const [duration, setDuration] = useState<Duration>('30');
  const [voiceType, setVoiceType] = useState('ai');
  const [musicType, setMusicType] = useState('upbeat');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);

  const creationModes = [
    {
      id: 'video' as CreationMode,
      icon: Video,
      title: 'AI Video from Text',
      subtitle: 'Text → Video in 60 seconds',
      gradient: 'from-blue-500 to-purple-600',
      popular: true,
    },
    {
      id: 'post' as CreationMode,
      icon: Sparkles,
      title: 'Social Post (Text Only)',
      subtitle: 'AI-generated captions',
      gradient: 'from-green-500 to-emerald-600',
      popular: false,
    },
    {
      id: 'ad' as CreationMode,
      icon: TrendingUp,
      title: 'Product Ad Video',
      subtitle: 'From product catalog',
      gradient: 'from-orange-500 to-red-600',
      popular: false,
    },
    {
      id: 'repurpose' as CreationMode,
      icon: Wand2,
      title: 'Repurpose Existing Video',
      subtitle: 'Crop, edit, repost',
      gradient: 'from-pink-500 to-rose-600',
      popular: false,
    },
  ];

  const trendingTopics = [
    { topic: 'AI automation hacks', emoji: '🤖' },
    { topic: 'Morning routine for success', emoji: '☀️' },
    { topic: 'Side hustle ideas 2024', emoji: '💰' },
    { topic: 'Remote work productivity', emoji: '💻' },
  ];

  const videoStyles = [
    {
      id: 'cinematic' as VideoStyle,
      name: 'Cinematic',
      emoji: '🎬',
      description: 'Hollywood-style production',
    },
    {
      id: 'real' as VideoStyle,
      name: 'Real Footage',
      emoji: '📸',
      description: 'Authentic stock videos',
    },
    {
      id: 'ai-art' as VideoStyle,
      name: 'AI Art',
      emoji: '🎨',
      description: 'Unique AI-generated visuals',
    },
    {
      id: 'animated' as VideoStyle,
      name: 'Animated',
      emoji: '✨',
      description: 'Cartoon-style animation',
    },
  ];

  const platformOptions = [
    { id: 'instagram' as Platform, name: 'Instagram', emoji: '📷', aspectRatio: '9:16' },
    { id: 'tiktok' as Platform, name: 'TikTok', emoji: '🎵', aspectRatio: '9:16' },
    { id: 'youtube' as Platform, name: 'YouTube', emoji: '▶️', aspectRatio: '16:9' },
  ];

  const handleModeSelect = (mode: CreationMode) => {
    setSelectedMode(mode);
    setStep('input');
  };

  const handleInputSubmit = () => {
    if (!prompt.trim()) return;
    setStep('configure');
  };

  const handleGenerate = async () => {
    setStep('generate');
    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setStep('review');
          setGeneratedVideo({
            url: '/placeholder-video.mp4',
            caption: 'AI-generated caption will appear here...',
            hashtags: '#AI #VideoMarketing #SocialMedia',
          });
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  // STEP 1: Mode Selection
  if (step === 'mode') {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            What do you want to create?
          </h2>
          <p className="text-gray-400">Choose a content type to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creationModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`
                  relative p-6 rounded-2xl text-left
                  bg-gradient-to-br ${mode.gradient}
                  hover:scale-105 active:scale-95
                  transition-all duration-200
                  shadow-lg group
                `}
              >
                {mode.popular && (
                  <Badge variant="warning" size="sm" className="absolute top-4 right-4">
                    Popular
                  </Badge>
                )}
                <Icon className="w-10 h-10 text-white mb-3" />
                <h3 className="text-xl font-bold text-white mb-1">{mode.title}</h3>
                <p className="text-white/80">{mode.subtitle}</p>
                <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // STEP 2: Input (Prompt)
  if (step === 'input') {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep('mode')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Video Generator</h2>
            <p className="text-gray-400">Tell us what your video should be about</p>
          </div>
        </div>

        <Card variant="glass" padding="lg">
          <Input
            multiline
            rows={6}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your idea here...&#10;&#10;Example: '5 productivity tips for remote workers'"
            label="What should the video be about?"
            className="mb-4"
          />

          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleInputSubmit}
            disabled={!prompt.trim()}
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            Continue
          </Button>
        </Card>

        {/* Trending Topics */}
        <Card variant="glass" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-white">Or choose from trends:</h3>
          </div>
          <div className="space-y-2">
            {trendingTopics.map((trend, index) => (
              <button
                key={index}
                onClick={() => {
                  setPrompt(`Create a video about: ${trend.topic}`);
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-800/50 transition-colors group"
              >
                <span className="text-lg mr-2">{trend.emoji}</span>
                <span className="text-white group-hover:text-blue-400 transition-colors">
                  {trend.topic}
                </span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // STEP 3: Configure (Style, Platform, Duration)
  if (step === 'configure') {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setStep('input')}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Configure Your Video</h2>
            <p className="text-gray-400">Choose style, platforms, and settings</p>
          </div>
        </div>

        {/* Video Style */}
        <Card variant="glass" padding="lg">
          <h3 className="font-semibold text-white mb-4">Choose Video Style</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {videoStyles.map((styleOption) => (
              <button
                key={styleOption.id}
                onClick={() => setStyle(styleOption.id)}
                className={`
                  p-4 rounded-xl text-center transition-all
                  ${style === styleOption.id
                    ? 'bg-blue-500/20 border-2 border-blue-500 scale-105'
                    : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <div className="text-3xl mb-2">{styleOption.emoji}</div>
                <p className="font-semibold text-white text-sm">{styleOption.name}</p>
                <p className="text-xs text-gray-400 mt-1">{styleOption.description}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Platforms */}
        <Card variant="glass" padding="lg">
          <h3 className="font-semibold text-white mb-4">Target Platforms</h3>
          <div className="grid grid-cols-3 gap-3">
            {platformOptions.map((platform) => (
              <button
                key={platform.id}
                onClick={() => togglePlatform(platform.id)}
                className={`
                  p-4 rounded-xl text-center transition-all
                  ${platforms.includes(platform.id)
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <div className="text-2xl mb-2">{platform.emoji}</div>
                <p className="font-semibold text-white text-sm">{platform.name}</p>
                <p className="text-xs text-gray-400">{platform.aspectRatio}</p>
                {platforms.includes(platform.id) && (
                  <Check className="w-4 h-4 text-green-400 mx-auto mt-2" />
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* Duration */}
        <Card variant="glass" padding="lg">
          <h3 className="font-semibold text-white mb-4">Video Duration</h3>
          <div className="grid grid-cols-3 gap-3">
            {['15', '30', '60'].map((dur) => (
              <button
                key={dur}
                onClick={() => setDuration(dur as Duration)}
                className={`
                  p-4 rounded-xl text-center transition-all
                  ${duration === dur
                    ? 'bg-purple-500/20 border-2 border-purple-500'
                    : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                <p className="text-2xl font-bold text-white">{dur}s</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Generate Button */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setStep('input')}
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <Button
            variant="success"
            fullWidth
            size="lg"
            onClick={handleGenerate}
            icon={<Sparkles className="w-5 h-5" />}
          >
            Generate Video
          </Button>
        </div>
      </div>
    );
  }

  // STEP 4: Generating
  if (step === 'generate') {
    const steps = [
      { label: 'Analyzing prompt', progress: 20 },
      { label: 'Generating script', progress: 40 },
      { label: 'Creating visuals', progress: 70 },
      { label: 'Adding voiceover', progress: 85 },
      { label: 'Finalizing video', progress: 100 },
    ];

    const currentStepIndex = steps.findIndex((s) => generationProgress < s.progress);
    const activeStep = currentStepIndex >= 0 ? currentStepIndex : steps.length - 1;

    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[70vh]">
        <Card variant="glass" padding="xl" className="max-w-md w-full text-center">
          <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-6 animate-pulse" />

          <h2 className="text-2xl font-bold text-white mb-2">Creating Your Video...</h2>
          <p className="text-gray-400 mb-8">This usually takes 30-60 seconds</p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{generationProgress}% complete</p>
          </div>

          {/* Steps */}
          <div className="space-y-3 text-left">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all ${
                  index <= activeStep ? 'opacity-100' : 'opacity-30'
                }`}
              >
                {index < activeStep ? (
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : index === activeStep ? (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-600 rounded-full flex-shrink-0" />
                )}
                <span className="text-white">{step.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // STEP 5: Review & Post
  if (step === 'review') {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Check className="w-8 h-8 text-green-400" />
            Your Video is Ready!
          </h2>
          <p className="text-gray-400">Preview, edit, and post to your platforms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <Card variant="glass" padding="none">
              <div className="aspect-video bg-black rounded-t-xl flex items-center justify-center">
                <Video className="w-16 h-16 text-gray-600" />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-4">
                  <Button variant="primary" fullWidth>
                    <Sparkles className="w-4 h-4" />
                    Play Preview
                  </Button>
                  <Button variant="ghost">Edit</Button>
                </div>
              </div>
            </Card>

            {/* Caption */}
            <Card variant="glass" padding="lg" className="mt-4">
              <h3 className="font-semibold text-white mb-3">Caption</h3>
              <Input
                multiline
                rows={4}
                value={generatedVideo?.caption || ''}
                onChange={(e) => setGeneratedVideo({ ...generatedVideo, caption: e.target.value })}
                placeholder="Edit your caption..."
              />
              <p className="text-sm text-gray-400 mt-2">
                Hashtags: {generatedVideo?.hashtags}
              </p>
            </Card>
          </div>

          {/* Settings & Post */}
          <div className="space-y-4">
            <Card variant="glass" padding="lg">
              <h3 className="font-semibold text-white mb-4">Post Settings</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Post to:</p>
                  {platforms.map((platform) => (
                    <div key={platform} className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-white capitalize">{platform}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Duration: {duration}s</p>
                  <p className="text-sm text-gray-400 mb-2">Style: {style}</p>
                </div>
              </div>
            </Card>

            <Button variant="success" fullWidth size="lg">
              Post Now
            </Button>
            <Button variant="ghost" fullWidth>
              Save as Draft
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setStep('mode')}>
              Create Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
