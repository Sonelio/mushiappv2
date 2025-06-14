import nodemailer from 'nodemailer';

if (!process.env.GMAIL_EMAIL) {
  throw new Error('Missing env.GMAIL_EMAIL');
}
if (!process.env.GMAIL_APP_PASSWORD) {
  throw new Error('Missing env.GMAIL_APP_PASSWORD');
}

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

interface SendPasswordEmailProps {
  to: string;
  password: string;
}

export async function sendPasswordResetEmail({ to, password }: SendPasswordEmailProps) {
  // Development fallback - if Gmail credentials are missing or invalid, log to console
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    // Verify SMTP connection
    await transporter.verify();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #6E54B5; margin: 0;">Mushi App</h1>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin-top: 0;">Your New Password</h2>
          <p style="color: #666; line-height: 1.5;">
            We've generated a new password for your account as requested. Please use the password below to sign in:
          </p>
          
          <div style="background-color: #fff; border: 2px solid #6E54B5; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0; color: #6E54B5; font-family: monospace; font-size: 18px; letter-spacing: 2px;">
              ${password}
            </h3>
          </div>
          
          <p style="color: #666; line-height: 1.5;">
            <strong>Important:</strong> For security reasons, we recommend changing this password after you sign in to your account.
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 14px;">
          <p>If you didn't request this password reset, please contact our support team immediately.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;

    const textContent = `
      Your New Password - Mushi App
      
      We've generated a new password for your account as requested.
      
      Your new password is: ${password}
      
      Please use this password to sign in to your account. For security reasons, we recommend changing this password after you sign in.
      
      If you didn't request this password reset, please contact our support team immediately.
    `;

    const mailOptions = {
      from: `"Mushi App" <${process.env.GMAIL_EMAIL}>`,
      to: to,
      subject: 'Your New Password - Mushi App',
      text: textContent,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent successfully to:', to);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Email service error:', error);
    
    // Development fallback - log password to console
    if (isDevelopment) {
      console.log('\n' + '='.repeat(60));
      console.log('🔑 DEVELOPMENT MODE - EMAIL FALLBACK');
      console.log('='.repeat(60));
      console.log(`📧 To: ${to}`);
      console.log(`🔐 New Password: ${password}`);
      console.log('='.repeat(60));
      console.log('Note: Email sending failed, but password was updated.');
      console.log('Use the password above to sign in.');
      console.log('='.repeat(60) + '\n');
      
      return { success: true, messageId: 'console-fallback' };
    }
    
    throw new Error('Failed to send password reset email');
  }
} 