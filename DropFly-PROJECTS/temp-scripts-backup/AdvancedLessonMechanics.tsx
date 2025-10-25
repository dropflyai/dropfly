/**
 * Advanced Lesson Mechanics for Agent Academy
 * Enhanced interactive learning with gamification, analytics, and adaptive difficulty
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Trophy, 
  Target, 
  Zap, 
  Brain, 
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Flame,
  Shield,
  Lightbulb,
  RefreshCw
} from 'lucide-react'

interface LearningAnalytics {
  conceptMastery: { [concept: string]: number } // 0-100 mastery level
  averageAttempts: number
  timeToCompletion: number
  errorPatterns: string[]
  strengthAreas: string[]
  improvementAreas: string[]
  streakCount: number
  totalXP: number
}

interface AdaptiveDifficulty {
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  successRate: number
  recommendedNext: string[]
  skipSuggestions: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  unlocked: boolean
  progress: number
  maxProgress: number
  category: 'coding' | 'speed' | 'accuracy' | 'streak' | 'exploration'
}

interface PowerUp {
  id: string
  name: string
  description: string
  icon: string
  duration: number // in milliseconds
  effect: 'double_xp' | 'auto_hint' | 'syntax_check' | 'time_bonus' | 'second_chance'
  active: boolean
  cooldown: number
}

export const ACHIEVEMENTS: Achievement[] = [
  // Coding Achievements
  {
    id: 'first_variable',
    title: 'Memory Bank Initialization',
    description: 'Create your first variable',
    icon: '🧠',
    xpReward: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'coding'
  },
  {
    id: 'data_types_master',
    title: 'Intel Classification Expert',
    description: 'Master all 4 data types',
    icon: '📊',
    xpReward: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 4,
    category: 'coding'
  },
  {
    id: 'conditional_agent',
    title: 'Decision Making Protocol',
    description: 'Complete 5 conditional challenges',
    icon: '🔀',
    xpReward: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    category: 'coding'
  },
  {
    id: 'function_architect',
    title: 'Module Development Specialist',
    description: 'Create 10 different functions',
    icon: '⚙️',
    xpReward: 200,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    category: 'coding'
  },

  // Speed Achievements
  {
    id: 'lightning_coder',
    title: 'Lightning Response Agent',
    description: 'Complete a challenge in under 30 seconds',
    icon: '⚡',
    xpReward: 75,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    category: 'speed'
  },
  {
    id: 'speed_demon',
    title: 'Cyber Ops Speed Specialist',
    description: 'Complete 5 challenges under 1 minute each',
    icon: '🏃',
    xpReward: 200,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    category: 'speed'
  },

  // Accuracy Achievements
  {
    id: 'perfect_syntax',
    title: 'Precision Protocol Expert',
    description: 'Complete 3 challenges without syntax errors',
    icon: '🎯',
    xpReward: 125,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    category: 'accuracy'
  },
  {
    id: 'first_try_master',
    title: 'Tactical Accuracy Specialist',
    description: 'Get 5 challenges right on first try',
    icon: '🥇',
    xpReward: 250,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    category: 'accuracy'
  },

  // Streak Achievements
  {
    id: 'daily_operative',
    title: 'Daily Mission Commitment',
    description: 'Complete lessons for 3 days straight',
    icon: '📅',
    xpReward: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    category: 'streak'
  },
  {
    id: 'weekly_agent',
    title: 'Weekly Operations Specialist',
    description: 'Maintain 7-day learning streak',
    icon: '🔥',
    xpReward: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    category: 'streak'
  }
]

export const POWER_UPS: PowerUp[] = [
  {
    id: 'double_xp',
    name: 'XP Amplifier',
    description: 'Double XP for next 5 minutes',
    icon: '💎',
    duration: 300000, // 5 minutes
    effect: 'double_xp',
    active: false,
    cooldown: 0
  },
  {
    id: 'auto_hint',
    name: 'AI Assistant',
    description: 'Get automatic hints for 3 challenges',
    icon: '🤖',
    duration: 0, // Instant use
    effect: 'auto_hint',
    active: false,
    cooldown: 0
  },
  {
    id: 'syntax_shield',
    name: 'Syntax Shield',
    description: 'First syntax error auto-corrected',
    icon: '🛡️',
    duration: 0, // One-time use
    effect: 'syntax_check',
    active: false,
    cooldown: 0
  },
  {
    id: 'time_dilation',
    name: 'Time Dilation Field',
    description: '+50% time bonus for timed challenges',
    icon: '⏰',
    duration: 600000, // 10 minutes
    effect: 'time_bonus',
    active: false,
    cooldown: 0
  }
]

interface AdvancedLessonMechanicsProps {
  onXPGained: (xp: number) => void
  onAchievementUnlocked: (achievement: Achievement) => void
  onAnalyticsUpdate: (analytics: LearningAnalytics) => void
}

export default function AdvancedLessonMechanics({ 
  onXPGained, 
  onAchievementUnlocked, 
  onAnalyticsUpdate 
}: AdvancedLessonMechanicsProps) {
  // Core State
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS)
  const [powerUps, setPowerUps] = useState<PowerUp[]>(POWER_UPS)
  const [analytics, setAnalytics] = useState<LearningAnalytics>({
    conceptMastery: {},
    averageAttempts: 0,
    timeToCompletion: 0,
    errorPatterns: [],
    strengthAreas: [],
    improvementAreas: [],
    streakCount: 0,
    totalXP: 0
  })
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<AdaptiveDifficulty>({
    currentLevel: 'beginner',
    successRate: 0,
    recommendedNext: [],
    skipSuggestions: false
  })

  // Gamification State
  const [currentStreak, setCurrentStreak] = useState(0)
  const [comboMultiplier, setComboMultiplier] = useState(1)
  const [showAchievementPopup, setShowAchievementPopup] = useState<Achievement | null>(null)
  const [activePowerUp, setActivePowerUp] = useState<PowerUp | null>(null)

  // Achievement System
  const checkAchievements = useCallback((actionType: string, metadata: any) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.unlocked) return achievement

        let progressIncrement = 0
        
        switch (achievement.id) {
          case 'first_variable':
            if (actionType === 'variable_created') progressIncrement = 1
            break
          case 'data_types_master':
            if (actionType === 'data_type_mastered') progressIncrement = 1
            break
          case 'conditional_agent':
            if (actionType === 'conditional_completed') progressIncrement = 1
            break
          case 'function_architect':
            if (actionType === 'function_created') progressIncrement = 1
            break
          case 'lightning_coder':
            if (actionType === 'challenge_completed' && metadata.timeSeconds < 30) progressIncrement = 1
            break
          case 'perfect_syntax':
            if (actionType === 'challenge_completed' && metadata.syntaxErrors === 0) progressIncrement = 1
            break
          case 'first_try_master':
            if (actionType === 'challenge_completed' && metadata.attempts === 1) progressIncrement = 1
            break
          case 'daily_operative':
            if (actionType === 'daily_streak') progressIncrement = 1
            break
        }

        if (progressIncrement > 0) {
          const newProgress = Math.min(achievement.progress + progressIncrement, achievement.maxProgress)
          const isNewlyUnlocked = newProgress >= achievement.maxProgress && !achievement.unlocked
          
          if (isNewlyUnlocked) {
            setShowAchievementPopup(achievement)
            onXPGained(achievement.xpReward)
            onAchievementUnlocked(achievement)
          }

          return {
            ...achievement,
            progress: newProgress,
            unlocked: newProgress >= achievement.maxProgress
          }
        }

        return achievement
      })
      
      return updated
    })
  }, [onXPGained, onAchievementUnlocked])

  // Power-Up System
  const activatePowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId)
    if (!powerUp || powerUp.active || powerUp.cooldown > 0) return

    setPowerUps(prev => prev.map(p => 
      p.id === powerUpId ? { ...p, active: true } : p
    ))
    
    setActivePowerUp(powerUp)

    // Set duration timer for temporary power-ups
    if (powerUp.duration > 0) {
      setTimeout(() => {
        setPowerUps(prev => prev.map(p => 
          p.id === powerUpId ? { ...p, active: false, cooldown: powerUp.duration / 2 } : p
        ))
        setActivePowerUp(null)
      }, powerUp.duration)
    }
  }

  // Adaptive Difficulty System
  const updateDifficulty = useCallback((success: boolean, timeSpent: number, attempts: number) => {
    setAdaptiveDifficulty(prev => {
      const newSuccessRate = (prev.successRate + (success ? 1 : 0)) / 2
      
      let newLevel = prev.currentLevel
      if (newSuccessRate > 0.8 && timeSpent < 60) {
        newLevel = prev.currentLevel === 'beginner' ? 'intermediate' : 'advanced'
      } else if (newSuccessRate < 0.4 && attempts > 3) {
        newLevel = prev.currentLevel === 'advanced' ? 'intermediate' : 'beginner'
      }

      return {
        ...prev,
        currentLevel: newLevel,
        successRate: newSuccessRate,
        recommendedNext: generateRecommendations(newLevel, newSuccessRate),
        skipSuggestions: newSuccessRate > 0.9
      }
    })
  }, [])

  const generateRecommendations = (level: string, successRate: number): string[] => {
    if (level === 'beginner') {
      return ['Review basic syntax', 'Practice variable creation', 'Try guided tutorials']
    } else if (level === 'intermediate') {
      return ['Explore conditional logic', 'Practice function creation', 'Try mini-projects']
    } else {
      return ['Advanced challenges', 'Code optimization', 'Complex algorithms']
    }
  }

  // Analytics Tracking
  const updateAnalytics = useCallback((concept: string, attempts: number, timeSpent: number, success: boolean) => {
    setAnalytics(prev => {
      const newMastery = { ...prev.conceptMastery }
      const currentMastery = newMastery[concept] || 0
      
      // Update mastery based on performance
      if (success) {
        newMastery[concept] = Math.min(100, currentMastery + (attempts === 1 ? 20 : 10))
      } else {
        newMastery[concept] = Math.max(0, currentMastery - 5)
      }

      const updatedAnalytics = {
        ...prev,
        conceptMastery: newMastery,
        averageAttempts: (prev.averageAttempts + attempts) / 2,
        timeToCompletion: (prev.timeToCompletion + timeSpent) / 2,
        totalXP: prev.totalXP + (success ? 25 : 0)
      }

      onAnalyticsUpdate(updatedAnalytics)
      return updatedAnalytics
    })
  }, [onAnalyticsUpdate])

  // Public API for lesson components
  const lessonAPI = {
    // Track completion
    onChallengeCompleted: (metadata: {
      concept: string
      attempts: number
      timeSeconds: number
      syntaxErrors: number
      success: boolean
    }) => {
      updateAnalytics(metadata.concept, metadata.attempts, metadata.timeSeconds, metadata.success)
      updateDifficulty(metadata.success, metadata.timeSeconds, metadata.attempts)
      checkAchievements('challenge_completed', metadata)
      
      if (metadata.success) {
        const xpGain = activePowerUp?.effect === 'double_xp' ? 50 : 25
        onXPGained(xpGain * comboMultiplier)
        setComboMultiplier(prev => Math.min(3, prev + 0.1))
      } else {
        setComboMultiplier(1) // Reset combo on failure
      }
    },

    // Specific action tracking
    onVariableCreated: () => checkAchievements('variable_created', {}),
    onDataTypeMastered: () => checkAchievements('data_type_mastered', {}),
    onConditionalCompleted: () => checkAchievements('conditional_completed', {}),
    onFunctionCreated: () => checkAchievements('function_created', {}),

    // Power-up system
    activatePowerUp,
    getActivePowerUps: () => powerUps.filter(p => p.active),
    
    // Difficulty system
    getCurrentDifficulty: () => adaptiveDifficulty,
    
    // Analytics
    getAnalytics: () => analytics
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Achievement Popup */}
      {showAchievementPopup && (
        <div className="mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 rounded-lg shadow-2xl animate-bounce">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{showAchievementPopup.icon}</div>
            <div>
              <h3 className="font-bold text-lg">{showAchievementPopup.title}</h3>
              <p className="text-sm">{showAchievementPopup.description}</p>
              <p className="text-sm font-bold">+{showAchievementPopup.xpReward} XP</p>
            </div>
            <button 
              onClick={() => setShowAchievementPopup(null)}
              className="text-black hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Active Power-Up Display */}
      {activePowerUp && (
        <div className="mb-4 bg-purple-600/90 text-white p-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{activePowerUp.icon}</span>
            <div>
              <h4 className="font-bold text-sm">{activePowerUp.name}</h4>
              <p className="text-xs opacity-80">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Combo Multiplier */}
      {comboMultiplier > 1 && (
        <div className="mb-4 bg-orange-500/90 text-white p-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Flame className="w-4 h-4" />
            <span className="font-bold text-sm">{comboMultiplier.toFixed(1)}x Combo!</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Export the lesson API type for other components
export type { LearningAnalytics, Achievement, PowerUp }
export { lessonAPI }