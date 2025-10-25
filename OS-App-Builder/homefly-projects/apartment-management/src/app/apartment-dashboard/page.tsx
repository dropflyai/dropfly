'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FooterMinimal from '../../components/FooterMinimal'
import OnboardingFlow from '../../components/onboarding/OnboardingFlow'
import { 
  Home, 
  CreditCard, 
  Users, 
  Settings, 
  Bell, 
  MessageSquare, 
  Calendar,
  ChevronLeft,
  Menu,
  X,
  Search,
  Plus,
  Filter,
  Download,
  Crown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  UserPlus,
  Shield,
  FileText,
  ClipboardCheck,
  Zap,
  Database,
  Key,
  Signature,
  IdCard,
  CreditCard as CreditCardIcon,
  Banknote,
  Briefcase,
  FileCheck,
  BookOpen,
  Camera,
  ArrowRight
} from 'lucide-react'

// Import leasing components
import FinancialManagement from '@/components/leasing/FinancialManagement'
import LeaseGenerator from '@/components/leasing/LeaseGenerator'
import DigitalSignatures from '@/components/leasing/DigitalSignatures'
import IdentityVerification from '@/components/leasing/IdentityVerification'
import CreditReportSystem from '@/components/leasing/CreditReportSystem'
import IncomeVerificationEngine from '@/components/leasing/IncomeVerificationEngine'
import EmploymentVerification from '@/components/leasing/EmploymentVerification'
import ApprovalEmailTemplate from '@/components/leasing/ApprovalEmailTemplate'
import MoveOutEmailTemplate from '@/components/leasing/MoveOutEmailTemplate'
import EmployeeTraining from '@/components/leasing/EmployeeTraining'
import VendorManagement from '@/components/leasing/VendorManagement'
import DocumentsAndTemplates from '@/components/leasing/DocumentsAndTemplates'
import PropertyQualifications, { PropertyQualifications as PropertyQualificationsType } from '@/components/leasing/PropertyQualifications'
import MessagingSystem from '@/components/messaging/MessagingSystem'
import FeedbackWidget from '@/components/feedback/FeedbackWidget'

// Import demo data system
import { 
  initializeDemoData, 
  getDemoData, 
  updateDemoData, 
  completeTask, 
  getDemoStats,
  showDemoDataNotification 
} from '../../utils/demoData'

// Import error tracking
// Error tracking removed for deployment

