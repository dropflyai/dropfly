/**
 * Enhanced Gamified Lesson Interface
 * Integrates advanced mechanics with Agent Academy theming
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdvancedLessonMechanics, { LearningAnalytics, Achievement, PowerUp } from './AdvancedLessonMechanics'
import { 
  ArrowLeft, 
  Play, 
  Check, 
  Lightbulb, 
  Target,
  Sparkles,
  Zap,
  Award,
  Brain,
  Clock,
  TrendingUp,
  Shield,
  Star,
  Flame,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'

interface Dialogue {
  character: string
  text: string
  image: string
  emotion?: 'neutral' | 'confident' | 'encouraging' | 'serious' | 'alert'
}

interface Challenge {
  id: number
  instruction: string
  hint: string
  correctCode: string
  explanation: string
  spyContext: string
  concept: string // For analytics tracking
  difficulty: 'easy' | 'medium' | 'hard'
  timeLimit?: number // Optional time limit in seconds
}

interface LessonProps {
  lessonId: number
  title: string
  subtitle: string
  description: string
  challenges: Challenge[]
  weekNumber: number
  introDialogue?: Dialogue[]
  backgroundImage?: string
  onComplete: (xpEarned: number) => void
}

export default function EnhancedGameifiedLesson({ 
  lessonId, 
  title,
  subtitle, 
  description, 
  challenges, 
  weekNumber,
  introDialogue,
  backgroundImage,
  onComplete 
}: LessonProps) {
  const router = useRouter()
  const startTimeRef = useRef<number>(Date.now())
  const challengeStartTimeRef = useRef<number>(Date.now())

  // Core lesson state
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isCorrect, setIsCorrect] = useState(false)
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [syntaxErrors, setSyntaxErrors] = useState(0)

  // Cutscene system
  const [showCutscene, setShowCutscene] = useState(!!introDialogue)
  const [currentDialogue, setCurrentDialogue] = useState(0)
  const [showCharacter, setShowCharacter] = useState(false)

  // Gamification state
  const [totalXP, setTotalXP] = useState(0)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null)
  const [showXPGain, setShowXPGain] = useState<number | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  // Advanced features
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)
  const [activePowerUps, setActivePowerUps] = useState<PowerUp[]>([])

  const currentChallengeData = challenges[currentChallenge]

  // Timer for timed challenges
  useEffect(() => {
    if (currentChallengeData?.timeLimit && !completedChallenges.includes(currentChallenge)) {
      setTimeRemaining(currentChallengeData.timeLimit)
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            clearInterval(timer)
            handleTimeUp()
            return 0
          }
          return prev ? prev - 1 : null
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [currentChallenge, completedChallenges])

  // Auto-advance cutscene dialogue
  useEffect(() => {
    if (showCutscene && introDialogue && currentDialogue < introDialogue.length) {
      const timer = setTimeout(() => {
        setShowCharacter(true)
        const nextTimer = setTimeout(() => {
          if (currentDialogue < introDialogue.length - 1) {
            setCurrentDialogue(prev => prev + 1)
            setShowCharacter(false)
          } else {
            setShowCutscene(false)
            setShowCharacter(false)
            challengeStartTimeRef.current = Date.now()
          }
        }, 4000)
        
        return () => clearTimeout(nextTimer)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [currentDialogue, showCutscene, introDialogue])

  // Lesson mechanics callbacks
  const handleXPGained = (xp: number) => {
    setTotalXP(prev => prev + xp)
    setShowXPGain(xp)
    setTimeout(() => setShowXPGain(null), 2000)
  }

  const handleAchievementUnlocked = (achievement: Achievement) => {
    setAchievements(prev => [...prev, achievement])
  }

  const handleAnalyticsUpdate = (newAnalytics: LearningAnalytics) => {
    setAnalytics(newAnalytics)
  }

  const handleTimeUp = () => {
    setFeedback("Time's up! The security system detected your infiltration attempt. Try a faster approach next time.")
    setIsCorrect(false)
  }

  // Enhanced code checking with analytics
  const checkCode = () => {
    const trimmedCode = code.trim()
    const challengeTime = (Date.now() - challengeStartTimeRef.current) / 1000
    const newAttempts = attempts + 1
    
    setAttempts(newAttempts)

    // Enhanced validation logic
    let isCorrect = false
    let newSyntaxErrors = 0

    // Check for basic syntax errors
    const commonSyntaxIssues = [
      { pattern: /def\s+\w+\([^)]*\)[^:]/g, error: 'Missing colon after function definition' },
      { pattern: /if\s+[^:]+[^:]/g, error: 'Missing colon after if statement' },
      { pattern: /'[^']*$/g, error: 'Unclosed quote' },
      { pattern: /"[^"]*$/g, error: 'Unclosed quote' }
    ]

    for (const issue of commonSyntaxIssues) {
      if (issue.pattern.test(trimmedCode)) {
        newSyntaxErrors++
        setSyntaxErrors(prev => prev + 1)
      }
    }

    // Challenge-specific validation
    if (currentChallengeData.correctCode.includes('def ')) {
      // Function challenge
      isCorrect = trimmedCode.includes('def ') && 
                 trimmedCode.includes(currentChallengeData.correctCode.split('(')[0].split(' ')[1])
    } else if (currentChallengeData.correctCode.includes('if ')) {
      // Conditional challenge
      isCorrect = trimmedCode.includes('if ') && trimmedCode.includes(':')
    } else if (currentChallengeData.correctCode.includes('=')) {
      // Variable assignment
      isCorrect = trimmedCode.includes('=') && 
                 !trimmedCode.includes('==') // Not comparison
    } else {
      // Direct match
      isCorrect = trimmedCode === currentChallengeData.correctCode ||
                 trimmedCode.replace(/\s+/g, ' ') === currentChallengeData.correctCode.replace(/\s+/g, ' ')
    }

    setIsCorrect(isCorrect)
    
    if (isCorrect) {
      setFeedback(currentChallengeData.explanation)
      if (!completedChallenges.includes(currentChallenge)) {
        setCompletedChallenges(prev => [...prev, currentChallenge])
        
        // Track completion with advanced mechanics
        const lessonMechanics = document.getElementById('lesson-mechanics') as any
        if (lessonMechanics?.lessonAPI) {
          lessonMechanics.lessonAPI.onChallengeCompleted({
            concept: currentChallengeData.concept,
            attempts: newAttempts,
            timeSeconds: challengeTime,
            syntaxErrors: newSyntaxErrors,
            success: true
          })
        }
      }
    } else {
      const errorMsg = newSyntaxErrors > 0 
        ? "Syntax error detected! Check your colons, quotes, and indentation."
        : getSmartFeedback(trimmedCode, currentChallengeData)
      setFeedback(errorMsg)
    }
  }

  const getSmartFeedback = (userCode: string, challenge: Challenge): string => {
    // AI-powered feedback based on common mistakes
    if (challenge.correctCode.includes('def ') && !userCode.includes('def ')) {
      return "You need to define a function using 'def'. Remember: def function_name():"
    }
    if (challenge.correctCode.includes('=') && !userCode.includes('=')) {
      return "Don't forget the assignment operator (=) to store values in variables."
    }
    if (challenge.correctCode.includes('print') && !userCode.includes('print')) {
      return "You need to use print() to display output to the terminal."
    }
    return "Check your code carefully against the requirements. Remember the spy context for clues!"
  }

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1)
      setCode('')
      setFeedback('')
      setIsCorrect(false)
      setShowHint(false)
      setHintLevel(0)
      setAttempts(0)
      setSyntaxErrors(0)
      setTimeRemaining(challenges[currentChallenge + 1]?.timeLimit || null)
      challengeStartTimeRef.current = Date.now()
    } else {
      // Lesson complete
      const totalTime = (Date.now() - startTimeRef.current) / 1000
      const lessonProgress = {
        [`lesson${lessonId}`]: true,
        completedAt: new Date().toISOString(),
        totalTime: totalTime,
        totalXP: totalXP
      }
      
      const weekProgress = JSON.parse(localStorage.getItem(`week${weekNumber}-progress`) || '{}')
      Object.assign(weekProgress, lessonProgress)
      localStorage.setItem(`week${weekNumber}-progress`, JSON.stringify(weekProgress))
      
      onComplete(totalXP)
      router.push(`/mission/operation-beacon/week-${weekNumber}?completed=lesson-${lessonId}`)
    }
  }

  const skipCutscene = () => {
    setShowCutscene(false)
    setShowCharacter(false)
    challengeStartTimeRef.current = Date.now()
  }

  // Render cutscene
  if (showCutscene && introDialogue) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          backgroundImage: backgroundImage ? `url('${backgroundImage}')` : `url('/Mission HQ Command Center.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        {/* Character Portrait */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          showCharacter ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          {showCharacter && introDialogue[currentDialogue] && (
            <div className="relative">
              <img 
                src={introDialogue[currentDialogue].image}
                alt={introDialogue[currentDialogue].character}
                className="max-w-lg h-auto drop-shadow-2xl"
                style={{
                  clipPath: 'polygon(25% 0%, 75% 0%, 75% 100%, 25% 100%)',
                  transform: 'scale(1.2)'
                }}
              />
            </div>
          )}
        </div>

        {/* Dialogue Box */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/80 backdrop-blur-lg border-2 border-cyan-400/60 p-6"
                 style={{clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'}}>
              
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-cyan-400 font-mono">
                  🔐 {introDialogue[currentDialogue]?.character}
                </h3>
                <button 
                  onClick={skipCutscene}
                  className="text-gray-400 hover:text-white font-mono text-sm"
                >
                  Skip Cutscene →
                </button>
              </div>
              
              <p className="text-white font-mono text-lg leading-relaxed">
                {introDialogue[currentDialogue]?.text}
              </p>
              
              {/* Progress Indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {introDialogue.map((_, index) => (
                  <div 
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentDialogue ? 'bg-cyan-400' : 
                      index < currentDialogue ? 'bg-cyan-600' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main lesson interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 relative">
      {/* Advanced Lesson Mechanics */}
      <div id="lesson-mechanics">
        <AdvancedLessonMechanics
          onXPGained={handleXPGained}
          onAchievementUnlocked={handleAchievementUnlocked}
          onAnalyticsUpdate={handleAnalyticsUpdate}
        />
      </div>

      {/* XP Gain Animation */}
      {showXPGain && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-2xl font-bold p-4 rounded-full shadow-2xl">
            +{showXPGain} XP
          </div>
        </div>
      )}

      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-800/50 to-cyan-700/50 backdrop-blur-lg border-b border-cyan-500/30 p-4">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/mission/operation-beacon/week-${weekNumber}`} className="text-cyan-400 hover:text-cyan-300 font-mono text-sm mb-2 block">
              ← Return to Week {weekNumber}
            </Link>
            <h1 className="text-2xl font-bold text-white font-mono">
              <span className="text-cyan-400">🔐 LESSON {lessonId}</span> - {title}
            </h1>
            <p className="text-gray-300 font-mono text-sm">{subtitle}</p>
          </div>
          
          {/* Enhanced Progress Display */}
          <div className="text-right space-y-1">
            <div className="flex items-center space-x-4">
              <div className="text-yellow-400 font-mono font-bold text-lg">+{totalXP} XP</div>
              {timeRemaining && (
                <div className="text-red-400 font-mono font-bold flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{timeRemaining}s</span>
                </div>
              )}
            </div>
            <div className="text-gray-300 text-sm">{completedChallenges.length}/4 Complete</div>
            {analytics && (
              <div className="text-green-400 text-xs">
                Success Rate: {Math.round((completedChallenges.length / Math.max(1, attempts)) * 100)}%
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-4 flex items-center space-x-6 text-sm font-mono">
          <div className="flex items-center space-x-1 text-purple-400">
            <Brain className="w-4 h-4" />
            <span>Difficulty: {currentChallengeData?.difficulty || 'Easy'}</span>
          </div>
          <div className="flex items-center space-x-1 text-blue-400">
            <Target className="w-4 h-4" />
            <span>Attempts: {attempts}</span>
          </div>
          {activePowerUps.length > 0 && (
            <div className="flex items-center space-x-1 text-purple-400">
              <Zap className="w-4 h-4" />
              <span>{activePowerUps.length} Power-ups Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Main lesson content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Challenge Instructions - Enhanced */}
            <div className="space-y-6">
              <div className="bg-black/60 backdrop-blur-lg border-2 border-blue-400/40 p-6"
                   style={{clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'}}>
                
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-blue-400 font-mono flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Mission Objective {currentChallenge + 1}/4</span>
                  </h2>
                  <div className="text-blue-400 font-mono text-sm">
                    {currentChallengeData?.concept || 'Python Fundamentals'}
                  </div>
                </div>
                
                <p className="text-white font-mono mb-4">
                  {currentChallengeData?.instruction}
                </p>
                
                {/* Spy Context - Enhanced */}
                <div className="bg-red-900/20 border-l-4 border-red-400 p-3 mb-4">
                  <p className="text-red-300 font-mono text-sm">
                    <span className="text-red-400 font-bold flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>🕵️ Intel Brief:</span>
                    </span> 
                    {currentChallengeData?.spyContext}
                  </p>
                </div>
                
                {/* Multi-level Hint System */}
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setShowHint(!showHint)
                      if (!showHint) setHintLevel(0)
                    }}
                    className="bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-400/40 text-yellow-400 font-mono text-sm px-3 py-2 transition-colors flex items-center space-x-2"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showHint ? 'Hide Tactical Guide' : 'Show Tactical Guide'}</span>
                  </button>
                  
                  {showHint && (
                    <div className="bg-yellow-400/10 border-l-4 border-yellow-400 p-3">
                      <p className="text-yellow-300 font-mono text-sm">
                        <span className="text-yellow-400 font-bold">🔑 Level {hintLevel + 1} Intel:</span> 
                        {hintLevel === 0 ? currentChallengeData?.hint : 
                         hintLevel === 1 ? 'Check your syntax - colons, indentation, and quotes are critical.' :
                         'Remember: Python is case-sensitive and spacing matters for readability.'}
                      </p>
                      
                      {hintLevel < 2 && (
                        <button 
                          onClick={() => setHintLevel(prev => Math.min(2, prev + 1))}
                          className="text-yellow-400 hover:text-yellow-300 text-xs mt-2"
                        >
                          Need more help? →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Feedback with Character Response */}
              {feedback && (
                <div className="bg-black/60 backdrop-blur-lg border-2 border-purple-400/40 p-6"
                     style={{clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'}}>
                  
                  <div className="flex items-start space-x-4">
                    <img 
                      src={isCorrect ? "/Commander Atlas_Sketch_processed.png" : "/Dr. Maya Nexus_Sketch_processed.png"}
                      alt={isCorrect ? "Commander Atlas" : "Dr. Maya Nexus"}
                      className="w-16 h-16 rounded-full border-2 border-purple-400"
                    />
                    <div className="flex-1">
                      <h3 className="text-purple-400 font-mono font-bold mb-2 flex items-center space-x-2">
                        {isCorrect ? <Check className="w-4 h-4 text-green-400" /> : <RefreshCw className="w-4 h-4 text-red-400" />}
                        <span>{isCorrect ? "Commander Atlas" : "Dr. Maya Nexus"}</span>
                      </h3>
                      <p className={`font-mono text-sm ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                        {feedback}
                      </p>
                    </div>
                  </div>
                  
                  {isCorrect && (
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-green-400 text-sm font-mono">
                        ✓ Mission Complete • +{showXPGain || 25} XP
                      </div>
                      <button 
                        onClick={nextChallenge}
                        className="bg-green-600 hover:bg-green-500 text-white font-mono px-4 py-2 transition-colors flex items-center space-x-2"
                        style={{clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'}}
                      >
                        <span>{currentChallenge < challenges.length - 1 ? 'Next Mission' : 'Complete Operation'}</span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Code Editor */}
            <div className="space-y-6">
              <div className="bg-black/80 backdrop-blur-lg border-2 border-cyan-400/40 p-6"
                   style={{clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))'}}>
                
                <h3 className="text-cyan-400 font-mono font-bold mb-4 flex items-center space-x-2">
                  <span>🖥️ Tactical Programming Terminal</span>
                  {timeRemaining && (
                    <div className="ml-auto text-red-400 text-sm">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </h3>
                
                {/* Enhanced Code Input with Syntax Highlighting Preview */}
                <div className="bg-gray-900 border border-cyan-400/30 rounded-lg overflow-hidden mb-4">
                  <div className="bg-gray-800 px-3 py-2 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="ml-auto text-gray-400 text-xs font-mono">
                        agent_terminal.py
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="# Enter your classified code here..."
                      className="w-full h-32 bg-transparent text-cyan-400 font-mono text-sm resize-none focus:outline-none leading-6"
                      spellCheck={false}
                    />
                  </div>
                </div>
                
                {/* Enhanced Control Panel */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCode('')}
                      className="bg-gray-600 hover:bg-gray-500 text-white font-mono px-3 py-2 text-sm transition-colors flex items-center space-x-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Clear</span>
                    </button>
                    
                    {/* Show/Hide Analytics */}
                    <button 
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-mono px-3 py-2 text-sm transition-colors flex items-center space-x-1"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Stats</span>
                    </button>
                  </div>
                  
                  <button 
                    onClick={checkCode}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono px-6 py-2 transition-colors flex items-center space-x-2"
                    style={{clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)'}}
                  >
                    <Play className="w-4 h-4" />
                    <span>Execute Mission</span>
                  </button>
                </div>
              </div>

              {/* Analytics Panel */}
              {showAnalytics && analytics && (
                <div className="bg-black/60 border border-purple-400/30 p-4 rounded-lg">
                  <h4 className="text-purple-400 font-mono font-bold mb-3 flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span>Performance Analytics</span>
                  </h4>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Attempts:</span>
                      <span className="text-white">{analytics.averageAttempts.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Completion Time:</span>
                      <span className="text-white">{analytics.timeToCompletion.toFixed(1)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Streak:</span>
                      <span className="text-orange-400">{analytics.streakCount}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tracking - Enhanced */}
              <div className="bg-black/40 border border-gray-600/30 p-4 rounded-lg">
                <h4 className="text-white font-mono font-bold mb-3 flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>Mission Progress</span>
                </h4>
                <div className="space-y-3">
                  {challenges.map((challenge, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                        completedChallenges.includes(index) ? 'bg-green-500 text-white border-green-400' :
                        index === currentChallenge ? 'bg-yellow-500 text-black border-yellow-400 animate-pulse' :
                        'bg-gray-700 text-gray-400 border-gray-600'
                      }`}>
                        {completedChallenges.includes(index) ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <span className={`font-mono text-sm ${
                          completedChallenges.includes(index) ? 'text-green-400' :
                          index === currentChallenge ? 'text-yellow-400' :
                          'text-gray-500'
                        }`}>
                          {challenge.concept}
                        </span>
                        {completedChallenges.includes(index) && (
                          <div className="flex items-center space-x-1 text-xs text-green-300 mt-1">
                            <Star className="w-3 h-3" />
                            <span>Complete</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* XP Progress Bar - Enhanced */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm font-mono text-gray-400 mb-2">
                    <span>Operation XP</span>
                    <span>{totalXP}/200</span>
                  </div>
                  <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 relative"
                      style={{ width: `${Math.min(100, (totalXP / 200) * 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}