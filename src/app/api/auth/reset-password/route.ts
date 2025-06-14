import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateRandomPassword, isValidEmail } from '@/lib/password-utils';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Check if user exists by trying to list users and filter by email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();

    if (userError) {
      console.error('User lookup error:', userError);
      return NextResponse.json(
        { error: 'Failed to process request. Please try again.' },
        { status: 500 }
      );
    }

    const user = userData.users.find(u => u.email === email);

    if (!user) {
      // For security, we don't reveal if the email exists or not
      return NextResponse.json(
        { message: 'If an account with this email exists, a new password has been sent.' },
        { status: 200 }
      );
    }

    // Generate new random password
    const newPassword = generateRandomPassword(12);

    // Update user's password in Supabase
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset password. Please try again.' },
        { status: 500 }
      );
    }

    // Send email with new password
    try {
      await sendPasswordResetEmail({
        to: email,
        password: newPassword
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Even if email fails, the password was updated, so we need to handle this gracefully
      return NextResponse.json(
        { error: 'Password was reset but email could not be sent. Please contact support.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'New password has been sent to your email address.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
} 