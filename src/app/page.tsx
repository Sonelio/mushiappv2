'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user) {
        router.push('/templates');
      }
    };
    
    checkUser();
  }, [router, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailError(false);
    setPasswordError(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Please enter your email address.');
      setIsLoading(false);
      return;
    }
    
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if it's a password-related error
        if (error.message.toLowerCase().includes('password') || 
            error.message.toLowerCase().includes('invalid login credentials')) {
          setPasswordError(true);
        } else {
          setError(error.message);
        }
        return;
      }

      if (data?.user) {
        router.push('/templates');
        router.refresh();
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get email from the form
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
    const email = emailInput?.value;

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Please enter your email address.');
      setError(null);
      return;
    }
    
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      setError(null);
      return;
    }

    setIsResettingPassword(true);
    setError(null);
    setEmailError(false);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setResetEmailSent(true);
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black p-8">
        <div className="relative w-full h-full rounded-[15px] overflow-hidden">
          <Image
            src="/welcome.png"
            alt="Welcome"
            fill
            className="object-cover"
            priority
          />
          {/* Mushi Logo - Top Left */}
          <div className="absolute top-6 left-6 z-10">
            <Image
              src="/mushi-logo.png"
              alt="Mushi Logo"
              width={120}
              height={36}
              priority
              className="object-contain"
            />
          </div>
          {/* Create Account Button - Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <Link 
              href="/signup" 
              className="text-white/90 hover:text-white transition-colors flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-[30px]"
            >
              Create an Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
          {/* Play Button Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <Image
                src="/playicon.png"
                alt="Play"
                width={104}
                height={104}
                className="ml-1"
              />
          </div>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-black">
        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-medium text-white mb-2">
                Sign in
              </h1>
            </div>

            {/* Success Message for Password Reset */}
            {resetEmailSent && (
              <div className="bg-green-900/50 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm mb-6">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  New password sent to your email! Check your inbox.
                </div>
              </div>
            )}

            {/* Sign In Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}
                            {/* Email Input */}
              <div className="relative">
                {emailError && (
                  <div className="absolute -top-12 left-4 z-10">
                    <div className="bg-[#5D2A2A] text-[#B55454] text-[15px] px-3 py-1 rounded-[15px] shadow-lg relative">
                      <div className="flex items-center gap-2">
                        <Image
                          src="/icons/emailicon.svg"
                          alt="Email Icon"
                          width={16}
                          height={16}
                        />
                        {emailErrorMessage}
                      </div>
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-4" style={{
                        width: 0,
                        height: 0,
                        borderLeft: '12px solid transparent',
                        borderRight: '12px solid transparent',
                        borderTop: '20px solid #5D2A2A'
                      }}></div>
                    </div>
                  </div>
                )}
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  disabled={isLoading}
                  className={`w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/60 focus:outline-none transition-all disabled:opacity-50 ${
                    emailError 
                      ? 'border-2 border-[#5D2A2A] focus:ring-2 focus:ring-red-500' 
                      : 'border-2 border-transparent focus:ring-2 focus:ring-purple-[#6E54B5] focus:border-transparent'
                  }`}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  disabled={isLoading}
                  className={`w-full px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/60 focus:outline-none transition-all pr-12 disabled:opacity-50 ${
                    passwordError 
                      ? 'border-2 border-[#5D2A2A] focus:ring-2 focus:ring-red-500' 
                      : 'border-2 border-transparent focus:ring-2 focus:ring-purple-[#6E54B5] focus:border-transparent'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
                {passwordError && (
                  <div className="absolute -bottom-9 left-4 z-10">
                    <div className="bg-[#5D2A2A] text-[#B55454] text-[15px] px-3 py-1 rounded-[15px] shadow-lg relative">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <circle cx="12" cy="16" r="1"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        Oops! Wrong password. Mind giving it another try?
                      </div>
                      {/* Arrow pointing up */}
                      <div className="absolute bottom-full left-4" style={{
                        width: 0,
                        height: 0,
                        borderLeft: '12px solid transparent',
                        borderRight: '12px solid transparent',
                        borderBottom: '20px solid #5D2A2A'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Continue Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full text-white text-[30px] font-medium py-3 px-6 rounded-[15px] transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:transform-none"
                  style={{
                    backgroundColor: '#6E54B5',
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#5A4494';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.backgroundColor = '#6E54B5';
                    }
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Continue'}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center my-8">
                <div className="flex-1 flex justify-end pr-4">
                  <Image
                    src="/dividerleft.svg"
                    alt="Divider Left"
                    width={200}
                    height={1}
                    className="object-contain opacity-80"
                  />
                </div>
                <span className="px-4 text-white text-sm">OR</span>
                <div className="flex-1 flex justify-start pl-4">
                  <Image
                    src="/dividerright.svg"
                    alt="Divider Right"
                    width={200}
                    height={1}
                    className="object-contain opacity-80"
                  />
                </div>
              </div>

              {/* Bottom Links */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  className="text-white/80 hover:text-white transition-colors font-medium border border-white border-1.5 hover:border-white px-10 py-4 rounded-lg bg-transparent cursor-pointer disabled:opacity-50"
                >
                  {isResettingPassword ? 'Sending...' : 'Forgot Password'}
                </button>
                <Link
                  href="/help"
                  className="text-white/80 hover:text-white transition-colors font-medium border border-white border-1.5 hover:border-white px-[70px] py-4 rounded-lg"
                >
                  Get Help
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
