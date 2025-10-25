'use client'

import React, { useState } from 'react'
import { 
  Mail, 
  FileText, 
  Calendar, 
  DollarSign, 
  Download, 
  Send, 
  Edit3, 
  CheckCircle,
  Key,
  Home,
  Shield,
  Clock,
  User,
  Phone,
  MapPin
} from 'lucide-react'

interface ApplicantData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  unitType: string
  unitNumber?: string
  monthlyRent: number
  leaseStart: string
  creditScore: number
  income: number
  applicationDate: string
}

interface PropertyQualifications {
  securityDepositMultiplier: number // e.g., 1.0 = 1 month rent
  keyDeposit: number
  petDeposit?: number
  adminFee: number
  utilityDeposit?: number
  parkingFee?: number
  moveInSpecial?: {
    description: string
    discount: number
  }
}

interface ApprovalEmailTemplateProps {
  applicant: ApplicantData
  propertyName: string
  propertyQualifications: PropertyQualifications
  onSendEmail: (emailData: any) => void
  onSaveDraft: (emailData: any) => void
}

export default function ApprovalEmailTemplate({
  applicant,
  propertyName,
  propertyQualifications,
  onSendEmail,
  onSaveDraft
}: ApprovalEmailTemplateProps) {
  const [emailSubject, setEmailSubject] = useState(
    `🎉 Application Approved - Welcome to ${propertyName}!`
  )
  const [customMessage, setCustomMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Calculate move-in costs
  const calculateMoveInCosts = () => {
    const monthlyRent = applicant.monthlyRent
    const leaseStartDate = new Date(applicant.leaseStart)
    const daysInMonth = new Date(leaseStartDate.getFullYear(), leaseStartDate.getMonth() + 1, 0).getDate()
    const daysRemaining = daysInMonth - leaseStartDate.getDate() + 1
    const proratedRent = (monthlyRent / daysInMonth) * daysRemaining

    const costs = {
      securityDeposit: monthlyRent * propertyQualifications.securityDepositMultiplier,
      firstMonthRent: monthlyRent,
      proratedRent: proratedRent,
      keyDeposit: propertyQualifications.keyDeposit,
      adminFee: propertyQualifications.adminFee,
      utilityDeposit: propertyQualifications.utilityDeposit || 0,
      parkingFee: propertyQualifications.parkingFee || 0,
      petDeposit: propertyQualifications.petDeposit || 0
    }

    const moveInSpecialDiscount = propertyQualifications.moveInSpecial?.discount || 0
    const subtotal = Object.values(costs).reduce((sum, cost) => sum + cost, 0)
    const total = subtotal - moveInSpecialDiscount

    return { ...costs, subtotal, moveInSpecialDiscount, total }
  }

  const moveInCosts = calculateMoveInCosts()

  const generateEmailContent = () => {
    return `
Dear ${applicant.firstName} ${applicant.lastName},

Congratulations! We are thrilled to inform you that your application for ${propertyName} has been APPROVED! 🎉

APPLICATION DETAILS:
• Applicant: ${applicant.firstName} ${applicant.lastName}
• Unit Type: ${applicant.unitType}${applicant.unitNumber ? ` - Unit ${applicant.unitNumber}` : ''}
• Monthly Rent: $${applicant.monthlyRent.toLocaleString()}
• Lease Start Date: ${new Date(applicant.leaseStart).toLocaleDateString()}
• Credit Score: ${applicant.creditScore}
• Verified Income: $${applicant.income.toLocaleString()}/year

MOVE-IN COSTS BREAKDOWN:
Please find attached your detailed Move-In Cost Calculation document. Here's a summary:

Security Deposit: $${moveInCosts.securityDeposit.toLocaleString()}
${moveInCosts.proratedRent < applicant.monthlyRent ? `Prorated Rent (${new Date(applicant.leaseStart).toLocaleDateString()} - End of Month): $${moveInCosts.proratedRent.toLocaleString()}` : `First Month's Rent: $${moveInCosts.firstMonthRent.toLocaleString()}`}
Administrative Fee: $${moveInCosts.adminFee.toLocaleString()}
Key Deposit: $${moveInCosts.keyDeposit.toLocaleString()}
${moveInCosts.utilityDeposit > 0 ? `Utility Deposit: $${moveInCosts.utilityDeposit.toLocaleString()}` : ''}
${moveInCosts.parkingFee > 0 ? `Parking Fee: $${moveInCosts.parkingFee.toLocaleString()}` : ''}
${moveInCosts.petDeposit > 0 ? `Pet Deposit: $${moveInCosts.petDeposit.toLocaleString()}` : ''}
${propertyQualifications.moveInSpecial ? `\n${propertyQualifications.moveInSpecial.description}: -$${propertyQualifications.moveInSpecial.discount.toLocaleString()}` : ''}

TOTAL MOVE-IN COST: $${moveInCosts.total.toLocaleString()}

NEXT STEPS:
1. Review the attached Move-In Cost Calculation document
2. Prepare certified funds (cashier's check or money order) for the total move-in amount
3. Schedule your lease signing appointment by calling us at (555) 123-4567
4. Complete your move-in inspection within 48 hours of lease signing

${customMessage ? `\nPERSONAL MESSAGE:\n${customMessage}\n` : ''}

We're excited to welcome you to your new home at ${propertyName}! Our team is here to ensure a smooth transition. Please don't hesitate to contact us with any questions.

Best regards,
${propertyName} Leasing Team
📧 leasing@${propertyName.toLowerCase().replace(/\s+/g, '')}.com
📞 (555) 123-4567
🏢 Luxury Living, Exceptional Service

---
This email contains confidential information. Please keep this document secure and contact us immediately if you have any questions about the move-in process.
`
  }

  const EmailPreview = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">To:</span>
          <span className="font-medium">{applicant.email}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Subject:</span>
          <span className="font-medium">{emailSubject}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Attachment:</span>
          <span className="text-sm text-blue-600">Move-In_Costs_${applicant.lastName}_${applicant.firstName}.pdf</span>
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
          {generateEmailContent()}
        </pre>
      </div>
    </div>
  )

  const handleSendEmail = () => {
    const emailData = {
      to: applicant.email,
      subject: emailSubject,
      content: generateEmailContent(),
      applicant,
      moveInCosts,
      propertyName,
      attachments: [{
        filename: `Move-In_Costs_${applicant.lastName}_${applicant.firstName}.pdf`,
        content: 'PDF_CONTENT_PLACEHOLDER'
      }]
    }
    onSendEmail(emailData)
  }

  const handleSaveDraft = () => {
    const emailData = {
      to: applicant.email,
      subject: emailSubject,
      content: generateEmailContent(),
      applicant,
      moveInCosts,
      customMessage,
      status: 'draft'
    }
    onSaveDraft(emailData)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Approval Email</h2>
            <p className="text-white/60">Automated email for approved application</p>
          </div>
        </div>
      </div>

      {/* Applicant Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Applicant Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-400" />
              <span className="text-white">{applicant.firstName} {applicant.lastName}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-green-400" />
              <span className="text-white">{applicant.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-purple-400" />
              <span className="text-white">{applicant.phone}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Home className="w-5 h-5 text-yellow-400" />
              <span className="text-white">{applicant.unitType}</span>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-white">${applicant.monthlyRent.toLocaleString()}/month</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-white">{new Date(applicant.leaseStart).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Move-In Costs Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Move-In Costs Calculation</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/70">Security Deposit:</span>
              <span className="text-white font-medium">${moveInCosts.securityDeposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">
                {moveInCosts.proratedRent < applicant.monthlyRent ? 'Prorated Rent:' : 'First Month Rent:'}
              </span>
              <span className="text-white font-medium">
                ${(moveInCosts.proratedRent < applicant.monthlyRent ? moveInCosts.proratedRent : moveInCosts.firstMonthRent).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Administrative Fee:</span>
              <span className="text-white font-medium">${moveInCosts.adminFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Key Deposit:</span>
              <span className="text-white font-medium">${moveInCosts.keyDeposit.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-3">
            {moveInCosts.utilityDeposit > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Utility Deposit:</span>
                <span className="text-white font-medium">${moveInCosts.utilityDeposit.toLocaleString()}</span>
              </div>
            )}
            {moveInCosts.parkingFee > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Parking Fee:</span>
                <span className="text-white font-medium">${moveInCosts.parkingFee.toLocaleString()}</span>
              </div>
            )}
            {moveInCosts.petDeposit > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Pet Deposit:</span>
                <span className="text-white font-medium">${moveInCosts.petDeposit.toLocaleString()}</span>
              </div>
            )}
            {propertyQualifications.moveInSpecial && (
              <div className="flex justify-between text-green-400">
                <span>Move-in Special:</span>
                <span className="font-medium">-${propertyQualifications.moveInSpecial.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-3">
              <div className="flex justify-between text-lg font-bold text-green-400">
                <span>Total Move-In Cost:</span>
                <span>${moveInCosts.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Customization */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Email Customization</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Email Subject</label>
            <input
              type="text"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Personal Message (Optional)</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal note for this tenant..."
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Email Preview */}
      {showPreview && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Email Preview</h3>
          <EmailPreview />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center space-x-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
        >
          <Edit3 className="w-5 h-5" />
          <span>{showPreview ? 'Hide Preview' : 'Preview Email'}</span>
        </button>

        <button
          onClick={handleSaveDraft}
          className="flex items-center space-x-2 px-6 py-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300 hover:bg-yellow-500/30 transition-colors"
        >
          <FileText className="w-5 h-5" />
          <span>Save Draft</span>
        </button>

        <button
          onClick={handleSendEmail}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
        >
          <Send className="w-5 h-5" />
          <span>Send Approval Email</span>
        </button>

        <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors">
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  )
}