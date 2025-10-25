'use client'

import React, { useState } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Mail, 
  Phone, 
  MapPin,
  Home,
  Calendar,
  CreditCard,
  Shield,
  Crown,
  CheckCircle,
  Clock,
  AlertTriangle,
  UserPlus
} from 'lucide-react'

const ResidentsContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const residents = [
    {
      id: 'res-001',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '(555) 123-4567',
      unit: '1234 Maple Street',
      type: 'homeowner',
      status: 'active',
      moveInDate: '2020-03-15',
      duesStatus: 'current',
      emergencyContact: 'Michael Johnson - (555) 234-5678',
      vehicles: ['Honda Civic - ABC123', 'Toyota Prius - XYZ789'],
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
      committees: ['Board President', 'Architectural Review'],
      lastActivity: '2025-01-18'
    },
    {
      id: 'res-002',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '(555) 234-5678',
      unit: '5678 Oak Avenue',
      type: 'homeowner',
      status: 'active',
      moveInDate: '2019-08-22',
      duesStatus: 'current',
      emergencyContact: 'Lisa Chen - (555) 345-6789',
      vehicles: ['BMW X5 - DEF456'],
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      committees: ['Board Vice President', 'Finance Committee'],
      lastActivity: '2025-01-17'
    },
    {
      id: 'res-003',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '(555) 345-6789',
      unit: '9012 Pine Drive',
      type: 'homeowner',
      status: 'active',
      moveInDate: '2021-01-10',
      duesStatus: 'current',
      emergencyContact: 'Carlos Rodriguez - (555) 456-7890',
      vehicles: ['Tesla Model 3 - GHI789', 'Ford Explorer - JKL012'],
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      committees: ['Board Treasurer', 'Landscaping Committee'],
      lastActivity: '2025-01-16'
    },
    {
      id: 'res-004',
      name: 'David Thompson',
      email: 'david.thompson@email.com',
      phone: '(555) 456-7890',
      unit: '3456 Elm Court',
      type: 'homeowner',
      status: 'active',
      moveInDate: '2022-06-05',
      duesStatus: 'late',
      emergencyContact: 'Emma Thompson - (555) 567-8901',
      vehicles: ['Jeep Wrangler - MNO345'],
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      committees: ['Board Secretary', 'Communications Committee'],
      lastActivity: '2025-01-15'
    },
    {
      id: 'res-005',
      name: 'Lisa Wang',
      email: 'lisa.wang@email.com',
      phone: '(555) 567-8901',
      unit: '7890 Cedar Lane',
      type: 'homeowner',
      status: 'active',
      moveInDate: '2018-11-30',
      duesStatus: 'current',
      emergencyContact: 'James Wang - (555) 678-9012',
      vehicles: ['Audi Q7 - PQR678'],
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      committees: ['Architectural Review Chair', 'Security Committee'],
      lastActivity: '2025-01-14'
    },
    {
      id: 'res-006',
      name: 'Robert Kim',
      email: 'robert.kim@email.com',
      phone: '(555) 678-9012',
      unit: '2468 Birch Way',
      type: 'renter',
      status: 'active',
      moveInDate: '2024-09-01',
      duesStatus: 'n/a',
      emergencyContact: 'Grace Kim - (555) 789-0123',
      vehicles: ['Hyundai Elantra - STU901'],
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      committees: [],
      lastActivity: '2025-01-13'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'inactive': return 'text-gray-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 border-green-500/30'
      case 'inactive': return 'bg-gray-500/20 border-gray-500/30'
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const getDuesStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'text-green-400'
      case 'late': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      case 'n/a': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getDuesStatusBg = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-500/20 border-green-500/30'
      case 'late': return 'bg-red-500/20 border-red-500/30'
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'n/a': return 'bg-gray-500/20 border-gray-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'homeowner' ? <Home className="w-5 h-5 text-blue-400" /> : <Shield className="w-5 h-5 text-purple-400" />
  }

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || resident.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Residents</h1>
          <p className="text-white/60 mt-2">Community member directory and management</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
            <Filter className="w-4 h-4 mr-2 inline" />
            Export List
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Resident
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search residents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Residents Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredResidents.map((resident) => (
          <div key={resident.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-start space-x-4 mb-6">
              <img 
                src={resident.photo} 
                alt={resident.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{resident.name}</h3>
                  {getTypeIcon(resident.type)}
                  {resident.committees.some(c => c.includes('Board') || c.includes('Chair')) && (
                    <Crown className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-2">{resident.unit}</p>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBg(resident.status)} ${getStatusColor(resident.status)}`}>
                    {resident.status.charAt(0).toUpperCase() + resident.status.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDuesStatusBg(resident.duesStatus)} ${getDuesStatusColor(resident.duesStatus)}`}>
                    Dues: {resident.duesStatus === 'n/a' ? 'N/A' : resident.duesStatus.charAt(0).toUpperCase() + resident.duesStatus.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Eye className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-white" />
                </button>
                <button className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg transition-colors">
                  <Mail className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{resident.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">{resident.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-300 text-sm">Move-in: {resident.moveInDate}</span>
              </div>
            </div>

            {resident.committees.length > 0 && (
              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="text-sm text-gray-400 mb-2">Committee Roles:</div>
                <div className="flex flex-wrap gap-2">
                  {resident.committees.map((committee, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                      {committee}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-700 pt-4">
              <div className="text-sm text-gray-400 mb-2">Vehicle Information:</div>
              <div className="space-y-1">
                {resident.vehicles.map((vehicle, index) => (
                  <div key={index} className="text-gray-300 text-sm">
                    {vehicle}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Emergency Contact:</span>
                <span className="text-gray-300">{resident.emergencyContact}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Last Activity:</span>
                <span className="text-gray-300">{resident.lastActivity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {residents.filter(r => r.type === 'homeowner').length}
          </div>
          <div className="text-sm text-gray-400">Homeowners</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {residents.filter(r => r.type === 'renter').length}
          </div>
          <div className="text-sm text-gray-400">Renters</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {residents.filter(r => r.duesStatus === 'current').length}
          </div>
          <div className="text-sm text-gray-400">Current on Dues</div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">
            {residents.filter(r => r.committees.length > 0).length}
          </div>
          <div className="text-sm text-gray-400">Committee Members</div>
        </div>
      </div>
    </div>
  )
}

export default ResidentsContent