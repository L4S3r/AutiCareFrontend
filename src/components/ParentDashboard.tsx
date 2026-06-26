"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smile, Brain, Target, Star, Trophy, Users, LogOut, Heart,
  Sparkles, Activity, Plus, LineChart, FileText, Settings,
  ShieldCheck, ChevronRight, CheckCircle2, AlertCircle, ChevronLeft,
  Utensils, Pill, Ban, HelpCircle
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { getAIPrediction, getPatients, getBehaviorLogs, createBehaviorLog, getNutritionPlans } from '../api';
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'progress' | 'nutrition' | 'clinicians' | 'logs'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Daily Behavior Logging Form States
  const [logMood, setLogMood] = useState<'excellent' | 'good' | 'neutral' | 'unsettled' | 'distressed'>('good');
  const [logSleep, setLogSleep] = useState('8');
  const [logMeds, setLogMeds] = useState(true);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // API Integrated Workspace States
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [loadingPrediction, setLoadingPrediction] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [predictionError, setPredictionError] = useState<string>('');
  const [nutritionPlan, setNutritionPlan] = useState<any>(null);
  const [loadingNutrition, setLoadingNutrition] = useState<boolean>(false);

  const child = parentUser.child || {
    name: 'Sami Al-Farsi',
    username: 'sami_al_farsi',
    age: '6',
    level: 'Level 2',
    gender: 'Male'
  };

  const [logs, setLogs] = useState<any[]>([
    { date: '2026-06-22', mood: 'excellent', sleep: '9.0 hrs', meds: true, notes: 'Very focused in matching game, took metafolin successfully.' },
    { date: '2026-06-21', mood: 'good', sleep: '8.5 hrs', meds: true, notes: 'Calm evening, positive social interactions.' },
    { date: '2026-06-20', mood: 'neutral', sleep: '7.5 hrs', meds: true, notes: 'Slight restlessness before sleep, settled in 10 mins.' }
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

  const loadNutritionData = async (childId: string) => {
    try {
      setLoadingNutrition(true);
      const res = await getNutritionPlans(childId);
      if (res.success && res.data && res.data.length > 0) {
        const approvedPlan = res.data.find((p: any) => p.approved === true) || res.data[0];
        setNutritionPlan(approvedPlan);
      }
    } catch (err) {
      console.error('Error fetching nutrition plan:', err);
    } finally {
      setLoadingNutrition(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoadingPrediction(true);
        setPredictionError('');

        const patientsRes = await getPatients();
        const childId =
          patientsRes?.data?.[0]?._id ||
          patientsRes?.data?.[0]?.id ||
          patientsRes?.[0]?._id ||
          patientsRes?.[0]?.id || '';

        if (!childId) {
          setPredictionError('No child profile found. Add a child to unlock tracking nodes.');
          return;
        }

        setActiveChildId(childId);
        await loadLogs(childId);
        await loadNutritionData(childId);

        const predRes = await getAIPrediction(childId, language);
        if (predRes?.data) {
          setPredictionData(predRes.data);
        }
      } catch (err: any) {
        setPredictionError('AI analysis array currently initializing. Re-syncing shortly.');
      } finally {
        setLoadingPrediction(false);
      }
    };

    loadDashboardData();
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
        if (predRes?.data) setPredictionData(predRes.data);
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

      {/* 1. COLLAPSIBLE SIDEBAR CONTAINER */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base shadow shadow-sky-500/35">A</div>
                <span className="text-sm font-black text-white tracking-tight">AutiCare <span className="text-sky-400">Parent</span></span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 mx-auto cursor-pointer transition-colors">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex flex-col space-y-1.5">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'dashboard' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Activity className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>
            <button onClick={() => setActiveTab('progress')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'progress' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <LineChart className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Child Progress</span>}
            </button>
            <button onClick={() => setActiveTab('nutrition')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'nutrition' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Utensils className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Nutrition Plan</span>}
            </button>
            <button onClick={() => setActiveTab('clinicians')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'clinicians' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Users className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Care Team</span>}
            </button>
            <button onClick={() => setActiveTab('logs')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'logs' ? 'bg-sky-500 text-white shadow shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <FileText className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Daily Logs</span>}
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-4">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3 pl-1 truncate">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0">{parentUser.name.charAt(0)}</div>
              <div className="truncate max-w-[140px]"><p className="text-xs font-extrabold text-white truncate">{parentUser.name}</p></div>
            </div>
          )}
          <button onClick={onLogout} className="w-full py-2 bg-rose-500/10 hover:bg-rose-50 hover:text-white text-rose-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            {!sidebarCollapsed && <span>LOGOUT</span>}
          </button>
        </div>
      </aside>

      {/* 2. CONTENT CONTAINER HUB */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <AppHeader title="Parent Portal" userName={parentUser.name} role="parent" language={language} />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 text-left select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800">Welcome, {parentUser.name.split(' ')[0]}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Track and support your child's tailored medical frameworks.</p>
            </div>
            <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm h-fit">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-1" />
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Play Corner Synced</span>
            </div>
          </div>

          {/* DASHBOARD TAB WORKSPACE */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-3xl p-6 text-white relative shadow-lg">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-5 gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl font-black text-sky-600 shadow">👦</div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-extrabold uppercase">{child.level}</span>
                    <h3 className="text-xl font-black">{child.name}</h3>
                    <p className="text-xs text-sky-100 font-semibold">Age: {child.age} Years • Account profile code: <span className="font-mono bg-white/15 px-2 py-0.5 rounded">{child.username}</span></p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 border-b pb-2 flex items-center gap-2"><Trophy className="w-4 h-4 text-sky-500" />Cognitive Progress Matrix</h4>
                  <div className="space-y-4">
                    <div className="space-y-1"><div className="flex justify-between text-xs font-bold text-slate-700"><span>Memory Match Game</span><span>85%</span></div><div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-sky-500 h-2 rounded-full" style={{ width: '85%' }} /></div></div>
                    <div className="space-y-1"><div className="flex justify-between text-xs font-bold text-slate-700"><span>Emotions Board Deck</span><span>90%</span></div><div className="w-full bg-slate-100 h-2 rounded-full"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: '90%' }} /></div></div>
                  </div>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 border-b pb-2 flex items-center gap-2"><Activity className="w-4 h-4 text-sky-500" />Quick Daily Log submission</h4>
                  {logSuccess && <div className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-xl">Logs successfully registered into cloud pools!</div>}
                  <form onSubmit={handleAddLog} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select value={logMood} onChange={(e: any) => setLogMood(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold outline-none"><option value="excellent">Excellent</option><option value="good">Good</option><option value="neutral">Neutral</option></select>
                      <input type="number" value={logSleep} onChange={(e) => setLogSleep(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-lg text-xs font-bold" placeholder="Sleep hours" required />
                    </div>
                    <textarea value={logNotes} onChange={(e) => setLogNotes(e.target.value)} placeholder="Observations, dietary deviations, sensory tokens..." className="w-full p-2 h-14 bg-slate-50 border rounded-lg text-xs font-bold outline-none resize-none" required />
                    <button type="submit" className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer">Save Log Profile</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* CHILD COGNITIVE PROGRESS CHART VIEW TAB */}
          {activeTab === 'progress' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b pb-2">Cognitive Growth Analytics Timeline</h4>
                <div className="h-64 w-full -ml-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                      <Line type="monotone" dataKey="Score" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Accuracy" stroke="#10b981" strokeWidth={2.5} strokeDasharray="5 5" />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* LIVE AI PREDICTION WINDOW CORE COMPONENT */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b pb-2 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>Real-time AI Behavioral Analysis</span>
                </h4>
                <AnimatePresence mode="wait">
                  {loadingPrediction ? (
                    <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"><div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" /><span className="text-xs font-bold font-mono text-slate-500">Processing baseline indicators...</span></div>
                  ) : predictionError ? (
                    <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-2xl border border-amber-100"><AlertCircle className="w-5 h-5 text-amber-500" /><span className="text-xs font-bold text-amber-700">{predictionError}</span></div>
                  ) : predictionData ? (
                    <div className={`relative rounded-2xl border p-5 ${predictionData.riskScore > 50 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">7-Day Crisis Risk Threshold Index</p>
                      <p className={`text-3xl font-black font-mono ${predictionData.riskScore > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>{predictionData.riskScore}%</p>
                      <p className="text-xs font-semibold text-slate-600 mt-2 leading-relaxed">{predictionData.message}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 text-slate-400 text-xs rounded-xl border border-dashed border-slate-200">Complete more daily behavior logs to calibrate your local AI predictive telemetry curves.</div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* GENOMIC NUTRITION PLAN SYSTEM TAB VIEW */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6 animate-fade-in">
              {loadingNutrition ? (
                <div className="p-12 text-center text-slate-400 font-mono text-xs">Accessing encrypted medical framework profiles...</div>
              ) : nutritionPlan ? (
                <div className="space-y-6">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex items-center space-x-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /><span className="text-xs font-bold text-emerald-800">Approved Medical Framework signed by: <span className="underline font-black">{nutritionPlan.approvedBy?.name || 'Assigned Specialist'}</span></span></div>
                    <span className="text-[10px] font-mono font-black uppercase bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 w-fit">STATUS: COMPLIANT</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Panel 1: Supplements */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 border-b pb-2 flex items-center gap-1.5"><Pill className="w-4 h-4 text-sky-500" /><span>Supplement Schedule Protocol</span></h4>
                      <div className="space-y-2">
                        {nutritionPlan.aiRecommendation?.supplements?.map((sup: any, i: number) => (
                          <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs">
                            <p className="font-black text-slate-800">{sup.name}</p>
                            <p className="text-[11px] text-brand-600 font-bold mt-0.5">{sup.dosage} — {sup.frequency}</p>
                          </div>
                        )) || <p className="text-xs text-slate-400 italic">No vitamins specified.</p>}
                      </div>
                    </div>

                    {/* Panel 2: Restrictions */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-rose-800 border-b pb-2 flex items-center gap-1.5"><Ban className="w-4 h-4 text-rose-500" /><span>Dietary Restrictions</span></h4>
                      <div className="space-y-2">
                        {nutritionPlan.aiRecommendation?.foodRestrictions?.map((res: string, i: number) => (
                          <div key={i} className="flex items-center space-x-2 p-2.5 bg-rose-50/50 border border-rose-100 rounded-xl text-xs font-bold text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /><span>{res}</span>
                          </div>
                        )) || <p className="text-xs text-slate-400 italic">No standard restrictions offline.</p>}
                      </div>
                    </div>

                    {/* Panel 3: Menu Plan */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 border-b pb-2 flex items-center gap-1.5"><Utensils className="w-4 h-4 text-emerald-500" /><span>Recommended Meal Framework</span></h4>
                      <div className="space-y-3">
                        {nutritionPlan.aiRecommendation?.mealSuggestions?.map((meal: any, i: number) => (
                          <div key={i} className="border rounded-xl p-3 bg-slate-50/40 text-xs">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 w-fit block mb-1.5">{meal.mealType}</span>
                            <ul className="space-y-1 list-disc list-inside text-slate-600 font-medium">
                              {meal.suggestions?.map((sug: string, k: number) => <li key={k}>{sug}</li>)}
                            </ul>
                          </div>
                        )) || <p className="text-xs text-slate-400 italic">No alternative menus compiled.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 border border-dashed rounded-3xl text-center text-slate-400 text-xs bg-white">No approved genetics nutrition plan is online yet. Complete base tracking configurations.</div>
              )}
            </div>
          )}

          {/* CLINICIANS CARE TEAM TAB VIEW */}
          {activeTab === 'clinicians' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border flex items-center justify-center text-2xl">🩺</div>
                  <div>
                    <span className="inline-flex bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">Active Provider</span>
                    <h4 className="text-sm font-black text-slate-800 mt-1">Dr. Sarah Connor</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Child Psychologist & Advisor</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 border flex items-center justify-center text-2xl">🧠</div>
                  <div>
                    <span className="inline-flex bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">Active Provider</span>
                    <h4 className="text-sm font-black text-slate-800 mt-1">Therapist Tom Smith</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Clinical Behavior Analyst</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ARCHIVE RECORDS DAILY LOGS VIEW TAB */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden animate-fade-in">
              <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b pb-2 mb-4">Daily Observational Log Archives</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b text-[10px] font-black text-slate-400 uppercase tracking-wider"><th className="pb-3">Date</th><th className="pb-3">Mood</th><th className="pb-3">Sleep</th><th className="pb-3">Meds</th><th className="pb-3">Observations</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td className="py-4 font-mono font-bold text-slate-800">{log.date}</td>
                        <td><span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${log.mood === 'excellent' ? 'bg-emerald-50 text-emerald-600' : 'bg-sky-50 text-sky-600'}`}>{log.mood}</span></td>
                        <td className="font-bold">{log.sleep}</td>
                        <td className="font-black text-emerald-500">{log.meds ? '✓' : '×'}</td>
                        <td className="max-w-xs truncate text-slate-400" title={log.notes}>{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}