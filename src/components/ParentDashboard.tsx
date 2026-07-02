"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Heart, Dna, MessageSquare, Settings, LogOut, ChevronRight,
  ChevronLeft, ShieldCheck, Clock, User, CheckCircle2,
  AlertCircle, Send, Users, Stethoscope, Sparkles, Activity
} from 'lucide-react';
import { Language } from '../types';
import { io, Socket } from 'socket.io-client';
import { getNutritionPlans, getChatHistory } from '../api';

interface ParentDashboardProps {
  language: Language;
  parentUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    childName?: string;
    asdLevel?: string;
    doctorId?: string;
    therapistId?: string;
  };
  onLogout: () => void;
}

interface ChatRegistry {
  doctor: any[];
  therapist: any[];
}

export default function ParentDashboard({ language, parentUser, onLogout }: ParentDashboardProps) {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'nutrition' | 'chat' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);

  // Fallback IDs for safety if context provisioning is missing parameters
  const assignedChildId = parentUser.id || "mock-child-id";
  const doctorUserId = parentUser.doctorId || "doc-karim";
  const therapistUserId = parentUser.therapistId || "therapist-01";

  // ─── CHAT SUB-SYSTEM STATE CONFIGURATIONS ───────────────────────────────────
  const [activeChannel, setActiveChannel] = useState<'doctor' | 'therapist'>('doctor');
  const [messages, setMessages] = useState<ChatRegistry>({ doctor: [], therapist: [] });
  const [inputText, setInputText] = useState('');
  const socketRef = useRef<Socket | null>(null);

  const activePartnerId = activeChannel === 'doctor' ? doctorUserId : therapistUserId;

  // Fetch Child Genetic Nutrition Data Lifecycle Matrix
  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        const res = await getNutritionPlans(assignedChildId);
        if (res.success && res.data && res.data.length > 0) {
          setNutritionPlan(res.data[0]);
        }
      } catch (err) {
        console.error("Error retrieving historical care records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNutritionData();
  }, [assignedChildId]);

  // CHAT TIMELINE REST RECOVERY FLOW
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (!assignedChildId || !activePartnerId) return;
      try {
        const res = await getChatHistory(assignedChildId, activePartnerId);
        if (res.success && res.data) {
          setMessages(prev => {
            const next = { ...prev };
            next[activeChannel] = res.data || [];
            return next;
          });
        }
      } catch (err) {
        console.error("Failed to restore message history canvas:", err);
      }
    };
    loadConversationHistory();
  }, [activeChannel, assignedChildId, activePartnerId]);

  // WEBSOCKET CHANNEL PIPELINE LISTENER
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.emit('register_user', parentUser.id);

    socket.on('receive_direct_message', (incomingMsg: any) => {
      if (incomingMsg.patientId === assignedChildId) {
        const channelKey = incomingMsg.senderRole === 'doctor' ? 'doctor' : 'therapist';
        setMessages(prev => {
          const next = { ...prev };
          next[channelKey] = [...next[channelKey], incomingMsg];
          return next;
        });
      }
    });

    return () => {
      socket.off('receive_direct_message');
      socket.disconnect();
    };
  }, [parentUser.id, assignedChildId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    const payload = {
      patientId: assignedChildId,
      senderId: parentUser.id,
      senderRole: 'parent',
      receiverId: activePartnerId,
      text: inputText.trim()
    };

    socketRef.current.emit('send_direct_message', payload);

    const localOptimisticMessage = {
      _id: Date.now().toString(),
      patientId: assignedChildId,
      sender: parentUser.id,
      senderRole: 'parent',
      receiver: activePartnerId,
      text: inputText.trim(),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => {
      const next = { ...prev };
      next[activeChannel] = [...next[activeChannel], localOptimisticMessage];
      return next;
    });

    setInputText('');
  };

  return (
    <div className={`flex min-h-screen bg-slate-50 font-sans ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>

      {/* SIDEBAR VIEWPORTS PANEL */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50 ${isRtl ? 'right-0' : 'left-0'}`}>
        <div className="space-y-8">
          <div className={`flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-black text-base">P</div>
                <span className="text-sm font-black text-white tracking-tight">AutiCare <span className="text-indigo-400">{isRtl ? 'العائلة' : 'Family'}</span></span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 mx-auto cursor-pointer transition-colors">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex flex-col space-y-1.5">
            <button onClick={() => setActiveTab('overview')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <User className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'ملف الطفل الأساسي' : 'Child Blueprint'}</span>}
            </button>
            <button onClick={() => setActiveTab('nutrition')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center ${activeTab === 'nutrition' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Dna className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'المخطط الجيني الغذائي' : 'Genomic Nutrition'}</span>}
            </button>
            <button onClick={() => setActiveTab('chat')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'التواصل الآمن المشفر' : 'Secure Coordination'}</span>}
            </button>
          </nav>
        </div>

        <button onClick={onLogout} className={`w-full py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
          <LogOut className="w-3.5 h-3.5" />
          {!sidebarCollapsed && <span>{isRtl ? 'تسجيل الخروج' : 'LOGOUT'}</span>}
        </button>
      </aside>

      {/* DASHBOARD CONTAINER SYSTEM */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? (isRtl ? 'pr-16' : 'pl-16') : (isRtl ? 'pr-64' : 'pl-64')}`}>
        <div className="p-6 md:p-8 space-y-6 select-none">

          <div className={`border-b pb-4 flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div>
              <h2 className="text-xl font-black text-slate-800">{isRtl ? `مرحباً، عائلة ${parentUser.childName || 'البطل'}` : `Welcome, Caregiver of ${parentUser.childName || 'Sami'}`}</h2>
              <p className="text-xs text-slate-400 font-semibold">{isRtl ? 'بوابة الرعاية السلوكية والغذائية التجديدية المخصصة' : 'Precision Care Tracking & Dynamic Telemetry Hub'}</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center gap-1.5 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[10px] tracking-wider uppercase font-mono">{isRtl ? 'معتمد ومحمي بالكامل' : 'HIPAA Protected'}</span>
            </div>
          </div>

          {/* TAB CONTENT: VISUAL OVERVIEW CANVAS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs md:col-span-2 space-y-4">
                <h3 className={`text-sm font-black text-slate-800 flex items-center gap-2 border-b pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>{isRtl ? 'الملف التشخيصي السريري للطفل' : 'Diagnostic Blueprint Core'}</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isRtl ? 'الاسم الكامل' : 'Child Target Profile Name'}</span>
                    <span className="text-sm font-black text-slate-800 block mt-1">{parentUser.childName || 'Sami'}</span>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isRtl ? 'مقياس التصنيف التشخيصي المعتمد' : 'ASD Severity Stratification Scale'}</span>
                    <span className="inline-block mt-1 bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                      {parentUser.asdLevel || 'Level 1 (Mild Sensory)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className={`text-sm font-black text-slate-800 flex items-center gap-2 border-b pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{isRtl ? 'فريق الرعاية الطبية المتكامل' : 'Active Care Coordination Group'}</span>
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-xl">👨‍⚕️</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Dr. Karim Al-Saeed</p>
                      <p className="text-[9px] text-blue-500 font-bold">{isRtl ? 'استشاري طب الأعصاب والمخطط الجيني' : 'Supervising Physician Lead'}</p>
                    </div>
                  </div>
                  <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-xl">👩‍🏫</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Amina El-Gamil</p>
                      <p className="text-[9px] text-purple-500 font-bold">{isRtl ? 'أخصائي تعديل السلوك والتحليل التطبيقي' : 'Primary ABA Behavioral Expert'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: GENETIC NUTRITION PLAN TRACKER */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6 animate-fade-in">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">Synchronizing cellular maps...</div>
              ) : nutritionPlan ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Left Main View Block: Supplements and RAG Text Output */}
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                    <div className={`bg-slate-950 text-slate-200 p-4 rounded-2xl space-y-2 border border-slate-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {isRtl ? 'إستراتيجية التغذية المصممة بالذكاء الاصطناعي' : 'AI Compiled Cellular Matrix Profile'}
                      </span>
                      <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{nutritionPlan.aiRecommendation?.nutritionPlan}</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">{isRtl ? '💊 مصفوفة المكملات الغذائية والجرعات المقررة' : '💊 Prescribed Supplement Titration Grid'}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nutritionPlan.aiRecommendation?.supplements?.map((s: any, i: number) => (
                          <div key={i} className={`p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-xs text-slate-800">{s.name}</span>
                              <span className="bg-indigo-50 text-indigo-700 font-black text-[9px] px-2 py-0.5 rounded uppercase">{s.dosage}</span>
                            </div>
                            {s.notes && <p className="text-[10px] text-slate-400 font-medium italic mt-1">{isRtl ? 'السبب المخبري:' : 'Target Objective:'} {s.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Panel View Block: Inclusions, Exclusions, and Direct Specialist Notes */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl space-y-2">
                      <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">🔴 {isRtl ? 'الممنوعات والأطعمة المسببة للالتهاب' : 'Inflammatory Exclusions'}</span>
                      <ul className={`list-disc list-inside text-xs text-slate-600 font-medium space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                        {nutritionPlan.aiRecommendation?.foodRestrictions?.map((item: any, idx: number) => (
                          <li key={idx}>{typeof item === 'string' ? item : String(item.name || Object.values(item)[0])}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" /> {isRtl ? 'توجيهات الطبيب السريرية' : 'Physician Sign-off Notes'}
                      </span>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed italic">{nutritionPlan.doctorNotes || 'No special clinical modifications added.'}</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                  {isRtl ? 'لم يتم إصدار أي خطة غذائية جينية لهذا الملف الطبي حتى الآن.' : 'No precise genomic diet metrics mapped or signed off for this profile container yet.'}
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT: CHAT TIMELINE PORTAL */}
          {activeTab === 'chat' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-xs overflow-hidden animate-fade-in text-left">
              <div className={`bg-gradient-to-r from-indigo-600 to-blue-600 p-4 text-white flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    💬 {isRtl ? 'بوابة التنسيق والتواصل المشفر والآمن' : 'Secure Clinical Communication Gateway'}
                  </h3>
                  <p className="text-[10px] text-blue-100 font-medium">HIPAA Certified • Encrypted Medical Data Channel Pipeline</p>
                </div>
                <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold animate-pulse">
                  {isRtl ? 'متصل الآن' : 'Live Uplink'}
                </span>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-4 h-96 ${isRtl ? 'md:grid-flow-col' : ''}`}>

                {/* Sidebar Active Care Member Nodes */}
                <div className={`border-r border-slate-100 dark:border-slate-700 bg-slate-50/50 p-2 flex md:flex-col gap-1.5 ${isRtl ? 'border-r-0 border-l' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setActiveChannel('doctor')}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : ''} ${activeChannel === 'doctor' ? 'bg-white dark:bg-slate-700 shadow-xs border border-slate-100 dark:border-slate-600 font-black text-indigo-600' : 'opacity-60 hover:opacity-100'
                      }`}
                  >
                    <span className="text-base">👨‍⚕️</span>
                    <div className="text-[11px]">
                      <p className="text-slate-800 dark:text-slate-200">Dr. Karim Al-Saeed</p>
                      <p className="text-[9px] text-blue-500 font-bold">{isRtl ? 'الطبيب المعالج المشرف' : 'Primary Physician Lead'}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannel('therapist')}
                    className={`w-full p-2.5 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${isRtl ? 'flex-row-reverse text-right' : ''} ${activeChannel === 'therapist' ? 'bg-white dark:bg-slate-700 shadow-xs border border-slate-100 dark:border-slate-600 font-black text-purple-600' : 'opacity-60 hover:opacity-100'
                      }`}
                  >
                    <span className="text-base">👩‍🏫</span>
                    <div className="text-[11px]">
                      <p className="text-slate-800 dark:text-slate-200">Amina El-Gamil</p>
                      <p className="text-[9px] text-purple-500 font-bold">{isRtl ? 'أخصائي تعديل السلوك' : 'ABA Case Specialist'}</p>
                    </div>
                  </button>
                </div>

                {/* Direct Messaging Canvas Engine Layout */}
                <div className="col-span-3 flex flex-col justify-between p-4 bg-slate-50/10">
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
                    {messages[activeChannel]?.map((msg: any) => {
                      const isParent = msg.senderRole === 'parent' || msg.sender === parentUser.id;
                      return (
                        <div key={msg._id || msg.id} className={`flex flex-col ${isParent ? 'items-end' : 'items-start'} animate-fade-in`}>
                          <div className={`max-w-[80%] p-2.5 rounded-2xl text-xs leading-relaxed ${isParent
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-600'
                            }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-slate-400 mt-0.5 px-1">
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Messaging Textarea Input Box Form */}
                  <form onSubmit={handleSendMessage} className={`mt-3 flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={isRtl ? 'اكتب رسالتك السريرية المشفرة هنا...' : 'Type confidential text thread message...'}
                      className={`input flex-1 bg-white dark:bg-slate-900 text-xs h-9 py-1 ${isRtl ? 'text-right direction-rtl' : ''}`}
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl flex items-center justify-center cursor-pointer transition-colors">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}