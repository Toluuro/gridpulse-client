'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage(): React.JSX.Element {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 🆕 Password visibility state
  const [assignedRoom, setAssignedRoom] = useState<'room-alpha' | 'room-beta' | 'room-gamma'>('room-alpha');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ message: string; devVerificationUrl?: string } | null>(null);
  const { login } = useAuth();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setErrorMsg('');
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
      }
    } catch (err) {
      setErrorMsg('Network error during Google authentication');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, assignedRoom }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setSuccessData(data);
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
          
          {/* 🚀 DYNAMIC VIP CONFIRMATION VIEW */}
          {successData ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Access Pending</h2>
                <p className="mt-1 text-xs text-slate-500">Your syndicate profile has been generated and secured.</p>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed px-2">
                We have dispatched a formal confirmation link to <strong className="text-slate-900">{email}</strong>. You can verify through your inbox, or use your VIP Instant Access Portal below:
              </p>

              {/* VIP INSTANT ACCESS BADGE */}
              {successData.devVerificationUrl && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-2 shadow-lg transform transition hover:scale-[1.02]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Instant Syndicate Portal
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">VIP Feature</span>
                  </div>
                  <a 
                    href={successData.devVerificationUrl} 
                    className="block text-xs font-bold text-white hover:text-blue-300 transition break-all underline decoration-slate-600 hover:decoration-blue-300"
                  >
                    Click here to activate your session instantly →
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-slate-900 transition">
                  Return to Sign In →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Onboard New Executive</h2>
                <p className="mt-1 text-xs text-slate-500">Select your default syndicate data room below.</p>
              </div>

              {errorMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl">{errorMsg}</div>}

              <div className="w-full flex justify-center py-1">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg('Google Sign-Up was unsuccessful')}
                  theme="outline"
                  shape="pill"
                  text="signup_with"
                />
              </div>

              <div className="relative flex items-center justify-center"><div className="border-t border-slate-200 w-full"/><span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 absolute">Or manual onboarding</span></div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Modurotolu Opadele" className="w-full text-black bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Corporate Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tolu@flocompliance.com" className="w-full text-black bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"/>
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Default Syndicate Room</label>
                  <select value={assignedRoom} onChange={(e: any) => setAssignedRoom(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition">
                    <option value="room-alpha">Room 1: VestedProp Series A Syndication</option>
                    <option value="room-beta">Room 2: FloCompliance SaaS Venture Round</option>
                    <option value="room-gamma">Room 3: Eko Atlantic High-Rise Development</option>
                  </select>
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white py-3 rounded-xl font-extrabold text-sm shadow-md transition">
                  {isLoading ? 'Creating Executive Account...' : 'Complete Registration →'}
                </button>
              </form>
              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">Already registered? <Link href="/login" className="font-bold text-blue-600 hover:underline">Sign In</Link></div>
            </>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}