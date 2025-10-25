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
  CheckCircle
} from 'lucide-react'

interface MoveInCostsPDFProps {
  applicant: {
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
  propertyName: string
  propertyAddress: string
  moveInCosts: {
    securityDeposit: number
    firstMonthRent: number
    proratedRent: number
    keyDeposit: number
    adminFee: number
    utilityDeposit: number
    parkingFee: number
    petDeposit: number
    moveInSpecialDiscount: number
    total: number
  }
  propertyQualifications: {
    securityDepositMultiplier: number
    keyDeposit: number
    adminFee: number
    moveInSpecial?: {
      description: string
      discount: number
    }
  }
}

export default function MoveInCostsPDF({
  applicant,
  propertyName,
  propertyAddress,
  moveInCosts,
  propertyQualifications
}: MoveInCostsPDFProps) {
  
  const generatePDFContent = () => {
    const currentDate = new Date().toLocaleDateString()
    const leaseStartDate = new Date(applicant.leaseStart).toLocaleDateString()
    
    return (
      <div className="bg-white text-black p-8 max-w-4xl mx-auto" id="pdf-content">
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
                <span>(555) 123-4567</span>
                <Mail className="w-4 h-4 ml-4 mr-2" />
                <span>leasing@{propertyName.toLowerCase().replace(/\s+/g, '')}.com</span>
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-2">
                <Building className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm text-gray-600">Document Date:</p>
              <p className="font-semibold">{currentDate}</p>
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">MOVE-IN COST CALCULATION</h2>
          <div className="flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
            <span className="text-lg text-green-600 font-semibold">APPLICATION APPROVED</span>
          </div>
        </div>

        {/* Applicant Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Applicant Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{applicant.firstName} {applicant.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{applicant.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold">{applicant.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Application Date:</span>
                <span className="font-semibold">{new Date(applicant.applicationDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2" />
              Lease Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Type:</span>
                <span className="font-semibold">{applicant.unitType}</span>
              </div>
              {applicant.unitNumber && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Number:</span>
                  <span className="font-semibold">{applicant.unitNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Rent:</span>
                <span className="font-semibold">${applicant.monthlyRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lease Start Date:</span>
                <span className="font-semibold">{leaseStartDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Move-In Costs Breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <DollarSign className="w-6 h-6 mr-2" />
            Move-In Costs Breakdown
          </h3>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
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
                    ${moveInCosts.securityDeposit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {propertyQualifications.securityDepositMultiplier}x monthly rent
                  </td>
                </tr>
                
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {moveInCosts.proratedRent < applicant.monthlyRent ? 'Prorated Rent' : 'First Month Rent'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                    ${(moveInCosts.proratedRent < applicant.monthlyRent ? moveInCosts.proratedRent : moveInCosts.firstMonthRent).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {moveInCosts.proratedRent < applicant.monthlyRent ? 
                      `${leaseStartDate} - End of Month` : 
                      'Full month rent'}
                  </td>
                </tr>

                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm font-medium text-gray-900">Administrative Fee</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                    ${moveInCosts.adminFee.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    One-time processing fee
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
                    ${moveInCosts.keyDeposit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Refundable upon key return
                  </td>
                </tr>

                {moveInCosts.utilityDeposit > 0 && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">Utility Deposit</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                      ${moveInCosts.utilityDeposit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Utility connection deposit
                    </td>
                  </tr>
                )}

                {moveInCosts.parkingFee > 0 && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">Parking Fee</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                      ${moveInCosts.parkingFee.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      First month parking
                    </td>
                  </tr>
                )}

                {moveInCosts.petDeposit > 0 && (
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">Pet Deposit</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-semibold">
                      ${moveInCosts.petDeposit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Pet-related damages deposit
                    </td>
                  </tr>
                )}

                {propertyQualifications.moveInSpecial && moveInCosts.moveInSpecialDiscount > 0 && (
                  <tr className="bg-green-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-700">{propertyQualifications.moveInSpecial.description}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-700 font-semibold">
                      -${moveInCosts.moveInSpecialDiscount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600">
                      Limited time offer
                    </td>
                  </tr>
                )}

                <tr className="bg-gray-50 border-t-2 border-gray-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-gray-900">TOTAL MOVE-IN COST</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="text-2xl font-bold text-green-600">${moveInCosts.total.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Due at lease signing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">Payment Instructions</h3>
          <div className="space-y-2 text-blue-700">
            <p>• Payment must be made with certified funds (cashier's check or money order)</p>
            <p>• Personal checks are not accepted for move-in costs</p>
            <p>• Make payable to: {propertyName}</p>
            <p>• Bring this document and payment to your lease signing appointment</p>
            <p>• All deposits are subject to the terms of your lease agreement</p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-yellow-800 mb-4">Important Notes</h3>
          <div className="space-y-2 text-yellow-700 text-sm">
            <p>• This calculation is valid for 72 hours from the document date</p>
            <p>• Security deposit is refundable subject to lease terms and condition of unit upon move-out</p>
            <p>• Key deposit is fully refundable upon return of all keys and remotes</p>
            <p>• Prorated rent calculations are based on actual days of occupancy</p>
            <p>• Move-in special offers are subject to availability and may expire</p>
            <p>• Contact our leasing office immediately if you have questions about these charges</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
          <p className="mb-2">This document was generated electronically by {propertyName} Leasing System</p>
          <p>Document ID: MIC-{applicant.lastName.toUpperCase()}-{Date.now().toString().slice(-8)}</p>
          <p className="mt-4 font-semibold">Welcome to {propertyName}!</p>
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
            <title>Move-In Costs - ${applicant.firstName} ${applicant.lastName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .bg-gray-50 { background-color: #f9fafb; }
              .bg-blue-50 { background-color: #eff6ff; }
              .bg-yellow-50 { background-color: #fffbeb; }
              .bg-green-50 { background-color: #f0fdf4; }
              .border { border: 1px solid #e5e7eb; }
              .border-blue-200 { border-color: #bfdbfe; }
              .border-yellow-200 { border-color: #fde68a; }
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
            ${document.getElementById('pdf-content')?.innerHTML}
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
        <h3 className="text-lg font-bold text-white">Move-In Costs Document</h3>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-300 hover:bg-blue-500/30 transition-colors"
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