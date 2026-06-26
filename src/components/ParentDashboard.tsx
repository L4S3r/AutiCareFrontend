"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smile, Brain, Target, Star, Trophy, Users, LogOut, Heart,
  Sparkles, Activity, Plus, LineChart, FileText, Settings,
  ShieldCheck, ChevronRight, CheckCircle2, AlertCircle, ChevronLeft
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { getGameProgress, submitGameScore, getAIPrediction, getPatients, getBehaviorLogs, createBehaviorLog } from '../api';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import AppHeader from './AppHeader';

interface ParentDashboardProps {
  language: Language;
  parentUser: {
    name: string;
    email: string;
    child?: {
      name: string;
      username: string;
      age: string | number;
      level: string;
      gender: string;
    };
  };
  onLogout: () => void;
}

export default function ParentDashboard({ language, parentUser, onLogout }: ParentDashboardProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'progress' | 'clinicians' | 'logs'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Logs Form States
  const [logMood, setLogMood] = useState<'excellent' | 'good' | 'neutral' | 'unsettled' | 'distressed'>('good');
  const [logSleep, setLogSleep] = useState('8');
  const [logMeds, setLogMeds] = useState(true);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // --- AI Prediction States ---
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [loadingPrediction, setLoadingPrediction] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [predictionError, setPredictionError] = useState<string>('');

  // Local state child details
  const child = parentUser.child || {
    name: 'Sami Al-Farsi',
    username: 'sami_al_farsi',
    age: '6',
    level: 'Level 2',
    gender: 'Male'
  };

  // Static mock logs for display
  const [logs, setLogs] = useState<any[]>([
    { date: '2026-06-22', mood: 'excellent', sleep: '9.0 hrs', meds: true, notes: 'Very focus in matching game, took metafolin without proxy.' },
    { date: '2026-06-21', mood: 'good', sleep: '8.5 hrs', meds: true, notes: 'Calm evening, positive social interactions.' },
    { date: '2026-06-20', mood: 'neutral', sleep: '7.5 hrs', meds: true, notes: 'Slight restlessness before sleep, settled in 10m.' }
  ]);

  const loadLogs = async (childId: string) => {
    try {
      const logsRes = await getBehaviorLogs(childId);
      if (logsRes.success && logsRes.data && logsRes.data.length > 0) {
        const mapped = logsRes.data.map((l: any) => ({
          date: l.date ? l.date.split('T')[0] : '',
          mood: l.mood === 'very_happy' ? 'excellent' :
            l.mood === 'happy' ? 'good' :
              l.mood === 'neutral' ? 'neutral' :
                l.mood === 'anxious' || l.mood === 'sad' || l.mood === 'very_sad' ? 'unsettled' : 'distressed',
          sleep: `${l.sleepHours || 0} hrs`,
          meds: l.medication && l.medication[0] ? l.medication[0].taken : true,
          notes: l.notes || ''
        }));
        setLogs(mapped);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    const loadPrediction = async () => {
      try {
        setLoadingPrediction(true);
        setPredictionError('');

        const patientsRes = await getPatients();
        const childId =
          patientsRes?.data?.[0]?._id ||
          patientsRes?.data?.[0]?.id ||
          patientsRes?.[0]?._id ||
          patientsRes?.[0]?.id ||
          '';

        if (!childId) {
          setPredictionError('No child profile found. Add a child to see AI insights.');
          return;
        }

        setActiveChildId(childId);
        await loadLogs(childId);

        const predRes = await getAIPrediction(childId, language);
        if (predRes?.data) {
          setPredictionData(predRes.data);
        }
      } catch (err: any) {
        setPredictionError('AI prediction unavailable right now. Try again later.');
        console.error('AI prediction error:', err);
      } finally {
        setLoadingPrediction(false);
      }
    };

    loadPrediction();
  }, [language]);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    try {
      let dbMood = 'neutral';
      if (logMood === 'excellent') dbMood = 'very_happy';
      else if (logMood === 'good') dbMood = 'happy';
      else if (logMood === 'unsettled') dbMood = 'anxious';
      else if (logMood === 'distressed') dbMood = 'angry';

      const logData = {
        childId: activeChildId,
        date: new Date(),
        mood: dbMood,
        sleepHours: Number(logSleep),
        sleepQuality: Number(logSleep) >= 8 ? 'excellent' : Number(logSleep) >= 6 ? 'good' : 'poor',
        meltdownSeverity: 'none',
        meltdowns: 0,
        medication: [{ name: 'Metafolin', taken: logMeds }],
        notes: logNotes || 'Parent logged daily behavioral stats.',
      };

      const res = await createBehaviorLog(logData);
      if (res.success) {
        setLogSuccess(true);
        setLogNotes('');
        await loadLogs(activeChildId);

        setLoadingPrediction(true);
        const predRes = await getAIPrediction(activeChildId, language);
        if (predRes?.data) {
          setPredictionData(predRes.data);
        }
        setLoadingPrediction(false);

        setTimeout(() => setLogSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save behavior log:', err);
    }
  };

  const chartData = [
    { name: isRtl ? 'الأحد' : 'Sun', Score: 60, Accuracy: 70 },
    { name: isRtl ? 'الإثنين' : 'Mon', Score: 75, Accuracy: 80 },
    { name: isRtl ? 'الثلاثاء' : 'Tue', Score: 85, Accuracy: 85 },
    { name: isRtl ? 'الأربعاء' : 'Wed', Score: 80, Accuracy: 90 },
    { name: isRtl ? 'الخميس' : 'Thu', Score: 92, Accuracy: 95 }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* 1. RESPONSIVE SIDEBAR NAVIGATION */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 border-slate-800 z-50 fixed h-full`}>
        <div className="space-y-8">
          {/* Logo brand and Toggle Control */}
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base shadow shadow-sky-500/35">A</div>
                <span className="text-sm font-black text-white tracking-tight">
                  AutiCare <span className="text-sky-400">{isRtl ? 'بوابة الآباء' : 'Parent'}</span>
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 mx-auto transition-colors cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center ${activeTab === 'dashboard' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl && !sidebarCollapsed ? 'space-x-reverse text-right' : ''}`}
              title={isRtl ? 'لوحة التحكم' : 'Dashboard'}
            >
              <Activity className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>}
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center ${activeTab === 'progress' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl && !sidebarCollapsed ? 'space-x-reverse text-right' : ''}`}
              title={isRtl ? 'متابعة تقدم الطفل' : 'Child Progress'}
            >
              <LineChart className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'متابعة تقدم الطفل' : 'Child Progress'}</span>}
            </button>

            <button
              onClick={() => setActiveTab('clinicians')}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center ${activeTab === 'clinicians' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl && !sidebarCollapsed ? 'space-x-reverse text-right' : ''}`}
              title={isRtl ? 'الأطباء والمعالجين' : 'Care Team'}
            >
              <Users className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'الأطباء والمعالجين' : 'Care Team'}</span>}
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left transition-all flex items-center ${activeTab === 'logs' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'hover:bg-slate-800 text-slate-400 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} ${isRtl && !sidebarCollapsed ? 'space-x-reverse text-right' : ''}`}
              title={isRtl ? 'السجلات اليومية' : 'Daily Logs'}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{isRtl ? 'السجلات اليومية' : 'Daily Logs'}</span>}
            </button>
          </nav>
        </div>

        {/* Footer profile metadata */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 text-left pl-1">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-extrabold text-xs">
                {parentUser.name.charAt(0)}
              </div>
              <div className="truncate max-w-[140px]">
                <p className="text-xs font-extrabold text-white truncate">{parentUser.name}</p>
                <p className="text-[9px] text-slate-500 font-semibold truncate">{parentUser.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className={`w-full py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-black rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center ${sidebarCollapsed ? 'px-0' : 'space-x-2'}`}
            title={isRtl ? 'تسجيل الخروج' : 'Logout'}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>{isRtl ? 'تسجيل الخروج' : 'LOGOUT'}</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <AppHeader
          title={language === 'ar' ? "بوابة أولياء الأمور" : "Parent Portal"}
          userName={parentUser.name}
          role="parent"
          language={language}
        />

        <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 select-none text-left">
          {/* WELCOME BANNER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                {isRtl ? 'مرحباً،' : 'Welcome,'} {parentUser.name.split(' ')[0]}
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                {isRtl ? 'راقب وادعم مسار تطور طفلك وعلاجه التكاملي.' : "Track and support your child's progress and care coordination."}
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm h-fit">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-1" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                {isRtl ? 'متصل بركن الألعاب' : 'Play Corner Synced'}
              </span>
            </div>
          </div>

          {/* DYNAMIC VIEW WORKSPACE */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Child Profile Card */}
              <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-sky-400/20">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-5 gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl font-black text-sky-600 shadow">👦</div>
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase">
                      <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                      <span>{child.level}</span>
                    </div>
                    <h3 className="text-xl font-black">{child.name}</h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold text-sky-100">
                      <span>{isRtl ? 'العمر:' : 'Age:'} {child.age} {isRtl ? 'سنوات' : 'Years'}</span>
                      <span>•</span>
                      <span>{isRtl ? 'الجنس:' : 'Gender:'} {isRtl && child.gender === 'Male' ? 'ذكر' : child.gender}</span>
                      <span>•</span>
                      <span>{isRtl ? 'حساب الطفل:' : 'Child Account:'} <span className="font-mono bg-white/15 px-2 py-0.5 rounded font-black text-white">{child.username}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Containers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Progress Indicators */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-sky-500 animate-bounce" />
                    <span>{isRtl ? 'نتائج ألعاب التنمية الإدراكية' : 'Cognitive Games Progress'}</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center space-x-1.5"><Brain className="w-4 h-4 text-sky-500" /><span>{isRtl ? 'تطابق الذاكرة' : 'Memory Match'}</span></span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-sky-500 h-2 rounded-full" style={{ width: '85%' }} /></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="flex items-center space-x-1.5"><Smile className="w-4 h-4 text-emerald-500" /><span>{isRtl ? 'لوحة المشاعر' : 'Emotions Board'}</span></span>
                        <span>90%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '90%' }} /></div>
                    </div>
                  </div>
                </div>

                {/* Log Sheet Form */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-sky-500" />
                    <span>{isRtl ? 'إضافة سجل تدوين سريع' : 'Quick Daily Log'}</span>
                  </h4>
                  {logSuccess && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isRtl ? 'تم إضافة التدوين بنجاح!' : 'Log entry saved successfully!'}</span>
                    </div>
                  )}
                  <form onSubmit={handleAddLog} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">{isRtl ? 'المزاج العام' : 'Overall Mood'}</label>
                        <select value={logMood} onChange={(e: any) => setLogMood(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none">
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="neutral">Neutral</option>
                          <option value="unsettled">Unsettled</option>
                          <option value="distressed">Distressed</option>
                        </select>
                      </div>
                      <div className="space-y-0.5">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">{isRtl ? 'ساعات النوم' : 'Sleep Hours'}</label>
                        <input type="number" value={logSleep} onChange={(e) => setLogSleep(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none" required />
                      </div>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">{isRtl ? 'ملاحظات وتطورات مهمة' : 'Observations'}</label>
                      <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} placeholder="Stimming triggers, dietary notes..." className="w-full p-2 h-14 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none resize-none" required />
                    </div>
                    <button type="submit" className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1">
                      <Plus className="w-4 h-4" /><span>{isRtl ? 'حفظ السجل' : 'Save Log'}</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* VIEW B: PROGRESS & AI INSIGHTS */}
          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2">{isRtl ? 'مخطط التطور المعرفي ونشاط الانتباه' : 'Child Cognitive Growth Chart'}</h4>
                <div className="h-64 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" tickLine={false} />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                      <Line type="monotone" dataKey="Score" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Accuracy" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI REPORT COMPONENT BLOCK */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
                  <span>Live AI Behavioral Analysis</span>
                </h4>
                <AnimatePresence mode="wait">
                  {loadingPrediction ? (
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold font-mono text-slate-500">Analyzing trends...</span>
                    </div>
                  ) : predictionError ? (
                    <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-bold text-amber-700">{predictionError}</span>
                    </div>
                  ) : predictionData ? (
                    <div className={`relative rounded-2xl border p-5 ${predictionData.riskScore > 50 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">AI 7-Day Crisis Risk Window</p>
                          <p className={`text-3xl font-black font-mono ${predictionData.riskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{predictionData.riskScore}%</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-600 leading-relaxed">{predictionData.message}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 text-slate-400 text-xs rounded-xl border border-slate-100">Complete behavior log submissions to train personalized AI prediction arrays.</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* VIEW C: CARE TEAM CLINICIANS */}
          {activeTab === 'clinicians' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl">🩺</div>
                  <div>
                    <span className="inline-flex bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">Active Doctor</span>
                    <h4 className="text-sm font-black text-slate-800">Dr. Sarah Connor</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Child Psychologist</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-2xl">🧠</div>
                  <div>
                    <span className="inline-flex bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">Active Therapist</span>
                    <h4 className="text-sm font-black text-slate-800">Therapist Tom Smith</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Behavioral Therapist</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW D: ARCHIVE LOG ENTRIES */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
              <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2 mb-4">Daily Observational Log Archives</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Mood</th>
                      <th className="pb-3">Sleep</th>
                      <th className="pb-3">Supplements</th>
                      <th className="pb-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {logs.map((log, index) => (
                      <tr key={index} className="text-slate-600">
                        <td className="py-4 font-mono font-bold text-slate-800">{log.date}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${log.mood === 'excellent' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>{log.mood}</span>
                        </td>
                        <td className="py-4 font-bold">{log.sleep}</td>
                        <td className="py-4 font-black text-emerald-500">{log.meds ? '✓' : '×'}</td>
                        <td className="py-4 max-w-xs truncate text-slate-400">{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}