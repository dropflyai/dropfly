'use client'

import React, { useState } from 'react'
import { 
  DollarSign, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  Search, 
  Filter, 
  Plus, 
  Download,
  Eye,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  Users,
  BarChart3,
  PieChart,
  Receipt
} from 'lucide-react'

const PaymentsContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dues' | 'history' | 'reports'>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const monthlyDues = [
    {
      id: 'dues-001',
      unit: '1234 Maple Street',
      resident: 'Sarah Johnson',
      amount: 285,
      dueDate: '2025-02-01',
      status: 'paid',
      paidDate: '2025-01-28',
      method: 'Auto-Pay',
      transactionId: 'TXN-2025-001'
    },
    {
      id: 'dues-002',
      unit: '5678 Oak Avenue',
      resident: 'Michael Chen',
      amount: 285,
      dueDate: '2025-02-01',
      status: 'paid',
      paidDate: '2025-01-30',
      method: 'Credit Card',
      transactionId: 'TXN-2025-002'
    },
    {
      id: 'dues-003',
      unit: '9012 Pine Drive',
      resident: 'Emily Rodriguez',
      amount: 285,
      dueDate: '2025-02-01',
      status: 'pending',
      paidDate: null,
      method: null,
      transactionId: null
    },
    {
      id: 'dues-004',
      unit: '3456 Elm Court',
      resident: 'David Thompson',
      amount: 285,
      dueDate: '2025-02-01',
      status: 'overdue',
      paidDate: null,
      method: null,
      transactionId: null,
      daysOverdue: 15
    },
    {
      id: 'dues-005',
      unit: '7890 Cedar Lane',
      resident: 'Lisa Wang',
      amount: 285,
      dueDate: '2025-02-01',
      status: 'paid',
      paidDate: '2025-01-25',
      method: 'Bank Transfer',
      transactionId: 'TXN-2025-003'
    }
  ]

  const recentTransactions = [
    {
      id: 'txn-001',
      date: '2025-01-30',
      description: 'Monthly HOA Dues - February 2025',
      resident: 'Michael Chen',
      amount: 285,
      type: 'income',
      category: 'Monthly Dues',
      method: 'Credit Card'
    },
    {
      id: 'txn-002',
      date: '2025-01-28',
      description: 'Pool Maintenance Contract',
      vendor: 'AquaClear Pool Services',
      amount: -1200,
      type: 'expense',
      category: 'Maintenance',
      method: 'ACH Transfer'
    },
    {
      id: 'txn-003',
      date: '2025-01-28',
      description: 'Monthly HOA Dues - February 2025',
      resident: 'Sarah Johnson',
      amount: 285,
      type: 'income',
      category: 'Monthly Dues',
      method: 'Auto-Pay'
    },
    {
      id: 'txn-004',
      date: '2025-01-25',
      description: 'Landscaping Services',
      vendor: 'Green Thumb Landscaping',
      amount: -850,
      type: 'expense',
      category: 'Landscaping',
      method: 'Check'
    },
    {
      id: 'txn-005',
      date: '2025-01-25',
      description: 'Monthly HOA Dues - February 2025',
      resident: 'Lisa Wang',
      amount: 285,
      type: 'income',
      category: 'Monthly Dues',
      method: 'Bank Transfer'
    }
  ]

  const financialSummary = {
    totalRevenue: 47550,
    totalExpenses: 32100,
    netIncome: 15450,
    outstandingDues: 1995,
    collectionRate: 92.3,
    reserveFund: 125000,
    operatingFund: 28450
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'overdue': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 border-green-500/30'
      case 'pending': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'overdue': return 'bg-red-500/20 border-red-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'overdue': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">HOA Dues & Finances</h1>
          <p className="text-white/60 mt-2">Financial management and dues collection</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
            <Download className="w-4 h-4 mr-2 inline" />
            Export Report
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2 inline" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {(['overview', 'dues', 'history', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm">+12%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">${financialSummary.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <span className="text-red-400 text-sm">-5%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">${financialSummary.totalExpenses.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Expenses</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-blue-400 text-sm">+8%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">${financialSummary.netIncome.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Net Income</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <span className="text-yellow-400 text-sm">{financialSummary.collectionRate}%</span>
              </div>
              <div className="text-2xl font-bold text-white mb-2">${financialSummary.outstandingDues.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Outstanding Dues</div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Monthly Collection Rate</h3>
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="h-48 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Collection rate chart would go here</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Expense Breakdown</h3>
                <PieChart className="w-6 h-6 text-purple-400" />
              </div>
              <div className="h-48 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Expense breakdown chart would go here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fund Balances */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Reserve Fund</h3>
                  <p className="text-gray-400 text-sm">Long-term maintenance and capital improvements</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">${financialSummary.reserveFund.toLocaleString()}</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Operating Fund</h3>
                  <p className="text-gray-400 text-sm">Day-to-day operations and maintenance</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-white">${financialSummary.operatingFund.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Dues Tab */}
      {activeTab === 'dues' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by resident or unit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Dues List */}
          <div className="space-y-4">
            {monthlyDues.map((dues) => (
              <div key={dues.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{dues.unit}</h3>
                      <p className="text-gray-400">{dues.resident}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">${dues.amount}</div>
                      <div className="text-sm text-gray-400">Due: {dues.dueDate}</div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBg(dues.status)} ${getStatusColor(dues.status)}`}>
                        {getStatusIcon(dues.status)}
                        <span>{dues.status.charAt(0).toUpperCase() + dues.status.slice(1)}</span>
                      </span>
                      
                      <div className="flex space-x-2">
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                        {dues.status === 'pending' && (
                          <button className="p-2 bg-green-700 hover:bg-green-600 rounded-lg transition-colors">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {dues.status === 'paid' && (
                  <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Paid: {dues.paidDate}</span>
                      <span>Method: {dues.method}</span>
                      <span>Transaction: {dues.transactionId}</span>
                    </div>
                  </div>
                )}
                
                {dues.status === 'overdue' && dues.daysOverdue && (
                  <div className="mt-4 bg-red-900/20 border border-red-600/30 rounded-lg p-3">
                    <div className="flex items-center text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span>Overdue by {dues.daysOverdue} days</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-gradient-to-r from-green-500 to-teal-500' 
                        : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-6 h-6 text-white" />
                      ) : (
                        <TrendingDown className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{transaction.description}</h3>
                      <p className="text-gray-400">
                        {transaction.resident || transaction.vendor} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">{transaction.date} • {transaction.method}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Monthly Financial Report</h3>
              <p className="text-gray-400 text-sm">Comprehensive financial summary for the month</p>
            </button>

            <button className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Collection Rate Analysis</h3>
              <p className="text-gray-400 text-sm">Dues collection trends and delinquency report</p>
            </button>

            <button className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Budget vs Actual</h3>
              <p className="text-gray-400 text-sm">Compare budgeted vs actual income and expenses</p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentsContent