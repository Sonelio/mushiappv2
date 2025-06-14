'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';
import { useUser } from '@/components/providers/user-provider';
import type { User } from '@supabase/supabase-js';

const ProfileImage = ({ user }: { user: User | null }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset states when user image changes
    setImageError(false);
    setIsLoading(true);
  }, [user?.user_metadata?.avatar_url]);

  // Default avatar component
  const DefaultAvatar = () => (
    <div className="w-14 h-14 rounded-[15px] overflow-hidden">
      <Image
        src="/defaultprofile.png"
        alt="Default Profile"
        width={56}
        height={56}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );

  // Render default avatar if no user, no photo URL, or error
  if (!user?.user_metadata?.avatar_url || imageError) {
    return <DefaultAvatar />;
  }

  // Render actual profile image if available
  return (
    <div className="w-14 h-14 rounded-[15px] overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 bg-[#0C1813] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
        </div>
      )}
      <Image
        src={user.user_metadata.avatar_url}
        alt="Profile"
        width={56}
        height={56}
        className={`w-full h-full object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        priority
        unoptimized={true}
        onLoadingComplete={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const isTemplatesActive = pathname === '/templates';

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-4 my-6">
        <nav className="bg-[#181818] rounded-[15px] overflow-hidden">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-20">
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  ref={menuButtonRef}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white p-2"
                >
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Logo */}
              <div className="flex-shrink-0 md:flex-shrink-0">
                <Link href={"/" as Route} className="flex items-center">
                  <Image
                    src="/mushi-logo.png"
                    alt="Mushi Logo"
                    width={120}
                    height={36}
                    priority
                    className="object-contain"
                  />
                </Link>
              </div>

              {/* Main Navigation - Desktop */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href={"/templates" as Route}
                  className={`text-white text-[20px] font-bold tracking-wide px-6 py-4 rounded-md transition-colors ${
                    isTemplatesActive ? 'bg-[#222222]' : 'hover:bg-[#222222]'
                  }`}
                >
                  TEMPLATES
                </Link>
              </div>

              {/* Account Section - Desktop */}
              <div className="hidden md:flex items-center">
                <Link 
                  href={"/account" as Route}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#181818] transition-colors`}
                >
                  <ProfileImage user={user} />
                  <div className="text-sm mr-2">
                    <p className="text-[15px] font-semibold text-white mb-1">Account</p>
                    <p className="text-[15px] font-semibold text-[#667B66] truncate max-w-[120px]">
                      {user?.user_metadata?.full_name || user?.email || 'My Account'}
                    </p>
                  </div>
                </Link>
              </div>

              {/* Mobile Profile Picture */}
              <div className="md:hidden">
                <Link href={"/account" as Route}>
                  <ProfileImage user={user} />
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div ref={menuRef} className="md:hidden absolute top-full left-0 right-0 mx-4" style={{ marginTop: "-14px" }}>
              <div className="bg-[#11231C] overflow-hidden" style={{ borderRadius: "15px" }}>
                <div style={{ padding: "8px 4px 12px 4px" }}>
                  <Link
                    href={"/templates" as Route}
                    className={`block text-white text-[20px] font-bold tracking-wide rounded-md transition-colors text-center ${
                      isTemplatesActive ? 'bg-[#0C1813]' : 'hover:bg-[#0C1813]'
                    }`}
                    style={{ width: '150px', margin: '6px auto', padding: '8px 1px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    TEMPLATES
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
} 