'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Route } from 'next';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function HomePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

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

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-black" style={{
      backgroundImage: 'url("/background.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <div className="w-[480px] md:w-[480px] w-[320px] h-[480px] bg-[#17362A] p-8 rounded-[30px] shadow-xl">
        <div className="text-center mb-0">
          <div className="flex justify-center mb-8">
            <Image
              src="/mushi-logo.png"
              alt="Mushi Logo"
              width={150}
              height={45}
              priority
              className="object-contain"
            />
          </div>
          <h2 className="text-[20px] md:text-[25px] font-medium p-4 text-white">Sign in to Continue</h2>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-[18px] md:text-[20px] rounded bg-[#0C1310] rounded-[10px] border-0 text-[#667B66] placeholder-[#667B66] focus:ring-2 focus:ring-[#1D6D1E] focus:outline-none disabled:opacity-50"
                placeholder="Email"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 text-[18px] md:text-[20px] rounded bg-[#0C1310] rounded-[10px] border-0 text-[#667B66] placeholder-[#667B66] focus:ring-2 focus:ring-[#1D6D1E] focus:outline-none disabled:opacity-50"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#1D6D1E] text-white text-[20px] md:text-[25px] rounded-[10px] transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Enter Mushi'}
            </button>
          </div>
        </form>
        <div className="text-center mt-6">
          <span className="text-white text-[16px] md:text-[20px]">First time here? </span>
          <Link href={"/signup" as Route} className="text-[#1D6D1E] text-[16px] md:text-[20px]">
            Create Account.
          </Link>
        </div>
      </div>
    </div>
  );
}
