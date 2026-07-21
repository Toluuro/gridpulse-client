'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { socket } from '@/lib/socket';
import TickerBar from '@/components/TickerBar';
import GridCanvas from '@/components/GridCanvas';
import ChatPanel from '@/components/ChatPanel';

export default function DealRoomPage(): React.JSX.Element | null {
  const { roomId } = useParams() as { roomId: string };
  const { user, isAuthenticated, isLoading } = useAuth(); // 🆕 Get isLoading
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // 🆕 Wait for hydration before checking auth!
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }
    socket.emit('JOIN_DEAL_ROOM', { roomId, userEmail: user.email, userName: user.name });
  }, [isAuthenticated, user, roomId, router, isLoading]);

  // 🆕 Show a smooth loading state during browser refresh instead of redirecting!
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs animate-pulse">
        ⚡ Authenticating executive cocoon session...
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* 1. NIGERIAN MACRO TELEMETRY BAR */}
      <TickerBar />

      {/* 2. COCOON NAVIGATION */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
            <span>← Briefing Suite</span>
          </button>
          <span className="font-black text-lg text-white hidden sm:inline">
            Decision Cocoon <span className="text-blue-500">[{roomId}]</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Authenticated: <strong className="text-white">{user.name}</strong> ({user.role})</span>
          </div>
        </div>
      </header>

      {/* 3. MAIN COCOON WORKSPACE (GRID + CHAT) */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* LEFT 2 COLUMNS: SUPERVISED FINANCIAL CANVAS */}
        <div className="xl:col-span-2 space-y-6">
          <GridCanvas roomId={roomId} userName={user.name} />
        </div>

        {/* RIGHT COLUMN: REAL-TIME AUDIT CHAT & FILE TRANSMISSION SUITE */}
        <div className="xl:col-span-1">
          <ChatPanel roomId={roomId} currentUserEmail={user.email} currentUserName={user.name} />
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-600 font-mono shrink-0">
        GridPulse Executive Cocoon • AES-256 Bidirectional TCP Encryption Active
      </footer>
    </div>
  );
}