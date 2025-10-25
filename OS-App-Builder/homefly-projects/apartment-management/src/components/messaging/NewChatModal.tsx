'use client'

import React, { useState } from 'react'
import { 
  X, 
  Search, 
  Users, 
  Building, 
  Wrench, 
  MessageSquare, 
  Plus, 
  Check,
  Star,
  Crown,
  Shield,
  Home,
  User,
  Hash
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  avatar: string
  role: string
  unit?: string
  status: 'online' | 'offline' | 'away'
  department?: string
}

interface NewChatModalProps {
  isOpen: boolean
  onClose: () => void
  userType: 'resident' | 'admin'
  communityType?: 'apartment' | 'hoa'
  onStartChat: (contact: Contact, chatType: string) => void
}

export default function NewChatModal({ 
  isOpen, 
  onClose, 
  userType, 
  communityType = 'apartment',
  onStartChat 
}: NewChatModalProps) {
  const [activeTab, setActiveTab] = useState<'contacts' | 'management' | 'groups'>('contacts')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([])
  const [groupName, setGroupName] = useState('')

  // Mock contacts data
  const managementContacts: Contact[] = [
    {
      id: 'mgmt-1',
      name: 'Sarah Thompson',
      avatar: '👩‍💼',
      role: 'Property Manager',
      status: 'online',
      department: 'Management'
    },
    {
      id: 'mgmt-2',
      name: 'Mike Rodriguez',
      avatar: '🔧',
      role: 'Maintenance Supervisor',
      status: 'away',
      department: 'Maintenance'
    },
    {
      id: 'mgmt-3',
      name: 'Lisa Chen',
      avatar: '👩‍💻',
      role: 'Leasing Agent',
      status: 'online',
      department: 'Leasing'
    },
    {
      id: 'mgmt-4',
      name: 'David Wilson',
      avatar: '👨‍💼',
      role: 'Assistant Manager',
      status: 'offline',
      department: 'Management'
    }
  ]

  const residentContacts: Contact[] = [
    {
      id: 'res-1',
      name: 'Emma Davis',
      avatar: '👩‍🦰',
      role: 'Resident',
      unit: communityType === 'apartment' ? 'Unit 2A' : '1245 Oak Street',
      status: 'online'
    },
    {
      id: 'res-2',
      name: 'John Smith',
      avatar: '👨',
      role: 'Resident',
      unit: communityType === 'apartment' ? 'Unit 3C' : '1247 Oak Street',
      status: 'away'
    },
    {
      id: 'res-3',
      name: 'Maria Garcia',
      avatar: '👩',
      role: 'Resident',
      unit: communityType === 'apartment' ? 'Unit 1B' : '1249 Oak Street',
      status: 'online'
    },
    {
      id: 'res-4',
      name: 'Tom Johnson',
      avatar: '👨‍🦳',
      role: 'Resident',
      unit: communityType === 'apartment' ? 'Unit 4A' : '1251 Oak Street',
      status: 'offline'
    }
  ]

  const presetGroups = [
    {
      id: 'all-residents',
      name: 'All Residents',
      icon: <Users className="w-5 h-5 text-blue-400" />,
      description: `Message all ${communityType === 'apartment' ? 'tenants' : 'homeowners'}`
    },
    {
      id: 'management-team',
      name: 'Management Team',
      icon: <Building className="w-5 h-5 text-purple-400" />,
      description: 'Property management staff'
    },
    {
      id: 'maintenance',
      name: 'Maintenance',
      icon: <Wrench className="w-5 h-5 text-orange-400" />,
      description: 'Maintenance and repair team'
    },
    ...(communityType === 'hoa' ? [
      {
        id: 'hoa-board',
        name: 'HOA Board',
        icon: <Crown className="w-5 h-5 text-yellow-400" />,
        description: 'Board members and officers'
      }
    ] : [])
  ]

  if (!isOpen) return null

  const handleContactToggle = (contact: Contact) => {
    setSelectedContacts(prev => {
      const isSelected = prev.find(c => c.id === contact.id)
      if (isSelected) {
        return prev.filter(c => c.id !== contact.id)
      } else {
        return [...prev, contact]
      }
    })
  }

  const handleStartDirectMessage = (contact: Contact) => {
    onStartChat(contact, 'dm')
    onClose()
  }

  const handleStartGroupChat = () => {
    if (selectedContacts.length > 0) {
      // Create a group conversation
      const groupContact: Contact = {
        id: `group-${Date.now()}`,
        name: groupName || `Group with ${selectedContacts.map(c => c.name).join(', ')}`,
        avatar: '👥',
        role: 'Group',
        status: 'online'
      }
      onStartChat(groupContact, 'group')
      onClose()
    }
  }

  const filteredManagementContacts = managementContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredResidentContacts = residentContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.unit?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400'
      case 'away':
        return 'bg-yellow-400'
      case 'offline':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: Users },
    { id: 'management', label: 'Management', icon: Building },
    ...(userType === 'admin' ? [{ id: 'groups', label: 'Groups', icon: Hash }] : [])
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/20 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">New Message</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {activeTab === 'contacts' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">Residents</h3>
              {filteredResidentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                        {contact.avatar}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(contact.status)} border-2 border-gray-900 rounded-full`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">{contact.name}</p>
                      <p className="text-gray-400 text-sm">{contact.unit}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartDirectMessage(contact)}
                    className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm transition-colors"
                  >
                    Message
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'management' && (
            <div className="p-4 space-y-4">
              {userType === 'resident' && (
                <>
                  <h3 className="text-lg font-semibold text-white">Property Management</h3>
                  {filteredManagementContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white">
                            {contact.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(contact.status)} border-2 border-gray-900 rounded-full`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{contact.name}</p>
                          <p className="text-gray-400 text-sm">{contact.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartDirectMessage(contact)}
                        className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 text-sm transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </>
              )}

              {userType === 'admin' && (
                <>
                  <h3 className="text-lg font-semibold text-white">Staff Directory</h3>
                  {filteredManagementContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                            {contact.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(contact.status)} border-2 border-gray-900 rounded-full`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{contact.name}</p>
                          <p className="text-gray-400 text-sm">{contact.role} • {contact.department}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartDirectMessage(contact)}
                        className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 text-sm transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {activeTab === 'groups' && userType === 'admin' && (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Groups</h3>
              {presetGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {group.icon}
                    <div>
                      <p className="text-white font-medium">{group.name}</p>
                      <p className="text-gray-400 text-sm">{group.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const groupContact: Contact = {
                        id: group.id,
                        name: group.name,
                        avatar: '👥',
                        role: 'Group',
                        status: 'online'
                      }
                      onStartChat(groupContact, 'group')
                      onClose()
                    }}
                    className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 text-sm transition-colors"
                  >
                    Message
                  </button>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4">
                <h4 className="text-md font-semibold text-white mb-3">Create Group</h4>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 mb-3"
                />
                
                <div className="space-y-2 mb-4">
                  {[...filteredManagementContacts, ...filteredResidentContacts].map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContacts.find(c => c.id === contact.id) !== undefined}
                        onChange={() => handleContactToggle(contact)}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                      />
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm">
                        {contact.avatar}
                      </div>
                      <span className="text-white text-sm">{contact.name}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleStartGroupChat}
                  disabled={selectedContacts.length === 0}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all"
                >
                  Create Group ({selectedContacts.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}