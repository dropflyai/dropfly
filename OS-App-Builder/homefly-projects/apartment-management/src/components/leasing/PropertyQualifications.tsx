'use client'

import React, { useState } from 'react'
import { 
  Settings, 
  DollarSign, 
  Save, 
  Shield, 
  Key, 
  FileText, 
  Car, 
  Zap, 
  Home, 
  Edit3,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface PropertyQualificationsProps {
  propertyId: string
  propertyName: string
  onSave: (qualifications: PropertyQualifications) => void
}

export interface PropertyQualifications {
  securityDepositMultiplier: number
  keyDeposit: number
  adminFee: number
  utilityDeposit: number
  parkingFee: number
  petDeposit: number
  applicationFee: number
  moveInSpecial?: {
    description: string
    discount: number
    expirationDate?: string
  }
  qualificationCriteria: {
    minimumCreditScore: number
    minimumIncome: number // Monthly income requirement as multiple of rent
    maxDebtToIncomeRatio: number // Percentage
    employmentHistory: number // Months
    backgroundCheckRequired: boolean
    previousRentalHistory: number // Years
  }
  additionalFees: {
    petRent?: number
    storageUnit?: number
    garagePremium?: number
    shortTermLeaseFee?: number
  }
}

export default function PropertyQualifications({
  propertyId,
  propertyName,
  onSave
}: PropertyQualificationsProps) {
  const [qualifications, setQualifications] = useState<PropertyQualifications>({
    securityDepositMultiplier: 1.0,
    keyDeposit: 250,
    adminFee: 300,
    utilityDeposit: 150,
    parkingFee: 150,
    petDeposit: 500,
    applicationFee: 100,
    moveInSpecial: {
      description: "Move-in Special: First Month Free",
      discount: 0,
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    qualificationCriteria: {
      minimumCreditScore: 650,
      minimumIncome: 3.0, // 3x monthly rent
      maxDebtToIncomeRatio: 40,
      employmentHistory: 24,
      backgroundCheckRequired: true,
      previousRentalHistory: 2
    },
    additionalFees: {
      petRent: 50,
      storageUnit: 75,
      garagePremium: 100,
      shortTermLeaseFee: 200
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(qualifications)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateQualification = (path: string, value: any) => {
    setQualifications(prev => {
      const newQualifications = { ...prev }
      const keys = path.split('.')
      let current: any = newQualifications
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newQualifications
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Property Qualifications</h2>
            <p className="text-white/60">{propertyName} - Move-in Cost Settings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {saved && (
            <div className="flex items-center space-x-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Settings Saved</span>
            </div>
          )}
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isEditing ? 'Cancel' : 'Edit Settings'}</span>
          </button>
          
          {isEditing && (
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Move-in Costs */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
          <DollarSign className="w-6 h-6 mr-2" />
          Move-in Cost Structure
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Security Deposit (x Monthly Rent)
            </label>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <input
                type="number"
                step="0.1"
                min="0"
                max="3"
                value={qualifications.securityDepositMultiplier}
                onChange={(e) => updateQualification('securityDepositMultiplier', parseFloat(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
              <span className="text-white/60 text-sm">x rent</span>
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Key Deposit
            </label>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-yellow-400" />
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.keyDeposit}
                onChange={(e) => updateQualification('keyDeposit', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Administrative Fee
            </label>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.adminFee}
                onChange={(e) => updateQualification('adminFee', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Utility Deposit
            </label>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-green-400" />
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.utilityDeposit}
                onChange={(e) => updateQualification('utilityDeposit', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Parking Fee (Monthly)
            </label>
            <div className="flex items-center space-x-2">
              <Car className="w-5 h-5 text-cyan-400" />
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.parkingFee}
                onChange={(e) => updateQualification('parkingFee', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Pet Deposit
            </label>
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-orange-400" />
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.petDeposit}
                onChange={(e) => updateQualification('petDeposit', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Move-in Special */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Move-in Special Offer</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-white/70 text-sm font-medium mb-2">
              Special Description
            </label>
            <input
              type="text"
              value={qualifications.moveInSpecial?.description || ''}
              onChange={(e) => updateQualification('moveInSpecial.description', e.target.value)}
              disabled={!isEditing}
              placeholder="e.g., First Month Free, $500 Off Move-in"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Discount Amount
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.moveInSpecial?.discount || 0}
                onChange={(e) => updateQualification('moveInSpecial.discount', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Qualification Criteria */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Qualification Requirements</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Minimum Credit Score
            </label>
            <input
              type="number"
              min="300"
              max="850"
              value={qualifications.qualificationCriteria.minimumCreditScore}
              onChange={(e) => updateQualification('qualificationCriteria.minimumCreditScore', parseInt(e.target.value))}
              disabled={!isEditing}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Income Requirement (x Monthly Rent)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={qualifications.qualificationCriteria.minimumIncome}
              onChange={(e) => updateQualification('qualificationCriteria.minimumIncome', parseFloat(e.target.value))}
              disabled={!isEditing}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Max Debt-to-Income Ratio (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={qualifications.qualificationCriteria.maxDebtToIncomeRatio}
              onChange={(e) => updateQualification('qualificationCriteria.maxDebtToIncomeRatio', parseInt(e.target.value))}
              disabled={!isEditing}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Employment History (Months)
            </label>
            <input
              type="number"
              min="0"
              value={qualifications.qualificationCriteria.employmentHistory}
              onChange={(e) => updateQualification('qualificationCriteria.employmentHistory', parseInt(e.target.value))}
              disabled={!isEditing}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Rental History (Years)
            </label>
            <input
              type="number"
              min="0"
              value={qualifications.qualificationCriteria.previousRentalHistory}
              onChange={(e) => updateQualification('qualificationCriteria.previousRentalHistory', parseInt(e.target.value))}
              disabled={!isEditing}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="backgroundCheck"
              checked={qualifications.qualificationCriteria.backgroundCheckRequired}
              onChange={(e) => updateQualification('qualificationCriteria.backgroundCheckRequired', e.target.checked)}
              disabled={!isEditing}
              className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 disabled:opacity-50"
            />
            <label htmlFor="backgroundCheck" className="text-white/70">
              Background Check Required
            </label>
          </div>
        </div>
      </div>

      {/* Additional Fees */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Additional Monthly Fees</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Pet Rent (Monthly)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.additionalFees.petRent || 0}
                onChange={(e) => updateQualification('additionalFees.petRent', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Storage Unit
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.additionalFees.storageUnit || 0}
                onChange={(e) => updateQualification('additionalFees.storageUnit', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Garage Premium
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.additionalFees.garagePremium || 0}
                onChange={(e) => updateQualification('additionalFees.garagePremium', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm font-medium mb-2">
              Short-term Lease Fee
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-white/60">$</span>
              <input
                type="number"
                min="0"
                value={qualifications.additionalFees.shortTermLeaseFee || 0}
                onChange={(e) => updateQualification('additionalFees.shortTermLeaseFee', parseInt(e.target.value))}
                disabled={!isEditing}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Help Information */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-3xl p-6">
        <div className="flex items-start space-x-3">
          <Info className="w-6 h-6 text-blue-400 mt-1" />
          <div>
            <h4 className="text-lg font-semibold text-blue-300 mb-2">Property Qualification Settings</h4>
            <div className="text-blue-200 text-sm space-y-1">
              <p>• These settings determine move-in costs and approval criteria for all new applications</p>
              <p>• Security deposit multiplier: 1.0 = one month's rent, 1.5 = one and a half month's rent</p>
              <p>• Income requirement: 3.0 means applicant must earn 3x the monthly rent</p>
              <p>• Changes will apply to new applications after saving</p>
              <p>• Move-in specials can be time-limited promotional offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}