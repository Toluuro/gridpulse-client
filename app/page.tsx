'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { socket } from '@/lib/socket';

export default function LandingPage(): React.JSX.Element {
  const { user, isAuthenticated } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<{ total: number; room: number; dm: number } | null>(null);

  const roomNames: Record<string, string> = {
    'room-alpha': "VestedProp Series A Syndication",
    'room-beta': "FloCompliance SaaS Venture Round",
    'room-gamma': "Eko Atlantic High-Rise Development"
  };

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    // 1. Instantly ask the open WebSocket for the unread count
    socket.emit('REQUEST_UNREAD_COUNT', { email: user.email, assignedRoom: user.assignedRoom });

    // 2. Listen for the result and update the banner
    const handleUnreadResult = (data: { total: number; room: number; dm: number }) => {
      if (data.total > 0) setUnreadCounts(data);
      else setUnreadCounts(null);
    };

    // 3. If a message arrives while sitting on this page, just ask the socket for a fresh count!
    const handleNewMessage = (newMsg: any) => {
      const isMyRoomBroadcast = newMsg.recipientEmail === null && newMsg.roomId === user.assignedRoom;
      const isMyDM = newMsg.recipientEmail === user.email;
      const isFromSomeoneElse = newMsg.senderEmail !== user.email;

      if (isFromSomeoneElse && (isMyRoomBroadcast || isMyDM)) {
        socket.emit('REQUEST_UNREAD_COUNT', { email: user.email, assignedRoom: user.assignedRoom });
      }
    };

    socket.on('UNREAD_COUNT_RESULT', handleUnreadResult);
    socket.on('NEW_MESSAGE', handleNewMessage);

    return () => {
      socket.off('UNREAD_COUNT_RESULT', handleUnreadResult);
      socket.off('NEW_MESSAGE', handleNewMessage);
    };
  }, [isAuthenticated, user]);

  const handleDownloadExcelSimulation = () => {
    if (!user) return;
    const roomTitle = roomNames[user.assignedRoom] || "Syndicate_Model";
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Cell ID,Financial Metric Label,Baseline Valuation,Category\n"
      + "A1,Gross Asset Valuation ($),4500000,Editable Input\n"
      + "A2,Target Cap Rate (%),8.5,Editable Input\n"
      + "A3,Referral Commission Split (%),2.0,Editable Input\n"
      + "B1,Projected Annual Operating Income ($),382500,Auto-Calculated Projection\n"
      + "B2,Total Referral Yield Payout ($),90000,Auto-Calculated Projection\n"
      + "B3,Net Investor ROI (%),16.4,Live Syndicate Metric\n";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${roomTitle.replace(/\s+/g, '_')}_Model.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 overflow-x-hidden">
        
        {/* EXECUTIVE UNREAD MESSAGE LOGIN ALERT BANNER */}
        {unreadCounts && unreadCounts.total > 0 && (
          <div className="bg-linear-to-r from-blue-600 to-indigo-700 text-white p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-blue-400/30 animate-fade-in">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 animate-bounce">
                🔔
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wider">Unread Intelligence Waiting</h4>
                <p className="text-xs text-blue-100 mt-0.5">
                  You have <strong className="text-white font-extrabold underline">{unreadCounts.total} unread message(s)</strong> waiting in your assigned decision cocoon! 
                  ({unreadCounts.room} Room Broadcasts, {unreadCounts.dm} Direct Messages).
                </p>
              </div>
            </div>
            <Link 
              href={`/room/${user?.assignedRoom}`}
              className="bg-white text-blue-900 hover:bg-blue-50 px-5 py-2.5 rounded-xl text-xs font-black transition shadow-sm shrink-0 w-full sm:w-auto text-center"
            >
              Open Cocoon & Read →
            </Link>
          </div>
        )}

        {/* EXECUTIVE WELCOME BANNER */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Executive Briefing Suite</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome, {isAuthenticated && user ? user.name : 'Executive Analyst'}
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl">
              You are currently authenticated into the GridPulse multi-user command infrastructure. Review your assigned syndicate room below or enter the dark decision cocoon to begin live due diligence.
            </p>
          </div>

          {isAuthenticated && user ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
              <button 
                onClick={handleDownloadExcelSimulation}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-4 py-3 rounded-2xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>📥 Download Room Excel Model (.csv)</span>
              </button>
              <Link 
                href={`/room/${user.assignedRoom}`}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-xs font-black transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center"
              >
                <span>Enter Decision Cocoon →</span>
              </Link>
            </div>
          ) : (
            <Link href="/login" className="bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black transition shadow-md">
              Sign In to Access Room →
            </Link>
          )}
        </div>

        {/* ASSIGNED ROOM STATUS CARD */}
        {isAuthenticated && user && (
          <div className="bg-linear-to-r from-blue-900 via-slate-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-blue-500/30">
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-400 bg-blue-950/80 px-3 py-1 rounded-full border border-blue-500/30">
                Your Default Assigned Data Room
              </span>
              <h2 className="text-2xl font-black mt-2">{roomNames[user.assignedRoom]}</h2>
              <p className="text-slate-400 text-xs font-mono">Room ID: [{user.assignedRoom}] • Role: {user.role}</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-700 text-center shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Baseline Asset Valuation</span>
              <span className="text-xl font-mono font-black text-emerald-400">
                {user.assignedRoom === 'room-alpha' ? '$4,500,000' : user.assignedRoom === 'room-beta' ? '$12,800,000' : '$35,000,000'}
              </span>
            </div>
          </div>
        )}

        {/* CORE APPLICATION INTRODUCTORY BRIEFING */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-4">
            The GridPulse Methodology & Due Diligence Use Case
          </h3>
          
          <div className="prose prose-slate max-w-none text-slate-600 text-sm sm:text-base leading-relaxed space-y-4 font-medium">
            <p className="p-5 bg-blue-50/60 border-l-4 border-blue-600 rounded-r-2xl text-slate-800 font-semibold italic">
              &quot;When investment syndicates, real estate developers, or venture capitalists evaluate complex deals, they rely on financial models (commission splits, yield projections, amortization schedules). In a traditional setting, one person updates an Excel sheet and shares their screen. In GridPulse, all stakeholders sit in a virtual deal room watching live market valuation tickers stream across the top of their screen.&quot;
            </p>

            <p>
              GridPulse eliminates the friction of decentralized spreadsheet versioning. In standard syndication workflows, analysts emailing static Excel attachments create data silos where critical cap rate adjustments or referral commission splits are overwritten or miscalculated.
            </p>

            <p>
              By utilizing our <strong className="font-bold text-slate-900">decoupled Backend-for-Frontend (BFF) architecture</strong>, GridPulse establishes a persistent, bidirectional TCP connection between all stakeholders in a designated room. When an executive unlocks the supervised canvas and modifies a gross asset valuation, our persistent Express recalculation engine executes the financial projections on the server and broadcasts the exact ROI coordinates to every connected screen simultaneously in sub-second timeframes.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}