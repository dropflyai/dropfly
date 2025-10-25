'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Camera,
  Upload,
  Eye,
  Download,
  User,
  CreditCard,
  FileText,
  Smartphone,
  Scan,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Flag,
  MapPin,
  Calendar,
  Hash,
  Fingerprint,
  UserCheck,
  Ban,
  Settings,
  Zap,
  Database,
  ExternalLink
} from 'lucide-react'

interface IdentityDocument {
  id: string
  document_type: 'drivers_license' | 'passport' | 'state_id' | 'military_id' | 'visa' | 'green_card'
  document_number: string
  issuing_state?: string
  issuing_country?: string
  expiration_date: string
  front_image_url?: string
  back_image_url?: string
  uploaded_at: string
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired'
  verification_notes?: string
  extracted_data?: {
    full_name: string
    date_of_birth: string
    address: string
    document_number: string
    expiration_date: string
  }
}

interface BiometricData {
  id: string
  biometric_type: 'facial_recognition' | 'voice_print' | 'fingerprint'
  capture_method: 'live_selfie' | 'liveness_check' | 'voice_recording'
  biometric_hash: string
  confidence_score: number
  verification_status: 'pending' | 'matched' | 'no_match' | 'inconclusive'
  captured_at: string
  reference_image_url?: string
}

interface BackgroundCheck {
  id: string
  check_type: 'criminal' | 'eviction' | 'credit' | 'employment' | 'identity'
  provider: 'experian' | 'transunion' | 'equifax' | 'lexisnexis' | 'corelogic'
  status: 'pending' | 'complete' | 'failed' | 'requires_review'
  score?: number
  results: any
  completed_at?: string
  cost: number
  report_url?: string
}

interface IdentityVerificationRecord {
  id: string
  applicant_id: string
  applicant_name: string
  email: string
  phone: string
  verification_level: 'none' | 'basic' | 'enhanced' | 'premium'
  overall_status: 'pending' | 'verified' | 'flagged' | 'rejected'
  risk_score: number
  created_at: string
  last_updated: string
  documents: IdentityDocument[]
  biometrics: BiometricData[]
  background_checks: BackgroundCheck[]
  verification_notes: string[]
  flags: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    detected_at: string
  }[]
}

interface IdentityVerificationProps {
  propertyId: string
  onVerificationComplete?: (applicantId: string, status: string) => void
}

