import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage(): React.JSX.Element {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">Corporate Overview</span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Architecting the Cocoon for Executive Decision Making.</h1>
          <p className="text-slate-600 text-base leading-relaxed">GridPulse bridges the gap between static financial spreadsheets and real-time capital syndication. We provide real estate developers, venture capitalists, and risk analysts with persistent, bidirectional data rooms.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">01</div>
            <h3 className="font-bold text-lg text-slate-900">Real-Time BFF Architecture</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Decoupled Next.js edge rendering paired with persistent Express WebSockets ensures sub-second recalculation across all connected stakeholders.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-xl">02</div>
            <h3 className="font-bold text-lg text-slate-900">Supervised Canvas Control</h3>
            <p className="text-slate-500 text-sm leading-relaxed">By default, financial models remain locked in read-only cocoon mode. Executives must explicitly toggle supervision locks to modify baseline valuations.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black text-xl">03</div>
            <h3 className="font-bold text-lg text-slate-900">Direct & Room Messaging</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Integrated audit chat rooms allow instant PDF and Excel sheet transmission directly alongside live yield projections without leaving the dashboard.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}