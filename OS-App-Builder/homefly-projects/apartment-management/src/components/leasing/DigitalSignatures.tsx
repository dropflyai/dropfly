'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  PenTool, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Eye,
  Users,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Building,
  Plus,
  Upload,
  Trash2
} from 'lucide-react'

interface SignatureRequest {
  id: string
  documentName: string
  leaseId: string
  tenantName: string
  unitNumber: string
  status: 'draft' | 'sent' | 'in_progress' | 'completed' | 'declined' | 'expired'
  sentDate?: string
  completedDate?: string
  expiresDate?: string
  provider: 'docusign' | 'hellosign' | 'adobe_sign'
  envelopeId?: string
  signers: {
    id: string
    name: string
    email: string
    role: string
    status: 'pending' | 'signed' | 'declined'
    signedDate?: string
  }[]
  documentUrl?: string
  certificateUrl?: string
}

interface LeaseTemplate {
  id: string
  name: string
  description: string
  documentUrl: string
  fields: {
    name: string
    type: 'text' | 'signature' | 'date' | 'checkbox'
    required: boolean
  }[]
}

interface DigitalSignaturesProps {
  propertyId: string
  onSignatureCompleted?: (requestId: string) => void
}

export default function DigitalSignatures({ propertyId, onSignatureCompleted }: DigitalSignaturesProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'templates' | 'create'>('requests')
  const [signatureRequests, setSignatureRequests] = useState<SignatureRequest[]>([])
  const [leaseTemplates, setLeaseTemplates] = useState<LeaseTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockRequests: SignatureRequest[] = [
      {
        id: '1',
        documentName: 'Lease Agreement - Unit 4B',
        leaseId: 'lease-001',
        tenantName: 'Sarah Johnson',
        unitNumber: '4B',
        status: 'in_progress',
        sentDate: '2024-01-15',
        expiresDate: '2024-01-29',
        provider: 'docusign',
        envelopeId: 'env-12345',
        signers: [
          {
            id: 'signer-1',
            name: 'Sarah Johnson',
            email: 'sarah@email.com',
            role: 'Tenant',
            status: 'signed',
            signedDate: '2024-01-16'
          },
          {
            id: 'signer-2',
            name: 'Property Manager',
            email: 'manager@property.com',
            role: 'Landlord',
            status: 'pending'
          }
        ]
      },
      {
        id: '2',
        documentName: 'Lease Agreement - Unit 7A',
        leaseId: 'lease-002',
        tenantName: 'Mike Rodriguez',
        unitNumber: '7A',
        status: 'completed',
        sentDate: '2024-01-10',
        completedDate: '2024-01-12',
        provider: 'hellosign',
        signers: [
          {
            id: 'signer-3',
            name: 'Mike Rodriguez',
            email: 'mike@email.com',
            role: 'Tenant',
            status: 'signed',
            signedDate: '2024-01-12'
          },
          {
            id: 'signer-4',
            name: 'Property Manager',
            email: 'manager@property.com',
            role: 'Landlord',
            status: 'signed',
            signedDate: '2024-01-12'
          }
        ],
        documentUrl: '/documents/signed-lease-002.pdf',
        certificateUrl: '/documents/certificate-002.pdf'
      }
    ]

    const mockTemplates: LeaseTemplate[] = [
      {
        id: 'template-1',
        name: 'Standard 12-Month Lease',
        description: 'Standard residential lease agreement for 12-month terms',
        documentUrl: '/templates/standard-lease.pdf',
        fields: [
          { name: 'tenant_name', type: 'text', required: true },
          { name: 'unit_number', type: 'text', required: true },
          { name: 'monthly_rent', type: 'text', required: true },
          { name: 'lease_start_date', type: 'date', required: true },
          { name: 'tenant_signature', type: 'signature', required: true },
          { name: 'landlord_signature', type: 'signature', required: true }
        ]
      },
      {
        id: 'template-2',
        name: 'Month-to-Month Agreement',
        description: 'Flexible month-to-month rental agreement',
        documentUrl: '/templates/monthly-lease.pdf',
        fields: [
          { name: 'tenant_name', type: 'text', required: true },
          { name: 'unit_number', type: 'text', required: true },
          { name: 'monthly_rent', type: 'text', required: true },
          { name: 'start_date', type: 'date', required: true },
          { name: 'tenant_signature', type: 'signature', required: true },
          { name: 'landlord_signature', type: 'signature', required: true }
        ]
      }
    ]

    setSignatureRequests(mockRequests)
    setLeaseTemplates(mockTemplates)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'in_progress': return 'text-blue-400 bg-blue-500/20'
      case 'sent': return 'text-yellow-400 bg-yellow-500/20'
      case 'declined': return 'text-red-400 bg-red-500/20'
      case 'expired': return 'text-gray-400 bg-gray-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'sent': return <Send className="w-4 h-4" />
      case 'declined': return <XCircle className="w-4 h-4" />
      case 'expired': return <AlertTriangle className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const sendSignatureRequest = async (templateId: string, leaseData: any) => {
    setIsLoading(true)
    try {
      // Here you would integrate with DocuSign/HelloSign API
      console.log('Sending signature request:', { templateId, leaseData })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add new request to list
      const newRequest: SignatureRequest = {
        id: `req-${Date.now()}`,
        documentName: `Lease Agreement - Unit ${leaseData.unitNumber}`,
        leaseId: leaseData.leaseId,
        tenantName: leaseData.tenantName,
        unitNumber: leaseData.unitNumber,
        status: 'sent',
        sentDate: new Date().toISOString().split('T')[0],
        expiresDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        provider: 'docusign',
        envelopeId: `env-${Date.now()}`,
        signers: [
          {
            id: 'signer-tenant',
            name: leaseData.tenantName,
            email: leaseData.tenantEmail,
            role: 'Tenant',
            status: 'pending'
          },
          {
            id: 'signer-landlord',
            name: 'Property Manager',
            email: 'manager@property.com',
            role: 'Landlord',
            status: 'pending'
          }
        ]
      }

      setSignatureRequests(prev => [newRequest, ...prev])
      setActiveTab('requests')
      alert('Signature request sent successfully!')
    } catch (error) {
      alert('Failed to send signature request.')
    } finally {
      setIsLoading(false)
    }
  }

  const resendRequest = async (requestId: string) => {
    try {
      // API call to resend
      console.log('Resending request:', requestId)
      alert('Signature request resent successfully!')
    } catch (error) {
      alert('Failed to resend request.')
    }
  }

  const voidRequest = async (requestId: string) => {
    try {
      // API call to void
      console.log('Voiding request:', requestId)
      setSignatureRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'expired' as const }
            : req
        )
      )
      alert('Signature request voided successfully!')
    } catch (error) {
      alert('Failed to void request.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Digital Signatures</h1>
          <p className="text-white/60 mt-2">Manage lease agreements and digital signatures</p>
        </div>
        
        <button
          onClick={() => setActiveTab('create')}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
        >
          <Plus className="w-4 h-4" />
          <span>Create Request</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
        {[
          { id: 'requests', label: 'Signature Requests', icon: FileText },
          { id: 'templates', label: 'Lease Templates', icon: Upload },
          { id: 'create', label: 'Create New', icon: Plus }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Signature Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Requests</p>
                  <h3 className="text-2xl font-bold text-white">{signatureRequests.length}</h3>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending</p>
                  <h3 className="text-2xl font-bold text-white">
                    {signatureRequests.filter(r => ['sent', 'in_progress'].includes(r.status)).length}
                  </h3>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Completed</p>
                  <h3 className="text-2xl font-bold text-white">
                    {signatureRequests.filter(r => r.status === 'completed').length}
                  </h3>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">This Week</p>
                  <h3 className="text-2xl font-bold text-white">
                    {signatureRequests.filter(r => {
                      const reqDate = new Date(r.sentDate || '')
                      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      return reqDate > weekAgo
                    }).length}
                  </h3>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Recent Signature Requests</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {signatureRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-white">{request.documentName}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="capitalize">{request.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70 mb-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>Unit {request.unitNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{request.tenantName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Sent {request.sentDate}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="capitalize">{request.provider}</span>
                        </div>
                      </div>

                      {/* Signers Status */}
                      <div className="flex items-center space-x-4 mb-4">
                        {request.signers.map((signer) => (
                          <div key={signer.id} className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${
                              signer.status === 'signed' ? 'bg-green-400' :
                              signer.status === 'declined' ? 'bg-red-400' : 'bg-yellow-400'
                            }`} />
                            <span className="text-white/70 text-sm">
                              {signer.name} ({signer.role})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {request.status === 'completed' && (
                        <>
                          <button
                            onClick={() => window.open(request.documentUrl, '_blank')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Download signed document"
                          >
                            <Download className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => window.open(request.certificateUrl, '_blank')}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="View certificate"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                        </>
                      )}
                      
                      {['sent', 'in_progress'].includes(request.status) && (
                        <>
                          <button
                            onClick={() => resendRequest(request.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            title="Resend request"
                          >
                            <Send className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => voidRequest(request.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Void request"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid gap-6">
            {leaseTemplates.map((template) => (
              <div key={template.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
                    <p className="text-white/70 mb-4">{template.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {template.fields.slice(0, 4).map((field) => (
                        <div key={field.name} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            field.type === 'signature' ? 'bg-purple-400' :
                            field.type === 'date' ? 'bg-blue-400' :
                            field.type === 'checkbox' ? 'bg-green-400' : 'bg-gray-400'
                          }`} />
                          <span className="text-white/60 capitalize">{field.name.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => window.open(template.documentUrl, '_blank')}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template.id)
                        setActiveTab('create')
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create New Request Tab */}
      {activeTab === 'create' && (
        <CreateSignatureRequest
          templates={leaseTemplates}
          selectedTemplate={selectedTemplate}
          onSend={sendSignatureRequest}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

// Create Signature Request Component
function CreateSignatureRequest({ 
  templates, 
  selectedTemplate, 
  onSend, 
  isLoading 
}: {
  templates: LeaseTemplate[]
  selectedTemplate: string
  onSend: (templateId: string, data: any) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState({
    templateId: selectedTemplate,
    tenantName: '',
    tenantEmail: '',
    unitNumber: '',
    monthlyRent: '',
    leaseStartDate: '',
    leaseEndDate: '',
    securityDeposit: '',
    leaseId: `lease-${Date.now()}`
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.templateId || !formData.tenantName || !formData.tenantEmail) {
      alert('Please fill in all required fields')
      return
    }
    onSend(formData.templateId, formData)
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-white mb-6">Create Signature Request</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selection */}
        <div>
          <label className="block text-white/80 font-medium mb-2">Lease Template *</label>
          <select
            value={formData.templateId}
            onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          >
            <option value="">Select a template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id} className="bg-gray-900">
                {template.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tenant Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 font-medium mb-2">Tenant Name *</label>
            <input
              type="text"
              value={formData.tenantName}
              onChange={(e) => setFormData(prev => ({ ...prev, tenantName: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Enter tenant full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-white/80 font-medium mb-2">Tenant Email *</label>
            <input
              type="email"
              value={formData.tenantEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, tenantEmail: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="tenant@email.com"
              required
            />
          </div>
        </div>

        {/* Lease Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 font-medium mb-2">Unit Number</label>
            <input
              type="text"
              value={formData.unitNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="4B"
            />
          </div>
          
          <div>
            <label className="block text-white/80 font-medium mb-2">Monthly Rent</label>
            <input
              type="number"
              value={formData.monthlyRent}
              onChange={(e) => setFormData(prev => ({ ...prev, monthlyRent: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="2500"
            />
          </div>
          
          <div>
            <label className="block text-white/80 font-medium mb-2">Security Deposit</label>
            <input
              type="number"
              value={formData.securityDeposit}
              onChange={(e) => setFormData(prev => ({ ...prev, securityDeposit: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="2500"
            />
          </div>
        </div>

        {/* Lease Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 font-medium mb-2">Lease Start Date</label>
            <input
              type="date"
              value={formData.leaseStartDate}
              onChange={(e) => setFormData(prev => ({ ...prev, leaseStartDate: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          
          <div>
            <label className="block text-white/80 font-medium mb-2">Lease End Date</label>
            <input
              type="date"
              value={formData.leaseEndDate}
              onChange={(e) => setFormData(prev => ({ ...prev, leaseEndDate: e.target.value }))}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
          >
            Save Draft
          </button>
          
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send for Signature</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}