export default function ApartmentDashboardPage() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [demoData, setDemoData] = useState<any>(null)
  const [demoStats, setDemoStats] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check for demo user authentication
    const userData = localStorage.getItem('luxury_user')
    if (!userData) {
      router.push('/luxury-heights')
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.userType === 'admin') {
      // Admin can access this dashboard
      setUser(parsedUser)
      
      // Check if this is the first visit for onboarding
      const hasSeenOnboarding = localStorage.getItem('homefly_pro_onboarded')
      if (!hasSeenOnboarding) {
        setShowOnboarding(true)
      }

      // Initialize demo data system
      const initialDemoData = initializeDemoData()
      setDemoData(initialDemoData)
      setDemoStats(getDemoStats())
      
      // Show notification if data was reset
      showDemoDataNotification()
      
      // Log user login (removed for deployment)
      // logUserAction('dashboard_access', { userType: parsedUser.userType, dashboardType: 'apartment_management' })
    } else if (parsedUser.userType === 'resident') {
      // Redirect apartment residents to their dashboard
      router.push('/residentdashboard')
      return
    } else {
      // Invalid user type, redirect to login
      router.push('/luxury-heights')
      return
    }
  }, [router])

  const sidebarItems = [
    { id: 'pipeline', label: 'Leasing Pipeline', icon: Zap, priority: true },
    { id: 'units', label: 'Available Units', icon: Building, priority: true },
    { id: 'showings', label: 'Showings Today', icon: Calendar, priority: true },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'leases', label: 'Active Leases', icon: ClipboardCheck },
    { id: 'ai-tools', label: 'AI Assistant', icon: Shield },
    { id: 'pricing', label: 'Smart Pricing', icon: TrendingUp },
    { id: 'communications', label: 'Messages', icon: MessageSquare },
  ]

  const handleSignOut = () => {
    localStorage.removeItem('luxury_user')
    router.push('/luxury-heights')
  }

  // Demo data for approval email
  const demoApplicant = {
    id: 'app-001',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 234-5678',
    unitType: '1 Bedroom Luxury',
    unitNumber: '12B',
    monthlyRent: 4200,
    leaseStart: '2025-02-01',
    creditScore: 747,
    income: 145000,
    applicationDate: '2025-01-15'
  }

  const demoPropertyQualifications: PropertyQualificationsType = {
    securityDepositMultiplier: 1.0,
    keyDeposit: 250,
    adminFee: 300,
    utilityDeposit: 150,
    parkingFee: 150,
    petDeposit: 500,
    applicationFee: 100,
    moveInSpecial: {
      description: "Winter Move-in Special: $500 Off",
      discount: 500,
      expirationDate: '2025-03-31'
    },
    qualificationCriteria: {
      minimumCreditScore: 650,
      minimumIncome: 3.0,
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
  }

  const handleSendEmail = (emailData: any) => {
    console.log('Sending approval email:', emailData)
    // In a real application, this would integrate with an email service
    alert('Approval email sent successfully! (Demo mode)')
  }

  const handleSaveDraft = (emailData: any) => {
    console.log('Saving email draft:', emailData)
    alert('Email draft saved successfully! (Demo mode)')
  }

  const handleSaveQualifications = (qualifications: PropertyQualificationsType) => {
    console.log('Saving property qualifications:', qualifications)
    alert('Property qualifications saved successfully! (Demo mode)')
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
  }

  // Demo data for move-out email
  const demoTenant = {
    id: 'tenant-002',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael.rodriguez@email.com',
    phone: '(555) 987-6543',
    unitNumber: '8A',
    unitType: '2 Bedroom Executive',
    monthlyRent: 5200,
    leaseEndDate: '2025-07-31',
    moveOutDate: '2025-06-15',
    securityDeposit: 5200,
    keyDeposit: 300,
    petDeposit: 500,
    moveInDate: '2024-08-01',
    noticeDate: '2025-01-15',
    leaseBreakReason: 'Job relocation'
  }

  const demoMoveOutProcedures = {
    noticeRequirement: 60,
    inspectionScheduling: "Contact leasing office at least 48 hours before move-out date to schedule final inspection",
    keyReturnDeadline: "All keys, fobs, and garage remotes must be returned by 5:00 PM on move-out date",
    cleaningRequirements: [
      "Professional carpet cleaning (receipt required)",
      "All appliances cleaned inside and out",
      "Bathrooms deep cleaned and sanitized",
      "Kitchen thoroughly cleaned including oven and refrigerator",
      "All personal belongings removed",
      "Light fixtures and ceiling fans cleaned",
      "Windows and blinds cleaned",
      "Balcony/patio cleaned and cleared"
    ],
    repairRequirements: [
      "Fill all nail holes and touch up paint",
      "Replace any burnt out light bulbs",
      "Repair any damage beyond normal wear and tear",
      "Remove all adhesive residue from walls",
      "Ensure all fixtures are working properly",
      "Replace missing or damaged outlet covers"
    ],
    finalWalkthrough: "Final walkthrough will be conducted within 3 business days of move-out. Tenant may request to be present.",
    depositReturnTimeframe: 30,
    forwardingAddressRequired: true,
    utilityCutoffProcedure: "Coordinate with utility companies to transfer service out of your name effective move-out date",
    contactInformation: {
      office: "(555) 123-4567 (Mon-Fri 9AM-6PM, Sat 10AM-4PM)",
      emergency: "(555) 123-HELP (24/7 emergency maintenance)",
      email: "leasing@luxuryheights.com"
    }
  }

  const handleSendMoveOutEmail = (emailData: any) => {
    console.log('Sending move-out email:', emailData)
    alert('Move-out email sent successfully! (Demo mode)')
  }

  const handleSaveMoveOutDraft = (emailData: any) => {
    console.log('Saving move-out email draft:', emailData)
    alert('Move-out email draft saved successfully! (Demo mode)')
  }

  const handleTrainingProgress = (moduleId: string, completed: boolean) => {
    console.log('Training progress update:', { moduleId, completed })
    // In a real application, this would update the database
    if (completed) {
      alert(`Training module completed: ${moduleId}`)
    }
  }

  const handleVendorUpdate = (vendor: any) => {
    console.log('Vendor update:', vendor)
    // In a real application, this would update the database
    alert(`Vendor updated: ${vendor.name}`)
  }

  const renderContent = () => {
    if (!demoData) return <div className="text-white p-8">Loading demo data...</div>
    
    switch (activeTab) {
      case 'pipeline':
        return <LeasingPipelineContent demoData={demoData} setDemoData={setDemoData} />
      case 'units':
        return <AvailableUnitsContent demoData={demoData} setDemoData={setDemoData} />
      case 'showings':
        return <ShowingsContent demoData={demoData} setDemoData={setDemoData} />
      case 'applications':
        return <ApplicationsContent demoData={demoData} setDemoData={setDemoData} />
      case 'leases':
        return <ActiveLeasesContent demoData={demoData} setDemoData={setDemoData} />
      case 'ai-tools':
        return <AIAssistantContent demoData={demoData} setDemoData={setDemoData} />
      case 'pricing':
        return <SmartPricingContent demoData={demoData} setDemoData={setDemoData} />
      case 'communications':
        return <MessagingSystem 
          userType="admin" 
          userId={user?.id || 'demo-admin'} 
          userName={user?.firstName || 'Admin User'} 
          communityType="apartment" 
        />
      default:
        return <LeasingPipelineContent demoData={demoData} setDemoData={setDemoData} />
    }
  }

  if (!user) {
    return null // Loading state
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black">
      {/* Mobile Header */}
      <div className="lg:hidden bg-black/90 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          HomeFly Pro™
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push('/luxury-heights')}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:relative lg:translate-x-0 z-50 w-80 h-screen bg-black/90 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 overflow-y-auto`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">HomeFly Pro™</h2>
                  <p className="text-sm text-white/60">AI-Powered Leasing Platform</p>
                  {demoStats && (
                    <p className="text-xs text-yellow-400 mt-1">
                      Demo resets in: {demoStats.nextResetIn}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Back to Property */}
            <div className="mb-6">
              <button
                onClick={() => router.push('/luxury-heights')}
                className="w-full flex items-center space-x-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 p-3 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Building className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Back to Property</span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isPriority = item.priority
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 group ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-white'
                        : isPriority 
                        ? 'text-white hover:text-white hover:bg-gradient-to-r hover:from-yellow-500/10 hover:to-orange-500/10 border border-yellow-500/20'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isPriority ? 'text-yellow-400' : ''}`} />
                    <span className={`font-medium text-sm ${isPriority ? 'font-semibold' : ''}`}>{item.label}</span>
                    {isPriority && activeTab !== item.id && (
                      <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                    {activeTab === item.id && (
                      <div className="ml-auto w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    )}
                  </button>
                )
              })}
            </nav>

            {/* User Info */}
            <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.firstName?.[0] || 'A'}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{user?.firstName} {user?.lastName}</div>
                    <div className="text-white/60 text-sm">Leasing Manager</div>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 hover:bg-red-500/20 rounded-xl text-red-400 hover:text-red-300 transition-colors"
                  title="Sign Out"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Minimal Footer */}
      <FooterMinimal 
        showBackButton={true}
        backUrl="/luxury-heights"
        backLabel="Luxury Heights"
        onSignOut={handleSignOut}
        appName="Leasing Dashboard"
      />

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          onComplete={handleOnboardingComplete}
          isFirstVisit={true}
        />
      )}

      {/* Feedback Widget */}
      <FeedbackWidget productName="HomeFly Pro™" />
    </div>
  )
}

// 🚀 REVOLUTIONARY LEASING PIPELINE - The Heart of Productivity
function LeasingPipelineContent({ demoData, setDemoData }) {
  const todaysTasks = demoData?.todaysTasks || []

  const pipelineStages = [
    { stage: "Inquiries", count: 12, value: "$84,600", color: "blue" },
    { stage: "Showings", count: 8, value: "$52,400", color: "purple" },
    { stage: "Applications", count: 5, value: "$31,200", color: "yellow" },
    { stage: "Approved", count: 3, value: "$18,600", color: "green" }
  ]

  return (
    <div className="space-y-8">
      {/* AI-Powered Action Center */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Zap className="w-8 h-8 text-yellow-400 mr-3" />
              Today's Revenue Opportunities
            </h1>
            <p className="text-green-300 text-xl mt-2">${todaysTasks.reduce((sum, task) => sum + parseInt(task.revenue.replace(/[^0-9]/g, '')), 0).toLocaleString()} potential revenue • {todaysTasks.filter(t => !t.completed).length} high-impact tasks</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-white">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div className="text-green-300">Peak leasing hours</div>
          </div>
        </div>

        {/* Priority Tasks Queue */}
        <div className="grid gap-4 mb-6">
          {todaysTasks.filter(task => !task.completed).map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border ${
              task.priority === 'urgent' ? 'border-red-400/50 bg-red-500/10' :
              task.priority === 'high' ? 'border-yellow-400/50 bg-yellow-500/10' :
              'border-white/20'
            } hover:scale-102 transition-all cursor-pointer`}>
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'urgent' ? 'bg-red-400 animate-pulse' :
                  task.priority === 'high' ? 'bg-yellow-400 animate-pulse' :
                  'bg-blue-400'
                }`} />
                <div>
                  <p className="text-white font-semibold">{task.task}</p>
                  <p className="text-white/60 text-sm">{task.time} to complete • {task.revenue} monthly revenue</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  try {
                    // Log user action
                    // logUserAction('task_completed', { taskId: task.id, taskType: task.action, revenue: task.revenue, priority: task.priority })
                    
                    // Mark task as completed and update demo data
                    const updatedTasks = todaysTasks.map(t => 
                      t.id === task.id ? { ...t, completed: true, completedAt: Date.now() } : t
                    )
                    const updatedDemoData = { ...demoData, todaysTasks: updatedTasks }
                    setDemoData(updatedDemoData)
                    // Also update localStorage
                    localStorage.setItem('homefly_pro_demo_data', JSON.stringify(updatedDemoData))
                  } catch (error) {
                    console.error('Error completing task:', error)
                  }
                }}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                {task.action}
              </button>
            </div>
          ))}
        </div>

        {/* One-Click Actions */}
        <div className="flex space-x-4">
          <button className="flex-1 flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-semibold hover:scale-105 transition-all">
            <Calendar className="w-5 h-5" />
            <span>Quick Schedule ({demoData?.todaysShowings?.length || 0} showings)</span>
          </button>
          <button className="flex-1 flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl text-white font-semibold hover:scale-105 transition-all">
            <UserPlus className="w-5 h-5" />
            <span>Batch Approve (2 ready)</span>
          </button>
          <button className="flex-1 flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-semibold hover:scale-105 transition-all">
            <Signature className="w-5 h-5" />
            <span>Send Leases (3 pending)</span>
          </button>
        </div>
      </div>

      {/* Visual Pipeline Flow */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Live Leasing Pipeline</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">$186,800</div>
            <div className="text-white/60">Total pipeline value</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          {pipelineStages.map((stage, index) => (
            <div key={stage.stage} className="relative">
              <div className={`bg-gradient-to-br from-${stage.color}-600/20 to-${stage.color}-800/20 border border-${stage.color}-400/30 rounded-2xl p-6 text-center hover:scale-105 transition-all cursor-pointer`}>
                <h3 className="text-lg font-bold text-white mb-2">{stage.stage}</h3>
                <div className={`text-3xl font-bold text-${stage.color}-400 mb-1`}>{stage.count}</div>
                <div className="text-white/60 text-sm">{stage.value}</div>
              </div>
              {index < 3 && (
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center z-10">
                  <ArrowRight className="w-4 h-4 text-black" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Smart Insights */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-bold text-white">AI Insights & Recommendations</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-semibold mb-2">🎯 Peak Performance</p>
              <p className="text-white/70 text-sm">Your conversion rate is 23% above average. Focus on high-value units this week.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-semibold mb-2">💰 Pricing Opportunity</p>
              <p className="text-white/70 text-sm">Units 12B-15B can support $200-300 rent increase based on demand.</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white font-semibold mb-2">⚡ Automation Ready</p>
              <p className="text-white/70 text-sm">3 applications can be auto-approved with current AI confidence scores.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Applications Content Component
function ApplicationsContent({ demoData, setDemoData }) {
  const applications = demoData?.applications || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Application Management</h1>
          <p className="text-white/60 mt-2">Track and manage all apartment applications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors">
            <Filter className="w-4 h-4 mr-2 inline" />
            Filter
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-medium hover:scale-105 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2 inline" />
            New Application
          </button>
        </div>
      </div>

      {/* Application Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <FileText className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{applications.length}</h3>
          <p className="text-white/60 text-sm">Total Applications</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{applications.filter(app => app.status === 'pending').length}</h3>
          <p className="text-white/60 text-sm">Pending Review</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">{applications.filter(app => app.status === 'approved').length}</h3>
          <p className="text-white/60 text-sm">Approved</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-white">84%</h3>
          <p className="text-white/60 text-sm">Approval Rate</p>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Current Applications</h3>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-white/70 font-medium">Applicant</th>
                <th className="text-left p-4 text-white/70 font-medium">Unit Requested</th>
                <th className="text-left p-4 text-white/70 font-medium">Income</th>
                <th className="text-left p-4 text-white/70 font-medium">Credit Score</th>
                <th className="text-left p-4 text-white/70 font-medium">Status</th>
                <th className="text-left p-4 text-white/70 font-medium">Stage</th>
                <th className="text-left p-4 text-white/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        {app.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="text-white font-medium block">{app.name}</span>
                        <span className="text-white/60 text-sm">{app.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-white">{app.unit}</td>
                  <td className="p-4 text-white">{app.income}</td>
                  <td className="p-4">
                    {app.score > 0 ? (
                      <span className={`text-sm font-medium ${
                        app.score >= 800 ? 'text-green-400' : 
                        app.score >= 700 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {app.score}
                      </span>
                    ) : (
                      <span className="text-white/40 text-sm">Pending</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      app.status === 'approved' 
                        ? 'bg-green-500/20 text-green-400' 
                        : app.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-white/70 text-sm">{app.stage.replace('_', ' ')}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <FileText className="w-4 h-4 text-white/60" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Mail className="w-4 h-4 text-white/60" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Settings className="w-4 h-4 text-white/60" />
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
  )
}

// Other content components (simplified for space)
function TenantsContent() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tenant Management</h1>
          <p className="text-white/60 mt-2">Manage current tenants and lease agreements</p>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
        <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Tenant Management System</h3>
        <p className="text-white/60">Comprehensive tenant tracking, lease management, and communication tools</p>
      </div>
    </div>
  )
}

function ReportsContent() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Reports</h1>
          <p className="text-white/60 mt-2">Business intelligence and performance metrics</p>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
        <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Advanced Analytics Dashboard</h3>
        <p className="text-white/60">Real-time insights, occupancy trends, and financial performance</p>
      </div>
    </div>
  )
}

function MessagesContent() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Communication Center</h1>
          <p className="text-white/60 mt-2">Manage applicant and tenant communications</p>
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
        <MessageSquare className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Integrated Communication Hub</h3>
        <p className="text-white/60">Automated messaging, notifications, and applicant updates</p>
      </div>
    </div>
  )
}

// 🏢 SMART AVAILABLE UNITS - Visual Availability Management
function AvailableUnitsContent({ demoData, setDemoData }) {
  const availableUnits = demoData?.availableUnits || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Building className="w-8 h-8 text-blue-400 mr-3" />
            Available Units
          </h1>
          <p className="text-white/60 mt-2">{availableUnits.length} units available • ${availableUnits.reduce((sum, unit) => sum + unit.rent, 0).toLocaleString()} potential monthly revenue</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Listing
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <Calendar className="w-4 h-4 mr-2 inline" />
            Bulk Schedule
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-2xl p-6 text-center">
          <Building className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">9</div>
          <div className="text-green-300 text-sm">Ready to Lease</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-2xl p-6 text-center">
          <Calendar className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">11</div>
          <div className="text-blue-300 text-sm">Showings Today</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-2xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">$4,850</div>
          <div className="text-yellow-300 text-sm">Avg Rent</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-2xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">47%</div>
          <div className="text-purple-300 text-sm">Above Market</div>
        </div>
      </div>

      {/* Unit Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {availableUnits.map((unit) => (
          <div key={unit.unit} className={`bg-white/5 backdrop-blur-xl border rounded-3xl p-6 hover:scale-102 transition-all cursor-pointer ${
            unit.status === 'available' ? 'border-green-400/30' :
            unit.status === 'showing' ? 'border-blue-400/30' :
            'border-yellow-400/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Unit {unit.unit}</h3>
                <p className="text-white/60">{unit.type} • {unit.sqft} sqft • Floor {unit.floor}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">${unit.rent.toLocaleString()}</div>
                <div className="text-white/60 text-sm">per month</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {unit.features.map((feature) => (
                <span key={feature} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="text-lg font-bold text-white">{unit.showings}</div>
                <div className="text-white/60 text-xs">Showings</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{unit.applications}</div>
                <div className="text-white/60 text-xs">Applications</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${
                  unit.status === 'available' ? 'text-green-400' :
                  unit.status === 'showing' ? 'text-blue-400' :
                  'text-yellow-400'
                }`}>
                  {unit.status.toUpperCase()}
                </div>
                <div className="text-white/60 text-xs">Status</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                Schedule Showing
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                Quick Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 📅 TODAY'S SHOWINGS - Mobile-First Showing Management
function ShowingsContent({ demoData, setDemoData }) {
  const todaysShowings = demoData?.todaysShowings || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Calendar className="w-8 h-8 text-purple-400 mr-3" />
            Today's Showings
          </h1>
          <p className="text-white/60 mt-2">{todaysShowings.length} showings scheduled • {todaysShowings.filter(s => s.status === 'confirmed').length} confirmed • ${(todaysShowings.length * 4900).toLocaleString()} potential revenue</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Showing
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <Phone className="w-4 h-4 mr-2 inline" />
            Bulk SMS
          </button>
        </div>
      </div>

      {/* Mobile-First Showing Cards */}
      <div className="space-y-4">
        {todaysShowings.map((showing, index) => (
          <div key={index} className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 ${
            showing.status === 'confirmed' ? 'border-green-400/30' : 'border-yellow-400/30'
          } hover:scale-102 transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${
                  showing.status === 'confirmed' ? 'bg-green-400' : 'bg-yellow-400'
                } animate-pulse`} />
                <div>
                  <h3 className="text-lg font-bold text-white">{showing.time} - {showing.prospect}</h3>
                  <p className="text-white/60">Unit {showing.unit} • {showing.type} • {showing.phone}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 bg-green-600/20 hover:bg-green-600/40 rounded-xl text-green-400 transition-all">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-xl text-blue-400 transition-all">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl text-purple-400 transition-all">
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Actions for each showing */}
            <div className="flex space-x-3 mt-4">
              <button className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white text-sm font-medium hover:scale-105 transition-all">
                Start Showing
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white text-sm font-medium hover:scale-105 transition-all">
                Send Reminder
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl text-white text-sm font-medium hover:scale-105 transition-all">
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Showing Tools */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick Showing Tools</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-3 p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
            <Camera className="w-5 h-5" />
            <span>Photo Capture</span>
          </button>
          <button className="flex items-center justify-center space-x-3 p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
            <FileText className="w-5 h-5" />
            <span>Instant Application</span>
          </button>
          <button className="flex items-center justify-center space-x-3 p-4 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
            <Signature className="w-5 h-5" />
            <span>Digital Sign</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// 📋 ACTIVE LEASES - Streamlined Lease Management
function ActiveLeasesContent({ demoData, setDemoData }) {
  const activeLeases = demoData?.activeLeases || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <ClipboardCheck className="w-8 h-8 text-green-400 mr-3" />
            Active Leases
          </h1>
          <p className="text-white/60 mt-2">{activeLeases.length} active leases • ${activeLeases.reduce((sum, lease) => sum + lease.rent, 0).toLocaleString()} monthly revenue • {activeLeases.filter(l => l.daysLeft <= 60).length} renewals due</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <FileCheck className="w-4 h-4 mr-2 inline" />
            Batch Renewals
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <Plus className="w-4 h-4 mr-2 inline" />
            New Lease
          </button>
        </div>
      </div>

      {/* Lease Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-2xl p-6 text-center">
          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">124</div>
          <div className="text-green-300 text-sm">Current Leases</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-2xl p-6 text-center">
          <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">23</div>
          <div className="text-yellow-300 text-sm">Expiring Soon</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-2xl p-6 text-center">
          <FileCheck className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">11</div>
          <div className="text-blue-300 text-sm">Ready to Sign</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-2xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">92%</div>
          <div className="text-purple-300 text-sm">Renewal Rate</div>
        </div>
      </div>

      {/* Priority Lease Actions */}
      <div className="space-y-4">
        {activeLeases.map((lease, index) => (
          <div key={index} className={`bg-white/5 backdrop-blur-xl border rounded-2xl p-6 ${
            lease.daysLeft <= 30 ? 'border-red-400/30' :
            lease.daysLeft <= 60 ? 'border-yellow-400/30' :
            'border-green-400/30'
          } hover:scale-102 transition-all`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-4 h-4 rounded-full ${
                  lease.daysLeft <= 30 ? 'bg-red-400 animate-pulse' :
                  lease.daysLeft <= 60 ? 'bg-yellow-400 animate-pulse' :
                  'bg-green-400'
                }`} />
                <div>
                  <h3 className="text-lg font-bold text-white">{lease.tenant}</h3>
                  <p className="text-white/60">Unit {lease.unit} • ${lease.rent.toLocaleString()}/month • {lease.daysLeft} days left</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{lease.leaseEnd}</div>
                <div className={`text-sm ${
                  lease.renewalStatus === 'auto_renew' ? 'text-green-400' :
                  lease.renewalStatus === 'offer_sent' ? 'text-blue-400' :
                  lease.renewalStatus === 'declined' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {lease.renewalStatus.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-4">
              <button className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                Send Renewal
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                View Lease
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                Contact Tenant
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 🤖 AI ASSISTANT - Smart Leasing Automation
function AIAssistantContent({ demoData, setDemoData }) {
  const aiRecommendations = demoData?.aiRecommendations || []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Shield className="w-8 h-8 text-purple-400 mr-3" />
            AI Leasing Assistant
          </h1>
          <p className="text-white/60 mt-2">Powered by machine learning • Real-time market analysis • Predictive insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-green-600/20 rounded-xl border border-green-400/30">
            <span className="text-green-300 font-semibold">AI Online</span>
          </div>
        </div>
      </div>

      {/* AI Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-2xl p-6 text-center">
          <Zap className="w-8 h-8 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">94.2%</div>
          <div className="text-green-300 text-sm">Approval Accuracy</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-400/30 rounded-2xl p-6 text-center">
          <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">11.3hr</div>
          <div className="text-blue-300 text-sm">Avg Process Time</div>
        </div>
        <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-2xl p-6 text-center">
          <DollarSign className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">$47K</div>
          <div className="text-purple-300 text-sm">Revenue Optimized</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-400/30 rounded-2xl p-6 text-center">
          <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">87%</div>
          <div className="text-yellow-300 text-sm">Prediction Accuracy</div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="space-y-4">
        {aiRecommendations.map((rec, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-102 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  rec.type === 'pricing' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                  rec.type === 'approval' ? 'bg-gradient-to-r from-blue-600 to-cyan-600' :
                  rec.type === 'retention' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
                  'bg-gradient-to-r from-purple-600 to-pink-600'
                }`}>
                  {rec.type === 'pricing' ? <DollarSign className="w-6 h-6 text-white" /> :
                   rec.type === 'approval' ? <CheckCircle className="w-6 h-6 text-white" /> :
                   rec.type === 'retention' ? <Users className="w-6 h-6 text-white" /> :
                   <TrendingUp className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                  <p className="text-white/70">{rec.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">{rec.impact}</div>
                <div className="text-white/60 text-sm">{rec.confidence}% confidence</div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                Apply Recommendation
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                View Analysis
              </button>
              <button className="py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Chat Interface */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Ask Your AI Assistant</h3>
        <div className="flex space-x-3">
          <input 
            type="text" 
            placeholder="Ask about pricing, applications, market trends, or get recommendations..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            Ask AI
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-all">
            What's the optimal rent for Unit 12B?
          </button>
          <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-all">
            Which applications should I prioritize?
          </button>
          <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-all">
            Predict this month's leasing performance
          </button>
        </div>
      </div>
    </div>
  )
}

// 💰 SMART PRICING - Revenue Optimization Engine
function SmartPricingContent({ demoData, setDemoData }) {
  const pricingRecommendations = [
    { unit: "12B", currentRent: 4200, suggestedRent: 4450, increase: 250, confidence: 94, reason: "High demand, 47% above market avg" },
    { unit: "8A", currentRent: 3200, suggestedRent: 3380, increase: 180, confidence: 89, reason: "Recent renovations, premium features" },
    { unit: "15C", currentRent: 6800, suggestedRent: 6800, increase: 0, confidence: 78, reason: "Already at market peak" },
    { unit: "6B", currentRent: 4600, suggestedRent: 4750, increase: 150, confidence: 91, reason: "Bay view premium, strong comps" }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <TrendingUp className="w-8 h-8 text-green-400 mr-3" />
            Smart Pricing Engine
          </h1>
          <p className="text-white/60 mt-2">AI-powered pricing optimization • Real-time market analysis • Revenue maximization</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <DollarSign className="w-4 h-4 mr-2 inline" />
            Apply All Increases
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
            <BarChart3 className="w-4 h-4 mr-2 inline" />
            Market Report
          </button>
        </div>
      </div>

      {/* Revenue Impact Overview */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-400/30 rounded-3xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Potential Revenue Increase</h2>
          <div className="text-5xl font-bold text-green-400 mb-2">+$7,020</div>
          <p className="text-green-300">per month with recommended pricing • $84,240 annual increase</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">94%</div>
            <div className="text-green-300 text-sm">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">14.4%</div>
            <div className="text-green-300 text-sm">Revenue Increase</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">23</div>
            <div className="text-green-300 text-sm">Units Optimized</div>
          </div>
        </div>
      </div>

      {/* Individual Unit Recommendations */}
      <div className="space-y-4">
        {pricingRecommendations.map((item, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:scale-102 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Unit {item.unit}</h3>
                <p className="text-white/60">{item.reason}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="text-white/60 text-sm">Current</div>
                    <div className="text-lg font-bold text-white">${item.currentRent.toLocaleString()}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-green-300 text-sm">Suggested</div>
                    <div className="text-lg font-bold text-green-400">${item.suggestedRent.toLocaleString()}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    item.increase > 0 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {item.increase > 0 ? `+$${item.increase}` : 'Optimized'}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-white/60 text-sm">AI Confidence: {item.confidence}%</div>
                <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-green-400" style={{width: `${item.confidence}%`}} />
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                  Apply Increase
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl text-white font-medium hover:scale-105 transition-all">
                  View Analysis
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Market Intelligence */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-3xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Market Intelligence</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">$4,327</div>
            <div className="text-purple-300 text-sm">Market Average</div>
            <div className="text-green-400 text-xs mt-1">↑ 12% vs last month</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">8.2 days</div>
            <div className="text-purple-300 text-sm">Avg Days on Market</div>
            <div className="text-green-400 text-xs mt-1">↓ 23% vs last month</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">94.7%</div>
            <div className="text-purple-300 text-sm">Market Occupancy</div>
            <div className="text-green-400 text-xs mt-1">↑ 2.3% vs last month</div>
          </div>
        </div>
      </div>
    </div>
  )
}