"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
  Dna, MessageSquare, Settings, LogOut, ChevronRight,
  ChevronLeft, ShieldCheck, User, CheckCircle2,
  AlertCircle, Users, Stethoscope, Sparkles, Activity,
  Bell, Mic, Upload, Trash2, Sliders
} from 'lucide-react';
import { Language } from '../types';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ChatBox from './ChatBox';
import { useNotificationStore } from '../store/useNotificationStore';
import {
  getNutritionPlans,
  getBehaviorLogs,
  createBehaviorLog,
  getAIPrediction,
  updateProfileAvatar,
  updatePatientAvatar,
  uploadPatientBirthCertificate
} from '../api';

interface ParentDashboardProps {
  language: Language;
  parentUser: {
    _id?: string;
    id?: string;
    name: string;
    email: string;
    avatar?: string;
    child?: {
      _id?: string;
      id?: string;
      name: string;
      username: string;
      age?: string | number;
      calculatedAge?: string | number;
      level?: string;
      gender?: string;
      avatar?: string;
      birthCertificateUrl?: string;
      assignedDoctor?: { _id: string; name: string } | string | null;
      assignedTherapists?: (string | { _id: string; name: string })[];
    };
  };
  onLogout: () => void;
}



export default function ParentDashboard({ language, parentUser, onLogout }: ParentDashboardProps) {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'nutrition' | 'chat' | 'settings'>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const parentId = parentUser._id || parentUser.id || '';
  const child = parentUser.child;
  const childId = child?._id || child?.id || '';
  const childName = child?.name || '';
  const childLevel = child?.level || '';
  const childUsername = child?.username || '';
  const childAvatarUrl = child?.avatar || '';
  const childBirthCertUrl = child?.birthCertificateUrl || '';

  const doctorObj = child?.assignedDoctor;
  const doctorUserId = doctorObj && typeof doctorObj === 'object' ? (doctorObj as any)._id || '' : '';
  const doctorNameStr = doctorObj && typeof doctorObj === 'object' ? (doctorObj as any).name || '' : '';

  const therapists = child?.assignedTherapists || [];
  const firstTherapist = therapists[0];
  const therapistUserId = firstTherapist && typeof firstTherapist === 'object' ? (firstTherapist as any)._id || '' : (typeof firstTherapist === 'string' ? firstTherapist : '');
  const therapistNameStr = firstTherapist && typeof firstTherapist === 'object' ? (firstTherapist as any).name || '' : '';

  const [parentAvatar, setParentAvatar] = useState(parentUser.avatar || '');
  const [childAvatar, setChildAvatar] = useState(childAvatarUrl || '');
  const [birthCertificateUrl, setBirthCertificateUrl] = useState(childBirthCertUrl || '');

  const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);
  const [predictionData, setPredictionData] = useState<any | null>(null);
  const [predictionError, setPredictionError] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  // ─── NOTIFICATIONS ───────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAllAsRead
  } = useNotificationStore();

  // ─── DAILY BEHAVIOR LOGGING FORM STATES ───────────────────
  const [logMood, setLogMood] = useState<'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad' | 'anxious' | 'angry'>('happy');
  const [logSleep, setLogSleep] = useState('8');
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);
  const [logMedications, setLogMedications] = useState<{ name: string; time: string; taken: boolean }[]>([
    { name: 'Methyl Folate', time: 'morning', taken: false },
    { name: 'Methylcobalamin', time: 'evening', taken: false },
    { name: 'Vitamin D3+K2', time: 'morning', taken: false },
  ]);

  // ─── CHART DATA ────────────────────────────────────────────
  const moodScore = (mood: string) => {
    switch (mood) {
      case 'very_happy': return 90;
      case 'happy': return 75;
      case 'neutral': return 60;
      case 'anxious': return 40;
      case 'sad': return 35;
      case 'very_sad': return 20;
      case 'angry': return 15;
      default: return 50;
    }
  };

  const chartData = logs.filter((l: any) => l.date && l.sleep).map((l: any) => ({
    name: new Date(l.date).toLocaleDateString(isRtl ? 'ar' : 'en', { weekday: 'short' }),
    Mood: moodScore(l.mood),
    Sleep: parseFloat(l.sleep) * 10 || 50,
  }));

  // ─── VOICE NLP ────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef<any>(null);
  const shouldBeListeningRef = useRef(false);

  const loadBehaviorLogs = async () => {
    try {
      const res = await getBehaviorLogs(childId);
      if (res.success && res.data && res.data.length > 0) {
        const mapped = res.data.map((l: any) => ({
          date: l.date ? l.date.split('T')[0] : '',
          mood: l.mood || 'neutral',
          sleep: `${l.sleepHours || 0} hrs`,
          meds: l.medication && l.medication[0] ? l.medication[0].taken : true,
          notes: l.notes || ''
        }));
        setLogs(mapped);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    }
  };

  const fetchPredictionData = async () => {
    try {
      setLoadingPrediction(true);
      setPredictionError('');
      const predRes = await getAIPrediction(childId, language);
      if (predRes?.success && predRes?.data) {
        setPredictionData(predRes.data);
      }
    } catch (err) {
      setPredictionError(isRtl ? 'التحليل قيد التشغيل' : 'Analysis ongoing.');
    } finally {
      setLoadingPrediction(false);
    }
  };

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setLoading(true);
        const res = await getNutritionPlans(childId);
        if (res.success && res.data && res.data.length > 0) {
          setNutritionPlan(res.data[0]);
        }
      } catch (err) {
        console.error("Error fetching nutrition plan:", err);
      } finally {
        setLoading(false);
      }
    };
    if (childId) {
      fetchNutritionData();
      loadBehaviorLogs();
      fetchPredictionData();
      fetchNotifications();
    }
  }, [childId, language]);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language === 'ar' ? 'ar-EG' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setLogNotes(prev => prev ? `${prev} ${transcript}` : transcript);
        processVoiceInputNLP(transcript);
      };
      recognition.onerror = (event: any) => setVoiceError(event.error);
      recognition.onend = () => {
        if (shouldBeListeningRef.current) {
          try { recognition.start(); } catch { setIsListening(false); }
        } else {
          setIsListening(false);
        }
      };
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [language]);

  const processVoiceInputNLP = (text: string) => {
    const lower = text.toLowerCase();
    if (/meltdown|tantrum|crisis|انهيار|نوبة/i.test(lower)) {
      setLogMood('angry');
    } else if (/happy|focused|calm|سعيد|مرتاح|هادئ/i.test(lower)) {
      setLogMood('happy');
    } else if (/sad|upset|حزين|يبكي/i.test(lower)) {
      setLogMood('sad');
    }
    const hourMatch = text.match(/\d+/);
    if (hourMatch) {
      const hours = Math.min(Math.max(parseInt(hourMatch[0], 10), 1), 24);
      setLogSleep(hours.toString());
    }
  };

  const toggleVoiceLogging = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) return;
    if (isListening) {
      shouldBeListeningRef.current = false;
      recognitionRef.current.stop();
    } else {
      shouldBeListeningRef.current = true;
      setVoiceError('');
      try { recognitionRef.current.start(); } catch { }
    }
  };

  const handleAddLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId) return;
    try {
      const payload = {
        childId,
        mood: logMood,
        sleepHours: parseFloat(logSleep),
        medication: logMedications.map(m => ({ name: m.name, taken: m.taken, time: m.time })),
        notes: logNotes || '',
        date: new Date().toISOString()
      };
      const res = await createBehaviorLog(payload);
      if (res.success) {
        setLogSuccess(true);
        setLogNotes('');
        await loadBehaviorLogs();
        await fetchPredictionData();
        setTimeout(() => setLogSuccess(false), 3500);
      }
    } catch (err) {
      console.error("Failed to save log:", err);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'parent' | 'child') => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      if (target === 'parent') {
        const res = await updateProfileAvatar(file);
        if (res.success) setParentAvatar(res.data.avatar);
      } else {
        const res = await updatePatientAvatar(childId, file);
        if (res.success) setChildAvatar(res.data.avatar);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    }
  };

  const handleBirthCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      const res = await uploadPatientBirthCertificate(childId, file);
      if (res.success) {
        setBirthCertificateUrl(res.data.birthCertificateUrl);
      }
    } catch (err) {
      console.error("Birth certificate upload failed:", err);
    }
  };

  return (
    <div className={`flex min-h-screen bg-slate-50 font-sans ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>

      {/* SIDEBAR */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50 ${isRtl ? 'right-0' : 'left-0'}`}>
        <div className="space-y-8">
          <div className={`flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5">
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
              {!sidebarCollapsed && <span>{isRtl ? 'ملف الطفل' : 'Child Profile'}</span>}
            </button>
            <button onClick={() => setActiveTab('logs')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center ${activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Activity className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'التدوين اليومي' : 'Daily Tracking'}</span>}
            </button>
            <button onClick={() => setActiveTab('nutrition')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center ${activeTab === 'nutrition' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Dna className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'الخطة الغذائية' : 'Nutrition Plan'}</span>}
            </button>
            <button onClick={() => setActiveTab('chat')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'التواصل الآمن' : 'Secure Chat'}</span>}
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'الإعدادات' : 'Settings'}</span>}
            </button>
          </nav>
        </div>

        <button onClick={onLogout} className={`w-full py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all ${isRtl ? 'flex-row-reverse' : ''}`}>
          <LogOut className="w-3.5 h-3.5" />
          {!sidebarCollapsed && <span>{isRtl ? 'تسجيل الخروج' : 'LOGOUT'}</span>}
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? (isRtl ? 'pr-16' : 'pl-16') : (isRtl ? 'pr-64' : 'pl-64')}`}>
        <div className="p-6 md:p-8 space-y-6 select-none">

          {/* HEADER */}
          <div className={`border-b pb-4 flex justify-between items-center ${isRtl ? 'flex-row-reverse' : ''}`}>
            <div>
              <h2 className="text-xl font-black text-slate-800">
                {isRtl
                  ? `مرحباً، ${childName || parentUser.name}`
                  : `Welcome, ${childName || parentUser.name}`
                }
              </h2>
              <p className="text-xs text-slate-400 font-semibold">{isRtl ? 'بوابة الرعاية الغذائية' : 'Nutrition & Care Portal'}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-all cursor-pointer relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-black text-rose-500">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className={`absolute mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 z-50 space-y-3 ${isRtl ? 'left-0' : 'right-0'}`}>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-xs font-black text-slate-800">{isRtl ? 'الإشعارات' : 'Notifications'}</span>
                      <button onClick={() => markAllAsRead()} className="text-[10px] text-indigo-600 font-bold hover:underline">
                        {isRtl ? 'تحديد الكل كمقروء' : 'Mark all read'}
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-none">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">{isRtl ? 'لا توجد إشعارات' : 'No notifications'}</p>
                      ) : (
                        notifications.map((n: any) => (
                          <div key={n.id} className={`p-2.5 rounded-xl text-xs border transition-colors ${n.read ? 'bg-slate-50/50 border-slate-100' : 'bg-indigo-50/30 border-indigo-100'}`}>
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                              {n.title}
                            </div>
                            <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isRtl ? 'محمي' : 'Protected'}</span>
              </div>
            </div>
          </div>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs md:col-span-2 space-y-4">
                <h3 className={`text-sm font-black text-slate-800 flex items-center gap-2 border-b pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>{isRtl ? 'بيانات الطفل' : 'Child Data'}</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isRtl ? 'الاسم' : 'Name'}</span>
                    <span className="text-sm font-black text-slate-800 block mt-1">{childName || '-'}</span>
                  </div>
                  <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isRtl ? 'المستوى' : 'Level'}</span>
                    <span className="text-sm font-black text-slate-800 block mt-1">
                      {childLevel || '-'}
                    </span>
                  </div>
                  {childUsername && (
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isRtl ? 'اسم المستخدم' : 'Username'}</span>
                      <span className="text-sm font-mono font-black text-slate-800 block mt-1">{childUsername}</span>
                    </div>
                  )}
                  {child?.age && (
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{isRtl ? 'العمر' : 'Age'}</span>
                      <span className="text-sm font-black text-slate-800 block mt-1">{child.calculatedAge || child.age} {isRtl ? 'سنة' : 'years'}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className={`text-sm font-black text-slate-800 flex items-center gap-2 border-b pb-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{isRtl ? 'فريق الرعاية' : 'Care Team'}</span>
                </h3>
                <div className="space-y-3">
                  <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-xl">👨‍⚕️</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{doctorNameStr || (isRtl ? 'غير معين' : 'Not assigned')}</p>
                      <p className="text-[9px] text-blue-500 font-bold">{isRtl ? 'الطبيب المشرف' : 'Supervising Physician'}</p>
                    </div>
                  </div>
                  <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : ''}`}>
                    <span className="text-xl">👩‍🏫</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{therapistNameStr || (isRtl ? 'غير معين' : 'Not assigned')}</p>
                      <p className="text-[9px] text-purple-500 font-bold">{isRtl ? 'أخصائي السلوك' : 'ABA Specialist'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DAILY LOGS */}
          {activeTab === 'logs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    {isRtl ? 'تسجيل يومي' : 'Daily Log'}
                  </h4>
                  <button onClick={toggleVoiceLogging} className={`flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${isListening ? 'text-rose-500 animate-pulse' : 'text-indigo-600 hover:text-indigo-800'}`}>
                    <Mic className="w-3 h-3" />
                    <span>{isListening ? (isRtl ? 'جاري السماع...' : 'Listening...') : (isRtl ? 'إدخال صوتي' : 'Voice Log')}</span>
                  </button>
                </div>

                {voiceError && <div className="text-[9px] text-rose-500 font-bold">⚠️ {voiceError}</div>}
                {logSuccess && <div className="text-xs font-bold text-emerald-600 animate-fade-in">{isRtl ? 'تم الحفظ!' : 'Saved!'}</div>}

                <form onSubmit={handleAddLogSubmit} className="space-y-4">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">{isRtl ? 'المزاج العام' : 'Overall Mood'}</label>
                    <select value={logMood} onChange={(e: any) => setLogMood(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
                      <option value="very_happy">😄 {isRtl ? 'سعيد جداً' : 'Very Happy'}</option>
                      <option value="happy">😊 {isRtl ? 'سعيد' : 'Happy'}</option>
                      <option value="neutral">😐 {isRtl ? 'حيادي' : 'Neutral'}</option>
                      <option value="sad">😢 {isRtl ? 'حزين' : 'Sad'}</option>
                      <option value="very_sad">😭 {isRtl ? 'حزين جداً' : 'Very Sad'}</option>
                      <option value="anxious">😰 {isRtl ? 'قلق' : 'Anxious'}</option>
                      <option value="angry">😡 {isRtl ? 'غاضب / نوبة' : 'Angry / Meltdown'}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                      <span>{isRtl ? 'النوم' : 'Sleep'}</span>
                      <span className="text-indigo-600 font-mono">{logSleep}h</span>
                    </div>
                    <input type="range" min="2" max="14" step="0.5" value={logSleep} onChange={(e) => setLogSleep(e.target.value)} className="w-full accent-indigo-600 cursor-pointer" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">{isRtl ? 'الأدوية' : 'Medications'}</label>
                    {logMedications.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">{isRtl ? 'لا توجد أدوية مسجلة' : 'No medications recorded'}</p>
                    ) : (
                      logMedications.map((m, idx) => (
                        <button key={idx} type="button" onClick={() => setLogMedications(prev => prev.map((med, i) => i === idx ? { ...med, taken: !med.taken } : med))} className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${m.taken ? 'bg-emerald-50/60 border-emerald-100 text-emerald-700' : 'bg-rose-50/60 border-rose-100 text-rose-700'}`}>
                          <span className="truncate">{m.name}</span>
                          <span className="text-[10px] tracking-wider uppercase font-mono font-black">{m.taken ? '✓' : '×'}</span>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">{isRtl ? 'الملاحظات' : 'Notes'}</label>
                    <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium resize-none h-16 outline-none" placeholder={isRtl ? 'اكتب ملاحظاتك...' : 'Enter observations...'} />
                  </div>

                  <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors cursor-pointer">
                    {isRtl ? 'حفظ' : 'Save Log'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="text-xs font-black uppercase text-slate-800">{isRtl ? 'السجلات السابقة' : 'Previous Logs'}</h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left direction-ltr">
                    <thead>
                      <tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        <th className="pb-2">{isRtl ? 'التاريخ' : 'Date'}</th>
                        <th className="pb-2">{isRtl ? 'المزاج' : 'Mood'}</th>
                        <th className="pb-2">{isRtl ? 'النوم' : 'Sleep'}</th>
                        <th className="pb-2">{isRtl ? 'الأدوية' : 'Meds'}</th>
                        <th className="pb-2">{isRtl ? 'الملاحظات' : 'Notes'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 italic font-bold">
                            {isRtl ? 'لا توجد سجلات بعد.' : 'No logs yet.'}
                          </td>
                        </tr>
                      ) : (
                        logs.map((log: any, i: number) => (
                          <tr key={i}>
                            <td className="py-3 font-mono font-bold text-slate-800">{log.date || ''}</td>
                            <td>
                              <span className="text-xs font-bold text-slate-600">
                                {log.mood.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="font-bold">{log.sleep}</td>
                            <td className="font-black">{log.meds ? <span className="text-emerald-500">✓</span> : <span className="text-rose-500">×</span>}</td>
                            <td className="max-w-xs truncate text-slate-400" title={log.notes}>{log.notes}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {chartData.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-xs font-black uppercase text-slate-800 mb-3">{isRtl ? 'الرسم البياني' : 'Behavior Chart'}</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <ReLineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="Mood" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Sleep" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      </ReLineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="border-t pt-4 space-y-3">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">{isRtl ? 'التحليل السلوكي' : 'Behavioral Analysis'}</span>
                  {loadingPrediction ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse h-12" />
                  ) : predictionError ? (
                    <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <span className="text-xs font-bold text-amber-700">{predictionError}</span>
                    </div>
                  ) : predictionData ? (
                    <div className={`p-4 rounded-2xl border ${predictionData.riskScore > 50 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{isRtl ? 'مؤشر الخطر' : 'Risk Index'}</p>
                      <p className={`text-2xl font-black font-mono ${predictionData.riskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{predictionData.riskScore}%</p>
                      <p className="text-xs font-semibold text-slate-600 mt-1">{predictionData.message}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 text-slate-400 text-xs rounded-xl border border-dashed border-slate-200">
                      {isRtl ? 'سجل سلوكيات الطفل لبدء التحليل' : 'Log behaviors to see trends'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NUTRITION */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6 animate-fade-in">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">{isRtl ? 'جار التحميل...' : 'Loading...'}</div>
              ) : nutritionPlan ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                    <div className={`bg-slate-950 text-slate-200 p-4 rounded-2xl space-y-2 border border-slate-800 ${isRtl ? 'text-right' : 'text-left'}`}>
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> {isRtl ? 'الخطة الغذائية' : 'Nutrition Plan'}
                      </span>
                      <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{nutritionPlan.aiRecommendation?.nutritionPlan}</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">{isRtl ? 'المكملات الغذائية' : 'Supplements'}</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nutritionPlan.aiRecommendation?.supplements?.map((s: any, i: number) => (
                          <div key={i} className={`p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col justify-between ${isRtl ? 'text-right' : 'text-left'}`}>
                            <div className="flex justify-between items-center w-full">
                              <span className="font-bold text-xs text-slate-800">{s.name}</span>
                              <span className="text-xs font-bold text-indigo-700">{s.dosage || s.dose}</span>
                            </div>
                            {s.notes && <p className="text-[10px] text-slate-400 font-medium italic mt-1">{s.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                    {(() => {
                      const restrictions = nutritionPlan.aiRecommendation?.foodRestrictions || [];
                      const mid = Math.ceil(restrictions.length / 2);
                      const restricted = restrictions.slice(0, mid);
                      const toInclude = restrictions.slice(mid);
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl space-y-2">
                            <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">{isRtl ? 'الأطعمة الممنوعة' : 'Restricted Foods'}</span>
                            {restricted.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">{isRtl ? 'لا توجد' : 'None listed'}</p>
                            ) : (
                              <ul className={`list-disc list-inside text-xs text-slate-600 font-medium space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                {restricted.map((item: any, idx: number) => (
                                  <li key={idx}>{typeof item === 'string' ? item : String(item.name || Object.values(item)[0])}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl space-y-2">
                            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">{isRtl ? 'الأطعمة المسموحة' : 'Foods to Include'}</span>
                            {toInclude.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">{isRtl ? 'لا توجد' : 'None listed'}</p>
                            ) : (
                              <ul className={`list-disc list-inside text-xs text-slate-600 font-medium space-y-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                                {toInclude.map((item: any, idx: number) => (
                                  <li key={idx}>{typeof item === 'string' ? item : String(item.name || Object.values(item)[0])}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5" /> {isRtl ? 'ملاحظات الطبيب' : 'Doctor Notes'}
                      </span>
                      <p className="text-xs text-slate-700 font-semibold leading-relaxed italic">{nutritionPlan.doctorNotes || '-'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400 font-medium">
                  {isRtl ? 'لا توجد خطة غذائية بعد.' : 'No nutrition plan available.'}
                </div>
              )}
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="animate-fade-in">
              {childId && (doctorUserId || therapistUserId) ? (
                <ChatBox
                  childId={childId}
                  childName={childName}
                  currentUser={{ _id: parentId, name: parentUser.name, role: 'parent' }}
                  participants={[
                    ...(doctorUserId ? [{ _id: doctorUserId, name: doctorNameStr || (isRtl ? 'الطبيب' : 'Doctor'), role: 'doctor' as const, childName }] : []),
                    ...(therapistUserId ? [{ _id: therapistUserId, name: therapistNameStr || (isRtl ? 'المعالج' : 'Therapist'), role: 'therapist' as const, childName }] : []),
                  ]}
                  language={language}
                />
              ) : (
                <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-sm">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">
                    {isRtl ? 'لا يوجد متخصصون للتواصل معهم بعد' : 'No specialists assigned yet'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-black text-slate-800">{isRtl ? 'الملف الشخصي' : 'Profile Settings'}</h3>
                <p className="text-xs text-slate-400 font-semibold">{isRtl ? 'إدارة الملف الشخصي والمستندات' : 'Manage profile and documents'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                <div className="border border-slate-100 p-4 rounded-2xl space-y-3 bg-slate-50/50">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">{isRtl ? 'صورتك الشخصية' : 'Your Avatar'}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden relative flex items-center justify-center text-xl text-slate-600">
                      {parentAvatar ? <img src={parentAvatar} alt="Parent" className="w-full h-full object-cover" /> : <User className="w-6 h-6" />}
                    </div>
                    <label className="py-1.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 inline mr-1" /> {isRtl ? 'تحديث' : 'Upload'}
                      <input type="file" accept="image/*" onChange={(e) => handleAvatarUpload(e, 'parent')} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="border border-slate-100 p-4 rounded-2xl space-y-3 bg-slate-50/50">
                  <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">{isRtl ? 'صورة الطفل' : 'Child Avatar'}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden relative flex items-center justify-center text-xl">
                      {childAvatar ? <img src={childAvatar} alt="Child" className="w-full h-full object-cover" /> : '👦'}
                    </div>
                    <label className="py-1.5 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                      <Upload className="w-3.5 h-3.5 inline mr-1" /> {isRtl ? 'تحديث' : 'Upload'}
                      <input type="file" accept="image/*" onChange={(e) => handleAvatarUpload(e, 'child')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block">{isRtl ? 'شهادة الميلاد' : 'Birth Certificate'}</span>
                {birthCertificateUrl ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p>{isRtl ? 'تم الرفع' : 'Uploaded'}</p>
                        <a href={birthCertificateUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-600 underline font-semibold hover:text-emerald-800 block mt-0.5">
                          {isRtl ? 'عرض' : 'View'}
                        </a>
                      </div>
                    </div>
                    <button onClick={() => setBirthCertificateUrl('')} className="p-1.5 bg-white border border-rose-100 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{isRtl ? 'رفع شهادة الميلاد' : 'Upload birth certificate'}</span>
                    <span className="text-[9px] font-medium text-slate-400">PDF / Image</span>
                    <input type="file" accept="image/*,application/pdf" onChange={handleBirthCertificateUpload} className="hidden" />
                  </label>
                )}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
