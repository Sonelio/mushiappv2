'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

export default function PublicNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  
  const isCoursesActive = pathname === '/courses';
  const isAgencyActive = pathname === '/agency';
  const isTemplatesActive = pathname === '/templates';

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
        <nav className="bg-[#11231C] rounded-[15px] overflow-hidden">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-20">
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

              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href={"/agency" as Route}
                  className={`text-white text-[20px] font-semibold tracking-wide px-6 py-4 rounded-md transition-colors ${
                    isAgencyActive ? 'bg-[#0C1813]' : 'hover:bg-[#0C1813]'
                  }`}
                >
                  AGENCY
                </Link>
                <Link
                  href={"/templates" as Route}
                  className={`text-white text-[20px] font-semibold tracking-wide px-6 py-4 rounded-md transition-colors ${
                    isTemplatesActive ? 'bg-[#0C1813]' : 'hover:bg-[#0C1813]'
                  }`}
                >
                  TEMPLATES
                </Link>
                <Link
                  href={"/courses" as Route}
                  className={`text-white text-[20px] font-semibold tracking-wide px-6 py-4 rounded-md transition-colors ${
                    isCoursesActive ? 'bg-[#0C1813]' : 'hover:bg-[#0C1813]'
                  }`}
                >
                  COURSES
                </Link>
              </div>

              <div className="hidden md:flex items-center">
                <Link 
                  href={"/login" as Route}
                  className="bg-white text-[#11231C] px-6 py-3 rounded-[15px] font-semibold text-[20px] hover:bg-gray-100 transition-colors"
                >
                  Login
                </Link>
              </div>

              <div className="md:hidden">
                <Link 
                  href={"/login" as Route}
                  className="bg-white text-[#11231C] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div ref={menuRef} className="md:hidden absolute top-full left-0 right-0 mx-4" style={{ marginTop: "-14px" }}>
              <div className="bg-[#11231C] overflow-hidden" style={{ borderRadius: "15px" }}>
                <div style={{ padding: "8px 4px 12px 4px" }}>
                  <Link
                    href={"/agency" as Route}
                    className={`block text-white text-[20px] font-semibold tracking-wide rounded-md transition-colors text-center ${
                      isAgencyActive ? 'bg-[#0C1813]' : 'hover:bg-[#0C1813]'
                    }`}
                    style={{ width: '150px', margin: '6px auto', padding: '8px 1px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    AGENCY
                  </Link>
                  <Link
                    href={"/templates" as Route}
                    className={`block text-white text-[20px] font-semibold tracking-wide rounded-md transition-colors text-center ${
                      isTemplatesActive ? 'bg-[#0C1813]' : 'hover:bg-[#0C1813]'
                    }`}
                    style={{ width: '150px', margin: '6px auto', padding: '8px 1px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    TEMPLATES
                  </Link>
                  <Link
                    href={"/courses" as Route}
                    className={`block text-white text-[20px] font-semibold tracking-wide rounded-md transition-colors text-center ${
                      isCoursesActive ? 'bg-[#0C1813]' : 'hover:bg-[#0C1813]'
                    }`}
                    style={{ width: '150px', margin: '6px auto', padding: '8px 1px' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    COURSES
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