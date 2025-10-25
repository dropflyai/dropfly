'use client'

import React, { useState } from 'react'
import { 
  User, 
  Bell, 
  CreditCard, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  Palette, 
  Volume2, 
  VolumeX, 
  Settings, 
  Save, 
  Edit, 
  Check, 
  X,
  Smartphone,
  Key,
  Globe,
  Clock,
  Download,
  FileText,
  Heart,
  Users,
  Home
} from 'lucide-react'

export default function ResidentSettings({ communityType = 'apartment' }: { communityType?: string }) {
  const [activeTab, setActiveTab] = useState('profile')
  const [profileEditing, setProfileEditing] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true)
  const [communityUpdates, setCommunityUpdates] = useState(true)
  const [eventReminders, setEventReminders] = useState(true)
  const [autoPayEnabled, setAutoPayEnabled] = useState(true)
  const [privacyLevel, setPrivacyLevel] = useState('neighbors')

  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    emergencyContact: 'Jane Doe - (555) 987-6543',
    unit: communityType === 'apartment' ? 'Apt 2B' : '1234 Maple Street',
    moveInDate: '2024-06-01'
  })

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payments', label: 'Payment Preferences', icon: CreditCard },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'App Preferences', icon: Settings }
  ]

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Personal Information</h3>
          <button
            onClick={() => setProfileEditing(!profileEditing)}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-blue-400 transition-colors flex items-center"
          >
            {profileEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
            {profileEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">First Name</label>
            {profileEditing ? (
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            ) : (
              <p className="text-white bg-white/5 rounded-xl px-4 py-3">{profileData.firstName}</p>
            )}
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Last Name</label>
            {profileEditing ? (
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            ) : (
              <p className="text-white bg-white/5 rounded-xl px-4 py-3">{profileData.lastName}</p>
            )}
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Email</label>
            {profileEditing ? (
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            ) : (
              <p className="text-white bg-white/5 rounded-xl px-4 py-3">{profileData.email}</p>
            )}
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-2 block">Phone</label>
            {profileEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            ) : (
              <p className="text-white bg-white/5 rounded-xl px-4 py-3">{profileData.phone}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="text-gray-300 text-sm mb-2 block">Emergency Contact</label>
            {profileEditing ? (
              <input
                type="text"
                value={profileData.emergencyContact}
                onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
            ) : (
              <p className="text-white bg-white/5 rounded-xl px-4 py-3">{profileData.emergencyContact}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">{communityType === 'apartment' ? 'Apartment' : 'Property'} Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 text-sm mb-2 block">{communityType === 'apartment' ? 'Unit' : 'Address'}</label>
            <p className="text-white bg-white/5 rounded-xl px-4 py-3">{profileData.unit}</p>
          </div>
          <div>
            <label className="text-gray-300 text-sm mb-2 block">Move-in Date</label>
            <p className="text-white bg-white/5 rounded-xl px-4 py-3">{profileData.moveInDate}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Notification Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-gray-400 text-sm">Receive updates via email</p>
              </div>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-blue-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-gray-400 text-sm">Receive urgent updates via text</p>
              </div>
            </div>
            <button
              onClick={() => setSmsNotifications(!smsNotifications)}
              className={`w-12 h-6 rounded-full transition-colors ${smsNotifications ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${smsNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-gray-400 text-sm">In-app notifications</p>
              </div>
            </div>
            <button
              onClick={() => setPushNotifications(!pushNotifications)}
              className={`w-12 h-6 rounded-full transition-colors ${pushNotifications ? 'bg-purple-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Notification Types</h3>
        
        <div className="space-y-3">
          {[
            { id: 'maintenance', label: 'Maintenance Updates', state: maintenanceAlerts, setState: setMaintenanceAlerts },
            { id: 'community', label: 'Community Announcements', state: communityUpdates, setState: setCommunityUpdates },
            { id: 'events', label: 'Event Reminders', state: eventReminders, setState: setEventReminders }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <span className="text-white">{item.label}</span>
              <button
                onClick={() => item.setState(!item.state)}
                className={`w-10 h-5 rounded-full transition-colors ${item.state ? 'bg-blue-500' : 'bg-gray-600'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${item.state ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Payment Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-white font-medium">Auto-Pay</p>
              <p className="text-gray-400 text-sm">Automatically pay rent on the 1st of each month</p>
            </div>
            <button
              onClick={() => setAutoPayEnabled(!autoPayEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${autoPayEnabled ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoPayEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-2">Payment Method</p>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <span className="text-white">Visa ending in ****4242</span>
              <button className="ml-auto px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors">
                Change
              </button>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-2">Payment Reminders</p>
            <p className="text-gray-400 text-sm mb-3">Get reminded before your rent is due</p>
            <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50">
              <option value="3">3 days before</option>
              <option value="5">5 days before</option>
              <option value="7">1 week before</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Privacy Settings</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-2">Profile Visibility</p>
            <p className="text-gray-400 text-sm mb-3">Who can see your profile in the community directory</p>
            <select 
              value={privacyLevel}
              onChange={(e) => setPrivacyLevel(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <option value="public">Everyone</option>
              <option value="neighbors">Neighbors Only</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Show in Directory</p>
                <p className="text-gray-400 text-sm">Appear in the community member directory</p>
              </div>
              <button className="w-10 h-5 rounded-full bg-blue-500">
                <div className="w-4 h-4 rounded-full bg-white translate-x-5" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Share Contact Info</p>
                <p className="text-gray-400 text-sm">Allow neighbors to see your contact information</p>
              </div>
              <button className="w-10 h-5 rounded-full bg-gray-600">
                <div className="w-4 h-4 rounded-full bg-white translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppPreferences = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">App Preferences</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-2">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              <button className="p-3 bg-black border-2 border-blue-400 rounded-xl text-white text-sm">Dark</button>
              <button className="p-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Light</button>
              <button className="p-3 bg-white/10 border border-white/20 rounded-xl text-white text-sm">Auto</button>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-2">Language</p>
            <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>

          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-white font-medium mb-2">Default Page</p>
            <p className="text-gray-400 text-sm mb-3">Which page to show when you open the app</p>
            <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50">
              <option value="overview">Home</option>
              <option value="feed">Community Feed</option>
              <option value="payments">Payments</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'payments':
        return renderPaymentSettings()
      case 'privacy':
        return renderPrivacySettings()
      case 'preferences':
        return renderAppPreferences()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/20 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-2">
        <div className="flex flex-wrap gap-2">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}