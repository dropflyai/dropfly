'use client'

import { useState } from 'react'
import { 
  Zap, 
  Building, 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Play,
  X
} from 'lucide-react'

interface OnboardingFlowProps {
  onComplete: () => void
  isFirstVisit?: boolean
}

export default function OnboardingFlow({ onComplete, isFirstVisit = true }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [showVideo, setShowVideo] = useState(false)

  const steps = [
    {
      title: "Welcome to HomeFly Pro™",
      subtitle: "The AI-Powered Leasing Platform",
      description: "Transform your leasing operations with intelligent automation",
      icon: Zap,
      color: "from-yellow-600 to-orange-600",
      features: [
        "3x faster lease processing",
        "47% higher revenue optimization",
        "94.2% AI accuracy rate"
      ]
    },
    {
      title: "Your Command Center",
      subtitle: "Everything in One Place",
      description: "The Leasing Pipeline shows your daily priorities with revenue impact",
      icon: Building,
      color: "from-blue-600 to-cyan-600",
      features: [
        "Revenue-focused task queue",
        "One-click batch actions",
        "Real-time pipeline tracking"
      ]
    },
    {
      title: "AI Assistant",
      subtitle: "Your Smart Co-Pilot",
      description: "Get AI-powered recommendations for pricing, approvals, and retention",
      icon: Shield,
      color: "from-purple-600 to-pink-600",
      features: [
        "Smart pricing suggestions",
        "Auto-approval recommendations",
        "Renewal risk alerts"
      ]
    },
    {
      title: "Mobile-First Tools",
      subtitle: "Work From Anywhere",
      description: "Schedule showings, capture photos, and process applications on the go",
      icon: Users,
      color: "from-green-600 to-emerald-600",
      features: [
        "Mobile showing management",
        "Instant applications",
        "Digital signatures"
      ]
    },
    {
      title: "You're All Set!",
      subtitle: "Start Leasing Smarter",
      description: "Your demo environment is ready with sample data",
      icon: CheckCircle,
      color: "from-green-600 to-teal-600",
      features: [
        "Demo data resets daily at midnight",
        "Try all features risk-free",
        "Get support anytime"
      ]
    }
  ]

  const currentStepData = steps[currentStep]

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      localStorage.setItem('homefly_pro_onboarded', 'true')
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    localStorage.setItem('homefly_pro_onboarded', 'true')
    onComplete()
  }

  if (!isFirstVisit) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm text-white/60">Quick Tour</h3>
            <button
              onClick={handleSkip}
              className="text-white/60 hover:text-white transition-colors text-sm"
            >
              Skip Tour
            </button>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          {/* Icon */}
          <div className={`w-20 h-20 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <currentStepData.icon className="w-10 h-10 text-white" />
          </div>

          {/* Text Content */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{currentStepData.title}</h2>
            <h3 className="text-xl text-yellow-400 mb-4">{currentStepData.subtitle}</h3>
            <p className="text-white/70 text-lg">{currentStepData.description}</p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-8 bg-yellow-400' 
                      : index < currentStep
                      ? 'bg-yellow-400/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-3">
              {currentStep === 0 && (
                <button
                  onClick={() => setShowVideo(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all flex items-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Watch Demo</span>
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-white font-semibold hover:scale-105 transition-all flex items-center space-x-2"
              >
                <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {showVideo && (
          <div className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">HomeFly Pro™ Demo</h3>
                <button
                  onClick={() => setShowVideo(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center">
                <p className="text-white/60">Demo video placeholder - Add YouTube/Vimeo embed</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}