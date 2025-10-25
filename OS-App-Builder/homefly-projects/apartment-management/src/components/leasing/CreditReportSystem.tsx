'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  Building,
  Download,
  RefreshCw,
  FileText,
  Eye,
  Zap,
  Target,
  BarChart3,
  PieChart,
  Info,
  XCircle,
  Star,
  Fingerprint,
  Lock,
  Unlock,
  History,
  Percent,
  Plus,
  Minus
} from 'lucide-react'

interface CreditReport {
  id: string
  applicant_id: string
  applicant_name: string
  bureau: 'experian' | 'transunion' | 'equifax'
  report_type: 'basic' | 'standard' | 'premium'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  cost: number
  credit_score: number
  ordered_at: string
  completed_at?: string
  report_url?: string
  
  // Credit Analysis
  score_range: string
  score_factors: {
    payment_history: number
    credit_utilization: number
    length_of_history: number
    new_credit: number
    credit_mix: number
  }
  
  // Account Information
  total_accounts: number
  open_accounts: number
  closed_accounts: number
  total_credit_limit: number
  total_balance: number
  utilization_rate: number
  
  // Payment History
  on_time_payments: number
  late_payments: number
  missed_payments: number
  collections: number
  bankruptcies: number
  
  // Red Flags
  red_flags: {
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    detected_at: string
  }[]
  
  // Rental-Specific Analysis
  rental_related_debt: number
  eviction_records: number
  utility_collections: number
  
  // AI Risk Assessment
  ai_risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  risk_factors: string[]
  recommendations: string[]
}

interface CreditReportSystemProps {
  propertyId: string
  onReportCompleted?: (report: CreditReport) => void
}

