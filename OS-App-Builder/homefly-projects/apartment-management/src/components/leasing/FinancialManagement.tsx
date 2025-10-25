'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Banknote, 
  PieChart,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Plus,
  Receipt,
  Building,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Settings,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search
} from 'lucide-react'

interface FinancialTransaction {
  id: string
  transaction_date: string
  transaction_type: 'income' | 'expense' | 'transfer' | 'adjustment'
  category: string
  amount: number
  description: string
  reference_number?: string
  payment_method: string
  status: 'pending' | 'cleared' | 'failed' | 'refunded'
  property_id: string
  unit_id?: string
  tenant_id?: string
  lease_id?: string
  account_id: string
  account_name: string
  memo?: string
  receipt_url?: string
}

interface AccountBalance {
  account_id: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  balance: number
  last_updated: string
}

interface FinancialSummary {
  total_revenue: number
  total_expenses: number
  net_income: number
  operating_margin: number
  cash_flow: number
  accounts_receivable: number
  accounts_payable: number
  occupancy_rate: number
}

interface FinancialManagementProps {
  propertyId: string
}

export default function FinancialManagement({ propertyId }: FinancialManagementProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'accounts' | 'reports' | 'budgets'>('dashboard')
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [dateRange, setDateRange] = useState('this_month')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTransactions: FinancialTransaction[] = [
      {
        id: 'txn-001',
        transaction_date: '2024-01-15',
        transaction_type: 'income',
        category: 'rent',
        amount: 2800.00,
        description: 'Monthly rent - Unit 4B',
        reference_number: 'RENT-4B-0124',
        payment_method: 'ach',
        status: 'cleared',
        property_id: propertyId,
        unit_id: 'unit-4b',
        tenant_id: 'tenant-001',
        lease_id: 'lease-001',
        account_id: 'acc-rental-income',
        account_name: 'Rental Income',
        memo: 'January 2024 rent payment'
      },
      {
        id: 'txn-002',
        transaction_date: '2024-01-16',
        transaction_type: 'expense',
        category: 'maintenance',
        amount: 350.00,
        description: 'HVAC repair - Unit 7A',
        reference_number: 'MAINT-7A-001',
        payment_method: 'check',
        status: 'cleared',
        property_id: propertyId,
        unit_id: 'unit-7a',
        account_id: 'acc-maintenance',
        account_name: 'Maintenance & Repairs',
        memo: 'Emergency HVAC repair',
        receipt_url: '/receipts/hvac-repair-001.pdf'
      },
      {
        id: 'txn-003',
        transaction_date: '2024-01-18',
        transaction_type: 'income',
        category: 'fees',
        amount: 100.00,
        description: 'Application fee - Sarah Johnson',
        payment_method: 'credit_card',
        status: 'cleared',
        property_id: propertyId,
        account_id: 'acc-fees',
        account_name: 'Application Fees'
      },
      {
        id: 'txn-004',
        transaction_date: '2024-01-20',
        transaction_type: 'expense',
        category: 'utilities',
        amount: 1250.00,
        description: 'Electric bill - Common areas',
        reference_number: 'ELEC-0124',
        payment_method: 'ach',
        status: 'pending',
        property_id: propertyId,
        account_id: 'acc-utilities',
        account_name: 'Utilities'
      },
      {
        id: 'txn-005',
        transaction_date: '2024-01-22',
        transaction_type: 'income',
        category: 'deposits',
        amount: 2800.00,
        description: 'Security deposit - Unit 4B',
        payment_method: 'ach',
        status: 'cleared',
        property_id: propertyId,
        unit_id: 'unit-4b',
        tenant_id: 'tenant-001',
        account_id: 'acc-deposits',
        account_name: 'Security Deposits'
      }
    ]

    const mockBalances: AccountBalance[] = [
      { account_id: 'acc-checking', account_name: 'Operating Checking', account_type: 'asset', balance: 45230.50, last_updated: '2024-01-22' },
      { account_id: 'acc-savings', account_name: 'Reserve Savings', account_type: 'asset', balance: 125000.00, last_updated: '2024-01-22' },
      { account_id: 'acc-deposits', account_name: 'Security Deposits', account_type: 'liability', balance: 84000.00, last_updated: '2024-01-22' },
      { account_id: 'acc-rental-income', account_name: 'Rental Income', account_type: 'revenue', balance: 56000.00, last_updated: '2024-01-22' },
      { account_id: 'acc-maintenance', account_name: 'Maintenance & Repairs', account_type: 'expense', balance: 8750.00, last_updated: '2024-01-22' },
      { account_id: 'acc-utilities', account_name: 'Utilities', account_type: 'expense', balance: 3200.00, last_updated: '2024-01-22' },
      { account_id: 'acc-insurance', account_name: 'Insurance', account_type: 'expense', balance: 2400.00, last_updated: '2024-01-22' },
      { account_id: 'acc-fees', account_name: 'Application Fees', account_type: 'revenue', balance: 1200.00, last_updated: '2024-01-22' }
    ]

    const mockSummary: FinancialSummary = {
      total_revenue: 57200.00,
      total_expenses: 14350.00,
      net_income: 42850.00,
      operating_margin: 74.9,
      cash_flow: 38500.00,
      accounts_receivable: 5600.00,
      accounts_payable: 2100.00,
      occupancy_rate: 94.5
    }

    setTransactions(mockTransactions)
    setAccountBalances(mockBalances)
    setFinancialSummary(mockSummary)
  }, [propertyId])

  const getTransactionIcon = (type: string, category: string) => {
    if (type === 'income') {
      if (category === 'rent') return <Building className="w-4 h-4 text-green-400" />
      if (category === 'fees') return <Receipt className="w-4 h-4 text-green-400" />
      return <TrendingUp className="w-4 h-4 text-green-400" />
    } else {
      if (category === 'maintenance') return <Settings className="w-4 h-4 text-red-400" />
      if (category === 'utilities') return <Banknote className="w-4 h-4 text-red-400" />
      return <TrendingDown className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared': return 'text-green-400 bg-green-500/20'
      case 'pending': return 'text-yellow-400 bg-yellow-500/20'
      case 'failed': return 'text-red-400 bg-red-500/20'
      case 'refunded': return 'text-purple-400 bg-purple-500/20'
      default: return 'text-white/60 bg-white/10'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Management</h1>
          <p className="text-white/60 mt-2">QuickBooks-level financial tracking and reporting</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddTransaction(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-xl p-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: PieChart },
          { id: 'transactions', label: 'Transactions', icon: Receipt },
          { id: 'accounts', label: 'Chart of Accounts', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: TrendingUp },
          { id: 'budgets', label: 'Budgets', icon: Target }
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

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && financialSummary && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">+12.5%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(financialSummary.total_revenue)}</h3>
              <p className="text-white/60 text-sm">Total Revenue</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <span className="text-red-400 text-sm font-medium">+8.3%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(financialSummary.total_expenses)}</h3>
              <p className="text-white/60 text-sm">Total Expenses</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">+15.2%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{formatCurrency(financialSummary.net_income)}</h3>
              <p className="text-white/60 text-sm">Net Income</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Building className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-green-400 text-sm font-medium">+2.1%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{financialSummary.occupancy_rate}%</h3>
              <p className="text-white/60 text-sm">Occupancy Rate</p>
            </div>
          </div>

          {/* Cash Flow and Key Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash Flow */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Cash Flow Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Operating Cash Flow</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(financialSummary.cash_flow)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Accounts Receivable</span>
                  <span className="text-yellow-400 font-semibold">{formatCurrency(financialSummary.accounts_receivable)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Accounts Payable</span>
                  <span className="text-red-400 font-semibold">{formatCurrency(financialSummary.accounts_payable)}</span>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Net Cash Position</span>
                    <span className="text-green-400 font-bold text-lg">
                      {formatCurrency(financialSummary.cash_flow - financialSummary.accounts_payable)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Balances */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-xl font-bold text-white mb-6">Key Account Balances</h3>
              <div className="space-y-4">
                {accountBalances.filter(acc => ['Operating Checking', 'Reserve Savings', 'Security Deposits', 'Rental Income'].includes(acc.account_name)).map((account) => (
                  <div key={account.account_id} className="flex items-center justify-between">
                    <div>
                      <span className="text-white/70">{account.account_name}</span>
                      <p className="text-xs text-white/50">{account.account_type}</p>
                    </div>
                    <span className={`font-semibold ${
                      account.account_type === 'asset' ? 'text-green-400' :
                      account.account_type === 'liability' ? 'text-red-400' :
                      account.account_type === 'revenue' ? 'text-blue-400' : 'text-white'
                    }`}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.transaction_type, transaction.category)}
                    <div>
                      <h4 className="font-medium text-white">{transaction.description}</h4>
                      <p className="text-white/60 text-sm">{transaction.account_name} • {new Date(transaction.transaction_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`font-semibold ${
                      transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                    </span>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="today">Today</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="this_year">This Year</option>
              </select>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="all">All Categories</option>
                <option value="rent">Rent</option>
                <option value="fees">Fees</option>
                <option value="deposits">Deposits</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">All Transactions</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white/70 font-medium">Date</th>
                    <th className="text-left p-4 text-white/70 font-medium">Description</th>
                    <th className="text-left p-4 text-white/70 font-medium">Category</th>
                    <th className="text-left p-4 text-white/70 font-medium">Account</th>
                    <th className="text-left p-4 text-white/70 font-medium">Amount</th>
                    <th className="text-left p-4 text-white/70 font-medium">Status</th>
                    <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white/80">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {getTransactionIcon(transaction.transaction_type, transaction.category)}
                          <span className="text-white">{transaction.description}</span>
                        </div>
                      </td>
                      <td className="p-4 text-white/80 capitalize">{transaction.category}</td>
                      <td className="p-4 text-white/80">{transaction.account_name}</td>
                      <td className="p-4">
                        <span className={`font-semibold ${
                          transaction.transaction_type === 'income' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-white/10 rounded transition-colors">
                            <Eye className="w-4 h-4 text-white/60" />
                          </button>
                          <button className="p-1 hover:bg-white/10 rounded transition-colors">
                            <Edit className="w-4 h-4 text-white/60" />
                          </button>
                          {transaction.receipt_url && (
                            <button 
                              onClick={() => window.open(transaction.receipt_url, '_blank')}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Receipt className="w-4 h-4 text-blue-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Chart of Accounts Tab */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Chart of Accounts</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4 text-white/70 font-medium">Account Name</th>
                    <th className="text-left p-4 text-white/70 font-medium">Type</th>
                    <th className="text-left p-4 text-white/70 font-medium">Balance</th>
                    <th className="text-left p-4 text-white/70 font-medium">Last Updated</th>
                    <th className="text-left p-4 text-white/70 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {accountBalances.map((account) => (
                    <tr key={account.account_id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 text-white font-medium">{account.account_name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                          account.account_type === 'asset' ? 'bg-green-500/20 text-green-400' :
                          account.account_type === 'liability' ? 'bg-red-500/20 text-red-400' :
                          account.account_type === 'revenue' ? 'bg-blue-500/20 text-blue-400' :
                          account.account_type === 'expense' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {account.account_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-semibold ${
                          account.account_type === 'asset' || account.account_type === 'revenue' ? 'text-green-400' :
                          account.account_type === 'liability' || account.account_type === 'expense' ? 'text-red-400' :
                          'text-white'
                        }`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </td>
                      <td className="p-4 text-white/80">{new Date(account.last_updated).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 hover:bg-white/10 rounded transition-colors">
                            <Eye className="w-4 h-4 text-white/60" />
                          </button>
                          <button className="p-1 hover:bg-white/10 rounded transition-colors">
                            <Edit className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Profit & Loss Statement', description: 'Income and expenses over time', icon: TrendingUp },
              { name: 'Balance Sheet', description: 'Assets, liabilities, and equity', icon: BarChart3 },
              { name: 'Cash Flow Statement', description: 'Cash inflows and outflows', icon: DollarSign },
              { name: 'Rent Roll Report', description: 'Current tenant and rent information', icon: Building },
              { name: 'Vacancy Report', description: 'Available units and lost revenue', icon: Calendar },
              { name: 'Maintenance Report', description: 'Maintenance costs and trends', icon: Settings }
            ].map((report) => {
              const Icon = report.icon
              return (
                <div key={report.name} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{report.name}</h3>
                  </div>
                  <p className="text-white/70 text-sm mb-4">{report.description}</p>
                  <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300">
                    Generate Report
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Budgets Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Budget Management</h3>
            <p className="text-white/60 mb-6">Coming soon - Create and track budgets for better financial planning</p>
            <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300">
              Set Up Budgets
            </button>
          </div>
        </div>
      )}
    </div>
  )
}