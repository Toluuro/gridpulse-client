'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 🆕 Password visibility state
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); // 🚀 1. INJECTED: Verification state
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMsg('');
    setIsVerifying(true); // 🚀 2. INJECTED: Trigger verification overlay
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        setErrorMsg(data.error || 'Google authentication failed');
        setIsVerifying(false); // 🚀 INJECTED: Stop spinner on failure
      }
    } catch (err) {
      setErrorMsg('Network error during Google authentication');
      setIsVerifying(false); // 🚀 INJECTED: Stop spinner on network error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    setIsVerifying(true); // 🚀 2. INJECTED: Trigger verification overlay
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign in failed');
      login(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
      setIsVerifying(false); // 🚀 INJECTED: Stop spinner on failure so user can retry
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Executive Sign In</h2>
            <p className="mt-1 text-xs text-slate-500">Access your syndicate due diligence command center.</p>
          </div>

          {errorMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl">{errorMsg}</div>}

          {/* 🚀 3. INJECTED: Conditional check wrapping your existing elements */}
          {isVerifying ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-75"></div>
                <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Verifying Credentials...</h3>
                <p className="text-xs font-medium text-slate-500 max-w-60 mx-auto">
                  Establishing encrypted 256-bit handshake with the Dark Decision Cocoon.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold tracking-wider uppercase border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                Syndicate Gateway Active
              </div>
            </div>
          ) : (
            <>
              {/* LIVE GOOGLE OAUTH BUTTON */}
              <div className="w-full flex justify-center py-1">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg('Google Sign-In was unsuccessful')}
                  theme="outline"
                  shape="pill"
                />
              </div>

              <div className="relative flex items-center justify-center"><div className="border-t border-slate-200 w-full"/><span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 absolute">Or credentials</span></div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Corporate Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tolu@vestedprop.com" className="w-full text-black bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"/>
                </div>
                
                {/* 🆕 PASSWORD INPUT WITH EYE TOGGLE */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="••••••••" 
                      className="w-full text-black bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-extrabold text-sm shadow-md transition">
                  {isLoading ? 'Authenticating...' : 'Sign In →'}
                </button>
              </form>
              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">Don&apos;t have an account? <Link href="/register" className="font-bold text-blue-600 hover:underline">Register New User</Link></div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}