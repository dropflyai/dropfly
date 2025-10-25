'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Star, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar, 
  FileText, 
  CreditCard, 
  Award, 
  Activity, 
  BarChart3, 
  PieChart, 
  Target,
  Zap,
  Shield,
  Edit3,
  Eye,
  Download,
  Upload,
  MessageSquare,
  Settings,
  Archive,
  RotateCcw,
  Trash2,
  ExternalLink,
  UserPlus,
  ChevronDown,
  MoreVertical
} from 'lucide-react'

import VendorApplicationReview from './VendorApplicationReview'

interface Vendor {
  id: string
  name: string
  category: string
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  contactPerson: string
  email: string
  phone: string
  address: string
  services: string[]
  rating: number
  aiScore: number
  totalJobs: number
  completedJobs: number
  avgResponseTime: number // hours
  avgJobTime: number // days
  totalRevenue: number
  costEfficiency: number // percentage
  qualityScore: number
  onTimeDelivery: number // percentage
  customerSatisfaction: number
  joinDate: string
  lastActive: string
  licenses: string[]
  insurance: {
    liability: boolean
    workers: boolean
    expiryDate: string
  }
  paymentTerms: string
  preferredPayment: string
  riskLevel: 'low' | 'medium' | 'high'
  complianceScore: number
}

interface VendorManagementProps {
  propertyId?: string
  onVendorUpdate?: (vendor: Vendor) => void
}

