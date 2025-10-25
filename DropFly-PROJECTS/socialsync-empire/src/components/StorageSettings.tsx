'use client';

import { useState, useEffect } from 'react';
import {
  HardDrive,
  Cloud,
  FolderOpen,
  Key,
  Save,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Database,
  Package
} from 'lucide-react';

export type StorageProvider = 'local' | 'googledrive' | 'dropbox' | 'airtable' | 'supabase';

export interface StorageConfig {
  provider: StorageProvider;
  localPath?: string;
  googleDrive?: {
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    folderId?: string;
  };
  dropbox?: {
    accessToken?: string;
    folder?: string;
  };
  airtable?: {
    apiKey?: string;
    baseId?: string;
    tableName?: string;
  };
  supabase?: {
    url?: string;
    anonKey?: string;
    bucketName?: string;
  };
}

interface StorageSettingsProps {
  config: StorageConfig;
  onConfigChange: (config: StorageConfig) => void;
}

export default function StorageSettings({ config, onConfigChange }: StorageSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempConfig, setTempConfig] = useState<StorageConfig>(config);
  const [showSecrets, setShowSecrets] = useState(false);

  const providers = [
    {
      id: 'local' as StorageProvider,
      name: 'Local Folder',
      icon: FolderOpen,
      color: 'from-gray-500 to-gray-600',
      description: 'Save to your computer'
    },
    {
      id: 'googledrive' as StorageProvider,
      name: 'Google Drive',
      icon: Cloud,
      color: 'from-blue-500 to-blue-600',
      description: 'Save to Google Drive'
    },
    {
      id: 'dropbox' as StorageProvider,
      name: 'Dropbox',
      icon: Package,
      color: 'from-blue-600 to-blue-700',
      description: 'Save to Dropbox'
    },
    {
      id: 'airtable' as StorageProvider,
      name: 'Airtable',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      description: 'Save to Airtable base'
    },
    {
      id: 'supabase' as StorageProvider,
      name: 'Supabase',
      icon: Database,
      color: 'from-green-500 to-green-600',
      description: 'Save to Supabase storage'
    }
  ];

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('storageConfig');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setTempConfig(parsed);
      onConfigChange(parsed);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('storageConfig', JSON.stringify(tempConfig));
    onConfigChange(tempConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempConfig(config);
    setIsEditing(false);
  };

  const maskSecret = (value?: string) => {
    if (!value) return '';
    if (showSecrets) return value;
    return value.slice(0, 4) + '****' + value.slice(-4);
  };

  return (
    <div className="space-y-4">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Storage Destination
        </label>
        <div className="grid grid-cols-1 gap-2">
          {providers.map((provider) => {
            const Icon = provider.icon;
            const isSelected = tempConfig.provider === provider.id;
            return (
              <button
                key={provider.id}
                onClick={() => {
                  setTempConfig({ ...tempConfig, provider: provider.id });
                  setIsEditing(true);
                }}
                className={`
                  w-full p-3 rounded-lg border transition-all
                  ${isSelected
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${provider.color} rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm text-white">{provider.name}</div>
                    <div className="text-xs text-gray-400">{provider.description}</div>
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration */}
      {isEditing && (
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm text-gray-300">Configuration</h4>
            <button
              onClick={() => setShowSecrets(!showSecrets)}
              className="text-xs text-gray-400 hover:text-gray-300"
            >
              {showSecrets ? 'Hide' : 'Show'} Secrets
            </button>
          </div>

          {/* Local Storage Config */}
          {tempConfig.provider === 'local' && (
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Download Folder Path (optional)
              </label>
              <input
                type="text"
                value={tempConfig.localPath || ''}
                onChange={(e) => setTempConfig({
                  ...tempConfig,
                  localPath: e.target.value
                })}
                placeholder="~/Downloads/SocialSync"
                className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to use default Downloads folder
              </p>
            </div>
          )}

          {/* Google Drive Config */}
          {tempConfig.provider === 'googledrive' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Client ID
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={tempConfig.googleDrive?.clientId || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    googleDrive: { ...tempConfig.googleDrive, clientId: e.target.value }
                  })}
                  placeholder="Enter Google Client ID"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Client Secret
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={tempConfig.googleDrive?.clientSecret || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    googleDrive: { ...tempConfig.googleDrive, clientSecret: e.target.value }
                  })}
                  placeholder="Enter Google Client Secret"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Folder ID (optional)
                </label>
                <input
                  type="text"
                  value={tempConfig.googleDrive?.folderId || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    googleDrive: { ...tempConfig.googleDrive, folderId: e.target.value }
                  })}
                  placeholder="Enter Google Drive Folder ID"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                Get Google Drive API credentials
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Dropbox Config */}
          {tempConfig.provider === 'dropbox' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Access Token
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={tempConfig.dropbox?.accessToken || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    dropbox: { ...tempConfig.dropbox, accessToken: e.target.value }
                  })}
                  placeholder="Enter Dropbox Access Token"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Folder Path (optional)
                </label>
                <input
                  type="text"
                  value={tempConfig.dropbox?.folder || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    dropbox: { ...tempConfig.dropbox, folder: e.target.value }
                  })}
                  placeholder="/SocialSync/Videos"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <a
                href="https://www.dropbox.com/developers/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                Get Dropbox Access Token
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Airtable Config */}
          {tempConfig.provider === 'airtable' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  API Key
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={tempConfig.airtable?.apiKey || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    airtable: { ...tempConfig.airtable, apiKey: e.target.value }
                  })}
                  placeholder="Enter Airtable API Key"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Base ID
                </label>
                <input
                  type="text"
                  value={tempConfig.airtable?.baseId || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    airtable: { ...tempConfig.airtable, baseId: e.target.value }
                  })}
                  placeholder="appXXXXXXXXXXXXXX"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  value={tempConfig.airtable?.tableName || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    airtable: { ...tempConfig.airtable, tableName: e.target.value }
                  })}
                  placeholder="Videos"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <a
                href="https://airtable.com/account"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                Get Airtable API Key
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Supabase Config */}
          {tempConfig.provider === 'supabase' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Project URL
                </label>
                <input
                  type="text"
                  value={tempConfig.supabase?.url || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    supabase: { ...tempConfig.supabase, url: e.target.value }
                  })}
                  placeholder="https://xxxxx.supabase.co"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Anon Key
                </label>
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={tempConfig.supabase?.anonKey || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    supabase: { ...tempConfig.supabase, anonKey: e.target.value }
                  })}
                  placeholder="Enter Supabase Anon Key"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Bucket Name
                </label>
                <input
                  type="text"
                  value={tempConfig.supabase?.bucketName || ''}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    supabase: { ...tempConfig.supabase, bucketName: e.target.value }
                  })}
                  placeholder="videos"
                  className="w-full bg-gray-900 text-white text-sm rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <a
                href="https://app.supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
              >
                Get Supabase credentials
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Current Configuration Display */}
      {!isEditing && config.provider !== 'local' && (
        <div className="bg-gray-800/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-xs text-gray-400">
              <p className="font-medium text-gray-300 mb-1">Current Configuration:</p>
              <p>{providers.find(p => p.id === config.provider)?.name || 'Local'}</p>
              {config.provider === 'googledrive' && config.googleDrive?.clientId && (
                <p>Client ID: {maskSecret(config.googleDrive.clientId)}</p>
              )}
              {config.provider === 'dropbox' && config.dropbox?.accessToken && (
                <p>Token: {maskSecret(config.dropbox.accessToken)}</p>
              )}
              {config.provider === 'airtable' && config.airtable?.baseId && (
                <p>Base: {config.airtable.baseId}</p>
              )}
              {config.provider === 'supabase' && config.supabase?.bucketName && (
                <p>Bucket: {config.supabase.bucketName}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}