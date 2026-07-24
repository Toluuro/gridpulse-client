'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const scanForAuthSession = () => {
  if (typeof window === 'undefined') return { isAuthenticated: false, user: null };

  let foundUser = null;
  let isAuthenticated = false;

  const storages = [localStorage, sessionStorage];
  for (const storage of storages) {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i) || '';
      const lowerKey = key.toLowerCase();
      const val = storage.getItem(key) || '';

      if (
        lowerKey.includes('token') || 
        lowerKey.includes('jwt') || 
        lowerKey.includes('auth') || 
        lowerKey.includes('session') ||
        lowerKey.includes('gridpulse_access')
      ) {
        if (val && val !== 'null' && val !== 'false' && val !== 'undefined' && val !== '""') {
          isAuthenticated = true;
        }
      }

      if (
        lowerKey.includes('user') || 
        lowerKey.includes('profile') || 
        lowerKey.includes('account') || 
        lowerKey.includes('gridpulse')
      ) {
        if (val && val !== 'null' && val !== 'false' && val !== 'undefined') {
          try {
            const parsed = JSON.parse(val);
            if (parsed && (parsed.name || parsed.email || parsed._id || parsed.id || parsed.role || parsed.firstName)) {
              foundUser = parsed;
              isAuthenticated = true;
            }
          } catch (e) {
            if (val.length > 5 && !val.startsWith('{')) {
              isAuthenticated = true;
            }
          }
        }
      }
    }
  }

  if (!isAuthenticated) {
    const cookies = document.cookie.toLowerCase();
    if (['token', 'auth', 'jwt', 'session', 'user', 'gridpulse'].some((k) => cookies.includes(k))) {
      isAuthenticated = true;
    }
  }

  return { isAuthenticated, user: foundUser };
};

export default function Navbar(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState<{ isAuthenticated: boolean; user: any }>({
    isAuthenticated: false,
    user: null,
  });
  
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const updateAuth = () => {
      const session = scanForAuthSession();
      setAuthState(session);
    };

    updateAuth();

    window.addEventListener('storage', updateAuth);
    window.addEventListener('focus', updateAuth);
    window.addEventListener('auth-change', updateAuth);

    return () => {
      window.removeEventListener('storage', updateAuth);
      window.removeEventListener('focus', updateAuth);
      window.removeEventListener('auth-change', updateAuth);
    };
  }, [pathname]);

  // 🚀 THE HARD-RESET SIGN OUT ENGINE
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      // 1. Scrub all storage vaults
      localStorage.clear();
      sessionStorage.clear();
      
      // 2. Scrub all authentication cookies
      const cookieNames = ['token', 'auth_token', 'jwt', 'session', 'user', 'gridpulse_token', 'gridpulse_user'];
      cookieNames.forEach((name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });

      // 3. Broadcast logout event to any open client tabs
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('auth-change'));

      // 4. ENTERPRISE HARD RESET: Forces browser RAM and Next.js client cache to self-destruct!
      window.location.href = '/login';
    }
  };

  const { isAuthenticated, user } = authState;
  const displayName = user?.name || user?.firstName || user?.email || 'Executive Analyst';

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-md group-hover:bg-blue-700 transition">
                G
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">
                Grid<span className="text-blue-600">Pulse</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 uppercase tracking-widest">
              PRO
            </span>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/" 
              className={`text-sm font-bold transition ${isActive('/') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Briefing Suite
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-bold transition ${isActive('/about') ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
            >
              About Us
            </Link>
          </nav>

          {/* DESKTOP AUTH ACTION BUTTONS */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 animate-in fade-in duration-200">
                <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 truncate max-w-50 shadow-2xs">
                  👤 {displayName}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl font-extrabold text-xs shadow-xs border border-red-200 transition duration-150 cursor-pointer"
                >
                  Sign Out →
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-bold text-slate-600 hover:text-slate-900 transition px-3 py-2"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-extrabold text-sm shadow-md transition"
                >
                  Register →
                </Link>
              </>
            )}
          </div>

          {/* MOBILE VIEWPORT ACTIONS */}
          <div className="flex items-center gap-2 md:hidden">
            {isAuthenticated ? (
              <button 
                type="button"
                onClick={handleSignOut}
                className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg font-bold text-xs shadow-xs"
              >
                Sign Out
              </button>
            ) : (
              <Link 
                href="/register" 
                className="bg-slate-900 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-xs"
              >
                Register
              </Link>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE DROPDOWN COCOON */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Navigation</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 uppercase tracking-widest">
              PRO Edition
            </span>
          </div>
          <Link 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
          >
            Briefing Suite
          </Link>
          <Link 
            href="/about" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
          >
            About Us
          </Link>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button 
                type="button"
                onClick={handleSignOut}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition"
              >
                Sign Out of Syndicate Room ({displayName})
              </button>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
              >
                Sign In to Syndicate Room
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}