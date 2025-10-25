'use client';

import { useState } from 'react';
import { Upload, User, Trash2, Check, Loader2, Sparkles, Plus } from 'lucide-react';
import { Card } from '@/components/ui';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import BottomSheet from '@/components/ui/BottomSheet';

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  status: 'ready' | 'processing' | 'failed';
  uploadedAt: Date;
  isDefault?: boolean;
}

interface AvatarManagerProps {
  onSelect?: (avatar: Avatar) => void;
  selectedAvatarId?: string;
  showUpload?: boolean;
}

export default function AvatarManager({
  onSelect,
  selectedAvatarId,
  showUpload = true
}: AvatarManagerProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([
    {
      id: '1',
      name: 'Professional Headshot',
      imageUrl: '/placeholder-avatar-1.jpg',
      status: 'ready',
      uploadedAt: new Date(),
      isDefault: true,
    },
    {
      id: '2',
      name: 'Casual Style',
      imageUrl: '/placeholder-avatar-2.jpg',
      status: 'ready',
      uploadedAt: new Date(),
    },
  ]);

  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);

          // Add new avatar
          const newAvatar: Avatar = {
            id: Date.now().toString(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            imageUrl: URL.createObjectURL(file),
            status: 'processing',
            uploadedAt: new Date(),
          };

          setAvatars((prev) => [newAvatar, ...prev]);
          setShowUploadSheet(false);

          // Simulate AI processing
          setTimeout(() => {
            setAvatars((prev) =>
              prev.map((a) =>
                a.id === newAvatar.id ? { ...a, status: 'ready' as const } : a
              )
            );
          }, 3000);

          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this avatar?')) {
      setAvatars((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleSetDefault = (id: string) => {
    setAvatars((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      {showUpload && (
        <Button
          variant="primary"
          fullWidth
          icon={<Plus className="w-5 h-5" />}
          onClick={() => setShowUploadSheet(true)}
        >
          Upload New Avatar
        </Button>
      )}

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {avatars.map((avatar) => (
          <Card
            key={avatar.id}
            variant="glass"
            padding="sm"
            clickable
            onClick={() => onSelect?.(avatar)}
            className={`relative ${
              selectedAvatarId === avatar.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {/* Avatar Image */}
            <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-2 relative">
              {avatar.imageUrl ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <User className="w-12 h-12 text-white" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
              )}

              {/* Status Indicators */}
              {avatar.status === 'processing' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                  <p className="text-xs text-white">Processing...</p>
                </div>
              )}

              {selectedAvatarId === avatar.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {avatar.isDefault && (
                <Badge variant="primary" size="sm" className="absolute top-2 left-2">
                  Default
                </Badge>
              )}
            </div>

            {/* Avatar Info */}
            <div className="mb-2">
              <p className="text-sm font-medium text-white truncate">{avatar.name}</p>
              <p className="text-xs text-gray-400">
                {avatar.status === 'ready' ? 'Ready' : 'Processing...'}
              </p>
            </div>

            {/* Actions */}
            {avatar.status === 'ready' && (
              <div className="flex gap-1">
                {!avatar.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(avatar.id);
                    }}
                    className="flex-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors text-white"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(avatar.id);
                  }}
                  className="px-2 py-1 text-xs bg-red-600/20 hover:bg-red-600/30 rounded transition-colors text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Upload Bottom Sheet */}
      <BottomSheet
        isOpen={showUploadSheet}
        onClose={() => !uploading && setShowUploadSheet(false)}
        title="Upload Avatar Photo"
      >
        <div className="space-y-6">
          {/* Instructions */}
          <Card variant="elevated" padding="md">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-white mb-2">Tips for best results:</p>
                <ul className="space-y-1 list-disc list-inside text-gray-400">
                  <li>Use a clear, well-lit photo</li>
                  <li>Face should be clearly visible</li>
                  <li>Neutral background works best</li>
                  <li>Multiple angles create better AI models</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Upload Area */}
          {!uploading ? (
            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">Click to upload photo</p>
                <p className="text-sm text-gray-400">or drag and drop</p>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB</p>
              </div>
            </label>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Uploading avatar...</p>
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {/* How it works */}
          <Card variant="glass" padding="md">
            <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              How AI Avatars Work
            </h4>
            <div className="text-sm text-gray-400 space-y-2">
              <p>1. Upload 1-5 photos of yourself</p>
              <p>2. Our AI trains a custom model (~3 minutes)</p>
              <p>3. Generate unlimited videos with your avatar</p>
              <p>4. Your avatar can speak any script in any style</p>
            </div>
          </Card>

          {!uploading && (
            <Button
              variant="ghost"
              fullWidth
              onClick={() => setShowUploadSheet(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
