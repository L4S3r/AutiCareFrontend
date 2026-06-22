"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Smile, Brain, Target, Star, Trophy, Users, LogOut, Heart, 
  Sparkles, Activity, Plus, LineChart, FileText, Settings, 
  ShieldCheck, ChevronRight, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { getGameProgress, submitGameScore } from '../api';
import { ResponsiveContainer, LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

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

  // Logs Form States
  const [logMood, setLogMood] = useState<'excellent' | 'good' | 'neutral' | 'unsettled' | 'distressed'>('good');
  const [logSleep, setLogSleep] = useState('8');
  const [logMeds, setLogMeds] = useState(true);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

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

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      date: new Date().toISOString().split('T')[0],
      mood: logMood,
      sleep: `${logSleep} hrs`,
      meds: logMeds,
      notes: logNotes
    };
    setLogs([newLog, ...logs]);
    setLogSuccess(true);
    setLogNotes('');
    setTimeout(() => setLogSuccess(false), 3000);
  };

  // Recharts mock stats
  const chartData = [
    { name: isRtl ? 'الأحد' : 'Sun', Score: 60, Accuracy: 70 },
    { name: isRtl ? 'الإثنين' : 'Mon', Score: 75, Accuracy: 80 },
    { name: isRtl ? 'الثلاثاء' : 'Tue', Score: 85, Accuracy: 85 },
    { name: isRtl ? 'الأربعاء' : 'Wed', Score: 80, Accuracy: 90 },
    { name: isRtl ? 'الخميس' : 'Thu', Score: 92, Accuracy: 95 }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 ${isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'}`}>
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base shadow shadow-sky-500/35">
              A
            </div>
            <span className="text-sm font-black text-white tracking-tight">
              AutiCare <span className="text-sky-400">{isRtl ? 'بوابة الآباء' : 'Parent Portal'}</span>
            </span>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col space-y-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              } ${isRtl ? 'space-x-reverse text-right' : ''}`}
            >
              <Activity className="w-4 h-4" />
              <span>{isRtl ? 'لوحة التحكم' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'progress'
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              } ${isRtl ? 'space-x-reverse text-right' : ''}`}
            >
              <LineChart className="w-4 h-4" />
              <span>{isRtl ? 'متابعة تقدم الطفل' : 'Child Progress'}</span>
            </button>

            <button
              onClick={() => setActiveTab('clinicians')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'clinicians'
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              } ${isRtl ? 'space-x-reverse text-right' : ''}`}
            >
              <Users className="w-4 h-4" />
              <span>{isRtl ? 'الأطباء والمعالجين' : 'Care Team'}</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              } ${isRtl ? 'space-x-reverse text-right' : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span>{isRtl ? 'السجلات اليومية' : 'Daily Logs'}</span>
            </button>
          </nav>
        </div>

        {/* Footer profile metadata & logout */}
        <div className="border-t border-slate-800 pt-5 space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-extrabold text-xs">
              {parentUser.name.charAt(0)}
            </div>
            <div className="truncate max-w-[140px]">
              <p className="text-xs font-extrabold text-white truncate">{parentUser.name}</p>
              <p className="text-[9px] text-slate-500 font-semibold truncate">{parentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تسجيل الخروج' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* 2. DYNAMIC WORKSPACE STAGE */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8 select-none text-left">
        
        {/* HEADER BRAND */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {isRtl ? 'مرحباً،' : 'Welcome,'} {parentUser.name.split(' ')[0]}
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {isRtl ? 'راقب وادعم مسار تطور طفلك وعلاجه التكاملي.' : "Track and support your child's progress and care coordination."}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-1" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              {isRtl ? 'متصل بركن الألعاب' : 'Play Corner Synced'}
            </span>
          </div>
        </div>

        {/* WORKSPACE VIEWS */}

        {/* VIEW A: DASHBOARD HOME OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Child Profile Header Card */}
            <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg border border-sky-400/20">
              <div className="absolute top-0 right-0 w-32 h-full opacity-10 pointer-events-none">
                <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 100 100">
                  <circle cx="80" cy="50" r="30" />
                </svg>
              </div>

              <div className="flex flex-col sm:flex-row items-center sm:space-x-5 relative z-10 text-center sm:text-left gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-white/20 flex items-center justify-center text-3xl font-black text-sky-600 shadow">
                  👦
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 bg-white/20 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase border border-white/10">
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                    <span>{child.level}</span>
                  </div>
                  <h3 className="text-xl font-black">{child.name}</h3>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-semibold text-sky-100">
                    <span>{isRtl ? 'العمر:' : 'Age:'} {child.age} {isRtl ? 'سنوات' : 'Years'}</span>
                    <span>•</span>
                    <span>{isRtl ? 'الجنس:' : 'Gender:'} {isRtl && child.gender === 'Male' ? 'ذكر' : child.gender}</span>
                    <span>•</span>
                    <span>{isRtl ? 'حساب الطفل:' : 'Child Username:'} <span className="font-mono bg-white/15 px-2 py-0.5 rounded font-black text-white">{child.username}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Twin Panel Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Game Progress Stats */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2 flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-sky-500 animate-bounce" />
                  <span>{isRtl ? 'نتائج ألعاب التنمية الإدراكية' : 'Cognitive Games Progress'}</span>
                </h4>

                <div className="space-y-4">
                  {/* Memory match score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span className="flex items-center space-x-1.5">
                        <Brain className="w-4 h-4 text-sky-500" />
                        <span>{isRtl ? 'تطابق الذاكرة' : 'Memory Match'}</span>
                      </span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block">{isRtl ? 'تاريخ اللعب: أمس' : 'Last Played: Yesterday'}</span>
                  </div>

                  {/* Emotion Board score */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                      <span className="flex items-center space-x-1.5">
                        <Smile className="w-4 h-4 text-emerald-500" />
                        <span>{isRtl ? 'لوحة المشاعر' : 'Emotions Board'}</span>
                      </span>
                      <span>90%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '90%' }} />
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block">{isRtl ? 'تاريخ اللعب: منذ يومين' : 'Last Played: 2 days ago'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Daily Logs Logger */}
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
                      <select
                        value={logMood}
                        onChange={(e: any) => setLogMood(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="neutral">Neutral</option>
                        <option value="unsettled">Unsettled</option>
                        <option value="distressed">Distressed</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">{isRtl ? 'ساعات النوم' : 'Sleep Hours'}</label>
                      <input
                        type="number"
                        value={logSleep}
                        onChange={(e) => setLogSleep(e.target.value)}
                        placeholder="8"
                        min="0"
                        max="24"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <label className="text-[9px] font-black uppercase text-slate-400 block">{isRtl ? 'ملاحظات وتطورات مهمة' : 'Important observations'}</label>
                    <textarea
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      placeholder="Stimming triggers, dietary notes..."
                      className="w-full p-2 h-14 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRtl ? 'حفظ السجل' : 'Save Log'}</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* VIEW B: CHILD COGNITIVE PROGRESS TRACKING (Recharts Line chart) */}
        {activeTab === 'progress' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2">
                {isRtl ? 'مخطط التطور المعرفي ونشاط الانتباه' : 'Child Cognitive Growth & Attention Span chart'}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                Visualizing daily performance indicators synchronized directly from the child play corner.
              </p>
            </div>

            <div className="h-64 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <ReLineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                  <Line type="monotone" dataKey="Score" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Accuracy" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} />
                </ReLineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start space-x-3 text-xs text-slate-500 font-semibold leading-normal">
              <Sparkles className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
              <p>
                {isRtl 
                  ? 'رؤى أوتي كير الذكية: يظهر طفلك دقة مهارات مطابقة بنسبة ٩٢٪ مع ثبات في زمن الاستجابة الحركية. تتكامل هذه النتائج مع استهلاك مكملات الفولات النشطة صباحاً.'
                  : 'AutiCare Intelligence Insight: Your child shows a 92% memory matching score with stabilized motor response times. Folate coenzyme metabolic markers support this focus stability.'}
              </p>
            </div>
          </div>
        )}

        {/* VIEW C: CARE TEAM CLINICIANS */}
        {activeTab === 'clinicians' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest pl-1">
                {isRtl ? 'فريق الرعاية الطبية المخصص' : 'ASSIGNED HEALTHCARE PROVIDERS'}
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Contact, view recommendations, and inspect coordinates of your active care team.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Doctor Sarah Connor */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-start space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl">
                    🩺
                  </div>
                  <div className="text-left space-y-1">
                    <div className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {isRtl ? 'نشط حالياً' : 'Active Provider'}
                    </div>
                    <h4 className="text-sm font-black text-slate-800">Dr. Sarah Connor</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Child Psychologist</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 leading-normal font-semibold border-t border-slate-50 pt-3 w-full">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Clinic & Address</p>
                  <p className="text-slate-700 font-bold">City Development Center</p>
                  <p className="text-[10px] text-slate-400 mt-1">Recommended DNA Supplementation approval logs synced.</p>
                </div>
              </div>

              {/* Therapist Tom Smith */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-start space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-2xl">
                    🧠
                  </div>
                  <div className="text-left space-y-1">
                    <div className="inline-flex items-center bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                      {isRtl ? 'نشط حالياً' : 'Active Provider'}
                    </div>
                    <h4 className="text-sm font-black text-slate-800">Therapist Tom Smith</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Behavioral Therapist</p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 leading-normal font-semibold border-t border-slate-50 pt-3 w-full">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">Clinic & Address</p>
                  <p className="text-slate-700 font-bold">Autism Care Clinic</p>
                  <p className="text-[10px] text-slate-400 mt-1">Manages weekly sensory integration logs and ABA milestones.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW D: DAILY LOGS TABLE */}
        {activeTab === 'logs' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2">
                {isRtl ? 'أرشيف السجلات والتقارير اليومية' : 'Daily Observational Log archives'}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Recent behaviors logged by parents to construct predictive meltdown algorithms.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-semibold text-slate-600">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">
                    <th className="pb-3">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="pb-3">{isRtl ? 'المزاج' : 'Mood'}</th>
                    <th className="pb-3">{isRtl ? 'ساعات النوم' : 'Sleep'}</th>
                    <th className="pb-3">{isRtl ? 'المكملات' : 'Meds'}</th>
                    <th className="pb-3">{isRtl ? 'ملاحظات التقدم' : 'Observations'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log, index) => (
                    <tr key={index}>
                      <td className="py-4 font-mono font-bold text-slate-800">{log.date}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          log.mood === 'excellent' ? 'bg-emerald-50 text-emerald-600' :
                          log.mood === 'good' ? 'bg-sky-50 text-sky-600' :
                          log.mood === 'neutral' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {log.mood}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-slate-700">{log.sleep}</td>
                      <td className="py-4">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${log.meds ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {log.meds ? '✓' : '×'}
                        </span>
                      </td>
                      <td className="py-4 max-w-[240px] truncate font-medium text-slate-500" title={log.notes}>{log.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
