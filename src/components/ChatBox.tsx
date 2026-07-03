"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User, Stethoscope, Heart } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Language } from '../types';
import { getChatHistory, sendHttpMessage } from '../api';

export interface ChatParticipant {
  _id: string;
  name: string;
  role: 'doctor' | 'therapist' | 'parent';
  childName?: string;
}

interface ChatBoxProps {
  childId: string;
  childName: string;
  currentUser: { _id: string; name: string; role: string };
  participants: ChatParticipant[];
  language: Language;
}

const roleIcon = (role: string) => {
  switch (role) {
    case 'doctor': return <Stethoscope className="w-3.5 h-3.5" />;
    case 'therapist': return <Heart className="w-3.5 h-3.5" />;
    default: return <User className="w-3.5 h-3.5" />;
  }
};

const roleColor = (role: string) => {
  switch (role) {
    case 'doctor': return 'text-sky-600 bg-sky-50 border-sky-200';
    case 'therapist': return 'text-purple-600 bg-purple-50 border-purple-200';
    default: return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  }
};

export default function ChatBox({ childId, childName, currentUser, participants, language }: ChatBoxProps) {
  const isRtl = language === 'ar';
  const [activeParticipant, setActiveParticipant] = useState<ChatParticipant | null>(
    participants.length > 0 ? participants[0] : null
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!childId || !activeParticipant) return;
      try {
        const res = await getChatHistory(childId, activeParticipant._id);
        if (res.success && res.data) setMessages(res.data);
        else setMessages([]);
      } catch {
        setMessages([]);
      }
    };
    loadHistory();

    const pollInterval = setInterval(async () => {
      if (!childId || !activeParticipant) return;
      try {
        const res = await getChatHistory(childId, activeParticipant._id);
        if (!res.success || !(res.data as any[])?.length) return;
        const fresh = res.data as any[];
        setMessages(prev => {
          const prevIds = new Set(prev.map((m: any) => m._id || m.id));
          const hasNew = fresh.some((m: any) => !prevIds.has(m._id || m.id));
          return hasNew ? fresh : prev;
        });
      } catch {
        // poll silently
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [childId, activeParticipant]);

  useEffect(() => {
    if (!currentUser._id) return;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('register_user', currentUser._id);

    socket.on('receive_direct_message', (incomingMsg: any) => {
      if (incomingMsg.patientId === childId && activeParticipant &&
        (incomingMsg.sender === activeParticipant._id || incomingMsg.receiver === activeParticipant._id)) {
        setMessages(prev => [...prev, incomingMsg]);
      }
    });

    return () => {
      socket.off('receive_direct_message');
      socket.disconnect();
    };
  }, [currentUser._id, childId, activeParticipant]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeParticipant) return;

    const text = inputText.trim();
    const optimistic: any = {
      _id: Date.now().toString(),
      patientId: childId,
      sender: currentUser._id,
      senderRole: currentUser.role.toLowerCase(),
      receiver: activeParticipant._id,
      text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimistic]);
    setInputText('');

    // Try socket first for real-time delivery, fall back to HTTP REST
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_direct_message', {
        patientId: childId,
        senderId: currentUser._id,
        senderRole: currentUser.role.toLowerCase(),
        receiverId: activeParticipant._id,
        text,
      });
    } else {
      await sendHttpMessage({
        patientId: childId,
        receiverId: activeParticipant._id,
        text,
        senderRole: currentUser.role.toLowerCase() as 'parent' | 'doctor' | 'therapist',
      });
    }
  };

  const participantLabel = (p: ChatParticipant) => {
    const roleLabel = isRtl
      ? (p.role === 'doctor' ? 'طبيب' : p.role === 'therapist' ? 'أخصائي' : 'والد')
      : (p.role === 'doctor' ? 'Doctor' : p.role === 'therapist' ? 'Therapist' : 'Parent');
    const childContext = p.childName
      ? (isRtl ? `(طفل: ${p.childName})` : `(child of: ${p.childName})`)
      : '';
    return `${p.name} ${childContext}`.trim();
  };

  if (!activeParticipant) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-xs text-slate-400 font-medium">
          {isRtl ? 'لا يوجد مشاركون للتواصل معهم' : 'No participants to chat with'}
        </p>
      </div>
    );
  }

  const activeRoleColor = roleColor(activeParticipant.role);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
      <div className={`bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <div>
            <h3 className="font-bold text-sm">{isRtl ? 'التواصل الآمن' : 'Secure Chat'}</h3>
            <p className="text-[10px] text-blue-100 font-medium">
              {childName} — {activeParticipant.name}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-100">
          {isRtl ? 'مباشر' : 'Live'}
        </span>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-4 h-96 ${isRtl ? 'md:grid-flow-col' : ''}`}>
        <div className={`border-r border-slate-100 bg-slate-50/50 p-2 flex md:flex-col gap-1.5 ${isRtl ? 'border-r-0 border-l' : ''}`}>
          {participants.map(p => (
            <button
              key={p._id}
              type="button"
              onClick={() => setActiveParticipant(p)}
              className={`w-full p-2.5 rounded-xl flex items-center gap-2.5 text-left transition-all cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : ''} ${activeParticipant._id === p._id ? 'bg-white shadow-xs border border-slate-100 font-black' : 'opacity-60 hover:opacity-100'}`}
            >
              <div className={`p-1.5 rounded-lg ${roleColor(p.role)}`}>
                {roleIcon(p.role)}
              </div>
              <div className="text-[11px] min-w-0">
                <p className="text-slate-800 font-bold truncate">{p.name}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate">
                  {p.role === 'doctor' ? (isRtl ? 'طبيب' : 'Doctor') : p.role === 'therapist' ? (isRtl ? 'أخصائي' : 'Therapist') : (isRtl ? 'والد' : 'Parent')}
                  {p.childName ? ` · ${p.childName}` : ''}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="col-span-3 flex flex-col justify-between bg-slate-50/10">
          <div className="flex-1 overflow-y-auto space-y-2.5 p-4 pr-1 scrollbar-none">
            <div className={`text-center mb-3 text-[10px] font-medium ${activeRoleColor}`}>
              {isRtl ? 'أنت تتحدث مع' : 'You are chatting with'} {participantLabel(activeParticipant)}
            </div>

            {messages.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-8">
                {isRtl ? 'لا توجد رسائل بعد. أرسل أول رسالة!' : 'No messages yet. Send the first message!'}
              </div>
            ) : (
              messages.map((msg: any) => {
                const isMine = msg.sender === currentUser._id || msg.senderRole === currentUser.role.toLowerCase();
                return (
                  <div key={msg._id || msg.id || Math.random()} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} animate-fade-in`}>
                    <span className="text-[9px] text-slate-400 font-medium px-1 mb-0.5">
                      {isMine ? (isRtl ? 'أنت' : 'You') : msg.senderRole === 'doctor' ? (isRtl ? 'الطبيب' : 'Doctor') : msg.senderRole === 'therapist' ? (isRtl ? 'الأخصائي' : 'Therapist') : (isRtl ? 'الوالد' : 'Parent')}
                    </span>
                    <div className={`max-w-[80%] p-2.5 rounded-2xl text-xs leading-relaxed ${isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5 px-1">
                      {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className={`m-4 mt-0 flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRtl ? 'اكتب رسالتك...' : 'Type a message...'}
              className={`flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 ${isRtl ? 'text-right' : ''}`}
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