export default function CreditReportSystem({ propertyId, onReportCompleted }: CreditReportSystemProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'analytics' | 'settings'>('pending')
  const [creditReports, setCreditReports] = useState<CreditReport[]>([])
  const [selectedReport, setSelectedReport] = useState<CreditReport | null>(null)
  const [isOrdering, setIsOrdering] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)

  // Credit bureau pricing
  const bureauPricing = {
    experian: { basic: 15.00, standard: 25.00, premium: 35.00 },
    transunion: { basic: 12.00, standard: 22.00, premium: 32.00 },
    equifax: { basic: 14.00, standard: 24.00, premium: 34.00 }
  }

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockReports: CreditReport[] = [
      {
        id: 'cr-001',
        applicant_id: 'app-001',
        applicant_name: 'Sarah Johnson',
        bureau: 'experian',
        report_type: 'premium',
        status: 'completed',
        cost: 35.00,
        credit_score: 742,
        ordered_at: '2024-01-15T10:30:00Z',
        completed_at: '2024-01-15T10:32:00Z',
        report_url: '/reports/credit-cr-001.pdf',
        score_range: 'Excellent',
        score_factors: {
          payment_history: 95,
          credit_utilization: 15,
          length_of_history: 85,
          new_credit: 90,
          credit_mix: 80
        },
        total_accounts: 12,
        open_accounts: 8,
        closed_accounts: 4,
        total_credit_limit: 85000,
        total_balance: 12750,
        utilization_rate: 15,
        on_time_payments: 98,
        late_payments: 2,
        missed_payments: 0,
        collections: 0,
        bankruptcies: 0,
        red_flags: [],
        rental_related_debt: 0,
        eviction_records: 0,
        utility_collections: 0,
        ai_risk_score: 8,
        risk_level: 'low',
        risk_factors: [],
        recommendations: [
          'Excellent credit profile - approve immediately',
          'Consider offering premium unit or discount for quality tenant',
          'Fast-track application due to strong financial profile'
        ]
      },
      {
        id: 'cr-002',
        applicant_id: 'app-002',
        applicant_name: 'Mike Rodriguez',
        bureau: 'transunion',
        report_type: 'standard',
        status: 'completed',
        cost: 22.00,
        credit_score: 628,
        ordered_at: '2024-01-16T14:15:00Z',
        completed_at: '2024-01-16T14:18:00Z',
        report_url: '/reports/credit-cr-002.pdf',
        score_range: 'Fair',
        score_factors: {
          payment_history: 65,
          credit_utilization: 85,
          length_of_history: 70,
          new_credit: 60,
          credit_mix: 75
        },
        total_accounts: 8,
        open_accounts: 6,
        closed_accounts: 2,
        total_credit_limit: 25000,
        total_balance: 21250,
        utilization_rate: 85,
        on_time_payments: 82,
        late_payments: 15,
        missed_payments: 3,
        collections: 1,
        bankruptcies: 0,
        red_flags: [
          {
            type: 'high_utilization',
            severity: 'medium',
            description: 'Credit utilization above 80% indicates financial stress',
            detected_at: '2024-01-16T14:18:00Z'
          },
          {
            type: 'recent_collection',
            severity: 'high',
            description: 'Collection account opened in last 12 months',
            detected_at: '2024-01-16T14:18:00Z'
          }
        ],
        rental_related_debt: 2400,
        eviction_records: 0,
        utility_collections: 1,
        ai_risk_score: 68,
        risk_level: 'medium',
        risk_factors: [
          'High credit utilization indicates cash flow issues',
          'Recent collection activity shows payment difficulties',
          'Rental-related debt suggests previous housing payment issues'
        ],
        recommendations: [
          'Require additional security deposit (1.5x monthly rent)',
          'Request guarantor or co-signer',
          'Verify current income is 4x monthly rent (instead of 3x)',
          'Consider shorter lease term initially'
        ]
      },
      {
        id: 'cr-003',
        applicant_id: 'app-003',
        applicant_name: 'Jennifer Chen',
        bureau: 'experian',
        report_type: 'premium',
        status: 'processing',
        cost: 35.00,
        credit_score: 0,
        ordered_at: '2024-01-18T09:45:00Z',
        score_range: 'Pending',
        score_factors: {
          payment_history: 0,
          credit_utilization: 0,
          length_of_history: 0,
          new_credit: 0,
          credit_mix: 0
        },
        total_accounts: 0,
        open_accounts: 0,
        closed_accounts: 0,
        total_credit_limit: 0,
        total_balance: 0,
        utilization_rate: 0,
        on_time_payments: 0,
        late_payments: 0,
        missed_payments: 0,
        collections: 0,
        bankruptcies: 0,
        red_flags: [],
        rental_related_debt: 0,
        eviction_records: 0,
        utility_collections: 0,
        ai_risk_score: 0,
        risk_level: 'medium',
        risk_factors: [],
        recommendations: []
      }
    ]

    setCreditReports(mockReports)
  }, [])

  const orderCreditReport = async (applicantData: any) => {
    setIsOrdering(true)
    try {
      // Here you would integrate with credit bureau APIs
      console.log('Ordering credit report:', applicantData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReport: CreditReport = {
        id: `cr-${Date.now()}`,
        applicant_id: applicantData.applicantId,
        applicant_name: applicantData.applicantName,
        bureau: applicantData.bureau,
        report_type: applicantData.reportType,
        status: 'processing',
        cost: bureauPricing[applicantData.bureau][applicantData.reportType],
        credit_score: 0,
        ordered_at: new Date().toISOString(),
        score_range: 'Pending',
        score_factors: {
          payment_history: 0,
          credit_utilization: 0,
          length_of_history: 0,
          new_credit: 0,
          credit_mix: 0
        },
        total_accounts: 0,
        open_accounts: 0,
        closed_accounts: 0,
        total_credit_limit: 0,
        total_balance: 0,
        utilization_rate: 0,
        on_time_payments: 0,
        late_payments: 0,
        missed_payments: 0,
        collections: 0,
        bankruptcies: 0,
        red_flags: [],
        rental_related_debt: 0,
        eviction_records: 0,
        utility_collections: 0,
        ai_risk_score: 0,
        risk_level: 'medium',
        risk_factors: [],
        recommendations: []
      }

      setCreditReports(prev => [newReport, ...prev])
      setShowOrderForm(false)
      
      // Simulate completion after 3 seconds
      setTimeout(() => {
        setCreditReports(prev => 
          prev.map(report => 
            report.id === newReport.id 
              ? { ...report, status: 'completed' as const, completed_at: new Date().toISOString() }
              : report
          )
        )
      }, 3000)

      alert('Credit report ordered successfully!')
    } catch (error) {
      alert('Failed to order credit report.')
    } finally {
      setIsOrdering(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 740) return 'text-green-400'
    if (score >= 670) return 'text-blue-400'
    if (score >= 580) return 'text-yellow-400'
    if (score >= 500) return 'text-orange-400'
    return 'text-red-400'
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'critical': return 'text-red-400 bg-red-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20'
      case 'processing': return 'text-blue-400 bg-blue-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Credit Report System</h1>
          <p className="text-white/60 mt-2">Real-time credit pulls with AI-powered risk assessment</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-blue-500/30 rounded-xl">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">AI Analysis Active</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowOrderForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Order Report</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
        {[
          { id: 'pending', label: 'Pending Orders', icon: Clock, count: creditReports.filter(r => r.status === 'pending' || r.status === 'processing').length },
          { id: 'completed', label: 'Completed Reports', icon: CheckCircle, count: creditReports.filter(r => r.status === 'completed').length },
          { id: 'analytics', label: 'AI Analytics', icon: BarChart3 },
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

      {/* Pending Orders Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Processing</p>
                  <h3 className="text-2xl font-bold text-white">{creditReports.filter(r => r.status === 'processing').length}</h3>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">This Month</p>
                  <h3 className="text-2xl font-bold text-white">{creditReports.length}</h3>
                </div>
                <CreditCard className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Spent</p>
                  <h3 className="text-2xl font-bold text-white">
                    {formatCurrency(creditReports.reduce((sum, r) => sum + r.cost, 0))}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg Response</p>
                  <h3 className="text-2xl font-bold text-white">2.3 min</h3>
                </div>
                <Zap className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Recent Orders</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {creditReports.filter(r => r.status === 'pending' || r.status === 'processing').map((report) => (
                <div key={report.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-white">{report.applicant_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded uppercase">
                          {report.bureau}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-white/70">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Ordered {new Date(report.ordered_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{formatCurrency(report.cost)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span className="capitalize">{report.report_type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {report.status === 'processing' 
                              ? 'Processing...' 
                              : 'In queue'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {report.status === 'processing' && (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400" />
                      )}
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <RefreshCw className="w-4 h-4 text-white/60" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completed Reports Tab */}
      {activeTab === 'completed' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Completed Credit Reports</h3>
            </div>
            
            <div className="divide-y divide-white/5">
              {creditReports.filter(r => r.status === 'completed').map((report) => (
                <div key={report.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-medium text-white">{report.applicant_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          Completed
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(report.risk_level)}`}>
                          {report.risk_level.toUpperCase()} RISK
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-white/50">Credit Score</p>
                          <p className={`text-xl font-bold ${getScoreColor(report.credit_score)}`}>
                            {report.credit_score}
                          </p>
                          <p className="text-white/60 text-xs">{report.score_range}</p>
                        </div>
                        <div>
                          <p className="text-white/50">AI Risk Score</p>
                          <p className="text-xl font-bold text-white">{report.ai_risk_score}/100</p>
                          <p className="text-white/60 text-xs">AI Assessment</p>
                        </div>
                        <div>
                          <p className="text-white/50">Utilization</p>
                          <p className="text-xl font-bold text-white">{report.utilization_rate}%</p>
                          <p className="text-white/60 text-xs">Credit Usage</p>
                        </div>
                        <div>
                          <p className="text-white/50">Payment History</p>
                          <p className="text-xl font-bold text-white">{report.on_time_payments}%</p>
                          <p className="text-white/60 text-xs">On-time Payments</p>
                        </div>
                      </div>

                      {/* Red Flags */}
                      {report.red_flags.length > 0 && (
                        <div className="mb-4">
                          <p className="text-white/50 text-sm mb-2">Red Flags:</p>
                          <div className="flex flex-wrap gap-2">
                            {report.red_flags.map((flag, idx) => (
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
                        </div>
                      )}

                      {/* AI Recommendations */}
                      {report.recommendations.length > 0 && (
                        <div className="mb-4">
                          <p className="text-white/50 text-sm mb-2">AI Recommendations:</p>
                          <ul className="space-y-1">
                            {report.recommendations.slice(0, 2).map((rec, idx) => (
                              <li key={idx} className="text-white/70 text-sm flex items-start space-x-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2 inline" />
                        View Details
                      </button>
                      
                      {report.report_url && (
                        <button
                          onClick={() => window.open(report.report_url, '_blank')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Download PDF report"
                        >
                          <Download className="w-4 h-4 text-white/60" />
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

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Order Credit Report</h3>
              <button
                onClick={() => setShowOrderForm(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <OrderCreditReportForm 
              onSubmit={orderCreditReport} 
              onCancel={() => setShowOrderForm(false)}
              isLoading={isOrdering}
              pricing={bureauPricing}
            />
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <CreditReportDetails 
              report={selectedReport} 
              onClose={() => setSelectedReport(null)} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Order Form Component
function OrderCreditReportForm({ onSubmit, onCancel, isLoading, pricing }: any) {
  const [formData, setFormData] = useState({
    applicantId: '',
    applicantName: '',
    applicantEmail: '',
    ssn: '',
    dateOfBirth: '',
    bureau: 'experian',
    reportType: 'standard'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.applicantName || !formData.ssn || !formData.dateOfBirth) {
      alert('Please fill in all required fields')
      return
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Applicant Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 font-medium mb-2">Applicant Name *</label>
          <input
            type="text"
            value={formData.applicantName}
            onChange={(e) => setFormData(prev => ({ ...prev, applicantName: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Full name"
            required
          />
        </div>
        
        <div>
          <label className="block text-white/80 font-medium mb-2">Email</label>
          <input
            type="email"
            value={formData.applicantEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, applicantEmail: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="applicant@email.com"
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 font-medium mb-2">SSN (Last 4 digits) *</label>
          <input
            type="text"
            value={formData.ssn}
            onChange={(e) => setFormData(prev => ({ ...prev, ssn: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="1234"
            maxLength={4}
            required
          />
        </div>
        
        <div>
          <label className="block text-white/80 font-medium mb-2">Date of Birth *</label>
          <input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            required
          />
        </div>
      </div>

      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/80 font-medium mb-2">Credit Bureau</label>
          <select
            value={formData.bureau}
            onChange={(e) => setFormData(prev => ({ ...prev, bureau: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="experian" className="bg-gray-900">Experian</option>
            <option value="transunion" className="bg-gray-900">TransUnion</option>
            <option value="equifax" className="bg-gray-900">Equifax</option>
          </select>
        </div>
        
        <div>
          <label className="block text-white/80 font-medium mb-2">Report Type</label>
          <select
            value={formData.reportType}
            onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value }))}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="basic" className="bg-gray-900">Basic - ${pricing[formData.bureau]?.basic}</option>
            <option value="standard" className="bg-gray-900">Standard - ${pricing[formData.bureau]?.standard}</option>
            <option value="premium" className="bg-gray-900">Premium - ${pricing[formData.bureau]?.premium}</option>
          </select>
        </div>
      </div>

      {/* Cost Display */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-white/80">Total Cost:</span>
          <span className="text-2xl font-bold text-blue-400">
            ${pricing[formData.bureau]?.[formData.reportType] || '0.00'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Ordering...</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Order Report</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

// Credit Report Details Component
function CreditReportDetails({ report, onClose }: { report: CreditReport; onClose: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white">{report.applicant_name} - Credit Report</h3>
          <p className="text-white/60">Detailed analysis and AI recommendations</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Credit Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-white/70 mb-2">Credit Score</h4>
          <div className={`text-4xl font-bold mb-2 ${report.credit_score >= 740 ? 'text-green-400' : report.credit_score >= 670 ? 'text-blue-400' : report.credit_score >= 580 ? 'text-yellow-400' : 'text-red-400'}`}>
            {report.credit_score}
          </div>
          <p className="text-white/60">{report.score_range}</p>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-white/70 mb-2">AI Risk Score</h4>
          <div className="text-4xl font-bold text-white mb-2">{report.ai_risk_score}</div>
          <p className={`px-3 py-1 rounded-full text-xs font-medium ${
            report.risk_level === 'low' ? 'bg-green-500/20 text-green-400' :
            report.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
            report.risk_level === 'high' ? 'bg-orange-500/20 text-orange-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {report.risk_level.toUpperCase()} RISK
          </p>
        </div>
        
        <div className="bg-white/5 rounded-2xl p-6 text-center">
          <h4 className="text-white/70 mb-2">Credit Utilization</h4>
          <div className="text-4xl font-bold text-white mb-2">{report.utilization_rate}%</div>
          <p className="text-white/60">
            ${report.total_balance.toLocaleString()} / ${report.total_credit_limit.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Score Factors */}
      <div className="bg-white/5 rounded-2xl p-6 mb-6">
        <h4 className="text-lg font-bold text-white mb-4">Credit Score Factors</h4>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(report.score_factors).map(([factor, score]) => (
            <div key={factor} className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-white/20"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - score / 100)}`}
                    className={score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{score}</span>
                </div>
              </div>
              <p className="text-white/70 text-xs capitalize">{factor.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6">
          <h4 className="text-lg font-bold text-white mb-4">AI Recommendations</h4>
          <ul className="space-y-3">
            {report.recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">{idx + 1}</span>
                </div>
                <span className="text-white/80">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}