'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 🆕 Import pathname hook
import { useAuth } from '@/context/AuthContext';

export default function Navbar(): React.JSX.Element {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname(); // 🆕 Get current active URL

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-md">
            G
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Grid<span className="text-blue-600">Pulse</span> <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5 ml-1">PRO</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          {/* 🆕 Dynamic Active Link Styling */}
          <Link 
            href="/" 
            className={`transition ${isActive('/') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}
          >
            Briefing Suite
          </Link>
          <Link 
            href="/about" 
            className={`transition ${isActive('/about') ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}
          >
            About Us
          </Link>
          {isAuthenticated && user && (
            <Link href={`/room/${user.assignedRoom}`} className="bg-slate-900 hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1.5">
              <span>Enter Deal Room →</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block">{user.name}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">{user.role}</span>
              </div>
              <button onClick={logout} className="text-xs font-bold text-red-600 hover:underline px-2 py-1">
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/login" 
                className={`text-xs font-bold px-3 py-2 transition ${isActive('/login') ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'}`}
              >
                Sign In
              </Link>
              {/* 🆕 Defaults to Black (bg-slate-900), turns Blue ONLY when on /register */}
              <Link 
                href="/register" 
                className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition text-white ${isActive('/register') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-900 hover:bg-slate-800'}`}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}