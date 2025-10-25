// Custom email verification using Resend instead of Supabase default
import { sendEmail } from './email'

export function createCustomVerificationEmail(userEmail: string, confirmationUrl: string) {
  const subject = '🔐 Verify your CodeFly account - Action required'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your CodeFly Account</title>
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
        }
        
        .verification-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #ecfeff 100%);
          padding: 25px;
          border-radius: 12px;
          border-left: 4px solid #0ea5e9;
          margin: 25px 0;
          text-align: center;
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
        }
        
        .security-note {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
        }
        
        .footer {
          text-align: center;
          padding: 30px;
          color: #64748b;
          font-size: 14px;
          background: #f8fafc;
        }
      </style>
    </head>
    <body class="email-container">
      <div class="header">
        <div class="logo">CodeFly ✈️</div>
        <p class="tagline">Learn to Code, Take Flight!</p>
      </div>

      <div class="content">
        <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">Verify Your Account 🔐</h2>
        
        <p style="font-size: 16px; margin-bottom: 25px;">Welcome to CodeFly! Please verify your email address to activate your account and begin your coding adventure.</p>
        
        <div class="verification-card">
          <h3 style="margin-top: 0; color: #0e7490; font-size: 20px;">🎯 Account Verification Required</h3>
          <p style="margin-bottom: 25px; color: #0369a1;">Click the button below to verify your email address and unlock access to your missions.</p>
          
          <a href="${confirmationUrl}" class="cta-button">
            ✅ Verify Email Address
          </a>
        </div>

        <div class="security-note">
          <p style="margin: 0; color: #856404;"><strong>🔒 Security Note:</strong> This verification link expires in 24 hours for your protection.</p>
        </div>

        <p style="font-size: 14px; color: #64748b;">If you didn't create a CodeFly account, please ignore this email or contact our support team.</p>
      </div>

      <div class="footer">
        <p style="margin-bottom: 20px;"><strong>Ready for takeoff!</strong><br>The CodeFly Team ✈️</p>
        
        <p style="margin: 20px 0;">
          <a href="https://www.codeflyai.com" style="color: #3b82f6; text-decoration: none;">CodeFly.ai</a> | 
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
CodeFly Email Verification

Welcome to CodeFly! Please verify your email address to activate your account.

Verify your account: ${confirmationUrl}

This verification link expires in 24 hours for your protection.

If you didn't create a CodeFly account, please ignore this email.

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

export async function sendCustomVerificationEmail(userEmail: string, confirmationUrl: string) {
  const emailTemplate = createCustomVerificationEmail(userEmail, confirmationUrl)
  return await sendEmail(emailTemplate)
}