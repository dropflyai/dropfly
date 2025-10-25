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

export default function ResidentPortalPage() {
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

  if (!user) {
    return null // Loading state
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black">
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-xl border-b border-white/10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.push('/luxury-heights')}
            className="flex items-center text-white hover:text-yellow-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Property
          </button>
          
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Resident Portal</h1>
              <p className="text-white/60 text-sm">Luxury Heights Apartments</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-white">Welcome, {user?.firstName}</span>
            <button 
              onClick={handleSignOut}
              className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-xl text-red-400 hover:text-red-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Home, {user?.firstName}!</h2>
              <p className="text-white/70 text-lg">Your personalized resident experience at Luxury Heights</p>
            </div>
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pay Rent</h3>
            <p className="text-white/60 text-sm">Make payments and view history</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Maintenance</h3>
            <p className="text-white/60 text-sm">Submit requests and track status</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Messages</h3>
            <p className="text-white/60 text-sm">Communication with management</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Events</h3>
            <p className="text-white/60 text-sm">Community events and amenities</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Announcements */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Announcements</h3>
            <div className="space-y-4">
              {[
                { title: "Pool Maintenance Scheduled", date: "Jan 18, 2025", content: "The rooftop pool will be closed for maintenance on Saturday from 8am-2pm." },
                { title: "New Fitness Equipment", date: "Jan 15, 2025", content: "We've added new cardio equipment to the fitness center. Enjoy your workouts!" },
                { title: "Package Delivery Update", date: "Jan 12, 2025", content: "New secure package lockers have been installed in the lobby for your convenience." }
              ].map((announcement, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold">{announcement.title}</h4>
                    <span className="text-white/60 text-sm">{announcement.date}</span>
                  </div>
                  <p className="text-white/70 text-sm">{announcement.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Account Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Unit:</span>
                  <span className="text-white font-medium">4B</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Lease Expires:</span>
                  <span className="text-white font-medium">Dec 31, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Next Payment:</span>
                  <span className="text-green-400 font-medium">Feb 1, 2025</span>
                </div>
              </div>
            </div>

            {/* Amenity Hours */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Amenity Hours</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Fitness Center:</span>
                  <span className="text-white">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Rooftop Pool:</span>
                  <span className="text-white">6am - 10pm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Sky Lounge:</span>
                  <span className="text-white">8am - 11pm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}