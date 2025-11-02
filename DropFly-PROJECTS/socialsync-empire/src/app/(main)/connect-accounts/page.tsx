'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
}

export default function ConnectAccountsPage() {
  const router = useRouter();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'from-black to-cyan-400', connected: false },
    { id: 'instagram', name: 'Instagram', icon: '📷', color: 'from-purple-500 to-pink-500', connected: false },
    { id: 'youtube', name: 'YouTube', icon: '▶️', color: 'from-red-600 to-red-400', connected: false },
    { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'from-blue-400 to-blue-600', connected: false },
    { id: 'facebook', name: 'Facebook', icon: '👥', color: 'from-blue-600 to-blue-800', connected: false },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-500', connected: false },
  ]);

  const [connecting, setConnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch real connected accounts on mount
  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  const fetchConnectedAccounts = async () => {
    try {
      const response = await fetch('/api/social/profiles');
      const data = await response.json();

      if (data.success && data.profiles) {
        // Update platform connection status based on real data
        // Note: This depends on Ayrshare response format
        console.log('Ayrshare profiles:', data.profiles);
      }
    } catch (err) {
      console.error('Failed to fetch profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    setError('');

    try {
      // TODO: Implement Ayrshare OAuth flow
      // For now, simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPlatforms(prev =>
        prev.map(p =>
          p.id === platformId ? { ...p, connected: true } : p
        )
      );
    } catch (err) {
      setError(`Failed to connect ${platformId}. Please try again.`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (platformId: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.id === platformId ? { ...p, connected: false } : p
      )
    );
  };

  const connectedCount = platforms.filter(p => p.connected).length;
  const canSkip = connectedCount > 0;

  const handleContinue = () => {
    router.push('/home');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 rounded-full mb-4">
          <span className="w-8 h-8 rounded-full bg-[var(--primary-500)] text-white flex items-center justify-center text-sm font-bold">
            1
          </span>
          <span className="text-sm font-medium text-[var(--text-primary)]">Connect Your Accounts</span>
        </div>

        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          Connect Your Social Media Accounts
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Connect your platforms to start posting, scheduling, and tracking your content performance across all channels.
        </p>

        {connectedCount > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--success)]/10 border border-[var(--success)]/20 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
            <span className="text-sm font-medium text-[var(--success)]">
              {connectedCount} {connectedCount === 1 ? 'account' : 'accounts'} connected
            </span>
          </div>
        )}
      </div>

      {/* Beta Notice */}
      <Card variant="glass" padding="md" className="border-[var(--warning)]/20 bg-[var(--warning)]/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-[var(--warning)] mb-1">🚧 Beta Feature - OAuth Coming Soon</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              <strong>For testing:</strong> Click "Connect" to simulate account connections.
              <strong> For production:</strong> Full OAuth integration for each platform is in development.
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              You can skip this step and test content creation features. Social posting will use simulated connections.
            </p>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card variant="glass" padding="md" className="border-[var(--error)]/20 bg-[var(--error)]/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--error)]" />
            <p className="text-sm text-[var(--error)]">{error}</p>
          </div>
        </Card>
      )}

      {/* Platform Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => (
          <Card
            key={platform.id}
            variant="glass"
            padding="lg"
            className={`transition-all duration-200 ${
              platform.connected
                ? 'border-[var(--success)]/30 bg-[var(--success)]/5'
                : 'hover:border-[var(--primary-500)]/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-2xl`}>
                  {platform.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {platform.connected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              </div>

              <div>
                {platform.connected ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(platform.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConnect(platform.id)}
                    disabled={connecting !== null}
                  >
                    {connecting === platform.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <Card variant="glass" padding="lg" className="bg-gradient-to-br from-[var(--primary-500)]/5 to-[var(--secondary-500)]/5">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          What you can do once connected:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-500)]/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary-500)]" />
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">Cross-post instantly</h4>
              <p className="text-sm text-[var(--text-tertiary)]">Post to all platforms with one click</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-500)]/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary-500)]" />
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">Schedule ahead</h4>
              <p className="text-sm text-[var(--text-tertiary)]">Plan your content calendar weeks in advance</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-500)]/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary-500)]" />
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">Track performance</h4>
              <p className="text-sm text-[var(--text-tertiary)]">See analytics across all your accounts</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary-500)]/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[var(--primary-500)]" />
            </div>
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">Save time</h4>
              <p className="text-sm text-[var(--text-tertiary)]">Manage everything from one dashboard</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {connectedCount > 0 ? (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={handleContinue}
              className="min-w-[200px]"
            >
              Continue to Dashboard
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleContinue}
            >
              Add more later
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="lg"
              onClick={handleContinue}
              className="min-w-[200px]"
            >
              Skip & Test Features
            </Button>
            <p className="text-sm text-[var(--text-tertiary)] text-center w-full">
              You can connect accounts later in Settings
            </p>
          </>
        )}
      </div>

      {/* Note */}
      <p className="text-center text-sm text-[var(--text-tertiary)]">
        💡 You can connect more accounts later in Settings
      </p>
    </div>
  );
}
