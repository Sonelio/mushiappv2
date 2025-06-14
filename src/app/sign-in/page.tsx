'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function SignIn() {
  const [mode, setMode] = useState<'signin' | 'reset'>('signin')
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMode('reset')
    setResetEmailSent(false)
    setError(null)
  }

  const handleBackToSignin = () => {
    setMode('signin')
    setResetEmailSent(false)
    setError(null)
  }

  const handleSignInSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Here you would typically call your sign-in API
    setTimeout(() => {
      setIsLoading(false)
      // Simulate successful sign-in or add your actual sign-in logic
    }, 1000)
  }

  const handleResetSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    // Here you would typically call your password reset API
    setTimeout(() => {
      setIsLoading(false)
      setResetEmailSent(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/background.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Play Button Overlay on Background */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10">
        <div className="relative">
          <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Image
              src="/playicon.png"
              alt="Play"
              width={24}
              height={24}
              className="ml-1"
            />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-20 flex justify-between items-center p-8">
        <div className="flex items-center">
          <span className="text-white text-2xl font-bold tracking-wide">Mushi</span>
        </div>
        <Link 
          href="/signup" 
          className="text-white/80 hover:text-white transition-colors flex items-center gap-2"
        >
          Create an Account
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md px-8">
          {/* Dynamic heading based on mode */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2">
              {mode === 'signin' ? 'Sign in' : 'Reset Password'}
            </h1>
            {mode === 'reset' && !resetEmailSent && (
              <p className="text-white/80 text-lg mt-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            )}
          </div>

          {/* Unified Form */}
          {!resetEmailSent && (
            <form className="space-y-6" onSubmit={mode === 'signin' ? handleSignInSubmit : handleResetSubmit}>
              {error && (
                <div className="bg-red-900/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <input
                  name="email"
                  type="email"
                  placeholder={mode === 'signin' ? 'Email' : 'Enter your email address'}
                  disabled={isLoading}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                  required
                />
              </div>

              {/* Password Input - Hidden during reset mode */}
              {mode === 'signin' && (
                <div className="relative">
                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    disabled={isLoading}
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12 disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    disabled={isLoading}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Continue/Reset Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:transform-none"
                >
                  {isLoading 
                    ? (mode === 'signin' ? 'Signing in...' : 'Sending...')
                    : (mode === 'signin' ? 'Continue' : 'Send Reset Link')
                  }
                </button>
              </div>

              {/* Divider - Only show in signin mode */}
              {mode === 'signin' && (
                <div className="flex items-center my-8">
                  <div className="flex-1 border-t border-white/20"></div>
                  <span className="px-4 text-white/60 text-sm">OR</span>
                  <div className="flex-1 border-t border-white/20"></div>
                </div>
              )}

              {/* Bottom Links */}
              <div className="flex justify-between items-center">
                {mode === 'signin' ? (
                  <>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-white/80 hover:text-white transition-colors font-medium bg-transparent border-none cursor-pointer p-0"
                    >
                      Forgot Password
                    </button>
                    <Link
                      href="/help"
                      className="text-white/80 hover:text-white transition-colors font-medium"
                    >
                      Get Help
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleBackToSignin}
                      className="text-white/80 hover:text-white transition-colors font-medium bg-transparent border-none cursor-pointer flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                      </svg>
                      Back to Sign In
                    </button>
                    <Link
                      href="/help"
                      className="text-white/80 hover:text-white transition-colors font-medium"
                    >
                      Get Help
                    </Link>
                  </>
                )}
              </div>
            </form>
          )}

          {/* Success Message */}
          {mode === 'reset' && resetEmailSent && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Check your email</h2>
              <p className="text-white/80 text-lg mb-8">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleBackToSignin}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Back to Sign In
                </button>
                <button
                  onClick={() => setResetEmailSent(false)}
                  className="w-full text-white/80 hover:text-white transition-colors font-medium py-2"
                >
                  Didn't receive email? Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 