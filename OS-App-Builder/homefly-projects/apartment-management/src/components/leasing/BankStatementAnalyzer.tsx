'use client'

import React, { useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, CreditCard, PieChart, Calendar, Brain, Shield, Target } from 'lucide-react'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  category: string
  merchant?: string
  flagged: boolean
  confidence: number
}

interface SpendingPattern {
  category: string
  monthlyAverage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  volatility: number
  riskLevel: 'low' | 'medium' | 'high'
  color: string
}

interface BankAnalysis {
  accountBalance: {
    current: number
    average: number
    minimum: number
  }
  incomeAnalysis: {
    regularIncome: number
    irregularIncome: number
    incomeStability: number
  }
  spendingAnalysis: {
    totalSpending: number
    essentialSpending: number
    discretionarySpending: number
    spendingStability: number
  }
  riskFactors: string[]
  positiveFactors: string[]
  overallScore: number
}

const BankStatementAnalyzer: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m')
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'transactions' | 'insights'>('overview')

  // Mock data - in production, this would come from bank statement processing AI
  const transactions: Transaction[] = [
    {
      id: 'TXN001',
      date: '2025-01-15',
      description: 'SALARY DEPOSIT - TECHCORP',
      amount: 7916.67,
      type: 'credit',
      category: 'Salary',
      flagged: false,
      confidence: 0.98
    },
    {
      id: 'TXN002',
      date: '2025-01-14',
      description: 'RENT PAYMENT - LUXURY APTS',
      amount: -2800.00,
      type: 'debit',
      category: 'Housing',
      merchant: 'Luxury Apartments LLC',
      flagged: false,
      confidence: 0.95
    },
    {
      id: 'TXN003',
      date: '2025-01-13',
      description: 'UBER RIDES',
      amount: -45.50,
      type: 'debit',
      category: 'Transportation',
      merchant: 'Uber Technologies',
      flagged: false,
      confidence: 0.92
    },
    {
      id: 'TXN004',
      date: '2025-01-12',
      description: 'CASH WITHDRAWAL ATM',
      amount: -800.00,
      type: 'debit',
      category: 'Cash',
      flagged: true,
      confidence: 0.75
    },
    {
      id: 'TXN005',
      date: '2025-01-11',
      description: 'CRYPTO EXCHANGE DEPOSIT',
      amount: -1500.00,
      type: 'debit',
      category: 'Investment',
      merchant: 'Coinbase',
      flagged: true,
      confidence: 0.88
    }
  ]

  const spendingPatterns: SpendingPattern[] = [
    {
      category: 'Housing',
      monthlyAverage: 2800,
      trend: 'stable',
      volatility: 0.02,
      riskLevel: 'low',
      color: '#10B981'
    },
    {
      category: 'Food & Dining',
      monthlyAverage: 850,
      trend: 'increasing',
      volatility: 0.25,
      riskLevel: 'medium',
      color: '#F59E0B'
    },
    {
      category: 'Transportation',
      monthlyAverage: 420,
      trend: 'stable',
      volatility: 0.15,
      riskLevel: 'low',
      color: '#3B82F6'
    },
    {
      category: 'Entertainment',
      monthlyAverage: 650,
      trend: 'increasing',
      volatility: 0.35,
      riskLevel: 'high',
      color: '#8B5CF6'
    },
    {
      category: 'Investment',
      monthlyAverage: 1200,
      trend: 'decreasing',
      volatility: 0.45,
      riskLevel: 'high',
      color: '#EF4444'
    }
  ]

  const analysis: BankAnalysis = {
    accountBalance: {
      current: 15420.50,
      average: 12850.00,
      minimum: 8200.00
    },
    incomeAnalysis: {
      regularIncome: 7916.67,
      irregularIncome: 450.00,
      incomeStability: 0.92
    },
    spendingAnalysis: {
      totalSpending: 5920.00,
      essentialSpending: 3650.00,
      discretionarySpending: 2270.00,
      spendingStability: 0.78
    },
    riskFactors: [
      'High cash withdrawals ($800+ monthly average)',
      'Volatile entertainment spending (+35% month-over-month)',
      'Cryptocurrency investments (high volatility)',
      'Irregular deposit patterns detected'
    ],
    positiveFactors: [
      'Consistent salary deposits for 24+ months',
      'Stable housing costs (2% volatility)',
      'Maintains healthy account minimum',
      'Low overdraft/NSF frequency'
    ],
    overallScore: 0.78
  }

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(absAmount)
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400'
    if (score >= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-green-400" />
      case 'stable': return <Target className="w-4 h-4 text-blue-400" />
      default: return null
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Bank Statement Analyzer</h2>
          <p className="text-gray-400">AI-powered spending pattern analysis and financial behavior insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '3m' | '6m' | '12m')}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
          >
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
          </select>
          <div className="text-right">
            <div className="text-sm text-gray-400">Financial Health Score</div>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {Math.round(analysis.overallScore * 100)}/100
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {(['overview', 'patterns', 'transactions', 'insights'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Balance Analysis */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Account Balance Analysis</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-green-400">
                  {formatCurrency(analysis.accountBalance.current)}
                </div>
                <div className="text-sm text-gray-400">Current Balance</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-blue-400">
                  {formatCurrency(analysis.accountBalance.average)}
                </div>
                <div className="text-sm text-gray-400">Average Balance</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-xl font-bold text-yellow-400">
                  {formatCurrency(analysis.accountBalance.minimum)}
                </div>
                <div className="text-sm text-gray-400">Minimum Balance</div>
              </div>
            </div>
          </div>

          {/* Income vs Spending */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Income vs Spending</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Regular Income</span>
                <span className="text-green-400 font-medium">
                  {formatCurrency(analysis.incomeAnalysis.regularIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Essential Spending</span>
                <span className="text-red-400 font-medium">
                  {formatCurrency(analysis.spendingAnalysis.essentialSpending)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Discretionary Spending</span>
                <span className="text-orange-400 font-medium">
                  {formatCurrency(analysis.spendingAnalysis.discretionarySpending)}
                </span>
              </div>
              <hr className="border-gray-600" />
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Net Savings</span>
                <span className="text-green-400 font-bold">
                  {formatCurrency(analysis.incomeAnalysis.regularIncome - analysis.spendingAnalysis.totalSpending)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spending Patterns Tab */}
      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spendingPatterns.map((pattern, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{pattern.category}</h3>
                  {getTrendIcon(pattern.trend)}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monthly Average:</span>
                    <span className="text-white font-medium">
                      {formatCurrency(pattern.monthlyAverage)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volatility:</span>
                    <span className="text-white">
                      {Math.round(pattern.volatility * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk Level:</span>
                    <span className={getRiskColor(pattern.riskLevel)}>
                      {pattern.riskLevel.charAt(0).toUpperCase() + pattern.riskLevel.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Visual indicator */}
                <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(pattern.volatility * 100, 100)}%`,
                      backgroundColor: pattern.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-gray-800 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
              <div className="text-sm text-gray-400">
                Showing flagged and significant transactions
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.flagged ? 'bg-red-400' : 'bg-green-400'
                    }`} />
                    <div>
                      <div className="text-white font-medium">{transaction.description}</div>
                      <div className="text-sm text-gray-400">
                        {transaction.category} • {transaction.date}
                        {transaction.merchant && ` • ${transaction.merchant}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaction.type === 'credit' ? 'text-green-400' : 'text-white'
                    }`}>
                      {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {Math.round(transaction.confidence * 100)}% confidence
                    </div>
                  </div>
                </div>
                
                {transaction.flagged && (
                  <div className="mt-3 flex items-center text-yellow-400 text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Flagged for manual review
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Factors */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Risk Factors</h3>
            </div>
            
            <div className="space-y-3">
              {analysis.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Positive Factors */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Positive Factors</h3>
            </div>
            
            <div className="space-y-3">
              {analysis.positiveFactors.map((factor, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                <h4 className="text-green-400 font-medium mb-2">Approve Application</h4>
                <p className="text-green-300 text-sm">
                  Strong financial stability with consistent income and reasonable spending patterns. 
                  Recommend standard lease terms.
                </p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-medium mb-2">Monitor Cash Usage</h4>
                <p className="text-yellow-300 text-sm">
                  High cash withdrawal patterns may indicate off-books income or unusual spending. 
                  Consider additional income verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BankStatementAnalyzer