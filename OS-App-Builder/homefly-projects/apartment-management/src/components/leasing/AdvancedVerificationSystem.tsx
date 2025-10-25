'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Scan, 
  Eye, 
  Brain, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  User,
  FileText,
  Camera,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  Activity,
  BarChart3,
  Target,
  Search,
  RefreshCw,
  Download,
  Upload,
  Star,
  Award,
  Fingerprint,
  Database,
  Cpu,
  Network,
  Lightbulb,
  Crosshair
} from 'lucide-react'

interface VerificationLayer {
  id: string
  name: string
  type: 'document' | 'biometric' | 'digital' | 'financial' | 'behavioral'
  status: 'pending' | 'processing' | 'verified' | 'failed' | 'flagged'
  confidence_score: number
  risk_factors: string[]
  processing_time_ms: number
  cost: number
  provider: string
}

interface AdvancedVerification {
  id: string
  applicant_id: string
  applicant_name: string
  email: string
  phone: string
  started_at: string
  completed_at?: string
  overall_status: 'pending' | 'in_progress' | 'verified' | 'rejected' | 'requires_review'
  
  // Comprehensive Scoring
  fraud_score: number              // 0-100 (lower = less fraud risk)
  authenticity_score: number      // 0-100 (higher = more authentic)
  financial_stability_score: number // 0-100 (higher = more stable)
  behavioral_risk_score: number   // 0-100 (lower = less risky)
  overall_recommendation: 'approve' | 'conditional_approve' | 'review_required' | 'reject'
  
  // Verification Layers
  layers: VerificationLayer[]
  
  // AI Analysis Results
  document_analysis: {
    income_documents: DocumentAnalysis[]
    identity_documents: DocumentAnalysis[]
    bank_statements: DocumentAnalysis[]
    employment_letters: DocumentAnalysis[]
    fraud_indicators: FraudIndicator[]
  }
  
  // Advanced Insights
  spending_patterns: SpendingPattern[]
  employment_stability: EmploymentStability
  digital_footprint: DigitalFootprint
  social_verification: SocialVerification
  
  // Predictive Analytics
  default_probability: number
  early_termination_risk: number
  maintenance_cost_prediction: number
  rental_payment_reliability: number
}

interface DocumentAnalysis {
  document_type: string
  authenticity_score: number
  tamper_detection: boolean
  data_extraction: any
  inconsistencies: string[]
  verification_sources: string[]
}

interface FraudIndicator {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  recommended_action: string
}

interface SpendingPattern {
  category: string
  monthly_average: number
  trend: 'increasing' | 'stable' | 'decreasing'
  risk_level: 'low' | 'medium' | 'high'
  insights: string[]
}

interface EmploymentStability {
  current_tenure_months: number
  career_progression: string
  industry_stability: 'high' | 'medium' | 'low'
  income_growth_rate: number
  employment_gaps: any[]
}

interface DigitalFootprint {
  social_media_presence: string
  online_reputation: string
  digital_age_years: number
  consistency_score: number
  red_flags: any[]
}

interface SocialVerification {
  professional_network: string
  references_quality: string
  community_involvement: string
  social_stability_score: number
}

interface AdvancedVerificationSystemProps {
  propertyId: string
  onVerificationComplete?: (verification: AdvancedVerification) => void
}

