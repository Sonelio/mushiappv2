import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignIn() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-zinc-900 to-black">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Or{' '}
            <Link href={{ pathname: '/sign-up' }} className="font-medium text-purple-500 hover:text-purple-400">
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" action="#" method="POST">
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 py-1.5 px-3 bg-zinc-800 text-white placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-purple-500 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-md border-0 py-1.5 px-3 bg-zinc-800 text-white placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-purple-500 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-purple-500 focus:ring-purple-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-400">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href={{ pathname: '/forgot-password' }} className="font-medium text-purple-500 hover:text-purple-400">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-400"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
} 