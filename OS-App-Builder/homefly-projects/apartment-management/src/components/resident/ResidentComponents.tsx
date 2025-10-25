'use client'

import { useState } from 'react'
import { 
  AlertTriangle, 
  Eye, 
  CreditCard, 
  CheckCircle, 
  DollarSign, 
  Settings, 
  Bell, 
  MessageSquare 
} from 'lucide-react'

// Resident Violations Content - shows only violations for this resident
export function ResidentViolationsContent({ userId }: { userId: string }) {
  const [selectedViolation, setSelectedViolation] = useState<any>(null)
  
  // Sample violations for this resident only
  const userViolations = [
    {
      id: 'VIO-2025-001',
      type: 'Parking',
      description: 'Vehicle parked in visitor spot overnight',
      date: '2025-01-10',
      status: 'resolved',
      fine: 25,
      dueDate: '2025-01-25',
      paid: true,
      location: 'Unit 4B - Visitor Parking',
      notes: 'Resident acknowledged violation and moved vehicle. Fine paid.'
    },
    {
      id: 'VIO-2025-002', 
      type: 'Trash',
      description: 'Trash bins left out beyond collection day',
      date: '2025-01-15',
      status: 'pending',
      fine: 15,
      dueDate: '2025-02-01',
      paid: false,
      location: 'Unit 4B - Front of Property',
      notes: 'First notice sent to resident.'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Violations & Fines</h1>
          <p className="text-white/60 mt-2">View and manage your property violations</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-white/60 text-sm">Total Outstanding: </span>
            <span className="text-red-400 font-bold">${userViolations.filter(v => !v.paid).reduce((sum, v) => sum + v.fine, 0)}</span>
          </div>
        </div>
      </div>

      {/* Violations List */}
      <div className="space-y-4">
        {userViolations.map((violation) => (
          <div key={violation.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{violation.type} Violation</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      violation.status === 'resolved' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                      violation.status === 'pending' ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400' :
                      'bg-red-500/20 border-red-500/30 text-red-400'
                    }`}>
                      {violation.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3">{violation.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Violation Date: {violation.date}</span>
                    <span>•</span>
                    <span>Location: {violation.location}</span>
                    <span>•</span>
                    <span>ID: {violation.id}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-400">${violation.fine}</div>
                <div className="text-sm text-gray-400">Due: {violation.dueDate}</div>
                {violation.paid && (
                  <div className="text-xs text-green-400 mt-1">✓ Paid</div>
                )}
              </div>
            </div>

            {violation.notes && (
              <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                <p className="text-white/70 text-sm">{violation.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <button 
                onClick={() => setSelectedViolation(violation)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                View Details
              </button>
              {!violation.paid && (
                <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300">
                  <CreditCard className="w-4 h-4 mr-2 inline" />
                  Pay Fine
                </button>
              )}
            </div>
          </div>
        ))}
        
        {userViolations.length === 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Violations</h3>
            <p className="text-gray-400">You're all caught up! Keep up the great work following community guidelines.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Resident Messages Content - shows messages relevant to this resident
export function ResidentMessagesContent({ userId }: { userId: string }) {
  const [selectedMessage, setSelectedMessage] = useState<any>(null)
  
  // Sample messages filtered for this resident
  const userMessages = [
    {
      id: 'msg-001',
      from: 'Board of Directors',
      subject: 'Payment Confirmation - January HOA Dues',
      message: 'Thank you for your payment of $520 for January HOA dues. Payment received on 01/15/2025.',
      date: '2025-01-15',
      type: 'payment',
      read: true,
      priority: 'normal'
    },
    {
      id: 'msg-002', 
      from: 'Community Manager',
      subject: 'Maintenance Request Update - Unit 4B',
      message: 'Your maintenance request for kitchen faucet repair has been scheduled for 01/25/2025 between 2-4 PM.',
      date: '2025-01-18',
      type: 'maintenance',
      read: false,
      priority: 'normal'
    },
    {
      id: 'msg-003',
      from: 'Board Secretary',
      subject: 'Community BBQ Event Reminder',
      message: 'Friendly reminder about the community BBQ this Saturday at 2 PM in the courtyard. Looking forward to seeing you there!',
      date: '2025-01-17',
      type: 'announcement',
      read: true,
      priority: 'low'
    }
  ]

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'payment': return <DollarSign className="w-5 h-5 text-green-400" />
      case 'maintenance': return <Settings className="w-5 h-5 text-blue-400" />
      case 'announcement': return <Bell className="w-5 h-5 text-purple-400" />
      default: return <MessageSquare className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Messages</h1>
          <p className="text-white/60 mt-2">Personal communications and notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
            <span className="text-white/60 text-sm">Unread: </span>
            <span className="text-yellow-400 font-bold">{userMessages.filter(m => !m.read).length}</span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {userMessages.map((message) => (
          <div 
            key={message.id} 
            className={`bg-white/5 backdrop-blur-xl border rounded-3xl p-6 cursor-pointer hover:bg-white/10 transition-colors ${
              !message.read ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-white/10'
            }`}
            onClick={() => setSelectedMessage(message)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className={`text-lg font-bold ${!message.read ? 'text-white' : 'text-white/80'}`}>
                      {message.subject}
                    </h3>
                    {!message.read && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">From: {message.from}</p>
                  <p className="text-gray-300 line-clamp-2">{message.message}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">{message.date}</div>
                <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                  message.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                  message.type === 'maintenance' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {message.type}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Resident Notifications Content - includes payment notifications
export function ResidentNotificationsContent({ userId }: { userId: string }) {
  const notifications = [
    {
      id: 'notif-001',
      type: 'payment',
      title: 'Payment Confirmation',
      message: 'Your January HOA dues payment of $520 has been processed successfully.',
      timestamp: '2 hours ago',
      read: false,
      urgent: false,
      amount: 520
    },
    {
      id: 'notif-002',
      type: 'payment',
      title: 'Payment Due Reminder', 
      message: 'February HOA dues of $520 are due on February 1st, 2025.',
      timestamp: '1 day ago',
      read: true,
      urgent: false,
      amount: 520,
      dueDate: '2025-02-01'
    },
    {
      id: 'notif-003',
      type: 'maintenance',
      title: 'Maintenance Scheduled',
      message: 'Kitchen faucet repair scheduled for January 25th, 2-4 PM.',
      timestamp: '3 hours ago', 
      read: false,
      urgent: false
    },
    {
      id: 'notif-004',
      type: 'announcement',
      title: 'Community Event',
      message: 'Community BBQ this Saturday at 2 PM in the courtyard.',
      timestamp: '1 day ago',
      read: true,
      urgent: false
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Notifications</h1>
          <p className="text-white/60 mt-2">Personal alerts and updates</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
            Mark All Read
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Recent Notifications</h3>
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 hover:bg-white/5 rounded-2xl transition-colors">
              <div className={`w-3 h-3 rounded-full mt-2 ${!notification.read ? 'bg-yellow-400' : 'bg-gray-600'}`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${!notification.read ? 'text-white' : 'text-white/70'}`}>
                    {notification.title}
                    {notification.type === 'payment' && notification.amount && (
                      <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        ${notification.amount}
                      </span>
                    )}
                  </h4>
                  <span className="text-white/40 text-xs">{notification.timestamp}</span>
                </div>
                <p className="text-white/70 text-sm mt-1">{notification.message}</p>
                {notification.dueDate && (
                  <p className="text-yellow-400 text-xs mt-2">Due: {notification.dueDate}</p>
                )}
                <div className="flex items-center mt-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    notification.type === 'payment' ? 'bg-green-500/20 text-green-400' :
                    notification.type === 'maintenance' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {notification.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}