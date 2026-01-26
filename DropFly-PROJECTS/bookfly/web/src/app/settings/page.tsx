/**
 * Settings Page
 *
 * User profile, QuickBooks connections, and app preferences.
 */

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  User,
  Building2,
  Link2,
  Settings2,
  Plus,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
} from 'lucide-react';

// Section component for consistent styling
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-neutral-500">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// Mock connected accounts
const mockConnections = [
  {
    id: '1',
    companyName: 'Acme Corporation',
    realmId: 'qb-123456',
    connectedAt: '2024-01-10T12:00:00Z',
    status: 'connected' as const,
  },
  {
    id: '2',
    companyName: 'Tech Startup Inc',
    realmId: 'qb-789012',
    connectedAt: '2024-01-05T09:30:00Z',
    status: 'connected' as const,
  },
  {
    id: '3',
    companyName: 'Local Business LLC',
    realmId: 'qb-345678',
    connectedAt: '2024-01-02T15:45:00Z',
    status: 'error' as const,
    errorMessage: 'Token expired - reconnection required',
  },
];

// Default category options
const defaultCategories = [
  'Office Supplies',
  'Software & Subscriptions',
  'Travel & Transportation',
  'Meals & Entertainment',
  'Professional Services',
  'Utilities',
  'Rent & Lease',
  'Equipment',
  'Marketing & Advertising',
  'Insurance',
  'Miscellaneous',
];

