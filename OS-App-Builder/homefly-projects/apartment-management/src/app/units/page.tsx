'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Camera,
  Eye,
  Crown,
  Car,
  Package,
  Zap,
  ArrowRight,
  Home,
  Maximize2,
  Bath,
  Bed,
  ChefHat,
  Wifi,
  Dumbbell,
  Waves,
  Shield,
  Building
} from 'lucide-react'

export default function UnitsPage() {
  const router = useRouter()
  const [selectedFloorPlan, setSelectedFloorPlan] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list

  const floorPlans = [
    {
      id: 'studio-city',
      type: 'Studio',
      subtype: 'City View',
      sqft: 650,
      rent: 3200,
      deposit: 3200,
      available: 3,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      floorPlanImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      features: ['City View', 'Modern Kitchen', 'In-Unit Laundry', 'Hardwood Floors', 'Floor-to-Ceiling Windows'],
      amenities: ['High-Speed WiFi', 'Central AC/Heat', 'Dishwasher', 'Microwave'],
      bedrooms: 0,
      bathrooms: 1
    },
    {
      id: 'studio-bay',
      type: 'Studio',
      subtype: 'Bay View',
      sqft: 680,
      rent: 3450,
      deposit: 3450,
      available: 2,
      image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
      floorPlanImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      features: ['Bay View', 'Luxury Kitchen', 'In-Unit Laundry', 'Hardwood Floors', 'Private Balcony'],
      amenities: ['High-Speed WiFi', 'Central AC/Heat', 'Dishwasher', 'Wine Fridge'],
      bedrooms: 0,
      bathrooms: 1
    },
    {
      id: 'one-bed-city',
      type: '1 Bedroom',
      subtype: 'City View',
      sqft: 850,
      rent: 4200,
      deposit: 4200,
      available: 5,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      floorPlanImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      features: ['City View', 'Chef\'s Kitchen', 'Walk-in Closet', 'Hardwood Floors', 'Private Balcony'],
      amenities: ['High-Speed WiFi', 'Central AC/Heat', 'Dishwasher', 'In-Unit Washer/Dryer'],
      bedrooms: 1,
      bathrooms: 1
    },
    {
      id: 'one-bed-bay',
      type: '1 Bedroom',
      subtype: 'Bay View',
      sqft: 900,
      rent: 4650,
      deposit: 4650,
      available: 3,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      floorPlanImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      features: ['Bay View', 'Gourmet Kitchen', 'Walk-in Closet', 'Hardwood Floors', 'Large Balcony'],
      amenities: ['High-Speed WiFi', 'Central AC/Heat', 'Dishwasher', 'In-Unit Washer/Dryer', 'Wine Fridge'],
      bedrooms: 1,
      bathrooms: 1.5
    },
    {
      id: 'two-bed-city',
      type: '2 Bedroom',
      subtype: 'City View',
      sqft: 1200,
      rent: 5800,
      deposit: 5800,
      available: 4,
      image: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop',
      floorPlanImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      features: ['City View', 'Gourmet Kitchen', 'Master Suite', 'Office Space', 'Large Balcony'],
      amenities: ['High-Speed WiFi', 'Central AC/Heat', 'Dishwasher', 'In-Unit Washer/Dryer', 'Walk-in Closets'],
      bedrooms: 2,
      bathrooms: 2
    },
    {
      id: 'two-bed-pano',
      type: '2 Bedroom',
      subtype: 'Panoramic View',
      sqft: 1350,
      rent: 6500,
      deposit: 6500,
      available: 2,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      floorPlanImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      features: ['Panoramic View', 'Gourmet Kitchen', 'Master Suite', 'Office Space', 'Wrap-around Balcony'],
      amenities: ['High-Speed WiFi', 'Central AC/Heat', 'Dishwasher', 'In-Unit Washer/Dryer', 'Wine Fridge', 'Smart Home Tech'],
      bedrooms: 2,
      bathrooms: 2.5
    },
    {
      id: 'three-bed-penthouse',
      type: '3 Bedroom',
      subtype: 'Penthouse',
      sqft: 1800,
      rent: 8900,
      deposit: 8900,
      available: 1,
      image: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=800&h=600&fit=crop',
      floorPlanImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      features: ['360° Views', 'Chef\'s Kitchen', 'Master Suite', 'Home Office', 'Private Terrace', 'Fireplace'],
      amenities: ['High-Speed WiFi', 'Central AC/Heat', 'Premium Appliances', 'In-Unit Washer/Dryer', 'Wine Fridge', 'Smart Home Tech', 'Concierge Service'],
      bedrooms: 3,
      bathrooms: 3
    }
  ]

  const additionalServices = {
    parking: [
      { type: 'Standard Parking', price: 250, available: 15 },
      { type: 'Covered Parking', price: 350, available: 8 },
      { type: 'Premium Parking (EV Charging)', price: 450, available: 5 }
    ],
    storage: [
      { type: 'Small Storage (5x5)', price: 125, available: 12 },
      { type: 'Medium Storage (5x10)', price: 200, available: 8 },
      { type: 'Large Storage (10x10)', price: 300, available: 4 }
    ]
  }

  const filteredUnits = selectedFloorPlan === 'all' 
    ? floorPlans 
    : floorPlans.filter(unit => unit.type === selectedFloorPlan)

  const propertyInfo = {
    name: "Luxury Heights Apartments",
    address: "123 Skyline Drive, San Francisco, CA 94105",
    phone: "(555) 123-4567",
    email: "leasing@luxuryheights.com",
    rating: 4.8,
    reviews: 247,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/50 to-black">
      {/* Header */}
      <header className="relative z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => router.push('/luxury-heights')}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Property</span>
              </button>
              
              <div className="h-8 w-px bg-white/20" />
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Available Units</h1>
                  <p className="text-xs text-gray-400">Luxury Heights</p>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 || (i === 4 && propertyInfo.rating >= 4.5) ? 'fill-current' : ''}`} />
                ))}
                <span className="text-white ml-2 text-sm">{propertyInfo.rating}/5</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-300">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-yellow-400" />
                  <span>{propertyInfo.phone}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <section className="sticky top-20 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">Filter by:</span>
              <div className="flex space-x-2">
                {['all', 'Studio', '1 Bedroom', '2 Bedroom', '3 Bedroom'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFloorPlan(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      selectedFloorPlan === type
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                        : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {type === 'all' ? 'All Units' : type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="text-sm text-gray-300">
              Showing {filteredUnits.length} of {floorPlans.length} floor plans
            </div>
          </div>
        </div>
      </section>

      {/* Units Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredUnits.map((unit) => (
              <div key={unit.id} className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:scale-105 transition-all duration-300 hover:bg-white/10">
                <div className="relative">
                  <div 
                    className="h-64 bg-cover bg-center"
                    style={{ backgroundImage: `url(${unit.image})` }}
                  />
                  <div className="absolute top-4 left-4">
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full">
                      <span className="text-white text-sm font-bold">{unit.available} Available</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <button className="bg-black/50 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/70 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{unit.type}</h3>
                      <p className="text-gray-400">{unit.subtype}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-300">
                        <div className="flex items-center">
                          <Bed className="w-4 h-4 mr-1" />
                          <span>{unit.bedrooms === 0 ? 'Studio' : unit.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="w-4 h-4 mr-1" />
                          <span>{unit.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <Maximize2 className="w-4 h-4 mr-1" />
                          <span>{unit.sqft} sq ft</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400">
                        ${unit.rent.toLocaleString()}/mo
                      </div>
                      <div className="text-sm text-gray-400">
                        ${unit.deposit.toLocaleString()} deposit
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-semibold text-white">Key Features:</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {unit.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                          <span className="text-gray-300 text-xs">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      onClick={() => router.push('/application')}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 px-4 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Apply Now
                    </button>
                    <button 
                      onClick={() => router.push('/virtual-tour')}
                      className="bg-white/10 border border-white/20 hover:bg-white/20 px-4 py-3 rounded-xl text-white transition-colors flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gradient-to-t from-black/50 to-transparent">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Additional Services</h2>
            <p className="text-xl text-gray-300">
              Enhance your luxury living experience with our premium add-on services
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Parking Options */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                  <Car className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Parking Options</h3>
                  <p className="text-gray-400">Secure parking solutions for residents</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {additionalServices.parking.map((parking, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{parking.type}</h4>
                      <p className="text-sm text-gray-400">{parking.available} spots available</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-cyan-400">+${parking.price}/mo</div>
                      <button className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                        Add to Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Storage Options */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Storage Units</h3>
                  <p className="text-gray-400">Climate-controlled storage spaces</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {additionalServices.storage.map((storage, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{storage.type}</h4>
                      <p className="text-sm text-gray-400">{storage.available} units available</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-pink-400">+${storage.price}/mo</div>
                      <button className="text-sm text-pink-400 hover:text-pink-300 transition-colors">
                        Add to Application
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Make Luxury Heights Your Home?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Start your application today and join our exclusive community. Fast approval process with AI-powered screening.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => router.push('/application')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 px-12 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 hover:scale-105 flex items-center"
              >
                <Zap className="w-6 h-6 mr-3" />
                Start Application
                <ArrowRight className="w-6 h-6 ml-3" />
              </button>
              
              <button 
                onClick={() => router.push('/virtual-tour')}
                className="bg-white/10 border border-white/20 hover:bg-white/20 px-8 py-4 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center"
              >
                <Eye className="w-6 h-6 mr-3" />
                Take Virtual Tour
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}