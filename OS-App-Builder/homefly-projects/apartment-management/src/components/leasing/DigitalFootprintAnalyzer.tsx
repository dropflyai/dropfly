'use client'

import React, { useState } from 'react'
import { Eye, Shield, AlertTriangle, TrendingUp, Users, MapPin, Calendar, Brain, Search, Globe, Lock, Zap } from 'lucide-react'

interface SocialProfile {
  platform: string
  username: string
  verified: boolean
  followers: number
  following: number
  posts: number
  accountAge: number
  profileComplete: number
  riskScore: number
  lastActivity: string
  flags: string[]
}

interface DigitalFootprint {
  emailAnalysis: {
    breachHistory: number
    accountAge: number
    associatedServices: string[]
    reputation: 'excellent' | 'good' | 'fair' | 'poor'
  }
  phoneAnalysis: {
    carrierType: 'mobile' | 'landline' | 'voip'
    location: string
    ported: boolean
    reputation: number
    spamReports: number
  }
  addressAnalysis: {
    residencyHistory: string[]
    ownershipHistory: boolean
    neighborhoodScore: number
    crimeIndex: number
  }
  behaviorAnalysis: {
    consistencyScore: number
    authenticityScore: number
    socialEngagementScore: number
    riskIndicators: string[]
  }
  overallRiskScore: number
}

const DigitalFootprintAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'social' | 'digital' | 'behavior'>('overview')
  const [analysisDepth, setAnalysisDepth] = useState<'basic' | 'standard' | 'deep'>('standard')

  // Mock data - in production, this would come from various data sources and APIs
  const socialProfiles: SocialProfile[] = [
    {
      platform: 'LinkedIn',
      username: 'john.doe.engineer',
      verified: true,
      followers: 842,
      following: 456,
      posts: 128,
      accountAge: 6.5,
      profileComplete: 0.95,
      riskScore: 0.15,
      lastActivity: '2025-01-17',
      flags: []
    },
    {
      platform: 'Facebook',
      username: 'john.doe.sf',
      verified: false,
      followers: 324,
      following: 298,
      posts: 45,
      accountAge: 8.2,
      profileComplete: 0.78,
      riskScore: 0.25,
      lastActivity: '2025-01-15',
      flags: ['Limited public posts', 'Privacy settings high']
    },
    {
      platform: 'Instagram',
      username: 'johndoe_tech',
      verified: false,
      followers: 156,
      following: 89,
      posts: 23,
      accountAge: 2.1,
      profileComplete: 0.65,
      riskScore: 0.35,
      lastActivity: '2025-01-10',
      flags: ['Recent account creation', 'Low engagement rate']
    },
    {
      platform: 'Twitter/X',
      username: 'jdoe_codes',
      verified: false,
      followers: 89,
      following: 234,
      posts: 412,
      accountAge: 4.3,
      profileComplete: 0.82,
      riskScore: 0.20,
      lastActivity: '2025-01-18',
      flags: []
    }
  ]

  const digitalFootprint: DigitalFootprint = {
    emailAnalysis: {
      breachHistory: 2,
      accountAge: 7.5,
      associatedServices: ['LinkedIn', 'GitHub', 'Amazon', 'Netflix', 'Spotify'],
      reputation: 'good'
    },
    phoneAnalysis: {
      carrierType: 'mobile',
      location: 'San Francisco, CA',
      ported: false,
      reputation: 0.88,
      spamReports: 0
    },
    addressAnalysis: {
      residencyHistory: ['Current: 123 Tech St, SF, CA (2.1 years)', 'Previous: 456 Code Ave, SF, CA (3.2 years)'],
      ownershipHistory: false,
      neighborhoodScore: 0.85,
      crimeIndex: 0.22
    },
    behaviorAnalysis: {
      consistencyScore: 0.82,
      authenticityScore: 0.89,
      socialEngagementScore: 0.74,
      riskIndicators: [
        'Recent increase in social media activity',
        'Limited long-term address history'
      ]
    },
    overallRiskScore: 0.23
  }

  const formatFollowers = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const getRiskColor = (score: number) => {
    if (score <= 0.3) return 'text-green-400'
    if (score <= 0.6) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getReputationColor = (reputation: string) => {
    switch (reputation) {
      case 'excellent': return 'text-green-400'
      case 'good': return 'text-blue-400'
      case 'fair': return 'text-yellow-400'
      case 'poor': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getPlatformIcon = (platform: string) => {
    // In a real app, these would be actual platform icons
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Globe className="w-5 h-5 text-blue-500" />
      case 'facebook': return <Globe className="w-5 h-5 text-blue-600" />
      case 'instagram': return <Globe className="w-5 h-5 text-pink-500" />
      case 'twitter/x': return <Globe className="w-5 h-5 text-blue-400" />
      default: return <Globe className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Digital Footprint Analyzer</h2>
          <p className="text-gray-400">Comprehensive social media and digital identity verification</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={analysisDepth}
            onChange={(e) => setAnalysisDepth(e.target.value as 'basic' | 'standard' | 'deep')}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-400 focus:outline-none"
          >
            <option value="basic">Basic Analysis</option>
            <option value="standard">Standard Analysis</option>
            <option value="deep">Deep Analysis</option>
          </select>
          <div className="text-right">
            <div className="text-sm text-gray-400">Overall Risk Score</div>
            <div className={`text-2xl font-bold ${getRiskColor(digitalFootprint.overallRiskScore)}`}>
              {Math.round(digitalFootprint.overallRiskScore * 100)}/100
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {(['overview', 'social', 'digital', 'behavior'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Assessment */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Social Media Risk:</span>
                <span className={getRiskColor(0.25)}>Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Digital Identity:</span>
                <span className={getRiskColor(0.20)}>Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Behavioral Flags:</span>
                <span className={getRiskColor(0.30)}>Low</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Address History:</span>
                <span className={getRiskColor(0.25)}>Low</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-900/20 border border-green-600/30 rounded-lg">
              <div className="text-green-400 font-medium mb-1">Verification Status</div>
              <div className="text-green-300 text-sm">
                Digital identity confirmed. Low risk applicant with consistent online presence.
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {digitalFootprint.behaviorAnalysis.authenticityScore * 100}%
                </div>
                <div className="text-sm text-gray-400">Authenticity Score</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">
                  {socialProfiles.length}
                </div>
                <div className="text-sm text-gray-400">Verified Platforms</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">
                  {digitalFootprint.emailAnalysis.accountAge.toFixed(1)}y
                </div>
                <div className="text-sm text-gray-400">Digital Age</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black py-2 rounded-lg font-medium hover:from-yellow-500 hover:to-yellow-700 transition-all">
                Run Deep Scan
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
                Social Media Audit
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
                Behavior Analysis
              </button>
              <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialProfiles.map((profile, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getPlatformIcon(profile.platform)}
                    <h3 className="text-lg font-semibold text-white ml-3">{profile.platform}</h3>
                    {profile.verified && (
                      <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${getRiskColor(profile.riskScore)}`}>
                    Risk: {Math.round(profile.riskScore * 100)}%
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Username:</span>
                    <span className="text-white">@{profile.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Followers:</span>
                    <span className="text-white">{formatFollowers(profile.followers)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Age:</span>
                    <span className="text-white">{profile.accountAge} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Profile Complete:</span>
                    <span className="text-white">{Math.round(profile.profileComplete * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Activity:</span>
                    <span className="text-white">{profile.lastActivity}</span>
                  </div>
                </div>

                {profile.flags.length > 0 && (
                  <div className="border-t border-gray-700 pt-3">
                    <div className="text-yellow-400 text-sm font-medium mb-2">Flags:</div>
                    {profile.flags.map((flag, flagIndex) => (
                      <div key={flagIndex} className="text-yellow-300 text-sm flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-2" />
                        {flag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital Identity Tab */}
      {activeTab === 'digital' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Analysis */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Eye className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Email Analysis</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Breach History:</span>
                <span className={digitalFootprint.emailAnalysis.breachHistory > 0 ? 'text-yellow-400' : 'text-green-400'}>
                  {digitalFootprint.emailAnalysis.breachHistory} breaches
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Age:</span>
                <span className="text-white">{digitalFootprint.emailAnalysis.accountAge} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reputation:</span>
                <span className={getReputationColor(digitalFootprint.emailAnalysis.reputation)}>
                  {digitalFootprint.emailAnalysis.reputation.charAt(0).toUpperCase() + digitalFootprint.emailAnalysis.reputation.slice(1)}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-gray-400 text-sm mb-2">Associated Services:</div>
              <div className="flex flex-wrap gap-2">
                {digitalFootprint.emailAnalysis.associatedServices.map((service, index) => (
                  <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Phone Analysis */}
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Lock className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Phone Analysis</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Carrier Type:</span>
                <span className="text-white capitalize">{digitalFootprint.phoneAnalysis.carrierType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-white">{digitalFootprint.phoneAnalysis.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Ported:</span>
                <span className={digitalFootprint.phoneAnalysis.ported ? 'text-yellow-400' : 'text-green-400'}>
                  {digitalFootprint.phoneAnalysis.ported ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reputation:</span>
                <span className="text-green-400">
                  {Math.round(digitalFootprint.phoneAnalysis.reputation * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Spam Reports:</span>
                <span className={digitalFootprint.phoneAnalysis.spamReports > 0 ? 'text-red-400' : 'text-green-400'}>
                  {digitalFootprint.phoneAnalysis.spamReports}
                </span>
              </div>
            </div>
          </div>

          {/* Address History */}
          <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Address Analysis</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-gray-400 text-sm mb-3">Residency History:</div>
                <div className="space-y-2">
                  {digitalFootprint.addressAnalysis.residencyHistory.map((address, index) => (
                    <div key={index} className="text-gray-300 text-sm">{address}</div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ownership History:</span>
                  <span className={digitalFootprint.addressAnalysis.ownershipHistory ? 'text-green-400' : 'text-gray-400'}>
                    {digitalFootprint.addressAnalysis.ownershipHistory ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Neighborhood Score:</span>
                  <span className="text-green-400">
                    {Math.round(digitalFootprint.addressAnalysis.neighborhoodScore * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Crime Index:</span>
                  <span className={getRiskColor(digitalFootprint.addressAnalysis.crimeIndex)}>
                    {Math.round(digitalFootprint.addressAnalysis.crimeIndex * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Behavioral Analysis Tab */}
      {activeTab === 'behavior' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {Math.round(digitalFootprint.behaviorAnalysis.consistencyScore * 100)}%
              </div>
              <div className="text-gray-400">Consistency Score</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {Math.round(digitalFootprint.behaviorAnalysis.authenticityScore * 100)}%
              </div>
              <div className="text-gray-400">Authenticity Score</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {Math.round(digitalFootprint.behaviorAnalysis.socialEngagementScore * 100)}%
              </div>
              <div className="text-gray-400">Social Engagement</div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 text-yellow-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Behavioral Risk Indicators</h3>
            </div>
            
            <div className="space-y-3">
              {digitalFootprint.behaviorAnalysis.riskIndicators.map((indicator, index) => (
                <div key={index} className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-gray-300 text-sm">{indicator}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
              <div className="text-blue-400 font-medium mb-1">AI Assessment</div>
              <div className="text-blue-300 text-sm">
                Digital footprint indicates authentic identity with consistent behavior patterns. 
                Minor flags related to recent activity changes but overall low risk assessment.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalFootprintAnalyzer