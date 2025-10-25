'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  Building,
  Calendar,
  DollarSign,
  Shield,
  Eye,
  Edit,
  Copy,
  Settings,
  Zap,
  Users,
  Plus,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface RentalApplication {
  id: string
  prospect_id: string
  status: 'approved' | 'pending' | 'denied'
  primary_applicant: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  co_applicants?: {
    firstName: string
    lastName: string
    email: string
    relationship: string
  }[]
  unit_id: string
  unit_number: string
  requested_move_in_date: string
  lease_term_months: number
  monthly_rent: number
  security_deposit: number
  approved_rent?: number
  approved_deposit?: number
  approved_conditions?: string[]
  credit_score: number
  background_check_status: string
  income_verification_status: string
  employment_info: any
  rental_history: any
  created_at: string
}

interface LeaseTemplate {
  id: string
  name: string
  description: string
  lease_type: 'fixed' | 'month_to_month'
  default_term_months: number
  template_url: string
  required_fields: string[]
  optional_fields: string[]
}

interface GeneratedLease {
  id: string
  application_id: string
  lease_number: string
  status: 'draft' | 'generated' | 'sent_for_signature' | 'signed' | 'active'
  generated_at: string
  lease_start_date: string
  lease_end_date: string
  monthly_rent: number
  security_deposit: number
  document_url?: string
  signature_request_id?: string
}

interface LeaseGeneratorProps {
  propertyId: string
  onLeaseGenerated?: (lease: GeneratedLease) => void
}

