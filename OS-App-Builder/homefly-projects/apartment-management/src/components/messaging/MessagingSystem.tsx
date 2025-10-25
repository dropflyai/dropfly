'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Users, 
  Settings, 
  Phone, 
  Video, 
  Paperclip, 
  Smile, 
  MoreVertical,
  ArrowLeft,
  Clock,
  Check,
  CheckCheck,
  Pin,
  Star,
  Archive,
  Trash2,
  UserPlus,
  Shield,
  AlertCircle,
  Image as ImageIcon,
  File,
  MapPin,
  Camera,
  Mic,
  X,
  ChevronDown,
  Hash,
  Building,
  Home,
  Wrench,
  CreditCard,
  Calendar,
  Bell
} from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  senderRole: 'resident' | 'admin' | 'maintenance' | 'management'
  content: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'system'
  attachments?: Array<{
    id: string
    name: string
    size: string
    type: string
    url: string
  }>
  readBy?: string[]
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}

interface Conversation {
  id: string
  name: string
  type: 'dm' | 'management' | 'maintenance' | 'community' | 'group'
  participants: Array<{
    id: string
    name: string
    avatar: string
    role: string
    status: 'online' | 'offline' | 'away'
  }>
  lastMessage: Message
  unreadCount: number
  isPinned: boolean
  isArchived: boolean
  createdAt: string
}

interface MessagingSystemProps {
  userType: 'resident' | 'admin'
  userId: string
  userName: string
  communityType?: 'apartment' | 'hoa'
}

