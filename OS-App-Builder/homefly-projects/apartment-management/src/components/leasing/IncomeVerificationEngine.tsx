'use client'

import React, { useState } from 'react'
import { Check, AlertTriangle, TrendingUp, DollarSign, FileText, Clock, Brain, Shield } from 'lucide-react'

interface IncomeDocument {
  id: string
  type: 'paystub' | 'tax_return' | 'bank_statement' | 'employment_letter' | 'w2' | '1099'
  amount: number
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'annual'
  date: string
  verified: boolean
  confidence: number
  anomalies: string[]
}

interface IncomeAnalysis {
  totalMonthlyIncome: number
  verifiedIncome: number
  confidenceScore: number
  stability: number
  growthTrend: number
  riskFactors: string[]
  recommendations: string[]
  mlPredictions: {
    futurePay: number
    jobStability: number
    defaultRisk: number
  }
}

const IncomeVerificationEngine: React.FC = () => {
  const [selectedApplicant, setSelectedApplicant] = useState<string>('APP001')
  const [analysisMode, setAnalysisMode] = useState<'basic' | 'advanced' | 'ml'>('ml')

  // Mock data - in production, this would come from document processing AI
  const incomeDocuments: IncomeDocument[] = [
    {
      id: 'DOC001',
      type: 'paystub',
      amount: 4500,
      frequency: 'bi-weekly',
      date: '2025-01-15',
      verified: true,
      confidence: 0.95,
      anomalies: []
    },
    {
      id: 'DOC002',
      type: 'paystub',
      amount: 4600,
      frequency: 'bi-weekly',
      date: '2025-01-01',
      verified: true,
      confidence: 0.92,
      anomalies: ['Slight formatting inconsistency']
    },
    {
      id: 'DOC003',
      type: 'tax_return',
      amount: 115000,
      frequency: 'annual',
      date: '2024-04-15',
      verified: true,
      confidence: 0.98,
      anomalies: []
    },
    {
      id: 'DOC004',
      type: 'bank_statement',
      amount: 9200,
      frequency: 'monthly',
      date: '2025-01-01',
      verified: true,
      confidence: 0.89,
      anomalies: ['Irregular deposit patterns']
    }
  ]

  const analysis: IncomeAnalysis = {
    totalMonthlyIncome: 9750,
    verifiedIncome: 9200,
    confidenceScore: 0.93,
    stability: 0.88,
    growthTrend: 0.12,
    riskFactors: [
      'Minor formatting inconsistencies in recent paystubs',
      'Irregular deposit timing patterns',
      'Income growth may indicate job change'
    ],
    recommendations: [
      'Request additional employment verification',
      'Consider 6-month income averaging',
      'Monitor for consistent payment patterns'
    ],
    mlPredictions: {
      futurePay: 10200,
      jobStability: 0.85,
      defaultRisk: 0.15
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getFrequencyMultiplier = (frequency: string) => {
    switch (frequency) {
      case 'weekly': return 4.33
      case 'bi-weekly': return 2.17
      case 'monthly': return 1
      case 'annual': return 1/12
      default: return 1
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'paystub': return <DollarSign className="w-4 h-4" />
      case 'tax_return': return <FileText className="w-4 h-4" />
      case 'bank_statement': return <TrendingUp className="w-4 h-4" />
      case 'employment_letter': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Income Verification Engine</h2>
          <p className="text-gray-400">AI-powered income analysis with ML predictions</p>
        </div>
        <div className="flex space-x-2">
          {(['basic', 'advanced', 'ml'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setAnalysisMode(mode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                analysisMode === mode
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Analysis Summary */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Brain className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">AI Income Analysis</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(analysis.totalMonthlyIncome)}
              </div>
              <div className="text-sm text-gray-400">Total Monthly</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">
                {formatCurrency(analysis.verifiedIncome)}
              </div>
              <div className="text-sm text-gray-400">Verified Income</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className={`text-2xl font-bold ${getConfidenceColor(analysis.confidenceScore)}`}>
                {Math.round(analysis.confidenceScore * 100)}%
              </div>
              <div className="text-sm text-gray-400">Confidence</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(analysis.stability * 100)}%
              </div>
              <div className="text-sm text-gray-400">Stability</div>
            </div>
          </div>

          {/* ML Predictions */}
          {analysisMode === 'ml' && (
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <Brain className="w-4 h-4 text-yellow-400 mr-2" />
                <h4 className="font-semibold text-white">ML Predictions (Next 12 Months)</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(analysis.mlPredictions.futurePay)}
                  </div>
                  <div className="text-sm text-gray-400">Predicted Income</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-400">
                    {Math.round(analysis.mlPredictions.jobStability * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Job Stability</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-400">
                    {Math.round(analysis.mlPredictions.defaultRisk * 100)}%
                  </div>
                  <div className="text-sm text-gray-400">Default Risk</div>
                </div>
              </div>
            </div>
          )}

          {/* Risk Factors */}
          <div className="mb-6">
            <h4 className="font-semibold text-white mb-3">Risk Factors</h4>
            <div className="space-y-2">
              {analysis.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-white mb-3">AI Recommendations</h4>
            <div className="space-y-2">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Analysis */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Document Analysis</h3>
          </div>

          <div className="space-y-4">
            {incomeDocuments.map((doc) => (
              <div key={doc.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getDocumentIcon(doc.type)}
                    <span className="ml-2 text-white font-medium capitalize">
                      {doc.type.replace('_', ' ')}
                    </span>
                  </div>
                  {doc.verified ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-400" />
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-white">
                      {formatCurrency(doc.amount * getFrequencyMultiplier(doc.frequency))} /mo
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence:</span>
                    <span className={getConfidenceColor(doc.confidence)}>
                      {Math.round(doc.confidence * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{doc.date}</span>
                  </div>
                </div>

                {doc.anomalies.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="text-xs text-yellow-400">Anomalies:</div>
                    {doc.anomalies.map((anomaly, index) => (
                      <div key={index} className="text-xs text-gray-400">{anomaly}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all">
            Re-analyze Documents
          </button>
        </div>
      </div>

      {/* Advanced Analysis Options */}
      {analysisMode === 'advanced' && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Advanced Analysis Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left transition-colors">
              <h4 className="font-medium text-white mb-2">Historical Comparison</h4>
              <p className="text-sm text-gray-400">Compare with previous applications</p>
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left transition-colors">
              <h4 className="font-medium text-white mb-2">Industry Benchmarks</h4>
              <p className="text-sm text-gray-400">Compare against market rates</p>
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left transition-colors">
              <h4 className="font-medium text-white mb-2">Fraud Detection</h4>
              <p className="text-sm text-gray-400">Deep document authenticity scan</p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default IncomeVerificationEngine