export default function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState({
    name: 'John Smith',
    email: 'john@example.com',
    company: 'Smith Bookkeeping',
  });

  // Preferences state
  const [preferences, setPreferences] = useState({
    defaultCategory: 'Miscellaneous',
    confidenceThresholdHigh: 85,
    confidenceThresholdMedium: 60,
    autoApproveHighConfidence: false,
    emailNotifications: true,
  });

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [connectingQB, setConnectingQB] = useState(false);

  // Save profile handler
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save preferences handler
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  // Connect QuickBooks handler
  const handleConnectQuickBooks = async () => {
    setConnectingQB(true);
    try {
      // In production, this would redirect to QuickBooks OAuth
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.open('https://quickbooks.intuit.com/oauth', '_blank');
      toast.info('Complete the QuickBooks authorization in the new window');
    } catch (error) {
      toast.error('Failed to initiate QuickBooks connection');
    } finally {
      setConnectingQB(false);
    }
  };

  // Disconnect QB account handler
  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this QuickBooks account?')) {
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('QuickBooks account disconnected');
    } catch (error) {
      toast.error('Failed to disconnect account');
    }
  };

  // Reconnect handler for error state connections
  const handleReconnect = async (connectionId: string) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      window.open('https://quickbooks.intuit.com/oauth', '_blank');
      toast.info('Complete the QuickBooks reauthorization');
    } catch (error) {
      toast.error('Failed to initiate reconnection');
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <p className="mt-1 text-neutral-500">
          Manage your profile, connections, and preferences
        </p>
      </div>

      {/* Profile section */}
      <Section
        title="Profile"
        description="Your personal and company information"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <User className="h-8 w-8 text-primary-600" />
            </div>
            <button className="btn-secondary">Change Photo</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="company" className="label">
                Company Name
              </label>
              <input
                id="company"
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="btn-primary"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </Section>

      {/* QuickBooks connections section */}
      <Section
        title="QuickBooks Connections"
        description="Manage your connected QuickBooks accounts"
      >
        <div className="space-y-4">
          {/* Connected accounts list */}
          {mockConnections.map((connection) => (
            <div
              key={connection.id}
              className={cn(
                'flex items-center justify-between rounded-lg border p-4',
                connection.status === 'error'
                  ? 'border-error-200 bg-error-50'
                  : 'border-neutral-200 bg-neutral-50'
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    connection.status === 'error'
                      ? 'bg-error-100'
                      : 'bg-primary-100'
                  )}
                >
                  <Building2
                    className={cn(
                      'h-5 w-5',
                      connection.status === 'error'
                        ? 'text-error-600'
                        : 'text-primary-600'
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900">
                      {connection.companyName}
                    </span>
                    {connection.status === 'connected' ? (
                      <span className="badge bg-success-50 text-success-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Connected
                      </span>
                    ) : (
                      <span className="badge bg-error-50 text-error-700">
                        <AlertCircle className="h-3 w-3" />
                        Error
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500">
                    Realm ID: {connection.realmId}
                  </p>
                  {connection.errorMessage && (
                    <p className="text-sm text-error-600 mt-1">
                      {connection.errorMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {connection.status === 'error' && (
                  <button
                    onClick={() => handleReconnect(connection.id)}
                    className="btn-primary"
                  >
                    <Link2 className="h-4 w-4" />
                    Reconnect
                  </button>
                )}
                <button
                  onClick={() => handleDisconnect(connection.id)}
                  className="btn-ghost text-error-600 hover:text-error-700 hover:bg-error-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add new connection button */}
          <button
            onClick={handleConnectQuickBooks}
            disabled={connectingQB}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 p-4 text-neutral-500 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            {connectingQB ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
            Connect New QuickBooks Account
          </button>

          <p className="text-xs text-neutral-400">
            You&apos;ll be redirected to QuickBooks to authorize the connection.
            <a
              href="https://quickbooks.intuit.com/app/apps"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-1 text-primary-600 hover:underline"
            >
              Manage connected apps
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </Section>

      {/* Preferences section */}
      <Section
        title="Preferences"
        description="Customize how BookFly processes your transactions"
      >
        <div className="space-y-6">
          {/* Default category */}
          <div>
            <label htmlFor="defaultCategory" className="label">
              Default Category for Low Confidence Items
            </label>
            <select
              id="defaultCategory"
              value={preferences.defaultCategory}
              onChange={(e) =>
                setPreferences({ ...preferences, defaultCategory: e.target.value })
              }
              className="input w-full max-w-xs"
            >
              {defaultCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-400">
              Items that can&apos;t be categorized will default to this category
            </p>
          </div>

          {/* Confidence thresholds */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="highThreshold" className="label">
                High Confidence Threshold
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="highThreshold"
                  type="range"
                  min="50"
                  max="100"
                  value={preferences.confidenceThresholdHigh}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      confidenceThresholdHigh: Number(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span className="w-12 text-sm font-medium text-neutral-900">
                  {preferences.confidenceThresholdHigh}%
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="mediumThreshold" className="label">
                Medium Confidence Threshold
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="mediumThreshold"
                  type="range"
                  min="30"
                  max={preferences.confidenceThresholdHigh - 1}
                  value={preferences.confidenceThresholdMedium}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      confidenceThresholdMedium: Number(e.target.value),
                    })
                  }
                  className="flex-1"
                />
                <span className="w-12 text-sm font-medium text-neutral-900">
                  {preferences.confidenceThresholdMedium}%
                </span>
              </div>
            </div>
          </div>

          {/* Toggle options */}
          <div className="space-y-4 rounded-lg bg-neutral-50 p-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-neutral-900">
                  Auto-approve High Confidence Items
                </span>
                <p className="text-xs text-neutral-500">
                  Automatically approve items above the high confidence threshold
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.autoApproveHighConfidence}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    autoApproveHighConfidence: !preferences.autoApproveHighConfidence,
                  })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  preferences.autoApproveHighConfidence
                    ? 'bg-primary-600'
                    : 'bg-neutral-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    preferences.autoApproveHighConfidence
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  )}
                />
              </button>
            </label>

            <label className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-neutral-900">
                  Email Notifications
                </span>
                <p className="text-xs text-neutral-500">
                  Receive email alerts for new transactions and sync errors
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.emailNotifications}
                onClick={() =>
                  setPreferences({
                    ...preferences,
                    emailNotifications: !preferences.emailNotifications,
                  })
                }
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  preferences.emailNotifications
                    ? 'bg-primary-600'
                    : 'bg-neutral-200'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform',
                    preferences.emailNotifications
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  )}
                />
              </button>
            </label>
          </div>

          <div className="flex justify-end pt-4 border-t border-neutral-100">
            <button
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="btn-primary"
            >
              {savingPreferences ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Preferences
            </button>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" description="Irreversible and destructive actions">
        <div className="flex items-center justify-between rounded-lg border border-error-200 bg-error-50 p-4">
          <div>
            <h3 className="font-medium text-error-900">Delete Account</h3>
            <p className="text-sm text-error-700">
              Permanently delete your account and all associated data
            </p>
          </div>
          <button className="btn-danger">Delete Account</button>
        </div>
      </Section>
    </div>
  );
}
