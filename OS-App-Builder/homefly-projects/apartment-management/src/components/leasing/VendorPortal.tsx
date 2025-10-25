'use client'

import React, { useState } from 'react'
import { 
  LogIn, 
  Upload, 
  FileText, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Download, 
  Send, 
  Camera, 
  Paperclip, 
  Star, 
  BarChart3, 
  TrendingUp, 
  Award, 
  User, 
  Settings, 
  Bell, 
  CreditCard, 
  Receipt, 
  Eye,
  Edit3,
  Plus,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Building,
  Shield,
  Target,
  Activity
} from 'lucide-react'

interface VendorUser {
  id: string
  vendorId: string
  name: string
  email: string
  role: 'admin' | 'estimator' | 'technician'
  vendorName: string
  contactPerson: string
  phone: string
  address: string
  rating: number
  aiScore: number
  totalJobs: number
  pendingPayments: number
  lastLogin: string
}

interface WorkOrder {
  id: string
  propertyName: string
  unitNumber: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'emergency'
  status: 'pending' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'paid'
  requestDate: string
  dueDate: string
  estimatedCost: number
  actualCost: number
  photos: string[]
  notes: string
}

interface Invoice {
  id: string
  workOrderId: string
  amount: number
  description: string
  dateSubmitted: string
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  paymentDate?: string
  attachments: string[]
}

export default function VendorPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)
  const [showEstimateForm, setShowEstimateForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)

  // Demo vendor user data
  const vendorUser: VendorUser = {
    id: 'vendor-user-001',
    vendorId: 'vendor-001',
    name: 'Mike Johnson',
    email: 'mike@premiumplumbing.com',
    role: 'admin',
    vendorName: 'Premium Plumbing Solutions',
    contactPerson: 'Mike Johnson',
    phone: '(555) 123-4567',
    address: '123 Service Ave, City, ST 12345',
    rating: 4.8,
    aiScore: 92,
    totalJobs: 145,
    pendingPayments: 3250,
    lastLogin: '2025-01-18'
  }

  // Demo work orders data
  const workOrders: WorkOrder[] = [
    {
      id: 'wo-001',
      propertyName: 'Luxury Heights Apartments',
      unitNumber: '12B',
      description: 'Kitchen faucet leaking, needs replacement. Tenant reports water pooling under sink.',
      priority: 'high',
      status: 'pending',
      requestDate: '2025-01-18',
      dueDate: '2025-01-20',
      estimatedCost: 0,
      actualCost: 0,
      photos: [],
      notes: 'Tenant available weekdays after 5PM'
    },
    {
      id: 'wo-002',
      propertyName: 'Luxury Heights Apartments',
      unitNumber: '8A',
      description: 'Water heater making unusual noises, may need inspection or replacement.',
      priority: 'medium',
      status: 'quoted',
      requestDate: '2025-01-17',
      dueDate: '2025-01-22',
      estimatedCost: 850,
      actualCost: 0,
      photos: [],
      notes: 'Unit is vacant, key available at office'
    },
    {
      id: 'wo-003',
      propertyName: 'Luxury Heights Apartments',
      unitNumber: '5C',
      description: 'Bathroom sink drain clogged, standard cleaning needed.',
      priority: 'low',
      status: 'completed',
      requestDate: '2025-01-15',
      dueDate: '2025-01-18',
      estimatedCost: 125,
      actualCost: 125,
      photos: ['before.jpg', 'after.jpg'],
      notes: 'Completed successfully, tenant satisfied'
    },
    {
      id: 'wo-004',
      propertyName: 'Luxury Heights Apartments',
      unitNumber: '3A',
      description: 'Emergency: Burst pipe in bathroom, immediate attention required.',
      priority: 'emergency',
      status: 'in_progress',
      requestDate: '2025-01-18',
      dueDate: '2025-01-18',
      estimatedCost: 450,
      actualCost: 0,
      photos: ['emergency-photo.jpg'],
      notes: 'Started emergency repair at 2:30 PM'
    }
  ]

  // Demo invoices data
  const invoices: Invoice[] = [
    {
      id: 'inv-001',
      workOrderId: 'wo-003',
      amount: 125,
      description: 'Bathroom drain cleaning - Unit 5C',
      dateSubmitted: '2025-01-18',
      status: 'approved',
      attachments: ['receipt-001.pdf', 'photos.zip']
    },
    {
      id: 'inv-002',
      workOrderId: 'wo-005',
      amount: 875,
      description: 'Water heater replacement - Unit 1B',
      dateSubmitted: '2025-01-16',
      status: 'paid',
      paymentDate: '2025-01-17',
      attachments: ['invoice-002.pdf', 'warranty.pdf']
    },
    {
      id: 'inv-003',
      workOrderId: 'wo-004',
      amount: 450,
      description: 'Emergency pipe repair - Unit 3A',
      dateSubmitted: '2025-01-18',
      status: 'pending',
      attachments: ['emergency-invoice.pdf']
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'quoted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in_progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const LoginForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Vendor Portal</h2>
          <p className="text-white/60">Access your work orders and submit invoices</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsLoggedIn(true)}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">Demo Login - Click "Sign In" to continue</p>
        </div>
      </div>
    </div>
  )

  const Dashboard = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-3xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {vendorUser.name}!</h2>
            <p className="text-white/60">{vendorUser.vendorName} - Last login: {vendorUser.lastLogin}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">{vendorUser.rating}</span>
            </div>
            <div className="text-white/60 text-sm">AI Score: {vendorUser.aiScore}</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{workOrders.filter(w => w.status === 'pending').length}</h3>
          <p className="text-white/60 text-sm">Pending Quotes</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{workOrders.filter(w => w.status === 'in_progress').length}</h3>
          <p className="text-white/60 text-sm">Active Jobs</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">${vendorUser.pendingPayments.toLocaleString()}</h3>
          <p className="text-white/60 text-sm">Pending Payments</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Award className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{vendorUser.totalJobs}</h3>
          <p className="text-white/60 text-sm">Total Jobs</p>
        </div>
      </div>

      {/* Recent Work Orders */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Work Orders</h3>
          <button
            onClick={() => setActiveTab('work-orders')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All →
          </button>
        </div>
        
        <div className="space-y-4">
          {workOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-white font-medium">{order.propertyName} - Unit {order.unitNumber}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm mb-2">{order.description}</p>
                  <div className="flex items-center space-x-4 text-white/60 text-xs">
                    <span>Due: {order.dueDate}</span>
                    {order.estimatedCost > 0 && <span>Est: ${order.estimatedCost}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWorkOrder(order)}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors text-sm"
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Performance Overview</h3>
        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-8 text-center">
          <BarChart3 className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <p className="text-white/60">Performance analytics and trends would display here</p>
        </div>
      </div>
    </div>
  )

  const WorkOrders = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Work Orders</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {workOrders.map((order) => (
          <div key={order.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-bold text-white">{order.propertyName}</h3>
                  <span className="text-white/60">Unit {order.unitNumber}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(order.priority)}`}>
                    {order.priority.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                <p className="text-white/70 mb-4">{order.description}</p>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Requested:</span>
                    <span className="text-white ml-2">{order.requestDate}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Due Date:</span>
                    <span className="text-white ml-2">{order.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Estimated Cost:</span>
                    <span className="text-white ml-2">
                      {order.estimatedCost > 0 ? `$${order.estimatedCost}` : 'Not quoted'}
                    </span>
                  </div>
                </div>
                
                {order.notes && (
                  <div className="mt-4 p-3 bg-white/5 rounded-xl">
                    <span className="text-white/60 text-sm">Notes: </span>
                    <span className="text-white text-sm">{order.notes}</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-2 ml-6">
                <button
                  onClick={() => setSelectedWorkOrder(order)}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors text-sm"
                >
                  View Details
                </button>
                
                {order.status === 'pending' && (
                  <button
                    onClick={() => setShowEstimateForm(true)}
                    className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors text-sm"
                  >
                    Submit Quote
                  </button>
                )}
                
                {order.status === 'completed' && (
                  <button
                    onClick={() => setShowInvoiceForm(true)}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-colors text-sm"
                  >
                    Submit Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const Invoices = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Invoices & Payments</h2>
        <button
          onClick={() => setShowInvoiceForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>New Invoice</span>
        </button>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-white">Invoice #{invoice.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                    {invoice.status.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-white/70 mb-3">{invoice.description}</p>
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Amount:</span>
                    <span className="text-green-400 ml-2 font-semibold">${invoice.amount}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Submitted:</span>
                    <span className="text-white ml-2">{invoice.dateSubmitted}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Payment Date:</span>
                    <span className="text-white ml-2">{invoice.paymentDate || 'Pending'}</span>
                  </div>
                </div>
                
                {invoice.attachments.length > 0 && (
                  <div className="mt-3">
                    <span className="text-white/60 text-sm">Attachments: </span>
                    {invoice.attachments.map((attachment, index) => (
                      <span key={index} className="text-blue-400 text-sm ml-1">{attachment}</span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Eye className="w-5 h-5 text-white/60" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (!isLoggedIn) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black">
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{vendorUser.vendorName}</h1>
              <p className="text-white/60 text-sm">Vendor Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-white/60" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <Settings className="w-5 h-5 text-white/60" />
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black/90 backdrop-blur-xl border-r border-white/10 min-h-screen p-6">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'work-orders', label: 'Work Orders', icon: FileText },
              { id: 'invoices', label: 'Invoices', icon: Receipt },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'support', label: 'Support', icon: MessageSquare }
            ].map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'work-orders' && <WorkOrders />}
          {activeTab === 'invoices' && <Invoices />}
          {/* Add other tab content as needed */}
        </div>
      </div>
    </div>
  )
}