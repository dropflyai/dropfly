'use client'

import React from 'react'
import { 
  Download, 
  FileText, 
  Building, 
  User, 
  Calendar, 
  DollarSign,
  Shield,
  Key,
  Home,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  Zap,
  Car,
  Package,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface MoveOutCostsPDFProps {
  tenant: {
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
  propertyName: string
  propertyAddress: string
  moveOutFinancials: {
    leaseBreakFee: number
    cleaningFee: number
    repairCharges: number
    utilityCharges: number
    rentersInsuranceFee: number
    keyReplacementFee: number
    securityDepositRefund: number
    keyDepositRefund: number
    petDepositRefund: number
    proratedRentCredit: number
    isEarlyTermination: boolean
    daysEarly: number
    totalPotentialRefund: number
    totalPotentialCharges: number
  }
  moveOutProcedures: {
    noticeRequirement: number
    inspectionScheduling: string
    keyReturnDeadline: string
    cleaningRequirements: string[]
    repairRequirements: string[]
    finalWalkthrough: string
    depositReturnTimeframe: number
    forwardingAddressRequired: boolean
    utilityCutoffProcedure: string
    contactInformation: {
      office: string
      emergency: string
      email: string
    }
  }
}

export default function MoveOutCostsPDF({
  tenant,
  propertyName,
  propertyAddress,
  moveOutFinancials,
  moveOutProcedures
}: MoveOutCostsPDFProps) {
  
  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString()
    const moveOutDate = new Date(tenant.moveOutDate).toLocaleDateString()
    const leaseEndDate = new Date(tenant.leaseEndDate).toLocaleDateString()
    const noticeDate = new Date(tenant.noticeDate).toLocaleDateString()
    
    return (
      <div className="bg-white text-black p-8 max-w-4xl mx-auto" id="moveout-pdf-content">
        {/* Header */}
        <div className="border-b-2 border-gray-800 pb-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{propertyName}</h1>
              <div className="flex items-center mt-2 text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{propertyAddress}</span>
              </div>
              <div className="flex items-center mt-1 text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                <span>{moveOutProcedures.contactInformation.office}</span>
                <Mail className="w-4 h-4 ml-4 mr-2" />
                <span>{moveOutProcedures.contactInformation.email}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mb-2">
                <Building className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-600">Document Date:</p>
              <p className="font-semibold">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MOVE-OUT PROCEDURES & COST SUMMARY</h2>
          <div className="flex items-center justify-center">
            {moveOutFinancials.isEarlyTermination ? (
              <>
                <AlertTriangle className="w-6 h-6 text-orange-600 mr-2" />
                <span className="text-lg text-orange-600 font-semibold">EARLY TERMINATION - {moveOutFinancials.daysEarly} DAYS</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <span className="text-lg text-green-600 font-semibold">LEASE TERM COMPLETION</span>
              </>
            )}
          </div>
        </div>

        {/* Tenant Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Tenant Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{tenant.firstName} {tenant.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{tenant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold">{tenant.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit:</span>
                <span className="font-semibold">{tenant.unitNumber} ({tenant.unitType})</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Move-Out Timeline
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Notice Date:</span>
                <span className="font-semibold">{noticeDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Move-Out Date:</span>
                <span className="font-semibold">{moveOutDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lease End Date:</span>
                <span className="font-semibold">{leaseEndDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rent:</span>
                <span className="font-semibold">${tenant.monthlyRent.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deposits & Potential Refunds */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            Deposits Held & Potential Refunds
          </h3>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deposit Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Held
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Refund Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">Security Deposit</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                    ${tenant.securityDeposit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    Subject to final inspection
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Key className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">Key Deposit</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                    ${tenant.keyDeposit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    Full refund if keys returned
                  </td>
                </tr>

                {tenant.petDeposit && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Home className="w-4 h-4 mr-2 text-orange-500" />
                        <span className="text-sm font-medium text-gray-900">Pet Deposit</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                      ${tenant.petDeposit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      Subject to pet damage inspection
                    </td>
                  </tr>
                )}

                {moveOutFinancials.proratedRentCredit > 0 && (
                  <tr className="bg-green-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-700">Prorated Rent Credit</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-700 font-semibold">
                      ${moveOutFinancials.proratedRentCredit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      Credit for unused days
                    </td>
                  </tr>
                )}

                <tr className="bg-green-50 border-t-2 border-gray-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-green-800">TOTAL POTENTIAL REFUND</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-2xl font-bold text-green-600">${moveOutFinancials.totalPotentialRefund.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-green-600">
                    Before deductions
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Potential Charges */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" />
            Potential Charges & Deductions
          </h3>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Charge Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {moveOutFinancials.leaseBreakFee > 0 && (
                  <tr className="bg-red-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <XCircle className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-sm font-medium text-red-900">Early Termination Fee</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-900 font-semibold">
                      ${moveOutFinancials.leaseBreakFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      Breaking lease {moveOutFinancials.daysEarly} days early
                    </td>
                  </tr>
                )}

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm font-medium text-gray-900">Cleaning Charges</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    TBD
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Determined after final inspection
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900">Repair Charges</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    TBD
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Beyond normal wear and tear
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">Utility Reconciliation</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    TBD
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Final utility usage billing
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Key className="w-4 h-4 mr-2 text-orange-500" />
                      <span className="text-sm font-medium text-gray-900">Key Replacement</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                    TBD
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Only if keys not returned
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Move-Out Procedures Checklist */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <CheckCircle className="w-6 h-6 mr-2" />
            Move-Out Procedures Checklist
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="text-lg font-bold text-blue-800 mb-4">Cleaning Requirements</h4>
              <ul className="space-y-2 text-blue-700">
                {moveOutProcedures.cleaningRequirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h4 className="text-lg font-bold text-yellow-800 mb-4">Repair Requirements</h4>
              <ul className="space-y-2 text-yellow-700">
                {moveOutProcedures.repairRequirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-2">•</span>
                    <span className="text-sm">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Important Deadlines */}
        <div className="mb-8 bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Important Deadlines
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-orange-700">
            <div>
              <p className="font-semibold">Final Inspection:</p>
              <p className="text-sm">{moveOutProcedures.inspectionScheduling}</p>
            </div>
            <div>
              <p className="font-semibold">Key Return:</p>
              <p className="text-sm">{moveOutProcedures.keyReturnDeadline}</p>
            </div>
            <div>
              <p className="font-semibold">Utility Cutoff:</p>
              <p className="text-sm">{moveOutProcedures.utilityCutoffProcedure}</p>
            </div>
            <div>
              <p className="font-semibold">Deposit Refund:</p>
              <p className="text-sm">Within {moveOutProcedures.depositReturnTimeframe} days of move-out</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-green-800 mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-green-700">
            <div>
              <p className="font-semibold">Office Hours:</p>
              <p className="text-sm">{moveOutProcedures.contactInformation.office}</p>
            </div>
            <div>
              <p className="font-semibold">Emergency Contact:</p>
              <p className="text-sm">{moveOutProcedures.contactInformation.emergency}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p className="text-sm">{moveOutProcedures.contactInformation.email}</p>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Legal Notice</h3>
          <div className="space-y-2 text-gray-700 text-sm">
            <p>• Final charges will be determined after completion of move-out inspection</p>
            <p>• All deposits are subject to the terms and conditions of your lease agreement</p>
            <p>• You have the right to request an itemized list of any deductions from your deposit</p>
            <p>• Deposit refunds are processed within {moveOutProcedures.depositReturnTimeframe} days as required by state law</p>
            <p>• This document serves as official notice of move-out procedures and potential charges</p>
            {moveOutProcedures.forwardingAddressRequired && (
              <p>• <strong>Forwarding address is required</strong> for deposit refund and final correspondence</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
          <p className="mb-2">This document was generated electronically by {propertyName} Move-Out System</p>
          <p>Document ID: MOC-{tenant.lastName.toUpperCase()}-{Date.now().toString().slice(-8)}</p>
          <p className="mt-4">Thank you for being a valued resident at {propertyName}</p>
        </div>
      </div>
    )
  }

  const handleDownloadPDF = () => {
    // In a real implementation, this would use a PDF generation library like jsPDF or react-pdf
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Move-Out Procedures - ${tenant.firstName} ${tenant.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .bg-gray-50 { background-color: #f9fafb; }
              .bg-blue-50 { background-color: #eff6ff; }
              .bg-yellow-50 { background-color: #fffbeb; }
              .bg-green-50 { background-color: #f0fdf4; }
              .bg-orange-50 { background-color: #fff7ed; }
              .bg-red-50 { background-color: #fef2f2; }
              .border { border: 1px solid #e5e7eb; }
              .border-blue-200 { border-color: #bfdbfe; }
              .border-yellow-200 { border-color: #fde68a; }
              .border-green-200 { border-color: #bbf7d0; }
              .border-orange-200 { border-color: #fed7aa; }
              .border-gray-200 { border-color: #e5e7eb; }
              .rounded-lg { border-radius: 8px; }
              .p-6 { padding: 24px; }
              .mb-8 { margin-bottom: 32px; }
              .mb-4 { margin-bottom: 16px; }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .text-lg { font-size: 18px; }
              .text-2xl { font-size: 24px; }
              .text-3xl { font-size: 30px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
              .text-right { text-align: right; }
              @media print { 
                body { margin: 0; } 
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${document.getElementById('moveout-pdf-content')?.innerHTML}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Move-Out Procedures Document</h3>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-xl text-orange-300 hover:bg-orange-500/30 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>
      
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        {generatePDFContent()}
      </div>
    </div>
  )
}