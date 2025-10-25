'use client'

import React, { useState } from 'react'
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Crown, 
  Eye, 
  EyeOff,
  LogIn,
  UserCheck,
  Shield
} from 'lucide-react'

interface SignInModalProps {
  isOpen: boolean
  onClose: () => void
  onSignIn: (email: string, password: string, userType: 'resident' | 'admin') => void
  userType: 'resident' | 'admin'
}

export default function SignInModal({ isOpen, onClose, onSignIn, userType }: SignInModalProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Demo credentials
  const demoCredentials = {
    resident: {
      email: 'resident@willowbrook.com',
      password: 'demo123'
    },
    admin: {
      email: 'admin@willowbrook.com', 
      password: 'admin123'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication delay
    setTimeout(() => {
      const validCredentials = demoCredentials[userType]
      
      if (email === validCredentials.email && password === validCredentials.password) {
        onSignIn(email, password, userType)
        onClose()
      } else {
        alert('Invalid credentials. Use demo credentials:\nEmail: ' + validCredentials.email + '\nPassword: ' + validCredentials.password)
      }
      
      setIsLoading(false)
    }, 1000)
  }

  const fillDemoCredentials = () => {
    const creds = demoCredentials[userType]
    setEmail(creds.email)
    setPassword(creds.password)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              userType === 'admin' 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}>
              {userType === 'admin' ? (
                <Crown className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {userType === 'admin' ? 'Admin' : 'Resident'} Sign In
              </h2>
              <p className="text-gray-400 text-sm">Willowbrook Community</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Demo Credentials Helper */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 font-medium text-sm">Demo Credentials</span>
          </div>
          <div className="text-blue-300 text-sm space-y-1">
            <div>Email: {demoCredentials[userType].email}</div>
            <div>Password: {demoCredentials[userType].password}</div>
          </div>
          <button
            onClick={fillDemoCredentials}
            className="mt-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1 rounded text-blue-300 transition-colors"
          >
            Auto-fill credentials
          </button>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-xl pl-11 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center space-x-3 ${
              isLoading || !email || !password
                ? 'bg-gray-600 cursor-not-allowed'
                : userType === 'admin'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 hover:scale-105'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 hover:scale-105'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Sign In as {userType === 'admin' ? 'Admin' : 'Resident'}</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Secure authentication for Willowbrook Community
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <UserCheck className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs">Demo Mode Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}