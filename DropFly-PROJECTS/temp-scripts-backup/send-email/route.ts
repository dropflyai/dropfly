import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, createMissionCompleteEmail, createPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { type, ...emailData } = await request.json()

    let emailTemplate
    
    switch (type) {
      case 'mission_complete':
        const { userName, userEmail, missionName, xpEarned, nextMission } = emailData
        emailTemplate = createMissionCompleteEmail(userName, userEmail, missionName, xpEarned, nextMission)
        break
        
      case 'password_reset':
        const { userEmail: resetEmail, resetUrl } = emailData
        emailTemplate = createPasswordResetEmail(resetEmail, resetUrl)
        break
        
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    const result = await sendEmail(emailTemplate)

    if (result.success) {
      return NextResponse.json({ success: true, id: result.id })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' }, 
      { status: 500 }
    )
  }
}