// Initialize Resend with API key (only when available) - Using dynamic import to avoid build issues
let resend: any = null

async function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend')
      resend = new Resend(process.env.RESEND_API_KEY)
    } catch (error) {
      console.warn('Failed to load Resend:', error)
      return null
    }
  }
  return resend
}

export interface EmailTemplate {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

// Base email configuration
const EMAIL_CONFIG = {
  from: 'CodeFly ✈️ <info@codeflyai.com>',
  replyTo: 'info@codeflyai.com'
}

/**
 * Send email using Resend service
 */
export async function sendEmail({ to, subject, html, text }: EmailTemplate) {
  try {
    const resendClient = await getResendClient()
    
    // If no Resend API key, log and return success (for development)
    if (!resendClient) {
      console.log('📧 Email would be sent (no API key configured):')
      console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`)
      console.log(`Subject: ${subject}`)
      console.log('Email sending skipped - no RESEND_API_KEY configured')
      return { success: true, id: 'dev-mode-skip' }
    }

    const { data, error } = await resendClient.emails.send({
      from: EMAIL_CONFIG.from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      replyTo: EMAIL_CONFIG.replyTo
    })

    if (error) {
      console.error('Email sending error:', error)
      throw new Error(`Email sending failed: ${error.message}`)
    }

    console.log('Email sent successfully:', data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown email error' 
    }
  }
}

/**
 * Welcome email for new student signups - CodeFly Branding
 */
export function createWelcomeEmail(userName: string, userEmail: string) {
  const subject = '🚀 Welcome to CodeFly - Your Coding Adventure Begins!'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CodeFly</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        
        .email-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          color: #1e293b;
          max-width: 600px;
          margin: 0 auto;
          background: #f8fafc;
        }
        
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
          opacity: 0.3;
        }
        
        .logo-section {
          position: relative;
          z-index: 2;
        }
        
        .logo {
          font-size: 36px;
          font-weight: 800;
          color: white;
          margin: 0 0 10px 0;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .tagline {
          color: rgba(255,255,255,0.95);
          font-size: 18px;
          margin: 0;
          font-weight: 500;
        }
        
        .content {
          padding: 30px;
          background: white;
          margin: 0;
        }
        
        .welcome-message {
          background: linear-gradient(135deg, #f0f9ff 0%, #ecfeff 100%);
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #0ea5e9;
          margin: 25px 0;
        }
        
        .mission-card {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
          position: relative;
          overflow: hidden;
        }
        
        .mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 100px;
          height: 100px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 50%;
          transform: translate(50%, -50%);
        }
        
        .next-steps {
          background: #f1f5f9;
          padding: 25px;
          border-radius: 12px;
          margin: 25px 0;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: transform 0.2s;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: center;
          margin: 25px 0;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .stat-number {
          font-size: 28px;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .footer {
          text-align: center;
          padding: 30px;
          color: #64748b;
          font-size: 14px;
          background: #f8fafc;
        }
        
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
          .header { padding: 30px 20px; }
          .content { padding: 20px; }
        }
      </style>
    </head>
    <body class="email-container">
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <div class="logo">CodeFly ✈️</div>
          <p class="tagline">Learn to Code, Take Flight!</p>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Hi ${userName}! 👋</h2>
        
        <p style="font-size: 16px; margin-bottom: 25px;">Welcome to the <strong>CodeFly</strong> family! You're now part of our growing community of students mastering Python programming through our award-winning gamified curriculum.</p>
        
        <div class="mission-card">
          <h3 style="margin-top: 0; font-size: 20px; font-weight: 700;">🎮 Your Agent Academy Mission Awaits</h3>
          <p style="margin-bottom: 0; opacity: 0.9;">You've been recruited as an agent to infiltrate the Digital Fortress. Your first mission: <strong>Operation Beacon</strong> - master Python fundamentals through thrilling coding challenges in our immersive spy-themed adventure.</p>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3 style="color: #1e293b; margin-top: 0; font-size: 18px;">🎯 Ready for Takeoff?</h3>
          <ul style="margin: 0; padding-left: 20px; color: #475569;">
            <li style="margin-bottom: 8px;"><strong>Access Mission HQ:</strong> Your command center for all operations</li>
            <li style="margin-bottom: 8px;"><strong>Start Operation Beacon:</strong> Begin your Python journey</li>
            <li style="margin-bottom: 8px;"><strong>Earn XP & Unlock Rewards:</strong> Progress through 4 epic mission phases</li>
            <li style="margin-bottom: 0;"><strong>Join the Elite:</strong> Compete on leaderboards with students worldwide</li>
          </ul>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://codefly.ai/mission-hq" class="cta-button">
            🚀 Launch Mission HQ
          </a>
        </div>

        <!-- Stats -->
        <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 25px 0;">
          <h3 style="text-align: center; color: #1e293b; margin-top: 0;">Join Our Growing Community</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">127+</div>
              <div class="stat-label">Schools</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">50K+</div>
              <div class="stat-label">Students</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">94%</div>
              <div class="stat-label">Success Rate</div>
            </div>
          </div>
        </div>

        <!-- Support -->
        <div class="welcome-message">
          <h3 style="margin-top: 0; color: #0e7490;">✨ Need Support?</h3>
          <p style="margin-bottom: 15px;">Our team is here to ensure your coding journey is smooth:</p>
          <ul style="margin: 0; padding-left: 20px;">
            <li>📧 Email: <a href="mailto:info@codeflyai.com" style="color: #0ea5e9;">info@codeflyai.com</a></li>
            <li>📚 Help Center & Tutorials</li>
            <li>💬 Community Support</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin-bottom: 20px;"><strong>Happy coding!</strong><br>The CodeFly Team ✈️</p>
        
        <p style="margin: 20px 0;">
          <a href="https://codefly.ai" style="color: #3b82f6; text-decoration: none;">CodeFly.ai</a> | 
          <a href="mailto:info@codeflyai.com" style="color: #3b82f6; text-decoration: none;">Support</a>
        </p>
        
        <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
          You received this email because you signed up for CodeFly.<br>
          Questions? Contact us at info@codeflyai.com
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
Welcome to CodeFly! 🚀

Hi ${userName}!

Welcome to the CodeFly family! We're thrilled to have you join our community of students mastering Python programming through our gamified curriculum.

YOUR BLACK CIPHER MISSION AWAITS 🎮
You've been recruited as an agent to infiltrate the Digital Fortress. Your first mission: Operation Beacon - where you'll master Python fundamentals through exciting coding challenges.

WHAT'S NEXT? 🎯
• Access Mission HQ: Login to view your available missions
• Start Operation Beacon: Begin with Python fundamentals  
• Earn XP & Badges: Complete challenges to unlock rewards
• Level Up: Progress through 4 exciting mission phases

Start Your Mission: https://codefly.ai/mission-hq

CODEFLY COMMUNITY STATS
127+ Schools | 50K+ Students | 94% Success Rate

Need help? Email us: info@codeflyai.com

Happy coding! 🎉
The CodeFly Team ✈️

CodeFly.ai • info@codeflyai.com
  `

  return {
    to: userEmail,
    subject,
    html,
    text
  }
}

/**
 * Mission completion congratulations email
 */
export function createMissionCompleteEmail(userName: string, userEmail: string, missionName: string, xpEarned: number, nextMission?: string) {
  const subject = `🎉 Mission Complete: ${missionName} - ${xpEarned} XP Earned!`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mission Complete!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Mission Complete!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Excellent work, Agent ${userName}</p>
      </div>

      <!-- Achievement -->
      <div style="background: #f0f9ff; border: 2px solid #0ea5e9; padding: 25px; border-radius: 10px; text-align: center; margin-bottom: 25px;">
        <h2 style="color: #0369a1; margin-top: 0;">🏆 ${missionName} Complete</h2>
        <div style="font-size: 36px; font-weight: bold; color: #0ea5e9; margin: 15px 0;">+${xpEarned} XP</div>
        <p style="margin-bottom: 0; color: #0369a1;">Outstanding performance, Agent!</p>
      </div>

      ${nextMission ? `
      <!-- Next Mission -->
      <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #92400e;">🎯 Next Mission Available</h3>
        <p style="margin-bottom: 15px;">Your next challenge awaits: <strong>${nextMission}</strong></p>
        <div style="text-align: center;">
          <a href="https://codefly.ai/mission-hq" 
             style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 12px 24px; border-radius: 20px; font-weight: bold;">
            Continue Mission
          </a>
        </div>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #666; font-size: 14px;">
        <p>Keep up the excellent work! 🚀<br>
        The CodeFly Team ✈️</p>
      </div>
    </body>
    </html>
  `

  return {
    to: userEmail,
    subject,
    html
  }
}

/**
 * Password reset email
 */
export function createPasswordResetEmail(userEmail: string, resetUrl: string) {
  const subject = '🔐 Reset Your CodeFly Password'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Password Reset</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">CodeFly Account Security</p>
      </div>

      <!-- Content -->
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <p>Someone requested a password reset for your CodeFly account. If this was you, click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">
            Reset Password
          </a>
        </div>

        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;"><strong>Security Note:</strong> This link will expire in 1 hour for your security.</p>
        </div>

        <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #666; font-size: 14px;">
        <p>Stay secure! 🔒<br>
        The CodeFly Team ✈️</p>
        
        <p style="margin-top: 20px;">
          Questions? <a href="mailto:info@codeflyai.com" style="color: #4c6ef5;">Contact Support</a>
        </p>
      </div>
    </body>
    </html>
  `

  return {
    to: userEmail,
    subject,
    html
  }
}

/**
 * Teacher welcome email
 */
export function createTeacherWelcomeEmail(teacherName: string, teacherEmail: string, schoolName?: string) {
  const subject = '🎓 Welcome to CodeFly for Educators!'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome Educator!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <!-- Header -->
      <div style="text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
        <h1 style="margin: 0; font-size: 28px;">🎓 Welcome Educator!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Transform Your CS Classroom</p>
      </div>

      <!-- Main Content -->
      <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
        <h2 style="color: #059669; margin-top: 0;">Hi ${teacherName}! 👋</h2>
        
        <p>Welcome to <strong>CodeFly for Educators</strong>! You're now part of a community of 127+ schools using our platform to make computer science education engaging and effective.</p>
        
        ${schoolName ? `<p><strong>School:</strong> ${schoolName}</p>` : ''}
      </div>

      <!-- Teacher Features -->
      <div style="margin: 25px 0;">
        <h3 style="color: #333;">🚀 Educator Features</h3>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px;">
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 10px;"><strong>Real-time Progress Tracking:</strong> Monitor student progress instantly</li>
            <li style="margin-bottom: 10px;"><strong>Automated Grading:</strong> Save 10+ hours per week</li>
            <li style="margin-bottom: 10px;"><strong>Classroom Management:</strong> Organize students and assignments</li>
            <li style="margin-bottom: 10px;"><strong>Detailed Analytics:</strong> Understand student performance patterns</li>
            <li style="margin-bottom: 0;"><strong>Curriculum Alignment:</strong> Matches state standards</li>
          </ul>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://codefly.ai/teacher" 
           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">
          🎓 Access Teacher Dashboard
        </a>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #666; font-size: 14px;">
        <p>Ready to transform your classroom! 🚀<br>
        The CodeFly Team ✈️</p>
        
        <p style="margin-top: 20px;">
          <a href="mailto:info@codeflyai.com" style="color: #10b981; text-decoration: none;">Get Support</a> • 
          <a href="https://codefly.ai/docs" style="color: #10b981; text-decoration: none;">Documentation</a>
        </p>
      </div>
    </body>
    </html>
  `

  return {
    to: teacherEmail,
    subject,
    html
  }
}