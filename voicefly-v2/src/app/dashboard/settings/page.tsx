"use client";

import { useState } from "react";
import {
  User,
  Building2,
  CreditCard,
  Key,
  Bell,
  Shield,
  Palette,
  Link2,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreditDisplay } from "@/components/domain/credit-meter";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "business", label: "Business", icon: Building2 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Link2 },
];

const integrations = [
  { id: "stripe", name: "Stripe", description: "Payment processing", connected: true },
  { id: "twilio", name: "Twilio", description: "SMS & Voice", connected: true },
  { id: "zapier", name: "Zapier", description: "Automation", connected: false },
  { id: "slack", name: "Slack", description: "Team notifications", connected: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Settings
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors",
                    activeTab === tab.id
                      ? "bg-[var(--color-accent-purple-subtle)] text-[var(--color-accent-purple)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-surface)] p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Profile Settings
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Update your personal information
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Avatar name="John Doe" size="xl" />
                  <div>
                    <Button variant="secondary" size="sm">
                      Change photo
                    </Button>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                      JPG, GIF or PNG. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-text-primary)]">
                      First name
                    </label>
                    <Input defaultValue="John" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-text-primary)]">
                      Last name
                    </label>
                    <Input defaultValue="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Email
                  </label>
                  <Input type="email" defaultValue="john@example.com" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Phone
                  </label>
                  <Input type="tel" defaultValue="+1 (555) 000-0000" />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )}

            {/* Business Tab */}
            {activeTab === "business" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Business Settings
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Update your business information
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Business name
                  </label>
                  <Input defaultValue="Acme Inc." />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Industry
                  </label>
                  <Input defaultValue="Technology" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Business address
                  </label>
                  <Textarea
                    defaultValue="123 Main St, San Francisco, CA 94102"
                    rows={3}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Billing & Usage
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Manage your subscription and credits
                  </p>
                </div>

                {/* Current Plan */}
                <div className="p-4 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--color-text-primary)]">
                          Pro Plan
                        </h3>
                        <Badge variant="success">Active</Badge>
                      </div>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        $99/month • Renews Jan 20, 2026
                      </p>
                    </div>
                    <Button variant="secondary">Upgrade</Button>
                  </div>
                </div>

                {/* Credits */}
                <CreditDisplay
                  credits={2500}
                  maxCredits={5000}
                  plan="Pro"
                />

                {/* Payment Method */}
                <div>
                  <h3 className="font-medium text-[var(--color-text-primary)] mb-3">
                    Payment Method
                  </h3>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-14 rounded bg-[var(--color-bg-surface)] flex items-center justify-center text-[var(--color-text-tertiary)]">
                        <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">
                          •••• •••• •••• 4242
                        </p>
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                          Expires 12/26
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Notification Preferences
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Control how you receive notifications
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "New leads", description: "Get notified when new leads are captured" },
                    { label: "Missed calls", description: "Alert when Maya misses a call" },
                    { label: "Weekly reports", description: "Receive weekly performance summaries" },
                    { label: "System updates", description: "Important updates about VoiceFly" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-[var(--color-border-subtle)] last:border-0"
                    >
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {item.label}
                        </p>
                        <p className="text-sm text-[var(--color-text-tertiary)]">
                          {item.description}
                        </p>
                      </div>
                      <Switch defaultChecked={index < 2} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Security Settings
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Manage your security preferences
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Current password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    New password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">
                    Confirm new password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>

                <Button>Update password</Button>

                {/* Danger Zone */}
                <div className="mt-8 pt-6 border-t border-[var(--color-border-default)]">
                  <h3 className="font-medium text-[var(--color-error)] mb-3">
                    Danger Zone
                  </h3>
                  <div className="p-4 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-muted)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">
                          Delete account
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          Permanently delete your account and all data
                        </p>
                      </div>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    Integrations
                  </h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Connect VoiceFly with your favorite tools
                  </p>
                </div>

                <div className="space-y-3">
                  {integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[var(--color-bg-surface)] flex items-center justify-center">
                          <Link2 className="h-5 w-5 text-[var(--color-text-tertiary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {integration.name}
                          </p>
                          <p className="text-sm text-[var(--color-text-tertiary)]">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      {integration.connected ? (
                        <Badge variant="success" className="gap-1">
                          <Check className="h-3 w-3" />
                          Connected
                        </Badge>
                      ) : (
                        <Button variant="secondary" size="sm">
                          Connect
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
