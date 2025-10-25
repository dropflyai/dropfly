'use client'

import React, { useState } from 'react'
import { 
  FileText, 
  Mail, 
  Download, 
  Eye, 
  Edit3, 
  Copy, 
  Send, 
  Save,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Plus,
  Folder,
  Upload
} from 'lucide-react'

import ApprovalEmailTemplate from './ApprovalEmailTemplate'
import MoveOutEmailTemplate from './MoveOutEmailTemplate'

interface DocumentsAndTemplatesProps {
  propertyName: string
  propertyAddress: string
  demoApplicant: any
  demoTenant: any
  demoPropertyQualifications: any
  demoMoveOutProcedures: any
  onSendEmail: (emailData: any) => void
  onSaveDraft: (emailData: any) => void
  onSendMoveOutEmail: (emailData: any) => void
  onSaveMoveOutDraft: (emailData: any) => void
}

export default function DocumentsAndTemplates({
  propertyName,
  propertyAddress,
  demoApplicant,
  demoTenant,
  demoPropertyQualifications,
  demoMoveOutProcedures,
  onSendEmail,
  onSaveDraft,
  onSendMoveOutEmail,
  onSaveMoveOutDraft
}: DocumentsAndTemplatesProps) {
  const [activeCategory, setActiveCategory] = useState('email-templates')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const documentCategories = [
    { id: 'email-templates', label: 'Email Templates', icon: Mail, count: 8 },
    { id: 'lease-documents', label: 'Lease Documents', icon: FileText, count: 12 },
    { id: 'forms', label: 'Application Forms', icon: CheckCircle, count: 6 },
    { id: 'policies', label: 'Policies & Procedures', icon: AlertTriangle, count: 15 },
    { id: 'notices', label: 'Legal Notices', icon: FileText, count: 10 },
    { id: 'vendor-docs', label: 'Vendor Documents', icon: Folder, count: 7 }
  ]

  const emailTemplates = [
    {
      id: 'approval-email',
      name: 'Application Approval Email',
      description: 'Congratulations email sent to approved applicants',
      category: 'Onboarding',
      lastModified: '2025-01-15',
      status: 'active'
    },
    {
      id: 'moveout-email',
      name: 'Move-Out Instructions Email',
      description: 'Detailed instructions for tenant move-out procedures',
      category: 'Offboarding',
      lastModified: '2025-01-12',
      status: 'active'
    },
    {
      id: 'application-received',
      name: 'Application Received Confirmation',
      description: 'Automatic confirmation when application is submitted',
      category: 'Application Process',
      lastModified: '2025-01-10',
      status: 'active'
    },
    {
      id: 'lease-renewal',
      name: 'Lease Renewal Reminder',
      description: 'Notice to tenants about upcoming lease expiration',
      category: 'Lease Management',
      lastModified: '2025-01-08',
      status: 'active'
    },
    {
      id: 'maintenance-scheduled',
      name: 'Maintenance Scheduled Notification',
      description: 'Notification when maintenance work is scheduled',
      category: 'Maintenance',
      lastModified: '2025-01-05',
      status: 'active'
    },
    {
      id: 'rent-reminder',
      name: 'Rent Payment Reminder',
      description: 'Friendly reminder for upcoming rent payment',
      category: 'Payment',
      lastModified: '2025-01-03',
      status: 'active'
    }
  ]

  const renderTemplateContent = () => {
    switch (selectedTemplate) {
      case 'approval-email':
        return (
          <ApprovalEmailTemplate 
            applicant={demoApplicant}
            propertyName={propertyName}
            propertyQualifications={demoPropertyQualifications}
            onSendEmail={onSendEmail}
            onSaveDraft={onSaveDraft}
          />
        )
      case 'moveout-email':
        return (
          <MoveOutEmailTemplate 
            tenant={demoTenant}
            propertyName={propertyName}
            propertyAddress={propertyAddress}
            moveOutProcedures={demoMoveOutProcedures}
            onSendEmail={onSendMoveOutEmail}
            onSaveDraft={onSaveMoveOutDraft}
          />
        )
      default:
        return (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
            <FileText className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Template Preview</h3>
            <p className="text-white/60">Select a template from the list to view and edit</p>
          </div>
        )
    }
  }

  const filteredTemplates = emailTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Documents & Templates</h2>
            <p className="text-white/60">Manage email templates, forms, and documents</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-300 hover:bg-green-500/30 transition-colors">
            <Upload className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
          
          <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105">
            <Plus className="w-5 h-5" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-2xl p-1 overflow-x-auto">
        {documentCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span>{category.label} ({category.count})</span>
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search templates and documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <select className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option value="all" className="bg-gray-800">All Categories</option>
              <option value="onboarding" className="bg-gray-800">Onboarding</option>
              <option value="offboarding" className="bg-gray-800">Offboarding</option>
              <option value="maintenance" className="bg-gray-800">Maintenance</option>
              <option value="payment" className="bg-gray-800">Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Template List */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Email Templates</h3>
              <p className="text-white/60 text-sm">Click to preview and edit</p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`w-full p-4 text-left hover:bg-white/5 transition-colors border-b border-white/5 ${
                    selectedTemplate === template.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{template.name}</h4>
                      <p className="text-white/60 text-sm mb-2">{template.description}</p>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-blue-400">{template.category}</span>
                        <span className="text-xs text-white/40">{template.lastModified}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      <span className={`w-2 h-2 rounded-full ${
                        template.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Preview/Editor */}
        <div className="lg:col-span-2">
          {renderTemplateContent()}
        </div>
      </div>
    </div>
  )
}