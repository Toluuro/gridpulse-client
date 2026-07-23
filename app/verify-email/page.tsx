'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        
        if (res.ok) {
          setStatus('success');
          setTimeout(() => router.push('/login'), 3000); // Auto-redirect after success
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow-xl rounded-3xl sm:px-10 text-center">
        {status === 'loading' && <p className="text-slate-600 font-bold animate-pulse">Verifying your syndicate access...</p>}
        {status === 'success' && (
          <div>
            <h2 className="text-2xl font-black text-emerald-600 mb-2">Access Verified!</h2>
            <p className="text-slate-600 text-sm mb-6">Your email has been confirmed. Redirecting to the Briefing Suite...</p>
            <Link href="/login" className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold">Login Now</Link>
          </div>
        )}
        {status === 'error' && (
          <div>
            <h2 className="text-2xl font-black text-rose-600 mb-2">Verification Failed</h2>
            <p className="text-slate-600 text-sm mb-6">The verification link is invalid or has expired.</p>
            <Link href="/register" className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold">Register Again</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-bold">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}