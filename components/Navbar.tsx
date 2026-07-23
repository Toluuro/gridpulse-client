'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar(): React.JSX.Element {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. BRAND LOGO & PRO BADGE */}
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

          {/* 2. DESKTOP NAVIGATION LINKS (Hidden on Mobile screens) */}
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

          {/* 3. DESKTOP AUTH ACTION BUTTONS */}
          <div className="hidden md:flex items-center gap-4">
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
          </div>

          {/* 4. MOBILE VIEWPORT ACTIONS (Visible ONLY on Mobile) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Quick Register Button for High Mobile Conversion */}
            <Link 
              href="/register" 
              className="bg-slate-900 text-white px-3.5 py-2 rounded-lg font-bold text-xs shadow-sm"
            >
              Register
            </Link>

            {/* Hamburger Menu Toggle Button */}
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

      {/* 5. MOBILE DROPDOWN COCOON (Toggles when Hamburger is clicked) */}
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
            <Link 
              href="/login" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Sign In to Syndicate Room
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}