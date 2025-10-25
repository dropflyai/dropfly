'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Home, 
  User, 
  Bell, 
  MessageSquare, 
  CreditCard,
  Settings,
  ChevronLeft,
  Crown,
  Calendar,
  FileText,
  Wrench,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Package,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Shield,
  Building,
  Users,
  Camera,
  Download,
  Upload,
  Eye,
  Edit,
  Plus,
  ArrowRight
} from 'lucide-react'

interface PaymentHistory {
  id: string
  date: string
  amount: number
  type: string
  status: 'paid' | 'pending' | 'overdue'
  method: string
}

interface MaintenanceRequest {
  id: string
  date: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  category: string
}

export default function ResidentDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  // Mock data for resident
  const residentData = {
    name: 'Sarah Johnson',
    unit: 'Unit 2B',
    building: 'Luxury Heights',
    leaseEnd: '2025-12-31',
    rentAmount: 4200,
    nextDue: '2025-02-01'
  }

  const paymentHistory: PaymentHistory[] = [
    {
      id: '1',
      date: '2025-01-01',
      amount: 4200,
      type: 'Rent',
      status: 'paid',
      method: 'Auto-pay'
    },
    {
      id: '2', 
      date: '2024-12-01',
      amount: 4200,
      type: 'Rent',
      status: 'paid',
      method: 'Credit Card'
    },
    {
      id: '3',
      date: '2024-11-01',
      amount: 4200,
      type: 'Rent', 
      status: 'paid',
      method: 'Auto-pay'
    }
  ]

  const maintenanceRequests: MaintenanceRequest[] = [
    {
      id: '1',
      date: '2025-01-20',
      title: 'Kitchen Faucet Leak',
      description: 'Small leak under kitchen sink faucet',
      status: 'in-progress',
      priority: 'medium',
      category: 'Plumbing'
    },
    {
      id: '2',
      date: '2025-01-15',
      title: 'AC Filter Replacement',
      description: 'Scheduled AC filter replacement',
      status: 'completed',
      priority: 'low',
      category: 'HVAC'
    }
  ]

  const communityAmenities = [
    { icon: Waves, name: 'Rooftop Pool', hours: '6am - 10pm' },
    { icon: Dumbbell, name: 'Fitness Center', hours: '24/7' },
    { icon: Car, name: 'Parking Garage', hours: '24/7' },
    { icon: Wifi, name: 'Business Center', hours: '8am - 8pm' },
    { icon: Package, name: 'Package Room', hours: '24/7' },
    { icon: Shield, name: 'Concierge', hours: '7am - 11pm' }
  ]

  useEffect(() => {
    // Check for demo user authentication
    const userData = localStorage.getItem('luxury_user')
    if (!userData) {
      router.push('/luxury-heights')
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.userType !== 'customer') {
      router.push('/luxury-heights')
      return
    }
    setUser(parsedUser)
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('luxury_user')
    router.push('/luxury-heights')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'overdue': return 'text-red-400'
      case 'completed': return 'text-green-400'
      case 'in-progress': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  if (!user) {
    return null // Loading state
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              
              <div className="h-8 w-px bg-white/20" />
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Resident Portal</h1>
                  <p className="text-xs text-gray-400">{residentData.name} • {residentData.unit}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <button 
                onClick={handleSignOut}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="p-6">
        <div className="container mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
                <span className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded-full">Due Soon</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">${residentData.rentAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Next rent payment</div>
              <div className="text-xs text-gray-300 mt-1">Due {residentData.nextDue}</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Wrench className="w-8 h-8 text-blue-400" />
                <span className="text-xs text-orange-400 bg-orange-400/20 px-2 py-1 rounded-full">1 Active</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">2</div>
              <div className="text-sm text-gray-400">Maintenance requests</div>
              <div className="text-xs text-gray-300 mt-1">1 in progress</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-purple-400" />
                <span className="text-xs text-gray-400 bg-gray-400/20 px-2 py-1 rounded-full">Valid</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">11</div>
              <div className="text-sm text-gray-400">Months remaining</div>
              <div className="text-xs text-gray-300 mt-1">Lease ends {residentData.leaseEnd}</div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Star className="w-8 h-8 text-yellow-400" />
                <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">Premium</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">4.9</div>
              <div className="text-sm text-gray-400">Community rating</div>
              <div className="text-xs text-gray-300 mt-1">Based on resident reviews</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden mb-8">
            <div className="border-b border-white/10 p-6">
              <div className="flex space-x-4">
                {['overview', 'payments', 'maintenance', 'amenities'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      {paymentHistory.slice(0, 3).map((payment) => (
                        <div key={payment.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{payment.type}</h4>
                              <p className="text-gray-400 text-sm">{payment.date} • ${payment.amount.toLocaleString()}</p>
                            </div>
                          </div>
                          <span className={`text-sm ${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white mb-6">Unit Details</h3>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Unit</span>
                        <span className="text-white font-medium">{residentData.unit}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Building</span>
                        <span className="text-white font-medium">{residentData.building}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Monthly Rent</span>
                        <span className="text-white font-medium">${residentData.rentAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Lease End</span>
                        <span className="text-white font-medium">{residentData.leaseEnd}</span>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform">
                          <Download className="w-4 h-4 mr-2 inline" />
                          Download Lease Agreement
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Payment History</h3>
                    <button className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Make Payment
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div key={payment.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{payment.type}</h4>
                            <p className="text-gray-400">{payment.date}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white">${payment.amount.toLocaleString()}</div>
                            <span className={`text-sm ${getStatusColor(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Payment method: {payment.method}</span>
                          <button className="text-purple-400 hover:text-purple-300 transition-colors">
                            <Download className="w-4 h-4 mr-1 inline" />
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Maintenance Requests</h3>
                    <button className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-xl text-white font-medium hover:scale-105 transition-transform">
                      <Plus className="w-4 h-4 mr-2 inline" />
                      New Request
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {maintenanceRequests.map((request) => (
                      <div key={request.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{request.title}</h4>
                            <p className="text-gray-400">{request.description}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(request.priority)}`}></div>
                            <span className={`text-sm ${getStatusColor(request.status)}`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1).replace('-', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Submitted: {request.date} • {request.category}</span>
                          <div className="flex space-x-2">
                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                              <Eye className="w-4 h-4 mr-1 inline" />
                              View
                            </button>
                            <button className="text-purple-400 hover:text-purple-300 transition-colors">
                              <Edit className="w-4 h-4 mr-1 inline" />
                              Update
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-6">Community Amenities</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communityAmenities.map((amenity, index) => {
                      const Icon = amenity.icon
                      return (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group">
                          <div className="flex items-center justify-between mb-4">
                            <Icon className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                          <h4 className="text-lg font-semibold text-white mb-2">{amenity.name}</h4>
                          <p className="text-gray-400 text-sm">Hours: {amenity.hours}</p>
                          <button className="mt-4 w-full bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors">
                            Book Now
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}