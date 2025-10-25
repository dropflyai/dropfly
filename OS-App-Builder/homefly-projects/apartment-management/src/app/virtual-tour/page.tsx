'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Home,
  Eye,
  Crown,
  Camera,
  Video,
  Zap,
  ArrowRight,
  MapPin,
  Navigation,
  Move3D,
  MousePointer,
  Smartphone,
  Monitor,
  Headphones,
  Award,
  Clock,
  Users,
  Building,
  Bed,
  Bath,
  Maximize2,
  ChefHat,
  Dumbbell,
  Waves,
  Car,
  Wifi
} from 'lucide-react'

export default function VirtualTourPage() {
  const router = useRouter()
  const [selectedTour, setSelectedTour] = useState('lobby')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [tourProgress, setTourProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const tourSpots = [
    {
      id: 'lobby',
      name: 'Grand Lobby',
      description: 'Elegant entrance with concierge desk and luxury finishes',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
      duration: '2:30',
      highlights: ['24/7 Concierge', 'Marble Finishes', 'Art Installations']
    },
    {
      id: 'studio',
      name: 'Studio Apartment',
      description: 'Modern studio with city views and premium finishes',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      duration: '4:15',
      highlights: ['650 sq ft', 'City Views', 'Modern Kitchen', 'In-Unit Laundry']
    },
    {
      id: 'one-bedroom',
      name: '1 Bedroom Unit',
      description: 'Spacious one-bedroom with bay views and chef\'s kitchen',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
      duration: '5:45',
      highlights: ['850 sq ft', 'Bay Views', 'Chef\'s Kitchen', 'Walk-in Closet']
    },
    {
      id: 'two-bedroom',
      name: '2 Bedroom Unit',
      description: 'Premium two-bedroom with panoramic views and office space',
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
      duration: '7:20',
      highlights: ['1200 sq ft', 'Panoramic Views', 'Office Space', 'Large Balcony']
    },
    {
      id: 'penthouse',
      name: 'Penthouse Suite',
      description: 'Luxury penthouse with private terrace and 360° views',
      image: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=1200&h=800&fit=crop',
      duration: '8:30',
      highlights: ['1800 sq ft', '360° Views', 'Private Terrace', 'Fireplace']
    },
    {
      id: 'rooftop',
      name: 'Rooftop Pool',
      description: 'Infinity pool with stunning city and bay views',
      image: 'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1200&h=800&fit=crop',
      duration: '3:45',
      highlights: ['Infinity Pool', 'City Views', 'Lounge Area', 'BBQ Stations']
    },
    {
      id: 'fitness',
      name: 'Fitness Center',
      description: 'State-of-the-art gym with premium equipment',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=800&fit=crop',
      duration: '3:15',
      highlights: ['24/7 Access', 'Premium Equipment', 'Yoga Studio', 'Personal Training']
    },
    {
      id: 'lounge',
      name: 'Sky Lounge',
      description: 'Rooftop entertainment space with panoramic views',
      image: 'https://images.unsplash.com/photo-1582037928769-181f2644ecb7?w=1200&h=800&fit=crop',
      duration: '4:00',
      highlights: ['Panoramic Views', 'Entertainment System', 'Full Bar', 'Event Space']
    }
  ]

  const currentTour = tourSpots.find(spot => spot.id === selectedTour) || tourSpots[0]

  const propertyInfo = {
    name: "Luxury Heights Apartments",
    address: "123 Skyline Drive, San Francisco, CA 94105",
    rating: 4.8,
    reviews: 247,
  }

  const tourFeatures = [
    { icon: Move3D, text: '360° Virtual Views' },
    { icon: MousePointer, text: 'Interactive Navigation' },
    { icon: Smartphone, text: 'Mobile Optimized' },
    { icon: Monitor, text: 'HD Quality' },
    { icon: Headphones, text: 'Audio Narration' },
    { icon: Award, text: 'Award-Winning Design' }
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setTourProgress(prev => (prev >= 100 ? 0 : prev + 1))
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  const handleTourSelect = (tourId: string) => {
    setSelectedTour(tourId)
    setTourProgress(0)
    setIsPlaying(false)
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
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
                  <h1 className="text-lg font-bold text-white">Virtual Tour</h1>
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
              
              <button 
                onClick={() => router.push('/application')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 px-6 py-2 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tour Navigation */}
      <section className="sticky top-20 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 py-4">
        <div className="container mx-auto px-6">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            <span className="text-white font-medium whitespace-nowrap">Tour Locations:</span>
            <div className="flex space-x-2">
              {tourSpots.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handleTourSelect(spot.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                    selectedTour === spot.id
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                      : 'bg-white/10 border border-white/20 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {spot.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Tour Player */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Tour Viewer */}
            <div className="lg:col-span-2">
              <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video'} rounded-2xl overflow-hidden bg-black`}>
                <div 
                  className="w-full h-full bg-cover bg-center transition-all duration-500"
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.1)), url("${currentTour.image}")`,
                  }}
                />
                
                {/* Tour Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full flex items-center justify-center mb-6 mx-auto hover:bg-white/30 transition-colors cursor-pointer"
                         onClick={togglePlay}>
                      {isPlaying ? (
                        <Pause className="w-10 h-10 text-white" />
                      ) : (
                        <Play className="w-10 h-10 text-white ml-1" />
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{currentTour.name}</h3>
                    <p className="text-gray-200">{currentTour.description}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <button onClick={togglePlay} className="text-white hover:text-yellow-400 transition-colors">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <div className="flex-1 bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${tourProgress}%` }}
                      />
                    </div>
                    
                    <span className="text-white text-sm">{currentTour.duration}</span>
                    
                    <button onClick={toggleAudio} className="text-white hover:text-yellow-400 transition-colors">
                      {audioEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </button>
                    
                    <button onClick={toggleFullscreen} className="text-white hover:text-yellow-400 transition-colors">
                      {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {/* Navigation Dots */}
                <div className="absolute top-6 right-6 space-y-2">
                  {currentTour.highlights.map((highlight, index) => (
                    <div 
                      key={index}
                      className="w-3 h-3 bg-yellow-400 rounded-full cursor-pointer hover:scale-125 transition-transform"
                      title={highlight}
                    />
                  ))}
                </div>
              </div>

              {/* Tour Controls */}
              <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Tour Highlights</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {currentTour.highlights.map((highlight, index) => (
                    <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-3 text-center">
                      <span className="text-sm text-gray-300">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tour Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => router.push('/application')}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 px-4 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Apply Now
                  </button>
                  
                  <button 
                    onClick={() => router.push('/units')}
                    className="w-full bg-white/10 border border-white/20 hover:bg-white/20 px-4 py-3 rounded-xl text-white font-medium transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Floor Plans
                  </button>
                  
                  <button className="w-full bg-white/10 border border-white/20 hover:bg-white/20 px-4 py-3 rounded-xl text-white font-medium transition-colors flex items-center justify-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Schedule Visit
                  </button>
                </div>
              </div>

              {/* Tour Features */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Tour Features</h3>
                <div className="space-y-3">
                  {tourFeatures.map((feature, index) => {
                    const Icon = feature.icon
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300 text-sm">{feature.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Other Locations */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Other Locations</h3>
                <div className="space-y-3">
                  {tourSpots.filter(spot => spot.id !== selectedTour).slice(0, 3).map((spot) => (
                    <button 
                      key={spot.id}
                      onClick={() => handleTourSelect(spot.id)}
                      className="w-full text-left bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{spot.name}</h4>
                          <p className="text-gray-400 text-xs">{spot.duration}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-t from-black/50 to-transparent">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-400/30 rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Experience Luxury Heights in Person</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Ready to see more? Schedule an in-person tour or start your application to secure your luxury apartment today.
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
              
              <button className="bg-white/10 border border-white/20 hover:bg-white/20 px-8 py-4 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105 flex items-center">
                <Clock className="w-6 h-6 mr-3" />
                Schedule In-Person Tour
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}