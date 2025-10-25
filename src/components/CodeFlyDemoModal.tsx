'use client'

import { useState } from 'react'
import { X, Building, User, Mail, Phone, Calendar, MessageSquare, Users } from 'lucide-react'

interface CodeFlyDemoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CodeFlyDemoModal({ isOpen, onClose }: CodeFlyDemoModalProps) {
  const [formData, setFormData] = useState({
    contactName: '',
    schoolName: '',
    email: '',
    phone: '',
    jobTitle: '',
    numberOfStudents: '',
    gradeLevels: [] as string[],
    preferredDate: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setFormData(prev => ({
      ...prev,
      gradeLevels: checked 
        ? [...prev.gradeLevels, value]
        : prev.gradeLevels.filter(level => level !== value)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Your actual Zoho Forms endpoint
      const zohoFormEndpoint = 'https://forms.zoho.com/admincode1/form/RequestADemo'
      
      const formDataToSend = new FormData()
      formDataToSend.append('contactName', formData.contactName)
      formDataToSend.append('schoolName', formData.schoolName)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone', formData.phone)
      formDataToSend.append('jobTitle', formData.jobTitle)
      formDataToSend.append('numberOfStudents', formData.numberOfStudents)
      formDataToSend.append('gradeLevels', formData.gradeLevels.join(', '))
      formDataToSend.append('preferredDate', formData.preferredDate)
      formDataToSend.append('message', formData.message)

      // Submit to Zoho Forms
      await fetch(zohoFormEndpoint, {
        method: 'POST',
        body: formDataToSend,
        mode: 'no-cors' // Required for Zoho Forms
      })
      
      setIsSubmitted(true)
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
        setFormData({
          contactName: '',
          schoolName: '',
          email: '',
          phone: '',
          jobTitle: '',
          numberOfStudents: '',
          gradeLevels: [],
          preferredDate: '',
          message: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border border-violet-500/30 p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success State */}
        {isSubmitted ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Demo Request Sent! 🎉</h3>
            <p className="text-gray-300 mb-2">Thank you for your interest in CodeFly™ Pro!</p>
            <p className="text-gray-400 text-sm">We&apos;ll contact you within 24 hours to schedule your personalized demo.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center mb-4">
                <span className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-bold px-4 py-2 rounded-full">
                  🎯 SCHEDULE YOUR DEMO
                </span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Transform Your School with CodeFly™
              </h2>
              <p className="text-gray-300">
                See how gamified coding education can revolutionize your computer science program
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-semibold text-white mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="schoolName" className="block text-sm font-semibold text-white mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    School/District Name *
                  </label>
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="School or district name"
                  />
                </div>
              </div>

              {/* Contact Details Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="your.email@school.edu"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-white mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Job Title and Students Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-semibold text-white mb-2">
                    Job Title/Role *
                  </label>
                  <select
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  >
                    <option value="">Select your role</option>
                    <option value="Superintendent">Superintendent</option>
                    <option value="Principal">Principal</option>
                    <option value="IT Director">IT Director</option>
                    <option value="Curriculum Director">Curriculum Director</option>
                    <option value="Computer Science Teacher">Computer Science Teacher</option>
                    <option value="Technology Coordinator">Technology Coordinator</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="numberOfStudents" className="block text-sm font-semibold text-white mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Students
                  </label>
                  <select
                    id="numberOfStudents"
                    name="numberOfStudents"
                    value={formData.numberOfStudents}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  >
                    <option value="">Select enrollment</option>
                    <option value="Under 100">Under 100</option>
                    <option value="100-300">100-300</option>
                    <option value="300-500">300-500</option>
                    <option value="500-1000">500-1000</option>
                    <option value="1000-2000">1000-2000</option>
                    <option value="Over 2000">Over 2000</option>
                  </select>
                </div>
              </div>

              {/* Grade Levels */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Grade Levels Interested In
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {['Elementary', 'Middle School', 'High School'].map((level) => (
                    <label key={level} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={level}
                        checked={formData.gradeLevels.includes(level)}
                        onChange={handleCheckboxChange}
                        className="w-4 h-4 text-violet-600 bg-black/50 border-gray-600 rounded focus:ring-violet-500 focus:ring-2"
                      />
                      <span className="text-gray-300 text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferred Date */}
              <div>
                <label htmlFor="preferredDate" className="block text-sm font-semibold text-white mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Preferred Demo Date/Time
                </label>
                <input
                  type="datetime-local"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-white mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Additional Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
                  placeholder="Tell us about your goals for computer science education, timeline, or any specific questions..."
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-violet-600 to-cyan-600 rounded-lg hover:from-violet-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Scheduling Demo...</span>
                    </>
                  ) : (
                    <span>Schedule My CodeFly Demo</span>
                  )}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  We&apos;ll respond within 24 hours to schedule your personalized demo
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}