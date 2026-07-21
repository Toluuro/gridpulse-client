import React from 'react';
import Link from 'next/link';

export default function Footer(): React.JSX.Element {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 text-slate-500 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center font-bold text-white text-xs">G</div>
          <span className="font-bold text-slate-800">GridPulse Executive Infrastructure</span>
        </div>
        <div className="flex gap-6 font-semibold">
          <Link href="/" className="hover:underline">Briefing Suite</Link>
          <Link href="/about" className="hover:underline">About GridPulse</Link>
          <span className="text-slate-300">|</span>
          <span>Security Compliance: AES-256 TCP</span>
        </div>
        <p className="font-mono text-[11px]">© 2026 GridPulse Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}