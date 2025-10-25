'use client'

import React, { useState } from 'react'
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Upload, 
  Shield, 
  CreditCard, 
  Award, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  Download, 
  Send, 
  Plus, 
  X, 
  Camera, 
  Paperclip,
  Star,
  TrendingUp,
  DollarSign,
  Settings,
  Search,
  Filter
} from 'lucide-react'

interface VendorApplication {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address: string
  businessType: string
  yearsInBusiness: number
  servicesOffered: string[]
  serviceArea: string[]
  employeeCount: number
  annualRevenue: string
  
  // Licenses & Certifications
  licenses: {
    type: string
    number: string
    expiryDate: string
    document?: string
  }[]
  
  // Insurance Information
  insurance: {
    liability: {
      carrier: string
      policyNumber: string
      coverage: number
      expiryDate: string
      document?: string
    }
    workersComp: {
      carrier: string
      policyNumber: string
      expiryDate: string
      document?: string
    }
    bonding?: {
      carrier: string
      amount: number
      expiryDate: string
      document?: string
    }
  }
  
  // References
  references: {
    companyName: string
    contactPerson: string
    phone: string
    email: string
    relationship: string
    yearsWorked: number
  }[]
  
  // Banking & Payment
  bankingInfo: {
    accountType: string
    routingNumber: string
    accountNumber: string
    bankName: string
  }
  
  // Additional Documents
  documents: {
    type: string
    name: string
    uploadDate: string
  }[]
  
  // Application Status
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'pending_documents'
  submissionDate: string
  reviewedBy?: string
  reviewDate?: string
  rejectionReason?: string
  notes: string
}

interface VendorApplicationProps {
  onSubmit?: (application: VendorApplication) => void
  onSaveDraft?: (application: VendorApplication) => void
}