export default function VendorManagement({
  propertyId = "luxury-heights-001",
  onVendorUpdate
}: VendorManagementProps) {
  const [activeTab, setActiveTab] = useState('active')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showVendorDetails, setShowVendorDetails] = useState(false)
  const [showAddVendor, setShowAddVendor] = useState(false)
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showReportsDropdown, setShowReportsDropdown] = useState(false)
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
  
  const actionsRef = useRef<HTMLDivElement>(null)
  const reportsRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActionsDropdown(false)
      }
      if (reportsRef.current && !reportsRef.current.contains(event.target as Node)) {
        setShowReportsDropdown(false)
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettingsDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Demo vendor data
  const vendors: Vendor[] = [
    {
      id: 'vendor-001',
      name: 'Premium Plumbing Solutions',
      category: 'Plumbing',
      status: 'active',
      contactPerson: 'Mike Johnson',
      email: 'mike@premiumplumbing.com',
      phone: '(555) 123-4567',
      address: '123 Service Ave, City, ST 12345',
      services: ['Emergency Plumbing', 'Pipe Repair', 'Water Heater Installation', 'Drain Cleaning'],
      rating: 4.8,
      aiScore: 92,
      totalJobs: 145,
      completedJobs: 142,
      avgResponseTime: 2.5,
      avgJobTime: 1.2,
      totalRevenue: 89750,
      costEfficiency: 94,
      qualityScore: 96,
      onTimeDelivery: 98,
      customerSatisfaction: 4.9,
      joinDate: '2023-03-15',
      lastActive: '2025-01-18',
      licenses: ['Master Plumber License', 'City Permit'],
      insurance: {
        liability: true,
        workers: true,
        expiryDate: '2025-12-31'
      },
      paymentTerms: 'Net 30',
      preferredPayment: 'ACH',
      riskLevel: 'low',
      complianceScore: 98
    },
    {
      id: 'vendor-002',
      name: 'Elite HVAC Services',
      category: 'HVAC',
      status: 'active',
      contactPerson: 'Sarah Martinez',
      email: 'sarah@elitehvac.com',
      phone: '(555) 987-6543',
      address: '456 Climate Dr, City, ST 12345',
      services: ['AC Repair', 'Heating Installation', 'Duct Cleaning', 'Preventive Maintenance'],
      rating: 4.7,
      aiScore: 89,
      totalJobs: 98,
      completedJobs: 95,
      avgResponseTime: 3.1,
      avgJobTime: 2.1,
      totalRevenue: 127500,
      costEfficiency: 87,
      qualityScore: 91,
      onTimeDelivery: 94,
      customerSatisfaction: 4.6,
      joinDate: '2023-01-10',
      lastActive: '2025-01-17',
      licenses: ['HVAC Contractor License', 'EPA Certification'],
      insurance: {
        liability: true,
        workers: true,
        expiryDate: '2025-08-15'
      },
      paymentTerms: 'Net 15',
      preferredPayment: 'Check',
      riskLevel: 'low',
      complianceScore: 95
    },
    {
      id: 'vendor-003',
      name: 'Budget Electric Co.',
      category: 'Electrical',
      status: 'inactive',
      contactPerson: 'Tom Wilson',
      email: 'tom@budgetelectric.com',
      phone: '(555) 456-7890',
      address: '789 Volt St, City, ST 12345',
      services: ['Electrical Repair', 'Outlet Installation', 'Circuit Breaker'],
      rating: 3.2,
      aiScore: 45,
      totalJobs: 67,
      completedJobs: 52,
      avgResponseTime: 8.5,
      avgJobTime: 4.2,
      totalRevenue: 31200,
      costEfficiency: 65,
      qualityScore: 58,
      onTimeDelivery: 71,
      customerSatisfaction: 3.1,
      joinDate: '2022-11-20',
      lastActive: '2024-09-12',
      licenses: ['Electrician License'],
      insurance: {
        liability: false,
        workers: true,
        expiryDate: '2024-12-31'
      },
      paymentTerms: 'Net 45',
      preferredPayment: 'Cash',
      riskLevel: 'high',
      complianceScore: 62
    },
    {
      id: 'vendor-004',
      name: 'Ace Landscaping Pro',
      category: 'Landscaping',
      status: 'active',
      contactPerson: 'Maria Garcia',
      email: 'maria@acelandscaping.com',
      phone: '(555) 321-0987',
      address: '321 Garden Way, City, ST 12345',
      services: ['Lawn Maintenance', 'Tree Trimming', 'Irrigation', 'Snow Removal'],
      rating: 4.5,
      aiScore: 85,
      totalJobs: 203,
      completedJobs: 199,
      avgResponseTime: 12.0,
      avgJobTime: 0.5,
      totalRevenue: 156800,
      costEfficiency: 91,
      qualityScore: 88,
      onTimeDelivery: 96,
      customerSatisfaction: 4.4,
      joinDate: '2022-05-01',
      lastActive: '2025-01-18',
      licenses: ['Landscaping License', 'Pesticide Applicator'],
      insurance: {
        liability: true,
        workers: true,
        expiryDate: '2025-06-30'
      },
      paymentTerms: 'Net 30',
      preferredPayment: 'ACH',
      riskLevel: 'low',
      complianceScore: 92
    },
    {
      id: 'vendor-005',
      name: 'Express Cleaning Services',
      category: 'Cleaning',
      status: 'suspended',
      contactPerson: 'David Lee',
      email: 'david@expresscleaning.com',
      phone: '(555) 654-3210',
      address: '654 Clean St, City, ST 12345',
      services: ['Unit Cleaning', 'Carpet Cleaning', 'Window Washing'],
      rating: 2.8,
      aiScore: 32,
      totalJobs: 89,
      completedJobs: 71,
      avgResponseTime: 15.2,
      avgJobTime: 2.8,
      totalRevenue: 45600,
      costEfficiency: 72,
      qualityScore: 45,
      onTimeDelivery: 68,
      customerSatisfaction: 2.9,
      joinDate: '2023-08-12',
      lastActive: '2024-12-20',
      licenses: ['Business License'],
      insurance: {
        liability: true,
        workers: false,
        expiryDate: '2025-03-15'
      },
      paymentTerms: 'Net 60',
      preferredPayment: 'Check',
      riskLevel: 'high',
      complianceScore: 58
    }
  ]

  const categories = ['all', 'Plumbing', 'HVAC', 'Electrical', 'Landscaping', 'Cleaning', 'General Maintenance', 'Security', 'Painting']

  const filteredVendors = vendors.filter(vendor => {
    const matchesTab = 
      activeTab === 'active' ? vendor.status === 'active' :
      activeTab === 'inactive' ? vendor.status === 'inactive' :
      activeTab === 'suspended' ? vendor.status === 'suspended' :
      activeTab === 'all' ? true : false

    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory

    return matchesTab && matchesSearch && matchesCategory
  })

  const handleApproveApplication = (applicationId: string, notes: string) => {
    console.log('Approving application:', applicationId, notes)
    alert(`Application ${applicationId} approved with notes: ${notes}`)
  }

  const handleRejectApplication = (applicationId: string, reason: string) => {
    console.log('Rejecting application:', applicationId, reason)
    alert(`Application ${applicationId} rejected: ${reason}`)
  }

  const handleRequestDocuments = (applicationId: string, documents: string[]) => {
    console.log('Requesting documents for application:', applicationId, documents)
    alert(`Requested documents for ${applicationId}: ${documents.join(', ')}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getAIScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 75) return 'text-yellow-400'
    if (score >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor)
    setShowVendorDetails(true)
  }

  const VendorDetailsModal = () => {
    if (!selectedVendor) return null

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Building className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedVendor.name}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedVendor.status)}`}>
                    {selectedVendor.status.toUpperCase()}
                  </span>
                  <span className="text-white/60">{selectedVendor.category}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowVendorDetails(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <XCircle className="w-6 h-6 text-white/60" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* AI Performance Score */}
              <div className="lg:col-span-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-white">AI Performance Score</h4>
                  <Zap className="w-8 h-8 text-purple-400" />
                </div>
                
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{selectedVendor.aiScore}</div>
                    <div className="text-white/60 text-sm">Overall Score</div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-400 h-2 rounded-full" 
                        style={{ width: `${selectedVendor.aiScore}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">{selectedVendor.qualityScore}%</div>
                    <div className="text-white/60 text-sm">Quality Score</div>
                    <div className="flex items-center justify-center mt-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">{selectedVendor.costEfficiency}%</div>
                    <div className="text-white/60 text-sm">Cost Efficiency</div>
                    <div className="flex items-center justify-center mt-1">
                      <DollarSign className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400 mb-2">{selectedVendor.onTimeDelivery}%</div>
                    <div className="text-white/60 text-sm">On-Time Delivery</div>
                    <div className="flex items-center justify-center mt-1">
                      <Clock className="w-4 h-4 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-white">{selectedVendor.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-400" />
                    <span className="text-white">{selectedVendor.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-white">{selectedVendor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    <span className="text-white text-sm">{selectedVendor.address}</span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Performance Metrics</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Jobs:</span>
                    <span className="text-white font-semibold">{selectedVendor.totalJobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Completed:</span>
                    <span className="text-green-400 font-semibold">{selectedVendor.completedJobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Success Rate:</span>
                    <span className="text-white font-semibold">
                      {((selectedVendor.completedJobs / selectedVendor.totalJobs) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Avg Response:</span>
                    <span className="text-white font-semibold">{selectedVendor.avgResponseTime}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Total Revenue:</span>
                    <span className="text-green-400 font-semibold">${selectedVendor.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Risk Assessment</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Risk Level:</span>
                    <span className={`font-semibold capitalize ${getRiskLevelColor(selectedVendor.riskLevel)}`}>
                      {selectedVendor.riskLevel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Compliance Score:</span>
                    <span className="text-white font-semibold">{selectedVendor.complianceScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Liability Insurance:</span>
                    <span className={selectedVendor.insurance.liability ? 'text-green-400' : 'text-red-400'}>
                      {selectedVendor.insurance.liability ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Workers Comp:</span>
                    <span className={selectedVendor.insurance.workers ? 'text-green-400' : 'text-red-400'}>
                      {selectedVendor.insurance.workers ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Insurance Expires:</span>
                    <span className="text-white font-semibold">{selectedVendor.insurance.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Services Offered</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedVendor.services.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-white/5 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licenses */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Licenses & Certifications</h4>
                <div className="space-y-3">
                  {selectedVendor.licenses.map((license, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">{license}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/10">
              <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors">
                <ExternalLink className="w-5 h-5" />
                <span>View Portal</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span>Send Message</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-colors">
                <FileText className="w-5 h-5" />
                <span>Request Quote</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition-colors">
                <Edit3 className="w-5 h-5" />
                <span>Edit Vendor</span>
              </button>
              {selectedVendor.status === 'active' ? (
                <button className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors">
                  <Archive className="w-5 h-5" />
                  <span>Deactivate</span>
                </button>
              ) : (
                <button className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors">
                  <RotateCcw className="w-5 h-5" />
                  <span>Reactivate</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Vendor Management</h2>
            <p className="text-white/60">Manage approved vendors with AI-powered performance tracking</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Primary Action Button */}
          <button
            onClick={() => setShowAddVendor(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vendor</span>
          </button>

          {/* Actions Dropdown */}
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActionsDropdown(!showActionsDropdown)}
              className="flex items-center space-x-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Actions</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showActionsDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[9999]">
                <div className="p-2">
                  <button
                    onClick={() => {
                      window.open('/vendor-application', '_blank')
                      setShowActionsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <UserPlus className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Vendor Application</div>
                      <div className="text-white/60 text-sm">Open application portal</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('Bulk invite vendors')
                      setShowActionsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Bulk Invite</div>
                      <div className="text-white/60 text-sm">Send invitations to multiple vendors</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      console.log('Import vendors')
                      setShowActionsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Upload className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Import Vendors</div>
                      <div className="text-white/60 text-sm">Import from CSV or Excel</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reports Dropdown */}
          <div className="relative" ref={reportsRef}>
            <button
              onClick={() => setShowReportsDropdown(!showReportsDropdown)}
              className="flex items-center space-x-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Reports</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showReportsDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[9999]">
                <div className="p-2">
                  <button
                    onClick={() => {
                      console.log('Generate performance report')
                      setShowReportsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Performance Report</div>
                      <div className="text-white/60 text-sm">AI scores and metrics</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('Generate financial report')
                      setShowReportsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-white font-medium">Financial Report</div>
                      <div className="text-white/60 text-sm">Revenue and cost analysis</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      console.log('Generate compliance report')
                      setShowReportsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Shield className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Compliance Report</div>
                      <div className="text-white/60 text-sm">Insurance and licenses</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      console.log('Export vendor data')
                      setShowReportsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Download className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">Export Data</div>
                      <div className="text-white/60 text-sm">Download as CSV/Excel</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="flex items-center space-x-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showSettingsDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-[9999]">
                <div className="p-2">
                  <button
                    onClick={() => {
                      console.log('Configure AI scoring')
                      setShowSettingsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Zap className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-white font-medium">AI Scoring</div>
                      <div className="text-white/60 text-sm">Configure scoring parameters</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('Notification settings')
                      setShowSettingsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">Notifications</div>
                      <div className="text-white/60 text-sm">Alerts and reminders</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      console.log('Vendor categories')
                      setShowSettingsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Building className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-white font-medium">Categories</div>
                      <div className="text-white/60 text-sm">Manage service categories</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      console.log('System preferences')
                      setShowSettingsDropdown(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 rounded-xl transition-colors text-left"
                  >
                    <Settings className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-white font-medium">Preferences</div>
                      <div className="text-white/60 text-sm">System settings</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{vendors.filter(v => v.status === 'active').length}</h3>
          <p className="text-white/60 text-sm">Active Vendors</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <XCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{vendors.filter(v => v.status === 'inactive').length}</h3>
          <p className="text-white/60 text-sm">Inactive Vendors</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {(vendors.filter(v => v.status === 'active').reduce((sum, v) => sum + v.aiScore, 0) / vendors.filter(v => v.status === 'active').length).toFixed(0)}
          </h3>
          <p className="text-white/60 text-sm">Avg AI Score</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            ${vendors.reduce((sum, v) => sum + v.totalRevenue, 0).toLocaleString()}
          </h3>
          <p className="text-white/60 text-sm">Total Revenue</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Status Tabs */}
          <div className="flex space-x-1 bg-white/10 rounded-2xl p-1">
            {[
              { id: 'active', label: 'Active', count: vendors.filter(v => v.status === 'active').length },
              { id: 'inactive', label: 'Inactive', count: vendors.filter(v => v.status === 'inactive').length },
              { id: 'suspended', label: 'Suspended', count: vendors.filter(v => v.status === 'suspended').length },
              { id: 'applications', label: 'Applications', count: 3 },
              { id: 'all', label: 'All', count: vendors.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800">
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'applications' ? (
        <VendorApplicationReview 
          onApprove={handleApproveApplication}
          onReject={handleRejectApplication}
          onRequestDocuments={handleRequestDocuments}
        />
      ) : (
        <>
          {/* Vendors Table */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/70 font-medium">Vendor</th>
                    <th className="text-left p-4 text-white/70 font-medium">Category</th>
                    <th className="text-left p-4 text-white/70 font-medium">Status</th>
                    <th className="text-left p-4 text-white/70 font-medium">AI Score</th>
                    <th className="text-left p-4 text-white/70 font-medium">Performance</th>
                    <th className="text-left p-4 text-white/70 font-medium">Revenue</th>
                    <th className="text-left p-4 text-white/70 font-medium">Risk</th>
                    <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {vendor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <span className="text-white font-medium block">{vendor.name}</span>
                            <span className="text-white/60 text-sm">{vendor.contactPerson}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white">{vendor.category}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg font-bold ${getAIScoreColor(vendor.aiScore)}`}>
                            {vendor.aiScore}
                          </span>
                          <Zap className={`w-4 h-4 ${getAIScoreColor(vendor.aiScore)}`} />
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-white text-sm">{vendor.rating}</span>
                          </div>
                          <div className="text-white/60 text-sm">
                            {vendor.completedJobs}/{vendor.totalJobs}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-green-400 font-medium">
                        ${vendor.totalRevenue.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`font-medium capitalize ${getRiskLevelColor(vendor.riskLevel)}`}>
                          {vendor.riskLevel}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewVendor(vendor)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-white/60" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4 text-white/60" />
                          </button>
                          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Message">
                            <MessageSquare className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">AI Performance Insights</h3>
                <p className="text-white/60">Data-driven vendor performance analysis and recommendations</p>
              </div>
              <Activity className="w-12 h-12 text-purple-400" />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Top Performer</h4>
                <p className="text-green-400 font-medium">{vendors.filter(v => v.status === 'active').sort((a, b) => b.aiScore - a.aiScore)[0]?.name}</p>
                <p className="text-white/60 text-sm">AI Score: {vendors.filter(v => v.status === 'active').sort((a, b) => b.aiScore - a.aiScore)[0]?.aiScore}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">Needs Attention</h4>
                <p className="text-yellow-400 font-medium">{vendors.filter(v => v.aiScore < 70 && v.status === 'active').length} vendors</p>
                <p className="text-white/60 text-sm">Below performance threshold</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-2">ROI Optimization</h4>
                <p className="text-blue-400 font-medium">15.3% improvement</p>
                <p className="text-white/60 text-sm">Potential cost savings identified</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vendor Details Modal */}
      {showVendorDetails && <VendorDetailsModal />}
    </div>
  )
}