export default function IdentityVerification({ propertyId, onVerificationComplete }: IdentityVerificationProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'verified' | 'flagged' | 'settings'>('dashboard')
  const [verifications, setVerifications] = useState<IdentityVerificationRecord[]>([])
  const [selectedVerification, setSelectedVerification] = useState<IdentityVerificationRecord | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDocumentViewer, setShowDocumentViewer] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<IdentityDocument | null>(null)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockVerifications: IdentityVerificationRecord[] = [
      {
        id: 'verify-001',
        applicant_id: 'app-001',
        applicant_name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        verification_level: 'premium',
        overall_status: 'verified',
        risk_score: 15,
        created_at: '2024-01-15T10:30:00Z',
        last_updated: '2024-01-16T14:22:00Z',
        documents: [
          {
            id: 'doc-001',
            document_type: 'drivers_license',
            document_number: 'D123456789',
            issuing_state: 'CA',
            expiration_date: '2026-08-15',
            front_image_url: '/documents/dl-front-001.jpg',
            back_image_url: '/documents/dl-back-001.jpg',
            uploaded_at: '2024-01-15T11:00:00Z',
            verification_status: 'verified',
            extracted_data: {
              full_name: 'Sarah Michelle Johnson',
              date_of_birth: '1990-03-22',
              address: '123 Main St, San Francisco, CA 94105',
              document_number: 'D123456789',
              expiration_date: '2026-08-15'
            }
          }
        ],
        biometrics: [
          {
            id: 'bio-001',
            biometric_type: 'facial_recognition',
            capture_method: 'liveness_check',
            biometric_hash: 'hash_abc123...',
            confidence_score: 0.96,
            verification_status: 'matched',
            captured_at: '2024-01-15T11:15:00Z',
            reference_image_url: '/biometrics/selfie-001.jpg'
          }
        ],
        background_checks: [
          {
            id: 'bg-001',
            check_type: 'criminal',
            provider: 'lexisnexis',
            status: 'complete',
            score: 85,
            results: { records_found: 0, clear: true },
            completed_at: '2024-01-16T09:30:00Z',
            cost: 25.00,
            report_url: '/reports/criminal-bg-001.pdf'
          },
          {
            id: 'bg-002',
            check_type: 'eviction',
            provider: 'corelogic',
            status: 'complete',
            score: 92,
            results: { evictions_found: 0, clear: true },
            completed_at: '2024-01-16T10:15:00Z',
            cost: 20.00,
            report_url: '/reports/eviction-bg-001.pdf'
          }
        ],
        verification_notes: [
          'Identity document verified against state database',
          'Facial recognition match with 96% confidence',
          'Background checks clear - no criminal or eviction history'
        ],
        flags: []
      },
      {
        id: 'verify-002',
        applicant_id: 'app-002',
        applicant_name: 'David Chen',
        email: 'david.chen@email.com',
        phone: '(555) 987-6543',
        verification_level: 'enhanced',
        overall_status: 'flagged',
        risk_score: 75,
        created_at: '2024-01-18T09:00:00Z',
        last_updated: '2024-01-18T16:45:00Z',
        documents: [
          {
            id: 'doc-002',
            document_type: 'passport',
            document_number: 'P987654321',
            issuing_country: 'US',
            expiration_date: '2028-12-01',
            front_image_url: '/documents/passport-001.jpg',
            uploaded_at: '2024-01-18T09:30:00Z',
            verification_status: 'verified',
            extracted_data: {
              full_name: 'David Wei Chen',
              date_of_birth: '1988-11-08',
              address: '',
              document_number: 'P987654321',
              expiration_date: '2028-12-01'
            }
          }
        ],
        biometrics: [
          {
            id: 'bio-002',
            biometric_type: 'facial_recognition',
            capture_method: 'live_selfie',
            biometric_hash: 'hash_def456...',
            confidence_score: 0.72,
            verification_status: 'inconclusive',
            captured_at: '2024-01-18T10:00:00Z',
            reference_image_url: '/biometrics/selfie-002.jpg'
          }
        ],
        background_checks: [
          {
            id: 'bg-003',
            check_type: 'identity',
            provider: 'experian',
            status: 'requires_review',
            results: { identity_confirmed: false, additional_verification_needed: true },
            completed_at: '2024-01-18T14:30:00Z',
            cost: 15.00
          }
        ],
        verification_notes: [
          'Passport verification successful',
          'Facial recognition confidence below threshold (72%)',
          'Identity verification requires manual review'
        ],
        flags: [
          {
            type: 'biometric_mismatch',
            severity: 'medium',
            description: 'Facial recognition confidence below acceptable threshold',
            detected_at: '2024-01-18T10:00:00Z'
          },
          {
            type: 'identity_inconsistency',
            severity: 'high',
            description: 'Identity verification failed - additional documents required',
            detected_at: '2024-01-18T14:30:00Z'
          }
        ]
      },
      {
        id: 'verify-003',
        applicant_id: 'app-003',
        applicant_name: 'Michael Rodriguez',
        email: 'mike.rodriguez@email.com',
        phone: '(555) 456-7890',
        verification_level: 'basic',
        overall_status: 'pending',
        risk_score: 35,
        created_at: '2024-01-20T14:15:00Z',
        last_updated: '2024-01-20T14:15:00Z',
        documents: [],
        biometrics: [],
        background_checks: [],
        verification_notes: ['Verification process initiated'],
        flags: []
      }
    ]

    setVerifications(mockVerifications)
  }, [])

  const getRiskColor = (score: number) => {
    if (score <= 25) return 'text-green-400 bg-green-500/20'
    if (score <= 50) return 'text-yellow-400 bg-yellow-500/20'
    if (score <= 75) return 'text-orange-400 bg-orange-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'flagged': return 'text-orange-400 bg-orange-500/20'
      case 'rejected': return 'text-red-400 bg-red-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'flagged': return <Flag className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  const getVerificationLevelBadge = (level: string) => {
    const colors = {
      'none': 'bg-gray-500/20 text-gray-400',
      'basic': 'bg-blue-500/20 text-blue-400',
      'enhanced': 'bg-purple-500/20 text-purple-400',
      'premium': 'bg-gold-500/20 text-gold-400'
    }
    return colors[level as keyof typeof colors] || colors.none
  }

  const approveVerification = async (verificationId: string) => {
    setVerifications(prev => 
      prev.map(v => 
        v.id === verificationId 
          ? { ...v, overall_status: 'verified' as const, risk_score: Math.max(0, v.risk_score - 20) }
          : v
      )
    )
    
    if (onVerificationComplete) {
      const verification = verifications.find(v => v.id === verificationId)
      if (verification) {
        onVerificationComplete(verification.applicant_id, 'verified')
      }
    }
  }

  const rejectVerification = async (verificationId: string) => {
    setVerifications(prev => 
      prev.map(v => 
        v.id === verificationId 
          ? { ...v, overall_status: 'rejected' as const }
          : v
      )
    )
    
    if (onVerificationComplete) {
      const verification = verifications.find(v => v.id === verificationId)
      if (verification) {
        onVerificationComplete(verification.applicant_id, 'rejected')
      }
    }
  }

  const requestAdditionalDocs = async (verificationId: string) => {
    console.log('Requesting additional documents for:', verificationId)
    // Would send notification to applicant requesting more documents
    alert('Additional documentation request sent to applicant')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Identity Verification</h1>
          <p className="text-white/60 mt-2">Comprehensive applicant identity verification and background screening</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Advanced Security Active</span>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Shield, count: verifications.length },
          { id: 'pending', label: 'Pending Review', icon: Clock, count: verifications.filter(v => v.overall_status === 'pending').length },
          { id: 'verified', label: 'Verified', icon: CheckCircle, count: verifications.filter(v => v.overall_status === 'verified').length },
          { id: 'flagged', label: 'Flagged', icon: Flag, count: verifications.filter(v => v.overall_status === 'flagged').length },
          { id: 'settings', label: 'Settings', icon: Settings }
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
              {tab.count !== undefined && (
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">+5%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{verifications.filter(v => v.overall_status === 'verified').length}</h3>
              <p className="text-white/60 text-sm">Verified Applicants</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-yellow-400 text-sm font-medium">-2</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{verifications.filter(v => v.overall_status === 'pending').length}</h3>
              <p className="text-white/60 text-sm">Pending Review</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flag className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-orange-400 text-sm font-medium">+1</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{verifications.filter(v => v.overall_status === 'flagged').length}</h3>
              <p className="text-white/60 text-sm">Flagged for Review</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-medium">98.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">
                {verifications.length > 0 ? Math.round((verifications.filter(v => v.overall_status !== 'rejected').length / verifications.length) * 100) : 0}%
              </h3>
              <p className="text-white/60 text-sm">Verification Success Rate</p>
            </div>
          </div>

          {/* Recent Verifications */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Recent Verification Activity</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {verifications.slice(0, 5).map((verification) => (
                <div key={verification.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-white">{verification.applicant_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(verification.overall_status)}`}>
                          {getStatusIcon(verification.overall_status)}
                          <span className="capitalize">{verification.overall_status}</span>
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getVerificationLevelBadge(verification.verification_level)}`}>
                          {verification.verification_level.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70 mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4" />
                          <span>{verification.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4" />
                          <span>{verification.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span className={`px-2 py-1 rounded text-xs ${getRiskColor(verification.risk_score)}`}>
                            Risk: {verification.risk_score}/100
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(verification.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Verification Progress */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-2">
                          <FileText className={`w-4 h-4 ${verification.documents.length > 0 ? 'text-green-400' : 'text-gray-400'}`} />
                          <span className="text-xs text-white/60">
                            Documents: {verification.documents.length}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Fingerprint className={`w-4 h-4 ${verification.biometrics.length > 0 ? 'text-green-400' : 'text-gray-400'}`} />
                          <span className="text-xs text-white/60">
                            Biometrics: {verification.biometrics.length}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Database className={`w-4 h-4 ${verification.background_checks.length > 0 ? 'text-green-400' : 'text-gray-400'}`} />
                          <span className="text-xs text-white/60">
                            Background: {verification.background_checks.filter(bg => bg.status === 'complete').length}/{verification.background_checks.length}
                          </span>
                        </div>
                      </div>

                      {/* Flags */}
                      {verification.flags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {verification.flags.map((flag, idx) => (
                            <span key={idx} className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${
                              flag.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                              flag.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                              flag.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              <AlertTriangle className="w-3 h-3" />
                              <span>{flag.type.replace('_', ' ')}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedVerification(verification)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-white/60" />
                      </button>
                      
                      {verification.overall_status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveVerification(verification.id)}
                            className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Approve verification"
                          >
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => rejectVerification(verification.id)}
                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="Reject verification"
                          >
                            <XCircle className="w-4 h-4 text-red-400" />
                          </button>
                        </>
                      )}
                      
                      {verification.overall_status === 'flagged' && (
                        <button
                          onClick={() => requestAdditionalDocs(verification.id)}
                          className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-medium hover:bg-orange-500/30 transition-colors"
                        >
                          Request Docs
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

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Pending Verifications</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {verifications.filter(v => v.overall_status === 'pending').map((verification) => (
                <div key={verification.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-white mb-2">{verification.applicant_name}</h4>
                      <p className="text-white/60 text-sm mb-4">
                        Started {new Date(verification.created_at).toLocaleDateString()} • Risk Score: {verification.risk_score}/100
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Identity Documents</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            verification.documents.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {verification.documents.length > 0 ? 'Uploaded' : 'Missing'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Biometric Verification</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            verification.biometrics.length > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {verification.biometrics.length > 0 ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Background Checks</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            verification.background_checks.length > 0 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {verification.background_checks.length > 0 ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedVerification(verification)}
                        className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedVerification.applicant_name}</h3>
                <p className="text-white/60">{selectedVerification.email} • {selectedVerification.phone}</p>
              </div>
              <button
                onClick={() => setSelectedVerification(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Verification Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Overall Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedVerification.overall_status)}`}>
                    {selectedVerification.overall_status}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70">Risk Score</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(selectedVerification.risk_score)}`}>
                    {selectedVerification.risk_score}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Verification Level</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getVerificationLevelBadge(selectedVerification.verification_level)}`}>
                    {selectedVerification.verification_level}
                  </span>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4">
                <h4 className="font-medium text-white mb-3">Documents</h4>
                <div className="space-y-2">
                  {selectedVerification.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between">
                      <span className="text-white/70 text-sm capitalize">{doc.document_type.replace('_', ' ')}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(doc.verification_status)}`}>
                        {doc.verification_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4">
                <h4 className="font-medium text-white mb-3">Background Checks</h4>
                <div className="space-y-2">
                  {selectedVerification.background_checks.map((check) => (
                    <div key={check.id} className="flex items-center justify-between">
                      <span className="text-white/70 text-sm capitalize">{check.check_type}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(check.status)}`}>
                        {check.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            {selectedVerification.documents.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-bold text-white mb-4">Identity Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVerification.documents.map((doc) => (
                    <div key={doc.id} className="bg-white/5 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-white capitalize">{doc.document_type.replace('_', ' ')}</h5>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(doc.verification_status)}`}>
                          {doc.verification_status}
                        </span>
                      </div>
                      
                      {doc.extracted_data && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/60">Name:</span>
                            <span className="text-white">{doc.extracted_data.full_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">DOB:</span>
                            <span className="text-white">{doc.extracted_data.date_of_birth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Expires:</span>
                            <span className="text-white">{doc.extracted_data.expiration_date}</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 mt-4">
                        {doc.front_image_url && (
                          <button
                            onClick={() => {
                              setSelectedDocument(doc)
                              setShowDocumentViewer(true)
                            }}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                          >
                            View Images
                          </button>
                        )}
                        <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors">
                          Verify
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setSelectedVerification(null)}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                Close
              </button>
              
              {selectedVerification.overall_status === 'pending' && (
                <>
                  <button
                    onClick={() => requestAdditionalDocs(selectedVerification.id)}
                    className="px-6 py-3 bg-orange-500/20 border border-orange-500/30 rounded-xl text-orange-400 font-medium hover:bg-orange-500/30 transition-colors"
                  >
                    Request More Docs
                  </button>
                  <button
                    onClick={() => {
                      rejectVerification(selectedVerification.id)
                      setSelectedVerification(null)
                    }}
                    className="px-6 py-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      approveVerification(selectedVerification.id)
                      setSelectedVerification(null)
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Document Images</h3>
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedDocument.front_image_url && (
                <div>
                  <h4 className="text-white/80 mb-2">Front</h4>
                  <img 
                    src={selectedDocument.front_image_url} 
                    alt="Document Front"
                    className="w-full h-64 object-cover rounded-xl border border-white/10"
                  />
                </div>
              )}
              {selectedDocument.back_image_url && (
                <div>
                  <h4 className="text-white/80 mb-2">Back</h4>
                  <img 
                    src={selectedDocument.back_image_url} 
                    alt="Document Back"
                    className="w-full h-64 object-cover rounded-xl border border-white/10"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}