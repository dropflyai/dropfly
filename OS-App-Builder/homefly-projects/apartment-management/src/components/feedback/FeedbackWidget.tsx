'use client'

import { useState } from 'react'
import { MessageSquare, X, Send, Star, Lightbulb, AlertTriangle, Heart } from 'lucide-react'

interface FeedbackWidgetProps {
  productName?: string
}

export default function FeedbackWidget({ productName = "HomeFly Pro™" }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general' | null>(null)
  const [rating, setRating] = useState(0)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const feedbackTypes = [
    { type: 'bug' as const, icon: AlertTriangle, label: 'Report Bug', color: 'red' },
    { type: 'feature' as const, icon: Lightbulb, label: 'Feature Request', color: 'blue' },
    { type: 'general' as const, icon: Heart, label: 'General Feedback', color: 'green' }
  ]

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real implementation, this would send to your feedback service
    console.log('Feedback submitted:', {
      type: feedbackType,
      rating,
      message,
      email,
      product: productName,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    
    setIsSubmitted(true)
    setIsSubmitting(false)
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setIsOpen(false)
      setFeedbackType(null)
      setRating(0)
      setMessage('')
      setEmail('')
    }, 3000)
  }

  const isValid = feedbackType && message.trim() && rating > 0

  if (isSubmitted) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-2xl shadow-xl max-w-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">Thank You!</h3>
            <p className="text-green-100 text-sm">
              Your feedback helps us make {productName} even better.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        title="Send Feedback"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl w-96 max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">Send Feedback</h3>
            <p className="text-white/60 text-sm">Help us improve {productName}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Feedback Type Selection */}
          {!feedbackType && (
            <div>
              <h4 className="text-white font-semibold mb-3">What type of feedback?</h4>
              <div className="space-y-2">
                {feedbackTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.type}
                      onClick={() => setFeedbackType(type.type)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all hover:scale-105 ${
                        type.color === 'red' ? 'border-red-400/30 hover:bg-red-500/10' :
                        type.color === 'blue' ? 'border-blue-400/30 hover:bg-blue-500/10' :
                        'border-green-400/30 hover:bg-green-500/10'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${
                        type.color === 'red' ? 'text-red-400' :
                        type.color === 'blue' ? 'text-blue-400' :
                        'text-green-400'
                      }`} />
                      <span className="text-white font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Feedback Form */}
          {feedbackType && (
            <>
              {/* Rating */}
              <div>
                <h4 className="text-white font-semibold mb-3">Rate your experience</h4>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 rounded transition-all hover:scale-110 ${
                        star <= rating ? 'text-yellow-400' : 'text-white/30 hover:text-yellow-300'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <h4 className="text-white font-semibold mb-3">Tell us more</h4>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' ? 'Describe the bug you encountered...' :
                    feedbackType === 'feature' ? 'What feature would you like to see?' :
                    'Share your thoughts about HomeFly Pro™...'
                  }
                  className="w-full h-24 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>

              {/* Email (Optional) */}
              <div>
                <h4 className="text-white font-semibold mb-3">Email (optional)</h4>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-white/40 text-xs mt-1">
                  We'll only use this to follow up on your feedback
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setFeedbackType(null)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    isValid && !isSubmitting
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-105'
                      : 'bg-white/20 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}