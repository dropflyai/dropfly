'use client'

import React, { useState } from 'react'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Star, 
  FileText, 
  Download, 
  MessageSquare, 
  Calendar, 
  Award, 
  Shield, 
  CreditCard, 
  Filter, 
  Search, 
  MoreHorizontal,
  Edit3,
  Send,
  Archive,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Activity
} from 'lucide-react'

interface VendorApplication {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  businessType: string
  yearsInBusiness: number
  servicesOffered: string[]
  serviceArea: string[]
  employeeCount: number
  annualRevenue: string
  
  licenses: {
    type: string
    number: string
    expiryDate: string
    document?: string
  }[]
  
  insurance: {
    liability: {
      carrier: string
      policyNumber: string
      coverage: number
      expiryDate: string
      document?: string
    }
    workersComp: {
      carrier: string
      policyNumber: string
      expiryDate: string
      document?: string
    }
  }
  
  references: {
    companyName: string
    contactPerson: string
    phone: string
    email: string
    relationship: string
    yearsWorked: number
  }[]
  
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_documents'
  submissionDate: string
  reviewedBy?: string
  reviewDate?: string
  rejectionReason?: string
  notes: string
  riskScore?: number
  aiAssessment?: {
    score: number
    factors: string[]
    recommendations: string[]
  }
}

interface VendorApplicationReviewProps {
  onApprove?: (applicationId: string, notes: string) => void
  onReject?: (applicationId: string, reason: string) => void
  onRequestDocuments?: (applicationId: string, documents: string[]) => void
}

export default function VendorApplicationReview({
  onApprove,
  onReject,
  onRequestDocuments
}: VendorApplicationReviewProps) {
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_docs' | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  // Demo applications data
  const applications: VendorApplication[] = [
    {
      id: 'app-001',
      companyName: 'Swift Solutions LLC',
      contactPerson: 'Jennifer Adams',
      email: 'jennifer@swiftsolutions.com',
      phone: '(555) 789-0123',
      address: '456 Innovation Drive, Tech City, TC 54321',
      businessType: 'llc',
      yearsInBusiness: 3,
      servicesOffered: ['HVAC', 'Electrical'],
      serviceArea: ['Metro City', 'Suburban District'],
      employeeCount: 12,
      annualRevenue: '500k_1m',
      licenses: [
        {
          type: 'HVAC Contractor License',
          number: 'HVAC-2024-5567',
          expiryDate: '2025-12-31',
          document: 'hvac_license.pdf'
        },
        {
          type: 'Electrical Contractor License',
          number: 'ELC-2024-8899',
          expiryDate: '2025-11-30',
          document: 'electrical_license.pdf'
        }
      ],
      insurance: {
        liability: {
          carrier: 'Business Insurance Corp',
          policyNumber: 'BIC-789456',
          coverage: 2000000,
          expiryDate: '2025-08-15',
          document: 'liability_cert.pdf'
        },
        workersComp: {
          carrier: 'Workers Safety Inc',
          policyNumber: 'WSI-123789',
          expiryDate: '2025-08-15',
          document: 'workers_comp.pdf'
        }
      },
      references: [
        {
          companyName: 'Downtown Properties',
          contactPerson: 'Mark Thompson',
          phone: '(555) 111-2222',
          email: 'mark@downtownprops.com',
          relationship: 'Property Manager',
          yearsWorked: 2
        },
        {
          companyName: 'City Residential Group',
          contactPerson: 'Lisa Chen',
          phone: '(555) 333-4444',
          email: 'lisa@cityresgroup.com',
          relationship: 'Facilities Director',
          yearsWorked: 1
        }
      ],
      status: 'submitted',
      submissionDate: '2025-01-18',
      notes: '',
      riskScore: 85,
      aiAssessment: {
        score: 85,
        factors: [
          'Strong professional licenses in multiple trades',
          'Adequate insurance coverage',
          'Positive reference feedback',
          'Growing business with good revenue range'
        ],
        recommendations: [
          'Approve for HVAC and Electrical services',
          'Consider for preferred vendor status after 6 months',
          'Monitor performance closely in first quarter'
        ]
      }
    },
    {
      id: 'app-002',
      companyName: 'Budget Handyman Services',
      contactPerson: 'Joe Martinez',
      email: 'joe@budgethandyman.com',
      phone: '(555) 456-7890',
      address: '789 Service Lane, Value City, VC 98765',
      businessType: 'sole_proprietorship',
      yearsInBusiness: 1,
      servicesOffered: ['General Maintenance', 'Painting'],
      serviceArea: ['Local Area Only'],
      employeeCount: 3,
      annualRevenue: 'under_100k',
      licenses: [
        {
          type: 'General Business License',
          number: 'GBL-2024-1234',
          expiryDate: '2024-12-31',
          document: 'business_license.pdf'
        }
      ],
      insurance: {
        liability: {
          carrier: 'Cheap Insurance Co',
          policyNumber: 'CIC-456789',
          coverage: 500000,
          expiryDate: '2025-03-15',
          document: 'liability_basic.pdf'
        },
        workersComp: {
          carrier: 'Not Available',
          policyNumber: '',
          expiryDate: '',
          document: ''
        }
      },
      references: [
        {
          companyName: 'Local Apartments',
          contactPerson: 'Bob Wilson',
          phone: '(555) 999-8888',
          email: 'bob@localapts.com',
          relationship: 'Property Owner',
          yearsWorked: 1
        }
      ],
      status: 'under_review',
      submissionDate: '2025-01-17',
      reviewedBy: 'Admin User',
      notes: 'Needs workers compensation insurance before approval',
      riskScore: 42,
      aiAssessment: {
        score: 42,
        factors: [
          'New business with limited track record',
          'Insufficient insurance coverage',
          'Missing workers compensation',
          'Limited professional licenses',
          'Low revenue indicating small operation'
        ],
        recommendations: [
          'Request workers compensation insurance',
          'Require additional professional references',
          'Consider for general maintenance only',
          'Probationary period with close monitoring'
        ]
      }
    },
    {
      id: 'app-003',
      companyName: 'GreenScape Landscaping Pro',
      contactPerson: 'Maria Gonzalez',
      email: 'maria@greenscapepro.com',
      phone: '(555) 234-5678',
      address: '321 Garden Way, Nature City, NC 11223',
      businessType: 'corporation',
      yearsInBusiness: 8,
      servicesOffered: ['Landscaping'],
      serviceArea: ['Regional Service Area', 'Metro Districts'],
      employeeCount: 25,
      annualRevenue: '1m_5m',
      licenses: [
        {
          type: 'Landscaping Contractor License',
          number: 'LCL-2024-9876',
          expiryDate: '2025-10-31',
          document: 'landscape_license.pdf'
        },
        {
          type: 'Pesticide Applicator License',
          number: 'PAL-2024-5432',
          expiryDate: '2025-09-30',
          document: 'pesticide_license.pdf'
        }
      ],
      insurance: {
        liability: {
          carrier: 'Premier Business Insurance',
          policyNumber: 'PBI-654321',
          coverage: 5000000,
          expiryDate: '2025-12-31',
          document: 'premium_liability.pdf'
        },
        workersComp: {
          carrier: 'Safety First Insurance',
          policyNumber: 'SFI-789012',
          expiryDate: '2025-12-31',
          document: 'workers_comp_full.pdf'
        }
      },
      references: [
        {
          companyName: 'Luxury Estates Management',
          contactPerson: 'David Park',
          phone: '(555) 777-6666',
          email: 'david@luxuryestates.com',
          relationship: 'Regional Manager',
          yearsWorked: 5
        },
        {
          companyName: 'Metro Property Solutions',
          contactPerson: 'Sarah Kim',
          phone: '(555) 555-4444',
          email: 'sarah@metroprops.com',
          relationship: 'Operations Director',
          yearsWorked: 3
        }
      ],
      status: 'approved',
      submissionDate: '2025-01-15',
      reviewedBy: 'Senior Admin',
      reviewDate: '2025-01-16',
      notes: 'Excellent credentials and references. Approved for all landscaping services.',
      riskScore: 94,
      aiAssessment: {
        score: 94,
        factors: [
          'Established business with 8+ years experience',
          'Excellent insurance coverage',
          'Multiple professional licenses',
          'Strong revenue and employee base',
          'Outstanding reference feedback'
        ],
        recommendations: [
          'Approve for preferred vendor status',
          'Consider for exclusive landscaping contracts',
          'Excellent candidate for long-term partnership'
        ]
      }
    }
  ]

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus
    const matchesSearch = app.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.servicesOffered.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'under_review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'pending_documents': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const handleReviewAction = (action: 'approve' | 'reject' | 'request_docs') => {
    if (!selectedApplication) return

    switch (action) {
      case 'approve':
        onApprove?.(selectedApplication.id, reviewNotes)
        break
      case 'reject':
        onReject?.(selectedApplication.id, rejectionReason)
        break
      case 'request_docs':
        onRequestDocuments?.(selectedApplication.id, ['Workers Compensation Insurance'])
        break
    }

    setReviewAction(null)
    setReviewNotes('')
    setRejectionReason('')
    setShowDetails(false)
  }

  const ApplicationDetailsModal = () => {
    if (!selectedApplication) return null

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
                <h3 className="text-2xl font-bold text-white">{selectedApplication.companyName}</h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedApplication.status)}`}>
                    {selectedApplication.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-white/60">Applied: {selectedApplication.submissionDate}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <XCircle className="w-6 h-6 text-white/60" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* AI Assessment */}
              {selectedApplication.aiAssessment && (
                <div className="lg:col-span-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-white">AI Risk Assessment</h4>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getRiskScoreColor(selectedApplication.aiAssessment.score)}`}>
                        {selectedApplication.aiAssessment.score}
                      </div>
                      <div className="text-white/60 text-sm">Risk Score</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-white font-semibold mb-3">Assessment Factors</h5>
                      <ul className="space-y-2">
                        {selectedApplication.aiAssessment.factors.map((factor, index) => (
                          <li key={index} className="flex items-start space-x-2 text-white/70 text-sm">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-white font-semibold mb-3">AI Recommendations</h5>
                      <ul className="space-y-2">
                        {selectedApplication.aiAssessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2 text-white/70 text-sm">
                            <Star className="w-4 h-4 text-yellow-400 mt-0.5" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Information */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Company Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-blue-400" />
                    <span className="text-white">{selectedApplication.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-400" />
                    <span className="text-white">{selectedApplication.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span className="text-white">{selectedApplication.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    <span className="text-white text-sm">{selectedApplication.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-cyan-400" />
                    <span className="text-white capitalize">{selectedApplication.businessType.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Business Details</h4>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Years in Business:</span>
                    <span className="text-white font-semibold">{selectedApplication.yearsInBusiness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Employees:</span>
                    <span className="text-white font-semibold">{selectedApplication.employeeCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Revenue Range:</span>
                    <span className="text-white font-semibold capitalize">
                      {selectedApplication.annualRevenue.replace('_', ' to $')}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/70">Service Areas:</span>
                    <div className="mt-2 space-y-1">
                      {selectedApplication.serviceArea.map((area, index) => (
                        <div key={index} className="text-white text-sm bg-white/10 rounded-lg px-3 py-1">
                          {area}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Offered */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Services Offered</h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedApplication.servicesOffered.map((service, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-white/5 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">{service}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Licenses */}
              <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Licenses & Certifications</h4>
                <div className="space-y-4">
                  {selectedApplication.licenses.map((license, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-white font-semibold">{license.type}</h5>
                          <p className="text-white/70 text-sm">License #{license.number}</p>
                          <p className="text-white/60 text-sm">Expires: {license.expiryDate}</p>
                        </div>
                        {license.document && (
                          <button className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">Insurance Coverage</h4>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h5 className="text-white font-semibold mb-2">Liability Insurance</h5>
                    <div className="text-sm space-y-1">
                      <p className="text-white/70">Carrier: {selectedApplication.insurance.liability.carrier}</p>
                      <p className="text-white/70">Coverage: ${selectedApplication.insurance.liability.coverage.toLocaleString()}</p>
                      <p className="text-white/70">Expires: {selectedApplication.insurance.liability.expiryDate}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <h5 className="text-white font-semibold mb-2">Workers Compensation</h5>
                    <div className="text-sm space-y-1">
                      {selectedApplication.insurance.workersComp.carrier ? (
                        <>
                          <p className="text-white/70">Carrier: {selectedApplication.insurance.workersComp.carrier}</p>
                          <p className="text-white/70">Expires: {selectedApplication.insurance.workersComp.expiryDate}</p>
                        </>
                      ) : (
                        <p className="text-red-400">Not Available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Actions */}
            {selectedApplication.status !== 'approved' && selectedApplication.status !== 'rejected' && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="text-lg font-bold text-white mb-4">Review Actions</h4>
                
                {reviewAction && (
                  <div className="bg-white/5 rounded-2xl p-6 mb-6">
                    {reviewAction === 'approve' && (
                      <>
                        <h5 className="text-white font-semibold mb-3">Approve Application</h5>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Add approval notes..."
                          rows={4}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
                        />
                      </>
                    )}
                    
                    {reviewAction === 'reject' && (
                      <>
                        <h5 className="text-white font-semibold mb-3">Reject Application</h5>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          rows={4}
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400"
                        />
                      </>
                    )}

                    <div className="flex items-center space-x-4 mt-4">
                      <button
                        onClick={() => handleReviewAction(reviewAction)}
                        className={`px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 ${
                          reviewAction === 'approve' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400'
                            : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400'
                        }`}
                      >
                        Confirm {reviewAction === 'approve' ? 'Approval' : 'Rejection'}
                      </button>
                      <button
                        onClick={() => setReviewAction(null)}
                        className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {!reviewAction && (
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => setReviewAction('approve')}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    
                    <button
                      onClick={() => setReviewAction('reject')}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                    
                    <button
                      onClick={() => setReviewAction('request_docs')}
                      className="flex items-center space-x-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Request Documents</span>
                    </button>
                    
                    <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                      <span>Contact Vendor</span>
                    </button>
                  </div>
                )}
              </div>
            )}
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
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Vendor Applications</h2>
            <p className="text-white/60">Review and approve new vendor applications</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{applications.filter(a => a.status === 'submitted').length}</h3>
          <p className="text-white/60 text-sm">New Applications</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Eye className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{applications.filter(a => a.status === 'under_review').length}</h3>
          <p className="text-white/60 text-sm">Under Review</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{applications.filter(a => a.status === 'approved').length}</h3>
          <p className="text-white/60 text-sm">Approved</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Target className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">
            {Math.round(applications.reduce((sum, app) => sum + (app.aiAssessment?.score || 0), 0) / applications.length)}
          </h3>
          <p className="text-white/60 text-sm">Avg AI Score</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-1 bg-white/10 rounded-2xl p-1">
            {[
              { id: 'all', label: 'All', count: applications.length },
              { id: 'submitted', label: 'New', count: applications.filter(a => a.status === 'submitted').length },
              { id: 'under_review', label: 'Reviewing', count: applications.filter(a => a.status === 'under_review').length },
              { id: 'approved', label: 'Approved', count: applications.filter(a => a.status === 'approved').length },
              { id: 'rejected', label: 'Rejected', count: applications.filter(a => a.status === 'rejected').length }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterStatus === filter.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>

          <div className="flex space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => (
          <div key={application.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="text-lg font-bold text-white">{application.companyName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {application.aiAssessment && (
                    <div className="flex items-center space-x-2">
                      <span className="text-white/60 text-sm">AI Score:</span>
                      <span className={`font-bold ${getRiskScoreColor(application.aiAssessment.score)}`}>
                        {application.aiAssessment.score}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-white/60">Contact:</span>
                    <span className="text-white ml-2">{application.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Services:</span>
                    <span className="text-white ml-2">{application.servicesOffered.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-white/60">Experience:</span>
                    <span className="text-white ml-2">{application.yearsInBusiness} years</span>
                  </div>
                  <div>
                    <span className="text-white/60">Submitted:</span>
                    <span className="text-white ml-2">{application.submissionDate}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {application.servicesOffered.map((service, index) => (
                    <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white/70 text-xs">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-6">
                <button
                  onClick={() => {
                    setSelectedApplication(application)
                    setShowDetails(true)
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-300 hover:bg-purple-500/30 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  <span>Review</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Application Details Modal */}
      {showDetails && <ApplicationDetailsModal />}
    </div>
  )
}