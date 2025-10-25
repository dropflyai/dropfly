'use client'

import React, { useState } from 'react'
import { Check, X, Clock, Building, Phone, Mail, Calendar, TrendingUp, AlertTriangle, Shield, RefreshCw } from 'lucide-react'

interface EmploymentRecord {
  id: string
  employerName: string
  position: string
  startDate: string
  endDate?: string
  currentEmployer: boolean
  salary: number
  salaryType: 'hourly' | 'annual'
  status: 'verified' | 'pending' | 'failed' | 'flagged'
  verificationMethod: 'api' | 'manual' | 'document'
  confidence: number
  lastUpdated: string
  contactInfo: {
    phone?: string
    email?: string
    address?: string
  }
  flags: string[]
}

interface VerificationAPI {
  name: string
  status: 'online' | 'offline' | 'limited'
  coverage: number
  responseTime: number
  cost: number
}

const EmploymentVerification: React.FC = () => {
  const [selectedApplicant, setSelectedApplicant] = useState<string>('APP001')
  const [verificationInProgress, setVerificationInProgress] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'apis'>('current')

  // Mock data - in production, this would come from various verification APIs
  const employmentRecords: EmploymentRecord[] = [
    {
      id: 'EMP001',
      employerName: 'TechCorp Solutions Inc.',
      position: 'Senior Software Engineer',
      startDate: '2022-03-15',
      currentEmployer: true,
      salary: 95000,
      salaryType: 'annual',
      status: 'verified',
      verificationMethod: 'api',
      confidence: 0.95,
      lastUpdated: '2025-01-18T10:30:00Z',
      contactInfo: {
        phone: '+1-555-0123',
        email: 'hr@techcorp.com',
        address: '123 Tech Drive, San Francisco, CA 94105'
      },
      flags: []
    },
    {
      id: 'EMP002',
      employerName: 'StartupXYZ',
      position: 'Full Stack Developer',
      startDate: '2020-06-01',
      endDate: '2022-03-10',
      currentEmployer: false,
      salary: 75000,
      salaryType: 'annual',
      status: 'verified',
      verificationMethod: 'manual',
      confidence: 0.88,
      lastUpdated: '2025-01-17T14:20:00Z',
      contactInfo: {
        phone: '+1-555-0456',
        email: 'contact@startupxyz.com'
      },
      flags: ['Company acquired - verification through parent company']
    },
    {
      id: 'EMP003',
      employerName: 'FreelanceWork LLC',
      position: 'Independent Contractor',
      startDate: '2019-01-01',
      endDate: '2020-05-30',
      currentEmployer: false,
      salary: 45,
      salaryType: 'hourly',
      status: 'flagged',
      verificationMethod: 'document',
      confidence: 0.65,
      lastUpdated: '2025-01-16T09:15:00Z',
      contactInfo: {},
      flags: ['Self-reported income only', 'No direct employer contact', '1099 contractor status']
    }
  ]

  const verificationAPIs: VerificationAPI[] = [
    {
      name: 'Equifax Work Number',
      status: 'online',
      coverage: 85,
      responseTime: 1.2,
      cost: 15.00
    },
    {
      name: 'Truework API',
      status: 'online',
      coverage: 78,
      responseTime: 0.8,
      cost: 12.00
    },
    {
      name: 'Experian Employment',
      status: 'online',
      coverage: 72,
      responseTime: 2.1,
      cost: 18.00
    },
    {
      name: 'State UI Records',
      status: 'limited',
      coverage: 45,
      responseTime: 5.5,
      cost: 8.00
    },
    {
      name: 'Direct HR Systems',
      status: 'online',
      coverage: 35,
      responseTime: 0.5,
      cost: 25.00
    }
  ]

  const formatCurrency = (amount: number, type: 'hourly' | 'annual') => {
    if (type === 'hourly') {
      return `$${amount.toFixed(2)}/hr`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      case 'flagged': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <Check className="w-4 h-4 text-green-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed': return <X className="w-4 h-4 text-red-400" />
      case 'flagged': return <AlertTriangle className="w-4 h-4 text-orange-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getAPIStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400'
      case 'offline': return 'text-red-400'
      case 'limited': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const calculateTotalIncome = () => {
    return employmentRecords
      .filter(record => record.currentEmployer && record.status === 'verified')
      .reduce((total, record) => {
        if (record.salaryType === 'hourly') {
          return total + (record.salary * 40 * 52) // Assume 40 hours/week
        }
        return total + record.salary
      }, 0)
  }

  const handleVerifyEmployment = async (recordId: string) => {
    setVerificationInProgress(true)
    // Simulate API call delay
    setTimeout(() => {
      setVerificationInProgress(false)
      // In production, this would trigger actual API calls
    }, 3000)
  }

  const handleBulkVerification = async () => {
    setVerificationInProgress(true)
    // Simulate bulk verification
    setTimeout(() => {
      setVerificationInProgress(false)
    }, 5000)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Employment Verification</h2>
          <p className="text-gray-400">Real-time employment verification with multiple data sources</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Verified Income</div>
            <div className="text-xl font-bold text-green-400">
              {formatCurrency(calculateTotalIncome(), 'annual')}
            </div>
          </div>
          <button
            onClick={handleBulkVerification}
            disabled={verificationInProgress}
            className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all disabled:opacity-50 flex items-center"
          >
            {verificationInProgress ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            {verificationInProgress ? 'Verifying...' : 'Verify All'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {(['current', 'history', 'apis'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'current' && 'Current Employment'}
            {tab === 'history' && 'Employment History'}
            {tab === 'apis' && 'Verification Sources'}
          </button>
        ))}
      </div>

      {/* Current/History Employment */}
      {(activeTab === 'current' || activeTab === 'history') && (
        <div className="space-y-4">
          {employmentRecords
            .filter(record => activeTab === 'current' ? record.currentEmployer : !record.currentEmployer)
            .map((record) => (
              <div key={record.id} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start">
                    <Building className="w-5 h-5 text-yellow-400 mt-1 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{record.employerName}</h3>
                      <p className="text-gray-400">{record.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={`font-medium ${getStatusColor(record.status)}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {Math.round(record.confidence * 100)}% confidence
                      </div>
                    </div>
                    {getStatusIcon(record.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-400">Employment Period</span>
                    </div>
                    <div className="text-white font-medium">
                      {record.startDate} {record.endDate ? `- ${record.endDate}` : '- Present'}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-400">Salary</span>
                    </div>
                    <div className="text-white font-medium">
                      {formatCurrency(record.salary, record.salaryType)}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Shield className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-400">Verification Method</span>
                    </div>
                    <div className="text-white font-medium capitalize">
                      {record.verificationMethod}
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {Object.keys(record.contactInfo).length > 0 && (
                  <div className="bg-gray-700 rounded-lg p-4 mb-4">
                    <h4 className="text-white font-medium mb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {record.contactInfo.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-300">{record.contactInfo.phone}</span>
                        </div>
                      )}
                      {record.contactInfo.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-300">{record.contactInfo.email}</span>
                        </div>
                      )}
                      {record.contactInfo.address && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-gray-300">{record.contactInfo.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flags */}
                {record.flags.length > 0 && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-4">
                    <h4 className="text-yellow-400 font-medium mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Verification Flags
                    </h4>
                    <div className="space-y-1">
                      {record.flags.map((flag, index) => (
                        <div key={index} className="text-yellow-300 text-sm">• {flag}</div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Last updated: {new Date(record.lastUpdated).toLocaleString()}
                  </div>
                  <button
                    onClick={() => handleVerifyEmployment(record.id)}
                    disabled={verificationInProgress}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    Re-verify
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* API Sources */}
      {activeTab === 'apis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {verificationAPIs.map((api, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{api.name}</h3>
                <div className={`w-3 h-3 rounded-full ${
                  api.status === 'online' ? 'bg-green-400' :
                  api.status === 'offline' ? 'bg-red-400' : 'bg-yellow-400'
                }`} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={getAPIStatusColor(api.status)}>
                    {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Coverage:</span>
                  <span className="text-white">{api.coverage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time:</span>
                  <span className="text-white">{api.responseTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cost per Query:</span>
                  <span className="text-white">${api.cost.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
                Test Connection
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmploymentVerification