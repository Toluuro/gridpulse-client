'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
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

          {/* STATIC GOOGLE FIGUREHEAD BUTTON */}
          <button type="button" className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.8C6.2 7.3 8.9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/><path fill="#FBBC05" d="M5.3 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.5.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.8z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.3-6.7-5.2L1.6 16C3.5 19.8 7.4 23 12 23z"/></svg>
            <span>Sign in with Google</span>
          </button>

          <div className="relative flex items-center justify-center"><div className="border-t border-slate-200 w-full"/><span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 absolute">Or credentials</span></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Corporate Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tolu@vestedprop.com" className="w-full text-black bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"/>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full text-black bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"/>
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-extrabold text-sm shadow-md transition">
              {isLoading ? 'Authenticating...' : 'Sign In →'}
            </button>
          </form>
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">Don&apos;t have an account? <Link href="/register" className="font-bold text-blue-600 hover:underline">Register New User</Link></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}