export default function MessagingSystem({ 
  userType, 
  userId, 
  userName, 
  communityType = 'apartment' 
}: MessagingSystemProps) {
  const [activeView, setActiveView] = useState<'conversations' | 'chat'>('conversations')
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data for conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'mgmt-001',
      name: 'Property Management',
      type: 'management',
      participants: [
        { id: 'admin-1', name: 'Sarah Thompson', avatar: '👩‍💼', role: 'Property Manager', status: 'online' },
        { id: userId, name: userName, avatar: '😊', role: 'Resident', status: 'online' }
      ],
      lastMessage: {
        id: 'msg-001',
        senderId: 'admin-1',
        senderName: 'Sarah Thompson',
        senderAvatar: '👩‍💼',
        senderRole: 'admin',
        content: 'Your maintenance request has been scheduled for tomorrow at 2 PM.',
        timestamp: '2 hours ago',
        type: 'text',
        priority: 'normal'
      },
      unreadCount: 1,
      isPinned: true,
      isArchived: false,
      createdAt: '2024-01-01'
    },
    {
      id: 'maint-001',
      name: 'Maintenance Team',
      type: 'maintenance',
      participants: [
        { id: 'maint-1', name: 'Mike Rodriguez', avatar: '🔧', role: 'Maintenance', status: 'away' },
        { id: userId, name: userName, avatar: '😊', role: 'Resident', status: 'online' }
      ],
      lastMessage: {
        id: 'msg-002',
        senderId: userId,
        senderName: userName,
        senderAvatar: '😊',
        senderRole: 'resident',
        content: 'Thank you for fixing the AC so quickly!',
        timestamp: '1 day ago',
        type: 'text',
        priority: 'normal'
      },
      unreadCount: 0,
      isPinned: false,
      isArchived: false,
      createdAt: '2024-01-10'
    },
    {
      id: 'dm-001',
      name: 'Emma Davis',
      type: 'dm',
      participants: [
        { id: 'resident-2', name: 'Emma Davis', avatar: '👩‍🦰', role: 'Resident • Unit 2A', status: 'online' },
        { id: userId, name: userName, avatar: '😊', role: 'Resident', status: 'online' }
      ],
      lastMessage: {
        id: 'msg-003',
        senderId: 'resident-2',
        senderName: 'Emma Davis',
        senderAvatar: '👩‍🦰',
        senderRole: 'resident',
        content: 'Are you going to the community BBQ this weekend?',
        timestamp: '3 hours ago',
        type: 'text',
        priority: 'normal'
      },
      unreadCount: 2,
      isPinned: false,
      isArchived: false,
      createdAt: '2024-01-15'
    }
  ])

  // Mock messages for active conversation
  const mockMessages: { [key: string]: Message[] } = {
    'mgmt-001': [
      {
        id: 'msg-1',
        senderId: userId,
        senderName: userName,
        senderAvatar: '😊',
        senderRole: 'resident',
        content: 'Hi, I submitted a maintenance request for my AC unit yesterday. Any updates?',
        timestamp: '10:30 AM',
        type: 'text',
        priority: 'normal'
      },
      {
        id: 'msg-2',
        senderId: 'admin-1',
        senderName: 'Sarah Thompson',
        senderAvatar: '👩‍💼',
        senderRole: 'admin',
        content: 'Hello! I see your request here. Our maintenance team will be there tomorrow at 2 PM. Please make sure someone is available to let them in.',
        timestamp: '10:45 AM',
        type: 'text',
        priority: 'normal'
      },
      {
        id: 'msg-3',
        senderId: userId,
        senderName: userName,
        senderAvatar: '😊',
        senderRole: 'resident',
        content: 'Perfect, I\'ll be working from home tomorrow. Thank you!',
        timestamp: '10:47 AM',
        type: 'text',
        priority: 'normal'
      }
    ],
    'dm-001': [
      {
        id: 'msg-4',
        senderId: 'resident-2',
        senderName: 'Emma Davis',
        senderAvatar: '👩‍🦰',
        senderRole: 'resident',
        content: 'Hey! Did you see the announcement about the BBQ this weekend?',
        timestamp: '2:15 PM',
        type: 'text',
        priority: 'normal'
      },
      {
        id: 'msg-5',
        senderId: 'resident-2',
        senderName: 'Emma Davis',
        senderAvatar: '👩‍🦰',
        senderRole: 'resident',
        content: 'Are you going to the community BBQ this weekend?',
        timestamp: '2:16 PM',
        type: 'text',
        priority: 'normal'
      }
    ]
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleConversationClick = (conversation: Conversation) => {
    setActiveConversation(conversation)
    setMessages(mockMessages[conversation.id] || [])
    setActiveView('chat')
    
    // Mark as read
    setConversations(convs => 
      convs.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    )
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return

    const message: Message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderName: userName,
      senderAvatar: '😊',
      senderRole: 'resident',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      priority: 'normal'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Update conversation's last message
    setConversations(convs =>
      convs.map(conv =>
        conv.id === activeConversation.id
          ? { ...conv, lastMessage: message }
          : conv
      )
    )
  }

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'management':
        return <Building className="w-5 h-5 text-blue-400" />
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-orange-400" />
      case 'community':
        return <Users className="w-5 h-5 text-green-400" />
      case 'group':
        return <Hash className="w-5 h-5 text-purple-400" />
      default:
        return <MessageSquare className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'normal':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (activeView === 'chat' && activeConversation) {
    return (
      <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveView('conversations')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center space-x-3">
                {getConversationIcon(activeConversation.type)}
                <div>
                  <h3 className="text-white font-semibold">{activeConversation.name}</h3>
                  <p className="text-gray-400 text-sm">
                    {activeConversation.participants.length > 2 
                      ? `${activeConversation.participants.length} participants`
                      : activeConversation.participants.find(p => p.id !== userId)?.status || 'offline'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {activeConversation.type === 'dm' && (
                <>
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <Phone className="w-5 h-5 text-white" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <Video className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
                message.senderId === userId ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}>
                {message.senderId !== userId && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                    {message.senderAvatar}
                  </div>
                )}
                
                <div className={`rounded-2xl px-4 py-2 ${
                  message.senderId === userId
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white'
                }`}>
                  {message.senderId !== userId && (
                    <p className="text-xs text-gray-300 mb-1">{message.senderName}</p>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === userId ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors">
                <Smile className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Attachment Menu */}
          {showAttachments && (
            <div className="mt-3 p-3 bg-white/10 rounded-xl">
              <div className="grid grid-cols-4 gap-3">
                <button className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Camera className="w-6 h-6 text-blue-400 mb-1" />
                  <span className="text-xs text-white">Camera</span>
                </button>
                <button className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <ImageIcon className="w-6 h-6 text-green-400 mb-1" />
                  <span className="text-xs text-white">Photo</span>
                </button>
                <button className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <File className="w-6 h-6 text-orange-400 mb-1" />
                  <span className="text-xs text-white">File</span>
                </button>
                <button className="flex flex-col items-center p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MapPin className="w-6 h-6 text-red-400 mb-1" />
                  <span className="text-xs text-white">Location</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white/10 border border-white/20 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          />
        </div>
      </div>

      {/* Quick Actions for Admin */}
      {userType === 'admin' && (
        <div className="p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <Bell className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm">Send Announcement</span>
            </button>
            <button className="flex items-center space-x-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-white text-sm">Broadcast Message</span>
            </button>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => handleConversationClick(conversation)}
            className="w-full p-4 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
          >
            <div className="flex items-center space-x-3">
              {getConversationIcon(conversation.type)}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium truncate">{conversation.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-xs">{conversation.lastMessage.timestamp}</span>
                    {conversation.isPinned && <Pin className="w-3 h-3 text-blue-400" />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm truncate">
                    {conversation.lastMessage.senderName}: {conversation.lastMessage.content}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}