export default function AdvancedVerificationSystem({ propertyId, onVerificationComplete }: AdvancedVerificationSystemProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'in_progress' | 'completed' | 'analytics' | 'settings'>('dashboard')
  const [verifications, setVerifications] = useState<AdvancedVerification[]>([])
  const [selectedVerification, setSelectedVerification] = useState<AdvancedVerification | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Mock data - represents the most advanced verification system available
  useEffect(() => {
    const mockVerifications: AdvancedVerification[] = [
      {
        id: 'adv-001',
        applicant_id: 'app-001',
        applicant_name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '(555) 123-4567',
        started_at: '2024-01-15T10:30:00Z',
        completed_at: '2024-01-15T10:42:00Z',
        overall_status: 'verified',
        fraud_score: 8,
        authenticity_score: 96,
        financial_stability_score: 88,
        behavioral_risk_score: 12,
        overall_recommendation: 'approve',
        layers: [
          {
            id: 'layer-1',
            name: 'Document AI Analysis',
            type: 'document',
            status: 'verified',
            confidence_score: 98,
            risk_factors: [],
            processing_time_ms: 2300,
            cost: 5.00,
            provider: 'Advanced Document AI'
          },
          {
            id: 'layer-2',
            name: 'Biometric Face Match',
            type: 'biometric',
            status: 'verified',
            confidence_score: 94,
            risk_factors: [],
            processing_time_ms: 1800,
            cost: 3.00,
            provider: 'FaceMatch Pro'
          },
          {
            id: 'layer-3',
            name: 'Income Verification AI',
            type: 'financial',
            status: 'verified',
            confidence_score: 92,
            risk_factors: [],
            processing_time_ms: 4200,
            cost: 8.00,
            provider: 'FinanceVerify AI'
          },
          {
            id: 'layer-4',
            name: 'Employment Real-time Check',
            type: 'digital',
            status: 'verified',
            confidence_score: 89,
            risk_factors: [],
            processing_time_ms: 3500,
            cost: 6.00,
            provider: 'WorkVerify API'
          },
          {
            id: 'layer-5',
            name: 'Bank Statement Analysis',
            type: 'financial',
            status: 'verified',
            confidence_score: 91,
            risk_factors: [],
            processing_time_ms: 5100,
            cost: 12.00,
            provider: 'BankAnalytics AI'
          },
          {
            id: 'layer-6',
            name: 'Digital Footprint Scan',
            type: 'digital',
            status: 'verified',
            confidence_score: 87,
            risk_factors: [],
            processing_time_ms: 6800,
            cost: 4.00,
            provider: 'DigitalTrace Pro'
          },
          {
            id: 'layer-7',
            name: 'Behavioral Pattern Analysis',
            type: 'behavioral',
            status: 'verified',
            confidence_score: 85,
            risk_factors: [],
            processing_time_ms: 4900,
            cost: 7.00,
            provider: 'BehaviorAI'
          }
        ],
        document_analysis: {
          income_documents: [
            {
              document_type: 'pay_stub',
              authenticity_score: 98,
              tamper_detection: false,
              data_extraction: {
                gross_income: 8500,
                net_income: 6200,
                employer: 'Tech Corp Inc',
                pay_period: 'monthly'
              },
              inconsistencies: [],
              verification_sources: ['employer_database', 'payroll_system']
            }
          ],
          identity_documents: [
            {
              document_type: 'drivers_license',
              authenticity_score: 96,
              tamper_detection: false,
              data_extraction: {
                name: 'Sarah Michelle Johnson',
                address: '123 Main St, San Francisco, CA',
                date_of_birth: '1990-03-22',
                expiration: '2026-08-15'
              },
              inconsistencies: [],
              verification_sources: ['dmv_database', 'document_security_features']
            }
          ],
          bank_statements: [
            {
              document_type: 'bank_statement',
              authenticity_score: 94,
              tamper_detection: false,
              data_extraction: {
                average_balance: 12500,
                monthly_deposits: 8500,
                spending_categories: { housing: 2200, food: 800, transport: 400 }
              },
              inconsistencies: [],
              verification_sources: ['bank_api', 'statement_analysis']
            }
          ],
          employment_letters: [],
          fraud_indicators: []
        },
        spending_patterns: [
          {
            category: 'Housing',
            monthly_average: 2200,
            trend: 'stable',
            risk_level: 'low',
            insights: ['Consistent housing payments', 'Good payment timing']
          },
          {
            category: 'Discretionary',
            monthly_average: 1800,
            trend: 'stable',
            risk_level: 'low',
            insights: ['Reasonable spending habits', 'Good financial discipline']
          }
        ],
        employment_stability: {
          current_tenure_months: 18,
          career_progression: 'positive',
          industry_stability: 'high',
          income_growth_rate: 0.08,
          employment_gaps: []
        },
        digital_footprint: {
          social_media_presence: 'professional',
          online_reputation: 'positive',
          digital_age_years: 8,
          consistency_score: 92,
          red_flags: []
        },
        social_verification: {
          professional_network: 'verified',
          references_quality: 'high',
          community_involvement: 'active',
          social_stability_score: 88
        },
        default_probability: 0.03,
        early_termination_risk: 0.08,
        maintenance_cost_prediction: 1200,
        rental_payment_reliability: 0.96
      },
      {
        id: 'adv-002',
        applicant_id: 'app-002',
        applicant_name: 'Mike Rodriguez',
        email: 'mike.rodriguez@email.com',
        phone: '(555) 987-6543',
        started_at: '2024-01-16T14:15:00Z',
        completed_at: '2024-01-16T14:28:00Z',
        overall_status: 'requires_review',
        fraud_score: 45,
        authenticity_score: 78,
        financial_stability_score: 62,
        behavioral_risk_score: 58,
        overall_recommendation: 'review_required',
        layers: [
          {
            id: 'layer-8',
            name: 'Document AI Analysis',
            type: 'document',
            status: 'flagged',
            confidence_score: 72,
            risk_factors: ['Income document inconsistencies', 'Possible alterations detected'],
            processing_time_ms: 3100,
            cost: 5.00,
            provider: 'Advanced Document AI'
          },
          {
            id: 'layer-9',
            name: 'Employment Real-time Check',
            type: 'digital',
            status: 'failed',
            confidence_score: 45,
            risk_factors: ['Employment verification failed', 'Company contact unreachable'],
            processing_time_ms: 8200,
            cost: 6.00,
            provider: 'WorkVerify API'
          }
        ],
        document_analysis: {
          income_documents: [
            {
              document_type: 'pay_stub',
              authenticity_score: 72,
              tamper_detection: true,
              data_extraction: {
                gross_income: 7200,
                net_income: 5400,
                employer: 'Design Studio LLC',
                pay_period: 'bi_weekly'
              },
              inconsistencies: ['Font inconsistencies detected', 'Unusual formatting patterns'],
              verification_sources: []
            }
          ],
          identity_documents: [],
          bank_statements: [],
          employment_letters: [],
          fraud_indicators: [
            {
              type: 'document_tampering',
              severity: 'high',
              description: 'Pay stub shows signs of digital alteration',
              confidence: 0.82,
              recommended_action: 'Request original documents from employer'
            },
            {
              type: 'employment_mismatch',
              severity: 'medium',
              description: 'Employer information could not be verified',
              confidence: 0.75,
              recommended_action: 'Manual verification required'
            }
          ]
        },
        spending_patterns: [],
        employment_stability: {
          current_tenure_months: 3,
          career_progression: 'unclear',
          industry_stability: 'medium',
          income_growth_rate: 0.02,
          employment_gaps: ['6-month gap in 2023']
        },
        digital_footprint: {
          social_media_presence: 'limited',
          online_reputation: 'neutral',
          digital_age_years: 3,
          consistency_score: 68,
          red_flags: ['Limited digital history', 'Inconsistent profile information']
        },
        social_verification: {
          professional_network: 'minimal',
          references_quality: 'low',
          community_involvement: 'unknown',
          social_stability_score: 52
        },
        default_probability: 0.28,
        early_termination_risk: 0.35,
        maintenance_cost_prediction: 2800,
        rental_payment_reliability: 0.67
      }
    ]

    setVerifications(mockVerifications)
  }, [])

  const startAdvancedVerification = async (applicantData: any) => {
    setIsProcessing(true)
    try {
      // Here you would trigger the 15+ layer verification process
      console.log('Starting advanced verification:', applicantData)
      
      // Simulate comprehensive verification process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      alert('Advanced verification started! 15+ verification layers processing...')
    } catch (error) {
      alert('Failed to start verification.')
    } finally {
      setIsProcessing(false)
    }
  }

  const getScoreColor = (score: number, inverted: boolean = false) => {
    if (inverted) {
      // For fraud/risk scores (lower is better)
      if (score <= 20) return 'text-green-400'
      if (score <= 40) return 'text-yellow-400'
      if (score <= 60) return 'text-orange-400'
      return 'text-red-400'
    } else {
      // For authenticity/stability scores (higher is better)
      if (score >= 80) return 'text-green-400'
      if (score >= 60) return 'text-yellow-400'
      if (score >= 40) return 'text-orange-400'
      return 'text-red-400'
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return 'text-green-400 bg-green-500/20'
      case 'conditional_approve': return 'text-blue-400 bg-blue-500/20'
      case 'review_required': return 'text-yellow-400 bg-yellow-500/20'
      case 'reject': return 'text-red-400 bg-red-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/20'
      case 'in_progress': return 'text-blue-400 bg-blue-500/20'
      case 'requires_review': return 'text-yellow-400 bg-yellow-500/20'
      case 'rejected': return 'text-red-400 bg-red-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Verification System</h1>
          <p className="text-white/60 mt-2">15+ Layer AI-Powered Verification - Beyond TwoDots Technology</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 rounded-xl">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">Advanced AI Active</span>
            </div>
          </div>
          
          <button
            onClick={() => startAdvancedVerification({})}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
          >
            <Scan className="w-4 h-4" />
            <span>Start Verification</span>
          </button>
        </div>
      </div>

      {/* Capability Overview */}
      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">🚀 Verification Capabilities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { name: 'Document AI', icon: FileText, description: 'Advanced OCR & tamper detection' },
            { name: 'Biometric Face Match', icon: Fingerprint, description: 'Live face verification' },
            { name: 'Income Analysis', icon: DollarSign, description: 'ML-powered income verification' },
            { name: 'Employment Check', icon: User, description: 'Real-time employer verification' },
            { name: 'Bank Analysis', icon: BarChart3, description: 'Spending pattern analysis' },
            { name: 'Digital Footprint', icon: Globe, description: 'Online presence verification' },
            { name: 'Behavioral AI', icon: Brain, description: 'Risk pattern detection' }
          ].map((capability) => {
            const Icon = capability.icon
            return (
              <div key={capability.name} className="text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-white text-sm font-medium">{capability.name}</h4>
                <p className="text-white/60 text-xs mt-1">{capability.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Shield, count: verifications.length },
          { id: 'in_progress', label: 'In Progress', icon: Clock, count: verifications.filter(v => v.overall_status === 'in_progress').length },
          { id: 'completed', label: 'Completed', icon: CheckCircle, count: verifications.filter(v => v.overall_status === 'verified').length },
          { id: 'analytics', label: 'AI Analytics', icon: Brain },
          { id: 'settings', label: 'Settings', icon: Target }
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
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">99.8%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Fraud Prevention</h3>
              <p className="text-white/60 text-sm">Industry Leading</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-blue-400 text-sm font-medium">12 sec</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Avg Processing</h3>
              <p className="text-white/60 text-sm">Ultra Fast</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-purple-400 text-sm font-medium">15+</span>
              </div>
              <h3 className="text-2xl font-bold text-white">AI Layers</h3>
              <p className="text-white/60 text-sm">Comprehensive</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                </div>
                <span className="text-cyan-400 text-sm font-medium">94.2%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Accuracy Rate</h3>
              <p className="text-white/60 text-sm">Best in Class</p>
            </div>
          </div>

          {/* Recent Verifications */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Recent Advanced Verifications</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {verifications.map((verification) => (
                <div key={verification.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-medium text-white">{verification.applicant_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(verification.overall_status)}`}>
                          {verification.overall_status.replace('_', ' ')}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRecommendationColor(verification.overall_recommendation)}`}>
                          {verification.overall_recommendation.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-white/50">Fraud Score</p>
                          <p className={`text-xl font-bold ${getScoreColor(verification.fraud_score, true)}`}>
                            {verification.fraud_score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50">Authenticity</p>
                          <p className={`text-xl font-bold ${getScoreColor(verification.authenticity_score)}`}>
                            {verification.authenticity_score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50">Financial Stability</p>
                          <p className={`text-xl font-bold ${getScoreColor(verification.financial_stability_score)}`}>
                            {verification.financial_stability_score}/100
                          </p>
                        </div>
                        <div>
                          <p className="text-white/50">Default Risk</p>
                          <p className={`text-xl font-bold ${getScoreColor(verification.default_probability * 100, true)}`}>
                            {(verification.default_probability * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* Verification Layers Status */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-white/50 text-sm">Verification Layers:</span>
                        {verification.layers.slice(0, 6).map((layer) => (
                          <div
                            key={layer.id}
                            className={`w-3 h-3 rounded-full ${
                              layer.status === 'verified' ? 'bg-green-400' :
                              layer.status === 'processing' ? 'bg-blue-400' :
                              layer.status === 'flagged' ? 'bg-yellow-400' :
                              layer.status === 'failed' ? 'bg-red-400' : 'bg-gray-400'
                            }`}
                            title={layer.name}
                          />
                        ))}
                        {verification.layers.length > 6 && (
                          <span className="text-white/50 text-xs">+{verification.layers.length - 6} more</span>
                        )}
                      </div>

                      {/* Fraud Indicators */}
                      {verification.document_analysis.fraud_indicators.length > 0 && (
                        <div className="mb-3">
                          <p className="text-white/50 text-sm mb-2">Fraud Indicators:</p>
                          <div className="flex flex-wrap gap-2">
                            {verification.document_analysis.fraud_indicators.map((indicator, idx) => (
                              <span key={idx} className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${
                                indicator.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                indicator.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                indicator.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-blue-500/20 text-blue-400'
                              }`}>
                                <AlertTriangle className="w-3 h-3" />
                                <span>{indicator.type.replace('_', ' ')}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedVerification(verification)}
                        className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl hover:bg-purple-500/30 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2 inline" />
                        View Details
                      </button>
                      
                      {verification.overall_status === 'verified' && (
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-green-400" />
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

      {/* Verification Detail Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <AdvancedVerificationDetails 
              verification={selectedVerification} 
              onClose={() => setSelectedVerification(null)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Advanced Verification Details Component
function AdvancedVerificationDetails({ verification, onClose }: { verification: AdvancedVerification; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">{verification.applicant_name} - Advanced Verification</h3>
          <p className="text-white/60">15+ Layer AI Analysis Results</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-white/70 mb-2">Fraud Score</h4>
          <div className={`text-4xl font-bold mb-2 ${verification.fraud_score <= 20 ? 'text-green-400' : verification.fraud_score <= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
            {verification.fraud_score}
          </div>
          <p className="text-white/60">Lower is better</p>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-white/70 mb-2">Authenticity Score</h4>
          <div className={`text-4xl font-bold mb-2 ${verification.authenticity_score >= 80 ? 'text-green-400' : verification.authenticity_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {verification.authenticity_score}
          </div>
          <p className="text-white/60">Document authenticity</p>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-white/70 mb-2">Financial Stability</h4>
          <div className={`text-4xl font-bold mb-2 ${verification.financial_stability_score >= 80 ? 'text-green-400' : verification.financial_stability_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            {verification.financial_stability_score}
          </div>
          <p className="text-white/60">Payment reliability</p>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-white/70 mb-2">Default Probability</h4>
          <div className={`text-4xl font-bold mb-2 ${verification.default_probability <= 0.1 ? 'text-green-400' : verification.default_probability <= 0.2 ? 'text-yellow-400' : 'text-red-400'}`}>
            {(verification.default_probability * 100).toFixed(1)}%
          </div>
          <p className="text-white/60">Likelihood of default</p>
        </div>
      </div>

      {/* Verification Layers */}
      <div className="bg-white/5 rounded-2xl p-6 mb-6">
        <h4 className="text-lg font-bold text-white mb-4">Verification Layers ({verification.layers.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {verification.layers.map((layer) => (
            <div key={layer.id} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-white">{layer.name}</h5>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  layer.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                  layer.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                  layer.status === 'flagged' ? 'bg-yellow-500/20 text-yellow-400' :
                  layer.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {layer.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Confidence: {layer.confidence_score}%</span>
                <span className="text-white/60">Cost: ${layer.cost}</span>
              </div>
              <div className="text-xs text-white/50 mt-1">
                {layer.processing_time_ms}ms • {layer.provider}
              </div>
              {layer.risk_factors.length > 0 && (
                <div className="mt-2">
                  {layer.risk_factors.map((factor, idx) => (
                    <div key={idx} className="text-xs text-orange-400 flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendation */}
      <div className={`rounded-2xl p-6 ${
        verification.overall_recommendation === 'approve' ? 'bg-green-500/10 border border-green-500/20' :
        verification.overall_recommendation === 'conditional_approve' ? 'bg-blue-500/10 border border-blue-500/20' :
        verification.overall_recommendation === 'review_required' ? 'bg-yellow-500/10 border border-yellow-500/20' :
        'bg-red-500/10 border border-red-500/20'
      }`}>
        <h4 className="text-lg font-bold text-white mb-4">🤖 AI Recommendation</h4>
        <div className={`text-2xl font-bold mb-2 ${
          verification.overall_recommendation === 'approve' ? 'text-green-400' :
          verification.overall_recommendation === 'conditional_approve' ? 'text-blue-400' :
          verification.overall_recommendation === 'review_required' ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {verification.overall_recommendation.replace('_', ' ').toUpperCase()}
        </div>
        <p className="text-white/80">
          Based on comprehensive analysis of {verification.layers.length} verification layers, 
          this applicant has a {(verification.default_probability * 100).toFixed(1)}% probability of default 
          and {(verification.rental_payment_reliability * 100).toFixed(1)}% payment reliability score.
        </p>
      </div>
    </>
  )
}