export default function VendorApplication({
  onSubmit,
  onSaveDraft
}: VendorApplicationProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<Partial<VendorApplication>>({
    servicesOffered: [],
    serviceArea: [],
    licenses: [],
    references: [],
    documents: [],
    status: 'draft'
  })

  const totalSteps = 7
  const serviceCategories = [
    'Plumbing', 'HVAC', 'Electrical', 'Landscaping', 'Cleaning', 
    'General Maintenance', 'Security', 'Painting', 'Roofing', 
    'Flooring', 'Appliance Repair', 'Pest Control'
  ]

  const updateData = (field: string, value: any) => {
    setApplicationData(prev => ({ ...prev, [field]: value }))
  }

  const addLicense = () => {
    const newLicense = {
      type: '',
      number: '',
      expiryDate: '',
      document: ''
    }
    updateData('licenses', [...(applicationData.licenses || []), newLicense])
  }

  const addReference = () => {
    const newReference = {
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      relationship: '',
      yearsWorked: 0
    }
    updateData('references', [...(applicationData.references || []), newReference])
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    const completeApplication: VendorApplication = {
      ...applicationData,
      id: `app-${Date.now()}`,
      status: 'submitted',
      submissionDate: new Date().toISOString(),
      notes: ''
    } as VendorApplication
    
    onSubmit?.(completeApplication)
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${
            step === currentStep
              ? 'bg-blue-500 border-blue-500 text-white'
              : step < currentStep
              ? 'bg-green-500 border-green-500 text-white'
              : 'bg-white/10 border-white/20 text-white/60'
          }`}>
            {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
          </div>
          {step < totalSteps && (
            <div className={`w-12 h-1 mx-2 rounded transition-colors ${
              step < currentStep ? 'bg-green-500' : 'bg-white/20'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  const Step1CompanyInfo = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Building className="w-16 h-16 text-blue-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Company Information</h2>
        <p className="text-white/60">Tell us about your business</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Company Name *</label>
          <input
            type="text"
            value={applicationData.companyName || ''}
            onChange={(e) => updateData('companyName', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Your Company Name"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Contact Person *</label>
          <input
            type="text"
            value={applicationData.contactPerson || ''}
            onChange={(e) => updateData('contactPerson', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Primary Contact Name"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Email Address *</label>
          <input
            type="email"
            value={applicationData.email || ''}
            onChange={(e) => updateData('email', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="business@company.com"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Phone Number *</label>
          <input
            type="tel"
            value={applicationData.phone || ''}
            onChange={(e) => updateData('phone', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-white/70 text-sm font-medium mb-2">Business Address *</label>
          <textarea
            value={applicationData.address || ''}
            onChange={(e) => updateData('address', e.target.value)}
            rows={3}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Full business address including city, state, ZIP"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Business Type *</label>
          <select
            value={applicationData.businessType || ''}
            onChange={(e) => updateData('businessType', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" className="bg-gray-800">Select Business Type</option>
            <option value="sole_proprietorship" className="bg-gray-800">Sole Proprietorship</option>
            <option value="partnership" className="bg-gray-800">Partnership</option>
            <option value="llc" className="bg-gray-800">LLC</option>
            <option value="corporation" className="bg-gray-800">Corporation</option>
            <option value="franchise" className="bg-gray-800">Franchise</option>
          </select>
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Years in Business *</label>
          <input
            type="number"
            value={applicationData.yearsInBusiness || ''}
            onChange={(e) => updateData('yearsInBusiness', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="5"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Employee Count *</label>
          <input
            type="number"
            value={applicationData.employeeCount || ''}
            onChange={(e) => updateData('employeeCount', parseInt(e.target.value))}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm font-medium mb-2">Annual Revenue Range</label>
          <select
            value={applicationData.annualRevenue || ''}
            onChange={(e) => updateData('annualRevenue', e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" className="bg-gray-800">Select Revenue Range</option>
            <option value="under_100k" className="bg-gray-800">Under $100,000</option>
            <option value="100k_500k" className="bg-gray-800">$100,000 - $500,000</option>
            <option value="500k_1m" className="bg-gray-800">$500,000 - $1,000,000</option>
            <option value="1m_5m" className="bg-gray-800">$1,000,000 - $5,000,000</option>
            <option value="over_5m" className="bg-gray-800">Over $5,000,000</option>
          </select>
        </div>
      </div>
    </div>
  )

  const Step2Services = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Award className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Services & Expertise</h2>
        <p className="text-white/60">What services do you provide?</p>
      </div>

      <div>
        <label className="block text-white/70 text-sm font-medium mb-4">Services Offered * (Select all that apply)</label>
        <div className="grid md:grid-cols-3 gap-3">
          {serviceCategories.map((service) => (
            <label key={service} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={applicationData.servicesOffered?.includes(service) || false}
                onChange={(e) => {
                  const current = applicationData.servicesOffered || []
                  if (e.target.checked) {
                    updateData('servicesOffered', [...current, service])
                  } else {
                    updateData('servicesOffered', current.filter(s => s !== service))
                  }
                }}
                className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <span className="text-white">{service}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white/70 text-sm font-medium mb-4">Service Areas * (Cities/Regions you serve)</label>
        <div className="space-y-3">
          {(applicationData.serviceArea || ['']).map((area, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={area}
                onChange={(e) => {
                  const areas = [...(applicationData.serviceArea || [])]
                  areas[index] = e.target.value
                  updateData('serviceArea', areas)
                }}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="City, State or Region"
              />
              {index === (applicationData.serviceArea || []).length - 1 && (
                <button
                  type="button"
                  onClick={() => updateData('serviceArea', [...(applicationData.serviceArea || []), ''])}
                  className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
              {(applicationData.serviceArea || []).length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const areas = [...(applicationData.serviceArea || [])]
                    areas.splice(index, 1)
                    updateData('serviceArea', areas)
                  }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const Step3Licenses = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Licenses & Certifications</h2>
        <p className="text-white/60">Professional credentials and certifications</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-white/70 text-sm font-medium">Professional Licenses *</label>
          <button
            type="button"
            onClick={addLicense}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add License</span>
          </button>
        </div>

        <div className="space-y-4">
          {(applicationData.licenses || []).map((license, index) => (
            <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">License Type</label>
                  <input
                    type="text"
                    value={license.type}
                    onChange={(e) => {
                      const licenses = [...(applicationData.licenses || [])]
                      licenses[index] = { ...licenses[index], type: e.target.value }
                      updateData('licenses', licenses)
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="e.g., Master Plumber License"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">License Number</label>
                  <input
                    type="text"
                    value={license.number}
                    onChange={(e) => {
                      const licenses = [...(applicationData.licenses || [])]
                      licenses[index] = { ...licenses[index], number: e.target.value }
                      updateData('licenses', licenses)
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="License number"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={license.expiryDate}
                    onChange={(e) => {
                      const licenses = [...(applicationData.licenses || [])]
                      licenses[index] = { ...licenses[index], expiryDate: e.target.value }
                      updateData('licenses', licenses)
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Upload Document</label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="flex items-center space-x-2 px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload</span>
                    </button>
                    {license.document && (
                      <span className="text-green-400 text-sm">Document uploaded</span>
                    )}
                  </div>
                </div>
              </div>
              
              {(applicationData.licenses || []).length > 1 && (
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const licenses = [...(applicationData.licenses || [])]
                      licenses.splice(index, 1)
                      updateData('licenses', licenses)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Remove</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vendor Application</h1>
          <p className="text-white/60">Join our network of approved service providers</p>
        </div>

        {/* Progress Indicator */}
        <StepIndicator />

        {/* Form Container */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
          {/* Step Content */}
          {currentStep === 1 && <Step1CompanyInfo />}
          {currentStep === 2 && <Step2Services />}
          {currentStep === 3 && <Step3Licenses />}
          {/* Additional steps would go here */}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                currentStep === 1
                  ? 'bg-white/5 text-white/40 cursor-not-allowed'
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => onSaveDraft?.(applicationData as VendorApplication)}
                className="flex items-center space-x-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span>Save Draft</span>
              </button>

              {currentStep === totalSteps ? (
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                >
                  <Send className="w-5 h-5" />
                  <span>Submit Application</span>
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                >
                  <span>Next Step</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Step {currentStep} of {totalSteps} • Need help? Contact us at vendors@luxuryheights.com
          </p>
        </div>
      </div>
    </div>
  )
}