export default function LeaseGenerator({ propertyId, onLeaseGenerated }: LeaseGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'applications' | 'templates' | 'generated'>('applications')
  const [approvedApplications, setApprovedApplications] = useState<RentalApplication[]>([])
  const [leaseTemplates, setLeaseTemplates] = useState<LeaseTemplate[]>([])
  const [generatedLeases, setGeneratedLeases] = useState<GeneratedLease[]>([])
  const [selectedApplication, setSelectedApplication] = useState<RentalApplication | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockApplications: RentalApplication[] = [
      {
        id: 'app-001',
        prospect_id: 'prospect-001',
        status: 'approved',
        primary_applicant: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          phone: '(555) 123-4567'
        },
        co_applicants: [
          {
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@email.com',
            relationship: 'spouse'
          }
        ],
        unit_id: 'unit-4b',
        unit_number: '4B',
        requested_move_in_date: '2024-02-01',
        lease_term_months: 12,
        monthly_rent: 2800,
        security_deposit: 2800,
        approved_rent: 2750,
        approved_deposit: 2750,
        approved_conditions: ['Pet deposit required', 'Parking space included'],
        credit_score: 720,
        background_check_status: 'clear',
        income_verification_status: 'verified',
        employment_info: { employer: 'Tech Corp', position: 'Software Engineer', income: 8500 },
        rental_history: { previous_landlord: 'ABC Properties', years: 2 },
        created_at: '2024-01-15'
      },
      {
        id: 'app-002',
        prospect_id: 'prospect-002',
        status: 'approved',
        primary_applicant: {
          firstName: 'David',
          lastName: 'Chen',
          email: 'david.chen@email.com',
          phone: '(555) 987-6543'
        },
        unit_id: 'unit-7a',
        unit_number: '7A',
        requested_move_in_date: '2024-02-15',
        lease_term_months: 6,
        monthly_rent: 2400,
        security_deposit: 2400,
        credit_score: 680,
        background_check_status: 'clear',
        income_verification_status: 'verified',
        employment_info: { employer: 'Design Studio', position: 'Designer', income: 6000 },
        rental_history: { previous_landlord: 'XYZ Management', years: 1 },
        created_at: '2024-01-18'
      }
    ]

    const mockTemplates: LeaseTemplate[] = [
      {
        id: 'template-1',
        name: 'Standard 12-Month Lease',
        description: 'Standard residential lease agreement for 12-month terms with all standard clauses',
        lease_type: 'fixed',
        default_term_months: 12,
        template_url: '/templates/standard-lease.pdf',
        required_fields: ['tenant_name', 'unit_number', 'monthly_rent', 'security_deposit', 'lease_start_date', 'lease_end_date'],
        optional_fields: ['pet_policy', 'parking_info', 'special_terms']
      },
      {
        id: 'template-2',
        name: 'Month-to-Month Agreement',
        description: 'Flexible month-to-month rental agreement with 30-day notice',
        lease_type: 'month_to_month',
        default_term_months: 1,
        template_url: '/templates/monthly-lease.pdf',
        required_fields: ['tenant_name', 'unit_number', 'monthly_rent', 'security_deposit', 'start_date'],
        optional_fields: ['utilities_included', 'house_rules']
      },
      {
        id: 'template-3',
        name: 'Corporate Housing Lease',
        description: 'Short-term lease for corporate housing and extended stays',
        lease_type: 'fixed',
        default_term_months: 3,
        template_url: '/templates/corporate-lease.pdf',
        required_fields: ['tenant_name', 'company_name', 'unit_number', 'monthly_rent', 'term'],
        optional_fields: ['furniture_included', 'utilities_included', 'cleaning_service']
      }
    ]

    const mockGeneratedLeases: GeneratedLease[] = [
      {
        id: 'lease-001',
        application_id: 'app-003',
        lease_number: 'LSE-2024-001234',
        status: 'signed',
        generated_at: '2024-01-12',
        lease_start_date: '2024-02-01',
        lease_end_date: '2025-01-31',
        monthly_rent: 2600,
        security_deposit: 2600,
        document_url: '/documents/lease-001-signed.pdf',
        signature_request_id: 'env-12345'
      },
      {
        id: 'lease-002',
        application_id: 'app-004',
        lease_number: 'LSE-2024-001235',
        status: 'sent_for_signature',
        generated_at: '2024-01-16',
        lease_start_date: '2024-02-15',
        lease_end_date: '2024-08-14',
        monthly_rent: 2200,
        security_deposit: 2200,
        document_url: '/documents/lease-002-draft.pdf',
        signature_request_id: 'env-67890'
      }
    ]

    setApprovedApplications(mockApplications)
    setLeaseTemplates(mockTemplates)
    setGeneratedLeases(mockGeneratedLeases)
  }, [])

  const generateLease = async (application: RentalApplication, templateId: string) => {
    setIsGenerating(true)
    try {
      // Here you would call your lease generation API
      console.log('Generating lease for application:', application.id, 'with template:', templateId)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const template = leaseTemplates.find(t => t.id === templateId)
      const leaseEndDate = new Date(application.requested_move_in_date)
      leaseEndDate.setMonth(leaseEndDate.getMonth() + application.lease_term_months)
      
      const newLease: GeneratedLease = {
        id: `lease-${Date.now()}`,
        application_id: application.id,
        lease_number: `LSE-${new Date().getFullYear()}-${Math.floor(Math.random() * 900000) + 100000}`,
        status: 'generated',
        generated_at: new Date().toISOString().split('T')[0],
        lease_start_date: application.requested_move_in_date,
        lease_end_date: leaseEndDate.toISOString().split('T')[0],
        monthly_rent: application.approved_rent || application.monthly_rent,
        security_deposit: application.approved_deposit || application.security_deposit,
        document_url: `/documents/lease-${Date.now()}.pdf`
      }

      setGeneratedLeases(prev => [newLease, ...prev])
      setSelectedApplication(null)
      setActiveTab('generated')
      
      if (onLeaseGenerated) {
        onLeaseGenerated(newLease)
      }
      
      alert('Lease generated successfully! You can now review and send for signatures.')
    } catch (error) {
      alert('Failed to generate lease. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const sendForSignature = async (lease: GeneratedLease) => {
    try {
      console.log('Sending lease for signature:', lease.id)
      
      // Update lease status
      setGeneratedLeases(prev => 
        prev.map(l => 
          l.id === lease.id 
            ? { ...l, status: 'sent_for_signature' as const, signature_request_id: `env-${Date.now()}` }
            : l
        )
      )
      
      alert('Lease sent for digital signatures!')
    } catch (error) {
      alert('Failed to send lease for signature.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed': return 'text-green-400 bg-green-500/20'
      case 'sent_for_signature': return 'text-blue-400 bg-blue-500/20'
      case 'generated': return 'text-yellow-400 bg-yellow-500/20'
      case 'active': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed': return <CheckCircle className="w-4 h-4" />
      case 'sent_for_signature': return <Send className="w-4 h-4" />
      case 'generated': return <FileText className="w-4 h-4" />
      case 'active': return <Shield className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Automated Lease Generation</h1>
          <p className="text-white/60 mt-2">Transform approved applications into lease agreements</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">Auto-Generation Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
        {[
          { id: 'applications', label: 'Approved Applications', icon: CheckCircle, count: approvedApplications.length },
          { id: 'templates', label: 'Lease Templates', icon: FileText, count: leaseTemplates.length },
          { id: 'generated', label: 'Generated Leases', icon: Download, count: generatedLeases.length }
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
              <span className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Approved Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Ready for Lease</p>
                  <h3 className="text-2xl font-bold text-white">{approvedApplications.filter(a => a.status === 'approved').length}</h3>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Credit Score</p>
                  <h3 className="text-2xl font-bold text-white">
                    {approvedApplications.length > 0 
                      ? Math.round(approvedApplications.reduce((acc, app) => acc + app.credit_score, 0) / approvedApplications.length)
                      : 'N/A'
                    }
                  </h3>
                </div>
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Monthly Rent</p>
                  <h3 className="text-2xl font-bold text-white">
                    ${Math.round(approvedApplications.reduce((acc, app) => acc + (app.approved_rent || app.monthly_rent), 0) / approvedApplications.length).toLocaleString()}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Applications Ready for Lease Generation</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {approvedApplications.map((application) => (
                <div key={application.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-medium text-white">
                          {application.primary_applicant.firstName} {application.primary_applicant.lastName}
                        </h4>
                        {application.co_applicants && application.co_applicants.length > 0 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            +{application.co_applicants.length} co-applicant{application.co_applicants.length > 1 ? 's' : ''}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70 mb-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>Unit {application.unit_number}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Move-in: {new Date(application.requested_move_in_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${(application.approved_rent || application.monthly_rent).toLocaleString()}/month</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>Credit: {application.credit_score}</span>
                        </div>
                      </div>

                      {application.approved_conditions && application.approved_conditions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-white/50 mb-1">Approved Conditions:</p>
                          <div className="flex flex-wrap gap-2">
                            {application.approved_conditions.map((condition, idx) => (
                              <span key={idx} className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Generate Lease</span>
                      </button>
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
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{template.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.lease_type === 'fixed' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {template.lease_type === 'fixed' ? 'Fixed Term' : 'Month-to-Month'}
                      </span>
                    </div>
                    <p className="text-white/70 mb-4">{template.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white/50 mb-2">Required Fields:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.required_fields.slice(0, 3).map((field) => (
                            <span key={field} className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                              {field.replace('_', ' ')}
                            </span>
                          ))}
                          {template.required_fields.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                              +{template.required_fields.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-white/50 mb-2">Optional Fields:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.optional_fields.slice(0, 3).map((field) => (
                            <span key={field} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                              {field.replace('_', ' ')}
                            </span>
                          ))}
                          {template.optional_fields.length > 3 && (
                            <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded">
                              +{template.optional_fields.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => window.open(template.template_url, '_blank')}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      Preview
                    </button>
                    <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
                      <Edit className="w-4 h-4 mr-2 inline" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Leases Tab */}
      {activeTab === 'generated' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Generated</p>
                  <h3 className="text-2xl font-bold text-white">{generatedLeases.length}</h3>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Pending Signature</p>
                  <h3 className="text-2xl font-bold text-white">
                    {generatedLeases.filter(l => l.status === 'sent_for_signature').length}
                  </h3>
                </div>
                <Send className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Fully Signed</p>
                  <h3 className="text-2xl font-bold text-white">
                    {generatedLeases.filter(l => l.status === 'signed').length}
                  </h3>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">This Month</p>
                  <h3 className="text-2xl font-bold text-white">
                    {generatedLeases.filter(l => {
                      const genDate = new Date(l.generated_at)
                      const now = new Date()
                      return genDate.getMonth() === now.getMonth() && genDate.getFullYear() === now.getFullYear()
                    }).length}
                  </h3>
                </div>
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Generated Leases List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Generated Lease Agreements</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {generatedLeases.map((lease) => (
                <div key={lease.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-white">{lease.lease_number}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(lease.status)}`}>
                          {getStatusIcon(lease.status)}
                          <span className="capitalize">{lease.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(lease.lease_start_date).toLocaleDateString()} - {new Date(lease.lease_end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${lease.monthly_rent.toLocaleString()}/month</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span>${lease.security_deposit.toLocaleString()} deposit</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Generated {new Date(lease.generated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      {lease.document_url && (
                        <button
                          onClick={() => window.open(lease.document_url, '_blank')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Download lease document"
                        >
                          <Download className="w-4 h-4 text-blue-400" />
                        </button>
                      )}
                      
                      {lease.status === 'generated' && (
                        <button
                          onClick={() => sendForSignature(lease)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Send for Signature</span>
                        </button>
                      )}
                      
                      {lease.status === 'sent_for_signature' && (
                        <button
                          className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 font-medium"
                          disabled
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Awaiting Signatures
                        </button>
                      )}
                      
                      {lease.status === 'signed' && (
                        <button
                          className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 font-medium"
                          disabled
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Fully Signed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lease Generation Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Generate Lease Agreement</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Application Summary */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <h4 className="font-semibold text-white mb-4">Application Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/50">Tenant</p>
                  <p className="text-white">{selectedApplication.primary_applicant.firstName} {selectedApplication.primary_applicant.lastName}</p>
                </div>
                <div>
                  <p className="text-white/50">Unit</p>
                  <p className="text-white">{selectedApplication.unit_number}</p>
                </div>
                <div>
                  <p className="text-white/50">Move-in Date</p>
                  <p className="text-white">{new Date(selectedApplication.requested_move_in_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-white/50">Monthly Rent</p>
                  <p className="text-white">${(selectedApplication.approved_rent || selectedApplication.monthly_rent).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="mb-6">
              <label className="block text-white/80 font-medium mb-3">Select Lease Template</label>
              <div className="space-y-3">
                {leaseTemplates.map((template) => (
                  <label key={template.id} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selectedTemplate === template.id}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-white">{template.name}</h5>
                      <p className="text-white/60 text-sm">{template.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => generateLease(selectedApplication, selectedTemplate)}
                disabled={!selectedTemplate || isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Lease</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}