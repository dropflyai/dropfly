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
  AlertTriangle,
  Key,
  Home,
  Shield,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  Zap,
  Car,
  Package
} from 'lucide-react'

interface TenantData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  unitNumber: string
  unitType: string
  monthlyRent: number
  leaseEndDate: string
  moveOutDate: string
  securityDeposit: number
  keyDeposit: number
  petDeposit?: number
  moveInDate: string
  noticeDate: string
  leaseBreakReason?: string
}

interface MoveOutProcedures {
  noticeRequirement: number // days
  inspectionScheduling: string
  keyReturnDeadline: string
  cleaningRequirements: string[]
  repairRequirements: string[]
  finalWalkthrough: string
  depositReturnTimeframe: number // days
  forwardingAddressRequired: boolean
  utilityCutoffProcedure: string
  contactInformation: {
    office: string
    emergency: string
    email: string
  }
}

interface MoveOutEmailTemplateProps {
  tenant: TenantData
  propertyName: string
  propertyAddress: string
  moveOutProcedures: MoveOutProcedures
  onSendEmail: (emailData: any) => void
  onSaveDraft: (emailData: any) => void
}

export default function MoveOutEmailTemplate({
  tenant,
  propertyName,
  propertyAddress,
  moveOutProcedures,
  onSendEmail,
  onSaveDraft
}: MoveOutEmailTemplateProps) {
  const [emailSubject, setEmailSubject] = useState(
    `Move-Out Information - ${propertyName} Unit ${tenant.unitNumber}`
  )
  const [customMessage, setCustomMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Calculate move-out costs and refunds
  const calculateMoveOutFinancials = () => {
    const moveOutDate = new Date(tenant.moveOutDate)
    const leaseEndDate = new Date(tenant.leaseEndDate)
    const monthlyRent = tenant.monthlyRent
    
    // Calculate if early termination
    const isEarlyTermination = moveOutDate < leaseEndDate
    const daysInMonth = new Date(moveOutDate.getFullYear(), moveOutDate.getMonth() + 1, 0).getDate()
    const daysMoved = moveOutDate.getDate()
    const proratedRentCredit = ((daysInMonth - daysMoved) / daysInMonth) * monthlyRent

    const costs = {
      // Potential charges
      leaseBreakFee: isEarlyTermination ? monthlyRent * 2 : 0, // 2 months rent penalty
      cleaningFee: 0, // TBD after inspection
      repairCharges: 0, // TBD after inspection
      utilityCharges: 0, // TBD from utility reconciliation
      rentersInsuranceFee: 0, // TBD if policy needs extension
      keyReplacementFee: 0, // If keys not returned
      
      // Potential refunds
      securityDepositRefund: tenant.securityDeposit,
      keyDepositRefund: tenant.keyDeposit,
      petDepositRefund: tenant.petDeposit || 0,
      proratedRentCredit: isEarlyTermination ? 0 : proratedRentCredit,
      
      // Additional info
      isEarlyTermination,
      daysEarly: isEarlyTermination ? Math.ceil((leaseEndDate.getTime() - moveOutDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
    }

    const totalPotentialRefund = costs.securityDepositRefund + costs.keyDepositRefund + costs.petDepositRefund + costs.proratedRentCredit
    const totalPotentialCharges = costs.leaseBreakFee + costs.cleaningFee + costs.repairCharges + costs.utilityCharges + costs.rentersInsuranceFee + costs.keyReplacementFee

    return { ...costs, totalPotentialRefund, totalPotentialCharges }
  }

  const moveOutFinancials = calculateMoveOutFinancials()

  const generateEmailContent = () => {
    return `
Dear ${tenant.firstName} ${tenant.lastName},

We have received your notice to vacate Unit ${tenant.unitNumber} at ${propertyName}. This email contains important information about your move-out process and what to expect.

MOVE-OUT DETAILS:
• Tenant: ${tenant.firstName} ${tenant.lastName}
• Unit: ${tenant.unitNumber} (${tenant.unitType})
• Notice Date: ${new Date(tenant.noticeDate).toLocaleDateString()}
• Scheduled Move-Out Date: ${new Date(tenant.moveOutDate).toLocaleDateString()}
• Lease End Date: ${new Date(tenant.leaseEndDate).toLocaleDateString()}
${moveOutFinancials.isEarlyTermination ? `• Early Termination: Yes (${moveOutFinancials.daysEarly} days early)` : '• Lease Term: Completing full term'}

MOVE-OUT PROCEDURES:
Please find attached your detailed Move-Out Procedures and Financial Summary document. Key requirements:

1. FINAL INSPECTION SCHEDULING
   ${moveOutProcedures.inspectionScheduling}

2. KEY RETURN
   ${moveOutProcedures.keyReturnDeadline}

3. CLEANING REQUIREMENTS
${moveOutProcedures.cleaningRequirements.map(req => `   • ${req}`).join('\n')}

4. REPAIR REQUIREMENTS
${moveOutProcedures.repairRequirements.map(req => `   • ${req}`).join('\n')}

5. FINAL WALKTHROUGH
   ${moveOutProcedures.finalWalkthrough}

6. UTILITY CUTOFF
   ${moveOutProcedures.utilityCutoffProcedure}

FINANCIAL SUMMARY:
Deposits Held:
• Security Deposit: $${tenant.securityDeposit.toLocaleString()}
• Key Deposit: $${tenant.keyDeposit.toLocaleString()}
${tenant.petDeposit ? `• Pet Deposit: $${tenant.petDeposit.toLocaleString()}` : ''}

${moveOutFinancials.isEarlyTermination ? `Early Termination Fee: $${moveOutFinancials.leaseBreakFee.toLocaleString()}` : ''}
${moveOutFinancials.proratedRentCredit > 0 ? `Prorated Rent Credit: $${moveOutFinancials.proratedRentCredit.toLocaleString()}` : ''}

Final charges will be determined after:
• Final inspection for cleaning and damages
• Utility usage reconciliation
• Key return verification
• Insurance policy confirmation

DEPOSIT RETURN TIMEFRAME:
Your security deposit refund (minus any applicable charges) will be processed within ${moveOutProcedures.depositReturnTimeframe} days of your move-out date, as required by state law. A detailed accounting of any charges will be provided with your refund.

${moveOutProcedures.forwardingAddressRequired ? `FORWARDING ADDRESS REQUIRED:
Please provide your forwarding address for deposit refund and final correspondence. You can update this in your tenant portal or contact our office.` : ''}

CONTACT INFORMATION:
• Office: ${moveOutProcedures.contactInformation.office}
• Emergency: ${moveOutProcedures.contactInformation.emergency}
• Email: ${moveOutProcedures.contactInformation.email}

${customMessage ? `\nADDITIONAL NOTES:\n${customMessage}\n` : ''}

We appreciate your tenancy at ${propertyName} and want to ensure a smooth move-out process. Please don't hesitate to contact us with any questions about these procedures.

Thank you for being a valued resident,
${propertyName} Management Team
📧 ${moveOutProcedures.contactInformation.email}
📞 ${moveOutProcedures.contactInformation.office}
🏢 Professional Property Management

---
This notice contains important legal and financial information. Please retain this document for your records and refer to your lease agreement for complete terms and conditions.
`
  }

  const EmailPreview = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">To:</span>
          <span className="font-medium">{tenant.email}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Subject:</span>
          <span className="font-medium">{emailSubject}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Attachment:</span>
          <span className="text-sm text-blue-600">Move-Out_Guide_Unit_{tenant.unitNumber}_{tenant.lastName}.pdf</span>
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
      to: tenant.email,
      subject: emailSubject,
      content: generateEmailContent(),
      tenant,
      moveOutFinancials,
      propertyName,
      attachments: [{
        filename: `Move-Out_Guide_Unit_${tenant.unitNumber}_${tenant.lastName}.pdf`,
        content: 'PDF_CONTENT_PLACEHOLDER'
      }]
    }
    onSendEmail(emailData)
  }

  const handleSaveDraft = () => {
    const emailData = {
      to: tenant.email,
      subject: emailSubject,
      content: generateEmailContent(),
      tenant,
      moveOutFinancials,
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
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Move-Out Email</h2>
            <p className="text-white/60">Automated email for tenant move-out process</p>
          </div>
        </div>
      </div>

      {/* Tenant Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Tenant Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-400" />
              <span className="text-white">{tenant.firstName} {tenant.lastName}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-green-400" />
              <span className="text-white">{tenant.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-purple-400" />
              <span className="text-white">{tenant.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Home className="w-5 h-5 text-yellow-400" />
              <span className="text-white">Unit {tenant.unitNumber} ({tenant.unitType})</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-white">Move-Out: {new Date(tenant.moveOutDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-orange-400" />
              <span className="text-white">Lease End: {new Date(tenant.leaseEndDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-green-400" />
              <span className="text-white">${tenant.monthlyRent.toLocaleString()}/month</span>
            </div>
            <div className="flex items-center space-x-3">
              {moveOutFinancials.isEarlyTermination ? (
                <>
                  <XCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300">Early Termination ({moveOutFinancials.daysEarly} days)</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-300">Full Lease Term</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Financial Summary</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Deposits Held */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Deposits Held</h4>
            <div className="flex justify-between">
              <span className="text-white/70">Security Deposit:</span>
              <span className="text-white font-medium">${tenant.securityDeposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Key Deposit:</span>
              <span className="text-white font-medium">${tenant.keyDeposit.toLocaleString()}</span>
            </div>
            {tenant.petDeposit && (
              <div className="flex justify-between">
                <span className="text-white/70">Pet Deposit:</span>
                <span className="text-white font-medium">${tenant.petDeposit.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-white/20 pt-2">
              <div className="flex justify-between text-green-400 font-semibold">
                <span>Total Deposits:</span>
                <span>${moveOutFinancials.totalPotentialRefund.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Potential Charges */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">Potential Charges</h4>
            {moveOutFinancials.leaseBreakFee > 0 && (
              <div className="flex justify-between">
                <span className="text-white/70">Early Termination Fee:</span>
                <span className="text-red-300 font-medium">${moveOutFinancials.leaseBreakFee.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-white/70">Cleaning Charges:</span>
              <span className="text-white/50 text-sm">TBD after inspection</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Repair Charges:</span>
              <span className="text-white/50 text-sm">TBD after inspection</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Utility Reconciliation:</span>
              <span className="text-white/50 text-sm">TBD from billing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Key Replacement:</span>
              <span className="text-white/50 text-sm">TBD if not returned</span>
            </div>
          </div>
        </div>
      </div>

      {/* Move-Out Status */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Move-Out Checklist Status</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <span className="text-white/80">Notice Submitted</span>
              <span className="text-green-400 text-sm">✓ Complete</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-white/80">Inspection Scheduled</span>
              <span className="text-yellow-400 text-sm">Pending</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-white/80">Unit Cleaned</span>
              <span className="text-gray-400 text-sm">Pending</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center">
                <Key className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-white/80">Keys Returned</span>
              <span className="text-gray-400 text-sm">Pending</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-white/80">Utilities Transferred</span>
              <span className="text-gray-400 text-sm">Pending</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-500/20 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <span className="text-white/80">Forwarding Address</span>
              <span className="text-gray-400 text-sm">Pending</span>
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
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">Additional Notes (Optional)</label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add specific instructions or information for this tenant..."
              rows={4}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
        >
          <Send className="w-5 h-5" />
          <span>Send Move-Out Email</span>
        </button>

        <button className="flex items-center space-x-2 px-6 py-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors">
          <Download className="w-5 h-5" />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  )
}