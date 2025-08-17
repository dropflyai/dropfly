'use client'

import { useUser } from "@clerk/nextjs"
import { useState } from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Key,
  Globe,
  Save,
  AlertCircle
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
    marketing: false
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Profile Information</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
              <input
                type="text"
                defaultValue={user?.firstName || ''}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
              <input
                type="text"
                defaultValue={user?.lastName || ''}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              defaultValue={user?.primaryEmailAddress?.emailAddress || ''}
              disabled
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
            <input
              type="text"
              placeholder="Your company name"
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
        </div>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Email Notifications</p>
              <p className="text-sm text-gray-400">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
              className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Push Notifications</p>
              <p className="text-sm text-gray-400">Receive push notifications in browser</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
              className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Product Updates</p>
              <p className="text-sm text-gray-400">Get notified about new features</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.updates}
              onChange={(e) => setNotifications({...notifications, updates: e.target.checked})}
              className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-600 focus:ring-blue-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <p className="text-white">Marketing Communications</p>
              <p className="text-sm text-gray-400">Receive marketing and promotional content</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.marketing}
              onChange={(e) => setNotifications({...notifications, marketing: e.target.checked})}
              className="w-5 h-5 rounded border-white/20 bg-black/30 text-blue-600 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold text-white">API Configuration</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">API Endpoint</label>
            <div className="flex gap-2">
              <input
                type="text"
                value="https://api.dropfly.ai/v1"
                disabled
                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-gray-500"
              />
              <button className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-all">
                Copy
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">API Key</label>
            <div className="flex gap-2">
              <input
                type="password"
                value="sk_live_xxxxxxxxxxxxxxxxxxxxx"
                disabled
                className="flex-1 px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-gray-500"
              />
              <button className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-all">
                Regenerate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Billing & Subscription</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-lg border border-white/10">
            <div>
              <p className="text-white font-medium">Current Plan: Pro</p>
              <p className="text-sm text-gray-400">$999/month • Renews on Jan 15, 2025</p>
            </div>
            <button className="px-4 py-2 bg-white/5 rounded-lg text-white hover:bg-white/10 transition-all">
              Manage Plan
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AlertCircle className="w-4 h-4" />
            <p>You have used 67% of your monthly API quota</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-black/50 backdrop-blur-xl rounded-xl border border-red-500/20 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-red-400" />
          <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Delete Account</p>
              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  )
}