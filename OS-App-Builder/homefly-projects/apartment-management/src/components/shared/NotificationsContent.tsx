'use client'

import React, { useState } from 'react'
import { Bell, Filter, Check, Settings } from 'lucide-react'

const NotificationsContent: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-white/60 mt-2">System alerts and community notifications</p>
        </div>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300">
          <Settings className="w-4 h-4 mr-2 inline" />
          Settings
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Notifications</h3>
          <p className="text-gray-400">System notifications and alerts will be displayed here.</p>
        </div>
      </div>
    </div>
  )
}

export default NotificationsContent