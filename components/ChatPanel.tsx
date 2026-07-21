'use client';

import React, { useState, useEffect, useRef } from 'react';
import { socket } from '@/lib/socket';

interface Colleague {
  name: string;
  email: string;
  role: string;
}

interface ChatMessage {
  _id?: string;
  roomId: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string | null;
  content: string;
  readBy?: string[]; // 🆕 Track persistent read receipts
  createdAt?: string;
  attachment?: {
    fileName: string | null;
    fileType: string | null;
    fileData: string | null;
  };
}

interface ChatPanelProps {
  roomId: string;
  currentUserEmail: string;
  currentUserName: string;
}

export default function ChatPanel({ roomId, currentUserEmail, currentUserName }: ChatPanelProps): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [activeTab, setActiveTab] = useState<'room' | 'dm'>('room');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; data: string } | null>(null);
  
  // Persistent Notification Counter States
  const [unreadRoom, setUnreadRoom] = useState<number>(0);
  const [unreadDMs, setUnreadDMs] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleHistory = (history: ChatMessage[]) => {
      setMessages(history);
      
      // 1. Calculate historical unread room broadcasts from database
      const roomUnreadCount = history.filter(
        m => m.recipientEmail === null && 
             m.senderEmail !== currentUserEmail && 
             !m.readBy?.includes(currentUserEmail)
      ).length;

      // 2. Calculate historical unread DMs from database grouped by sender
      const dmUnreadMap: Record<string, number> = {};
      history.forEach(m => {
        if (m.recipientEmail === currentUserEmail && !m.readBy?.includes(currentUserEmail)) {
          dmUnreadMap[m.senderEmail] = (dmUnreadMap[m.senderEmail] || 0) + 1;
        }
      });

      // If user is currently sitting on the Room tab, immediately mark room messages as read in DB
      if (activeTab === 'room' && roomUnreadCount > 0) {
        socket.emit('MARK_MESSAGES_READ', { roomId, userEmail: currentUserEmail, type: 'room' });
        setUnreadRoom(0);
      } else {
        setUnreadRoom(roomUnreadCount);
      }

      // If user is sitting on a specific DM peer tab, immediately mark their DMs as read in DB
      if (activeTab === 'dm' && selectedRecipient && dmUnreadMap[selectedRecipient] > 0) {
        socket.emit('MARK_MESSAGES_READ', { roomId, userEmail: currentUserEmail, type: 'dm', senderEmail: selectedRecipient });
        dmUnreadMap[selectedRecipient] = 0;
      }
      setUnreadDMs(dmUnreadMap);
    };

    const handleNewMsg = (newMsg: ChatMessage) => {
      setMessages(prev => [...prev, newMsg]);

      // Handle incoming Room broadcast notification
      if (newMsg.recipientEmail === null && newMsg.senderEmail !== currentUserEmail) {
        if (activeTab !== 'room') {
          setUnreadRoom(prev => prev + 1);
        } else {
          // Actively viewing room tab: mark read immediately in DB!
          socket.emit('MARK_MESSAGES_READ', { roomId, userEmail: currentUserEmail, type: 'room' });
        }
      } 
      // Handle incoming DM notification
      else if (newMsg.recipientEmail === currentUserEmail && newMsg.senderEmail !== currentUserEmail) {
        if (activeTab !== 'dm' || selectedRecipient !== newMsg.senderEmail) {
          setUnreadDMs(prev => ({
            ...prev,
            [newMsg.senderEmail]: (prev[newMsg.senderEmail] || 0) + 1
          }));
        } else {
          // Actively viewing this sender's DM tab: mark read immediately in DB!
          socket.emit('MARK_MESSAGES_READ', { roomId, userEmail: currentUserEmail, type: 'dm', senderEmail: newMsg.senderEmail });
        }
      }
    };

    const handleRemovedMsg = ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(m => m._id !== messageId));
    };

    const handleColleagues = (list: Colleague[]) => {
      setColleagues(list.filter(c => c.email !== currentUserEmail));
      if (!selectedRecipient && list.length > 0) {
        const firstPeer = list.find(c => c.email !== currentUserEmail);
        if (firstPeer) setSelectedRecipient(firstPeer.email);
      }
    };

    socket.on('CHAT_HISTORY', handleHistory);
    socket.on('NEW_MESSAGE', handleNewMsg);
    socket.on('MESSAGE_REMOVED', handleRemovedMsg);
    socket.on('COLLEAGUES_LIST', handleColleagues);

    return () => {
      socket.off('CHAT_HISTORY', handleHistory);
      socket.off('NEW_MESSAGE', handleNewMsg);
      socket.off('MESSAGE_REMOVED', handleRemovedMsg);
      socket.off('COLLEAGUES_LIST', handleColleagues);
    };
  }, [currentUserEmail, activeTab, selectedRecipient, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab, selectedRecipient]);

  const handleTabSwitch = (tab: 'room' | 'dm') => {
    setActiveTab(tab);
    if (tab === 'room' && unreadRoom > 0) {
      setUnreadRoom(0);
      socket.emit('MARK_MESSAGES_READ', { roomId, userEmail: currentUserEmail, type: 'room' });
    }
    if (tab === 'dm' && selectedRecipient && unreadDMs[selectedRecipient] > 0) {
      setUnreadDMs(prev => ({ ...prev, [selectedRecipient]: 0 }));
      socket.emit('MARK_MESSAGES_READ', { roomId, userEmail: currentUserEmail, type: 'dm', senderEmail: selectedRecipient });
    }
  };

  const handlePeerSelect = (email: string) => {
    setSelectedRecipient(email);
    if (unreadDMs[email] > 0) {
      setUnreadDMs(prev => ({ ...prev, [email]: 0 }));
      socket.emit('MARK_MESSAGES_READ', { roomId, userEmail: currentUserEmail, type: 'dm', senderEmail: email });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile({ name: file.name, type: file.type, data: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const payload: ChatMessage = {
      roomId,
      senderName: currentUserName,
      senderEmail: currentUserEmail,
      recipientEmail: activeTab === 'dm' ? selectedRecipient : null,
      content: inputText,
      attachment: attachedFile ? { fileName: attachedFile.name, fileType: attachedFile.type, fileData: attachedFile.data } : undefined
    };

    socket.emit('SEND_MESSAGE', payload);
    setInputText('');
    setAttachedFile(null);
  };

  const handleUnsendMessage = (messageId?: string) => {
    if (!messageId) return;
    socket.emit('UNSEND_MESSAGE', {
      messageId,
      roomId,
      senderEmail: currentUserEmail,
      recipientEmail: activeTab === 'dm' ? selectedRecipient : null
    });
  };

  const displayedMessages = messages.filter(msg => {
    if (activeTab === 'room') return msg.recipientEmail === null;
    return (msg.senderEmail === currentUserEmail && msg.recipientEmail === selectedRecipient) ||
           (msg.senderEmail === selectedRecipient && msg.recipientEmail === currentUserEmail);
  });

  const totalUnreadDMs = Object.values(unreadDMs).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-145 shadow-2xl overflow-hidden font-sans">
      {/* CHAT HEADER TABS WITH PERSISTENT BADGES ON TOP OF BUTTONS */}
      <div className="bg-slate-950 p-3 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex gap-3">
          <button 
            onClick={() => handleTabSwitch('room')}
            className={`relative px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'room' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-900'}`}
          >
            <span>💬 Room Broadcasts</span>
            {/* 🆕 BADGE LITERALLY SITTING ON TOP OF THE TAB BUTTON */}
            {unreadRoom > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg border-2 border-slate-950 animate-bounce z-10">
                {unreadRoom}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => handleTabSwitch('dm')}
            className={`relative px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${activeTab === 'dm' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-900'}`}
          >
            <span>🔒 Direct Messages</span>
            {/* 🆕 BADGE LITERALLY SITTING ON TOP OF THE TAB BUTTON */}
            {totalUnreadDMs > 0 && (
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-extrabold w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-lg border-2 border-slate-950 animate-bounce z-10">
                {totalUnreadDMs}
              </span>
            )}
          </button>
        </div>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">Suite: [{roomId}]</span>
      </div>

      {/* DM COLLEAGUE SELECTOR WITH INDIVIDUAL PEER BADGES */}
      {activeTab === 'dm' && (
        <div className="bg-slate-900/90 p-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[10px] font-bold uppercase text-slate-400 px-2 shrink-0">Select Peer:</span>
          {colleagues.length === 0 ? (
            <span className="text-xs text-slate-500 italic px-2">No other colleagues currently online.</span>
          ) : (
            colleagues.map((peer) => {
              const peerUnread = unreadDMs[peer.email] || 0;
              return (
                <button
                  key={peer.email}
                  onClick={() => handlePeerSelect(peer.email)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${selectedRecipient === peer.email ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-800/50'}`}
                >
                  <span>👤 {peer.name}</span>
                  {peerUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white font-black w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm border border-slate-900 animate-pulse">
                      {peerUnread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* MESSAGES VIEWPORT */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {displayedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs italic">
            No messages logged yet. Use the input below to transmit due diligence notes or attach sheets.
          </div>
        ) : (
          displayedMessages.map((msg, index) => {
            const isMe = msg.senderEmail === currentUserEmail;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-0.5 px-1">
                  <span className="text-[11px] font-bold text-slate-400">{isMe ? 'You' : msg.senderName}</span>
                  <span className="text-[9px] font-mono text-slate-500">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                  
                  {isMe && msg._id && (
                    <button 
                      onClick={() => handleUnsendMessage(msg._id)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold ml-1 hover:underline transition"
                      title="Retract / Unsend Message"
                    >
                      ✕ Unsend
                    </button>
                  )}
                </div>
                
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-xs' : 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700'}`}>
                  {msg.content && <p>{msg.content}</p>}
                  
                  {msg.attachment && msg.attachment.fileData && (
                    <div className="mt-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">📄</span>
                        <span className="font-mono text-xs font-bold text-slate-200 truncate">{msg.attachment.fileName}</span>
                      </div>
                      <a
                        href={msg.attachment.fileData}
                        download={msg.attachment.fileName || "GridPulse_Document"}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition shrink-0 shadow-xs"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {attachedFile && (
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 shrink-0">
          <span className="truncate">📎 Attached: <strong>{attachedFile.name}</strong></span>
          <button onClick={() => setAttachedFile(null)} className="text-red-400 hover:text-red-300 font-bold ml-2">✕ Remove</button>
        </div>
      )}

      {/* INPUT FORM */}
      <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
        <label className="cursor-pointer bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 p-2.5 rounded-xl transition shrink-0" title="Attach Excel Sheet or PDF">
          <span>📎</span>
          <input type="file" accept=".xlsx,.xls,.csv,.pdf" onChange={handleFileUpload} className="hidden" />
        </label>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={activeTab === 'room' ? `Broadcast note or attach sheet to ${roomId}...` : `Direct message ${selectedRecipient || 'colleague'}...`}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
        />

        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-md shrink-0">
          Send →
        </button>
      </form>
    </div>
  );
}