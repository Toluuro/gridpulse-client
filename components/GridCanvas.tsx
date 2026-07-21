'use client';

import React, { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

interface CellData {
  cellId: string;
  label: string;
  value: number;
  isEditable: boolean;
  category: 'input' | 'metric' | 'projection';
}

interface GridCanvasProps {
  roomId: string;
  userName: string;
}

export default function GridCanvas({ roomId, userName }: GridCanvasProps): React.JSX.Element {
  const [gridData, setGridData] = useState<CellData[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(true); // 🆕 Supervised lock defaults to TRUE
  const [lastUpdatedCell, setLastUpdatedCell] = useState<string | null>(null);
  const [lastModifiedBy, setLastModifiedBy] = useState<string>('System Dashboard');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001'}/api/model/${roomId}`);
        const data = await res.json();
        if (data.gridData) {
          setGridData(data.gridData);
          setIsLocked(data.isLocked !== undefined ? data.isLocked : true);
          setLastModifiedBy(data.lastModifiedBy || 'System Dashboard');
        }
      } catch (err) {
        console.error('Failed to load initial model:', err);
      }
    };

    fetchModel();

    const handleRecalculation = (payload: { gridData: CellData[]; isLocked: boolean; lastModifiedBy: string; updatedCellId: string }) => {
      setGridData(payload.gridData);
      setIsLocked(payload.isLocked);
      setLastModifiedBy(payload.lastModifiedBy);
      setLastUpdatedCell(payload.updatedCellId);
      setTimeout(() => setLastUpdatedCell(null), 2000);
    };

    socket.on('MODEL_RECALCULATED', handleRecalculation);
    return () => { socket.off('MODEL_RECALCULATED', handleRecalculation); };
  }, [roomId]);

  const handleCellChange = (cellId: string, newValue: string) => {
    if (isLocked) return; // Prevent edits if canvas is locked!
    const numericVal = parseFloat(newValue) || 0;
    setGridData(prev => prev.map(c => c.cellId === cellId ? { ...c, value: numericVal } : c));
    socket.emit('UPDATE_CELL_VALUE', { roomId, cellId, newValue: numericVal, modifiedBy: userName });
  };

  const toggleSupervisionLock = () => {
    const newLockState = !isLocked;
    setIsLocked(newLockState);
    socket.emit('TOGGLE_EDIT_LOCK', { roomId, isLocked: newLockState, modifiedBy: userName });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* HEADER & SUPERVISION LOCK TOGGLE */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Interactive Due Diligence Deal Room
            </span>
            <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${isLocked ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
              <span>{isLocked ? '🔒 Read-Only Cocoon' : '🔓 Supervised Editing Active'}</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-3">Syndicate Financial Valuation Canvas</h2>
        </div>

        {/* 🆕 Responsive wrap container that stops mobile overflow! */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
          <div className="text-left sm:text-right font-mono text-xs text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span>Last edit by: </span>
            <strong className="text-emerald-400 block sm:inline">{lastModifiedBy}</strong>
          </div>

          <button
            onClick={toggleSupervisionLock}
            className={`w-full sm:w-auto px-4 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2 text-center whitespace-normal ${isLocked ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'}`}
          >
            <span>{isLocked ? '🔓 Unlock Canvas for Editing' : '🔒 Lock Canvas (Read-Only)'}</span>
          </button>
        </div>
      </div>

      {/* THE FINANCIAL DATA GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gridData.map((cell) => {
          const isHighlighted = lastUpdatedCell === cell.cellId || lastUpdatedCell === 'SUPERVISION_TOGGLE';
          const isInput = cell.category === 'input';

          return (
            <div 
              key={cell.cellId}
              className={`p-5 rounded-2xl border transition-all duration-300 ${isHighlighted ? 'bg-blue-950/50 border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]' : isInput ? 'bg-slate-950 border-slate-800' : 'bg-slate-800/50 border-slate-800/80'}`}
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-bold text-slate-300">{cell.label}</span>
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400">{cell.cellId}</span>
              </div>

              {isInput ? (
                <div className="relative mt-2">
                  <input
                    type="number"
                    step="any"
                    disabled={isLocked}
                    value={cell.value}
                    onChange={(e) => handleCellChange(cell.cellId, e.target.value)}
                    className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 font-mono font-black text-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isLocked ? 'border-slate-800 opacity-60 cursor-not-allowed' : 'border-slate-700 hover:border-slate-600'}`}
                  />
                  <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] uppercase font-extrabold pointer-events-none ${isLocked ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {isLocked ? 'Locked' : 'Editable'}
                  </span>
                </div>
              ) : (
                <div className="mt-2 px-3.5 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800/60 flex items-center justify-between">
                  <span className="font-mono font-black text-xl text-emerald-400">
                    {cell.cellId.startsWith('B3') ? `${cell.value}%` : `$${cell.value.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                    {cell.category === 'metric' ? 'Live ROI Metric' : 'Auto-Calculated'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}