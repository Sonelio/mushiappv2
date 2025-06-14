# Custom Password Reset Setup

This project now includes a custom password reset functionality that generates random passwords and sends them via email instead of using reset links.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# Existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# New required variables
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GMAIL_EMAIL=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

## Setup Steps

### 1. Get Supabase Service Role Key
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the `service_role` key (not the `anon` key)
4. Add it to your environment variables as `SUPABASE_SERVICE_ROLE_KEY`

### 2. Setup Gmail SMTP for Email
1. Use a Gmail account (or create one specifically for this app)
2. Enable 2-Factor Authentication on the Gmail account
3. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password
4. Add your Gmail credentials to environment variables:
   - `GMAIL_EMAIL=your-gmail@gmail.com`
   - `GMAIL_APP_PASSWORD=your-16-character-app-password`

**Benefits of Gmail SMTP:**
- No domain verification required
- Works immediately with any Gmail account
- Can send to any email address
- Free and reliable

### 📝 Gmail App Password Setup (Detailed Steps):

1. **Enable 2-Factor Authentication:**
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Click "Security" → "2-Step Verification"
   - Follow the setup process

2. **Generate App Password:**
   - After 2FA is enabled, go back to Security
   - Click "2-Step Verification" → "App passwords"
   - Select "Mail" and your device type
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Important Notes:**
   - Use the App Password, NOT your regular Gmail password
   - Remove spaces from the App Password when adding to .env
   - Make sure 2FA is fully enabled before generating App Password

### 🚀 Development Fallback

If email setup fails, the system will automatically log the generated password to your console in development mode, so you can still test the functionality!

### 3. Test the Functionality
1. Start your development server: `npm run dev`
2. Go to the sign-in page
3. Enter an email address
4. Click "Forgot Password"
5. Check the email inbox for the generated password

## How It Works

1. User enters email and clicks "Forgot Password"
2. System checks if user exists in Supabase
3. Generates a random 12-character password
4. Updates the user's password in Supabase using admin API
5. Sends the new password via email using Gmail SMTP
6. User can immediately sign in with the new password

## Security Notes

- Passwords are generated with uppercase, lowercase, numbers, and special characters
- Users are encouraged to change the password after signing in
- Email existence is not revealed for security (same response for existing/non-existing emails)
- All operations use secure server-side API routes

## Files Created/Modified

- `src/lib/supabase-admin.ts` - Supabase admin client
- `src/lib/password-utils.ts` - Password generation utilities
- `src/lib/email.ts` - Email service using Gmail SMTP
- `src/app/api/auth/reset-password/route.ts` - API route for password reset
- `src/app/page.tsx` - Updated frontend to use new API 