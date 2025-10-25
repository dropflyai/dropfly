'use client'

import React, { useState } from 'react'
import { 
  CreditCard, 
  Home, 
  FileText, 
  Wrench, 
  Calendar, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  MessageSquare,
  Bell,
  User,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Star,
  Filter,
  Search,
  Plus,
  Send,
  PaperclipIcon
} from 'lucide-react'

export function ResidentPaymentPortal() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('auto-pay')
  
  const rentDetails = {
    monthlyRent: 3200,
    dueDate: '1st of each month',
    unit: 'Apt 2B',
    balance: 0,
    nextDue: 'February 1, 2025',
    autopayEnabled: true,
    paymentHistory: [
      { date: '2025-01-01', amount: 3200, status: 'Paid', method: 'Auto-pay' },
      { date: '2024-12-01', amount: 3200, status: 'Paid', method: 'Auto-pay' },
      { date: '2024-11-01', amount: 3200, status: 'Paid', method: 'Auto-pay' },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Current Balance Card */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/20 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Rent Payment Portal</h2>
            <p className="text-gray-400">Unit: {rentDetails.unit}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-green-400">${rentDetails.balance}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Monthly Rent</p>
            <p className="text-2xl font-bold text-white">${rentDetails.monthlyRent}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Next Due Date</p>
            <p className="text-xl font-semibold text-white">{rentDetails.nextDue}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Auto-pay Status</p>
            <div className="flex items-center mt-1">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-green-400 font-medium">Enabled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Payment Methods</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button 
            onClick={() => setSelectedPaymentMethod('auto-pay')}
            className={`p-4 rounded-xl border ${selectedPaymentMethod === 'auto-pay' ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 bg-white/5'} hover:bg-white/10 transition-all`}
          >
            <CreditCard className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-white font-medium">Auto-pay</p>
            <p className="text-gray-400 text-sm">Visa ****4242</p>
          </button>
          <button 
            onClick={() => setSelectedPaymentMethod('bank')}
            className={`p-4 rounded-xl border ${selectedPaymentMethod === 'bank' ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 bg-white/5'} hover:bg-white/10 transition-all`}
          >
            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-white font-medium">Bank Transfer</p>
            <p className="text-gray-400 text-sm">Chase ****7890</p>
          </button>
          <button className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-white font-medium">Add New</p>
            <p className="text-gray-400 text-sm">Payment method</p>
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Payment History</h3>
          <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-xl text-blue-400 transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download Statement
          </button>
        </div>
        
        <div className="space-y-3">
          {rentDetails.paymentHistory.map((payment, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">${payment.amount}</p>
                  <p className="text-gray-400 text-sm">{payment.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-green-400 font-medium">{payment.status}</p>
                <p className="text-gray-400 text-sm">{payment.method}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function MaintenanceRequests() {
  const [showNewRequest, setShowNewRequest] = useState(false)
  const [requestType, setRequestType] = useState('')
  const [description, setDescription] = useState('')
  
  const requests = [
    {
      id: 'REQ-001',
      type: 'Plumbing',
      description: 'Kitchen sink is leaking',
      status: 'In Progress',
      submitted: '2025-01-10',
      technician: 'John Smith',
      statusColor: 'yellow'
    },
    {
      id: 'REQ-002', 
      type: 'Electrical',
      description: 'Bedroom outlet not working',
      status: 'Completed',
      submitted: '2025-01-05',
      completedDate: '2025-01-07',
      statusColor: 'green'
    },
    {
      id: 'REQ-003',
      type: 'HVAC',
      description: 'AC not cooling properly',
      status: 'Scheduled',
      submitted: '2025-01-12',
      scheduledDate: '2025-01-20',
      statusColor: 'blue'
    }
  ]

  const maintenanceTypes = [
    'Plumbing', 'Electrical', 'HVAC', 'Appliance', 'Structural', 'Pest Control', 'Other'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Maintenance Requests</h2>
            <p className="text-gray-400">Submit and track maintenance issues</p>
          </div>
          <button 
            onClick={() => setShowNewRequest(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Request
          </button>
        </div>
      </div>

      {/* New Request Form */}
      {showNewRequest && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Submit New Request</h3>
          <div className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Request Type</label>
              <select 
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              >
                <option value="">Select type...</option>
                {maintenanceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe the issue in detail..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 h-32"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Attach Photos (Optional)</label>
              <button className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-gray-300 hover:bg-white/20 transition-colors flex items-center">
                <PaperclipIcon className="w-4 h-4 mr-2" />
                Choose Files
              </button>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowNewRequest(false)
                  setRequestType('')
                  setDescription('')
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 rounded-xl text-white font-medium transition-all"
              >
                Submit Request
              </button>
              <button 
                onClick={() => setShowNewRequest(false)}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Requests */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Your Requests</h3>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`w-10 h-10 bg-${request.statusColor}-500/20 rounded-full flex items-center justify-center`}>
                    <Wrench className={`w-5 h-5 text-${request.statusColor}-400`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="text-white font-medium">{request.type}</p>
                      <span className="text-gray-400 text-sm">#{request.id}</span>
                    </div>
                    <p className="text-gray-300 mb-2">{request.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-gray-400">Submitted: {request.submitted}</span>
                      {request.technician && (
                        <span className="text-gray-400">Technician: {request.technician}</span>
                      )}
                      {request.scheduledDate && (
                        <span className="text-blue-400">Scheduled: {request.scheduledDate}</span>
                      )}
                      {request.completedDate && (
                        <span className="text-green-400">Completed: {request.completedDate}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 bg-${request.statusColor}-500/20 rounded-full`}>
                  <span className={`text-${request.statusColor}-400 text-sm font-medium`}>
                    {request.status}
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

export function LeaseDocuments() {
  const leaseInfo = {
    unit: 'Apt 2B',
    leaseStart: '2024-06-01',
    leaseEnd: '2025-05-31',
    monthlyRent: 3200,
    securityDeposit: 3200,
    tenants: ['John Doe', 'Jane Doe'],
    petDeposit: 500,
    parkingSpaces: 1
  }

  const documents = [
    { name: 'Signed Lease Agreement', date: '2024-05-15', size: '2.4 MB', type: 'PDF' },
    { name: 'Move-in Inspection Report', date: '2024-06-01', size: '1.8 MB', type: 'PDF' },
    { name: 'Pet Addendum', date: '2024-06-01', size: '0.5 MB', type: 'PDF' },
    { name: 'Parking Agreement', date: '2024-06-01', size: '0.3 MB', type: 'PDF' },
    { name: 'Community Rules & Regulations', date: '2024-06-01', size: '1.2 MB', type: 'PDF' }
  ]

  return (
    <div className="space-y-6">
      {/* Lease Summary */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Lease Information</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Unit</p>
            <p className="text-xl font-semibold text-white">{leaseInfo.unit}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Lease Term</p>
            <p className="text-white font-medium">{leaseInfo.leaseStart} to {leaseInfo.leaseEnd}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Monthly Rent</p>
            <p className="text-xl font-semibold text-white">${leaseInfo.monthlyRent}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Security Deposit</p>
            <p className="text-xl font-semibold text-white">${leaseInfo.securityDeposit}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Tenants</p>
            <p className="text-white">{leaseInfo.tenants.join(', ')}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Parking Spaces</p>
            <p className="text-xl font-semibold text-white">{leaseInfo.parkingSpaces}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-xl">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
            <p className="text-yellow-300">Your lease expires in 4 months. Contact the office to discuss renewal options.</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Lease Documents</h3>
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{doc.name}</p>
                  <p className="text-gray-400 text-sm">{doc.date} • {doc.size}</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-xl text-purple-400 transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ResidentCommunity() {
  const announcements = [
    {
      title: 'Pool Maintenance',
      date: '2025-01-15',
      message: 'The pool will be closed for maintenance on January 20-21.',
      priority: 'medium'
    },
    {
      title: 'Parking Lot Resurfacing',
      date: '2025-01-14',
      message: 'North parking lot will be resurfaced next week. Please use south lot.',
      priority: 'high'
    },
    {
      title: 'Community BBQ Event',
      date: '2025-01-10',
      message: 'Join us for a community BBQ on Saturday, February 1st at 2 PM!',
      priority: 'low'
    }
  ]

  const amenities = [
    { name: 'Fitness Center', hours: '5 AM - 11 PM', status: 'Open' },
    { name: 'Pool & Spa', hours: '7 AM - 10 PM', status: 'Open' },
    { name: 'Business Center', hours: '24/7', status: 'Open' },
    { name: 'Clubhouse', hours: '9 AM - 9 PM', status: 'Reserved' }
  ]

  return (
    <div className="space-y-6">
      {/* Community Announcements */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-white mb-6">Community Updates</h2>
        
        <div className="space-y-4">
          {announcements.map((announcement, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-white font-medium">{announcement.title}</h4>
                <span className="text-gray-400 text-sm">{announcement.date}</span>
              </div>
              <p className="text-gray-300">{announcement.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Amenities Status */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Amenity Hours</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{amenity.name}</p>
                <p className="text-gray-400 text-sm">{amenity.hours}</p>
              </div>
              <div className={`px-3 py-1 rounded-full ${
                amenity.status === 'Open' ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                <span className={`text-sm font-medium ${
                  amenity.status === 'Open' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {amenity.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Property Contacts</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Office</p>
                <p className="text-white">(555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-gray-400 text-sm">Emergency</p>
                <p className="text-white">(555) 999-8888</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white">office@luxuryheights.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Office Location</p>
                <p className="text-white">Building A, Suite 100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}