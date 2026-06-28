"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smile, Brain, Target, Star, Trophy, Users, LogOut, Heart,
  Sparkles, Activity, Plus, LineChart, FileText, Settings,
  ShieldCheck, ChevronRight, CheckCircle2, AlertCircle, ChevronLeft,
  Utensils, Pill, Ban, HelpCircle, Mic
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
  const [logMood, setLogMood] = useState<'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad' | 'anxious' | 'angry' | 'distressed'>('happy');
  const [logSleep, setLogSleep] = useState('8');
  const [logMedications, setLogMedications] = useState([
    { name: 'Methyl Folate (Metafolin)', time: 'Morning', taken: true },
    { name: 'Methylcobalamin (B12)', time: 'Morning', taken: true },
    { name: 'Vitamin D3 + K2', time: 'Noon', taken: true },
  ]);
  const [logNotes, setLogNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const shouldBeListeningRef = useRef(false);

  const toggleMedication = (index: number) => {
    setLogMedications(prev => prev.map((m, i) => i === index ? { ...m, taken: !m.taken } : m));
  };

  const sleepLabel = (h: number) => h >= 9 ? '🌟 Excellent' : h >= 7 ? '✅ Good' : h >= 5 ? '⚠️ Fair' : '❌ Poor';
  const sleepColor = (h: number) => h >= 9 ? '#10b981' : h >= 7 ? '#0ea5e9' : h >= 5 ? '#f59e0b' : '#ef4444';

  // Natural Language Processing Text Translation Micro-Helper
  const processVoiceInputNLP = (text: string) => {
    const mapSpokenNumber = (word: string): number => {
      const num = parseFloat(word);
      if (!isNaN(num)) return num;

      const mapping: { [key: string]: number } = {
        'half': 0.5,
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'eleven': 11, 'twelve': 12,
        // Arabic words
        '\u0646\u0635': 0.5, '\u0646\u0635\u0641': 0.5,
        '\u0633\u0627\u0639\u0629': 1, '\u0633\u0627\u0639\u062a\u064a\u0646': 2, '\u062b\u0644\u0627\u062b': 3, '\u062b\u0644\u0627\u062b\u0629': 3,
        '\u0623\u0631\u0628\u0639': 4, '\u0623\u0631\u0628\u0639\u0629': 4, '\u062e\u0645\u0633': 5, '\u062e\u0645\u0633\u0629': 5,
        '\u0633\u062a': 6, '\u0633\u062a\u0629': 6, '\u0633\u0628\u0639': 7, '\u0633\u0628\u0639\u0629': 7,
        '\u062b\u0645\u0627\u0646': 8, '\u062b\u0645\u0627\u0646\u064a': 8, '\u062b\u0645\u0627\u0646\u064a\u0629': 8, '\u062a\u0633\u0639': 9,
        '\u062a\u0633\u0639\u0629': 9, '\u0639\u0634\u0631': 10, '\u0639\u0634\u0631\u0629': 10
      };

      return mapping[word.toLowerCase().trim()] ?? 8;
    };

    const numWords = '\\d+(?:\\.\\d+)?|half|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve'
      + '|\u0646\u0635|\u0646\u0635\u0641|\u0633\u0627\u0639\u0629|\u0633\u0627\u0639\u062a\u064a\u0646|\u062b\u0644\u0627\u062b|\u062b\u0644\u0627\u062b\u0629|\u0623\u0631\u0628\u0639|\u0623\u0631\u0628\u0639\u0629|\u062e\u0645\u0633|\u062e\u0645\u0633\u0629|\u0633\u062a|\u0633\u062a\u0629|\u0633\u0628\u0639|\u0633\u0628\u0639\u0629|\u062b\u0645\u0627\u0646|\u062b\u0645\u0627\u0646\u064a\u0629|\u062a\u0633\u0639|\u062a\u0633\u0639\u0629|\u0639\u0634\u0631|\u0639\u0634\u0631\u0629';
    // Optional filler: "slept FOR 6", "slept ABOUT seven", "slept ONLY 5"
    const optFiller = '(?:for|about|around|only|just|nearly|approximately|roughly|\u0644\u0645\u062f\u0629|\u062d\u0648\u0627\u0644\u064a|\u062a\u0642\u0631\u064a\u0628\u0627\u064b|\u0641\u0642\u0637)?\\s*';

    // 1. Extract sleep hours — handles "slept for 6 hours", "7 hours of sleep", etc.
    const sleepMatch =
      text.match(new RegExp(`(?:slept?|sleep|\u0646\u0627\u0645|\u0646\u0627\u0645\u062a)\\s*${optFiller}(${numWords})`, 'i')) ||
      text.match(new RegExp(`(${numWords})\\s*(?:hours?\\s+of\\s+)?(?:sleep|slept|\u0633\u0627\u0639\u0627\u062a\\s+\u0646\u0648\u0645)`, 'i'));
    if (sleepMatch) {
      const hours = Math.min(Math.max(mapSpokenNumber(sleepMatch[1]), 0.5), 24);
      setLogSleep(hours.toString());
    }

    // 2. Meltdown count — "had 3 meltdowns", "two tantrums today"
    const meltdownCountMatch = text.match(
      /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:meltdowns?|tantrums?|crises|\u0627\u0646\u0647\u064a\u0627\u0631|\u0646\u0648\u0628\u0629)/i
    );
    if (meltdownCountMatch) {
      setLogMood('angry');
    } else {
      // 3. Mood keyword detection (only if no meltdown count)
      if (/meltdown|tantrum|crisis|\u0627\u0646\u0647\u064a\u0627\u0631|\u0646\u0648\u0628\u0629/i.test(text)) {
        setLogMood('angry');
      } else if (/\b(?:calm|relaxed|peaceful|great|happy|excellent|\u0647\u0627\u062f\u0626|\u0645\u0631\u062a\u0627\u062d)\b/i.test(text)) {
        setLogMood('happy');
      } else if (/\b(?:sad|upset|crying|unhappy|\u062d\u0632\u064a\u0646|\u064a\u0628\u0643\u064a)\b/i.test(text)) {
        setLogMood('sad');
      } else if (/\b(?:anxious|nervous|worried|stressed|\u0642\u0644\u0642)\b/i.test(text)) {
        setLogMood('anxious');
      }
    }

    // 4. Medication detection — sets all meds taken/not taken based on voice
    if (/\b(?:took|taken|gave)\b.*\b(?:meds?|medication|medicine|pill|\u062f\u0648\u0627\u0621|\u0623\u0639\u0637\u064a\u062a\u0647)\b/i.test(text)) {
      setLogMedications(prev => prev.map(m => ({ ...m, taken: true })));
    } else if (/\b(?:didn't|did not|no|skipped|forgot|refused|\u0644\u0645 \u064a\u0623\u062e\u0630|\u0646\u0633\u064a)\b.*\b(?:meds?|medication|medicine|pill|\u062f\u0648\u0627\u0621)\b/i.test(text)) {
      setLogMedications(prev => prev.map(m => ({ ...m, taken: false })));
    }
  };


  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition instance once (or when language changes)
  // to avoid Garbage Collection / re-render teardown bugs.
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setLogNotes(prev => prev ? `${prev} ${transcript}` : transcript);
        processVoiceInputNLP(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setVoiceError(event.error);
        
        // If it is a fatal blocker (like permissions, or language unsupported), stop retrying
        if (event.error !== 'no-speech' && event.error !== 'audio-capture') {
          shouldBeListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if user did not explicitly click stop (e.g. silent timeout)
        if (shouldBeListeningRef.current) {
          try {
            recognition.start();
          } catch (err) {
            console.warn("Failed to auto-restart speech recognition:", err);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.warn("Failed to abort speech recognition:", err);
        }
      }
    };
  }, [language]);

  // Toggle voice logging using persistent SpeechRecognition instance
  const toggleVoiceLogging = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const recognition = recognitionRef.current;
    if (recognition) {
      if (isListening) {
        shouldBeListeningRef.current = false;
        try {
          recognition.stop();
        } catch (err) {
          console.warn("Failed to stop speech recognition:", err);
        }
        setIsListening(false);
      } else {
        shouldBeListeningRef.current = true;
        setVoiceError('');
        try {
          recognition.start();
        } catch (err) {
          console.warn("Failed to start speech recognition:", err);
          shouldBeListeningRef.current = false;
          setIsListening(false);
        }
      }
    } else {
      // Toggle listening display for fallback/simulated click suggestions
      setIsListening(!isListening);
    }
  };

  // Helper to simulate speech entry from the suggestions helper
  const simulateSpeech = (text: string) => {
    setLogNotes(prev => prev ? `${prev} ${text}` : text);
    processVoiceInputNLP(text);
    shouldBeListeningRef.current = false;
    setVoiceError('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  };

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
          // Kept 1-to-1 matching to let it directly read database values cleanly
          mood: l.mood || 'neutral',
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
      const sleepNum = Number(logSleep);
      const logData = {
        childId: activeChildId,
        date: new Date(),
        mood: logMood,
        sleepHours: sleepNum,
        sleepQuality: sleepNum >= 8 ? 'excellent' : sleepNum >= 6 ? 'good' : 'poor',
        meltdownSeverity: 'none',
        meltdowns: 0,
        medication: logMedications.map(m => ({ name: m.name, taken: m.taken, time: m.time })),
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
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">
                        {isRtl ? 'المزاج العام' : 'Overall Mood'}
                      </label>
                      <select
                        value={logMood}
                        onChange={(e: any) => setLogMood(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                      >
                        <option value="very_happy">{isRtl ? 'سعيد جداً' : 'Very Happy'}</option>
                        <option value="happy">{isRtl ? 'سعيد' : 'Happy'}</option>
                        <option value="neutral">{isRtl ? 'حيادي' : 'Neutral'}</option>
                        <option value="sad">{isRtl ? 'حزين' : 'Sad'}</option>
                        <option value="very_sad">{isRtl ? 'حزين جداً' : 'Very Sad'}</option>
                        <option value="anxious">{isRtl ? 'قلق' : 'Anxious'}</option>
                        <option value="angry">{isRtl ? 'غاضب / نوبة / مضطرب' : 'Angry / Meltdown / Distressed'}</option>
                      </select>
                    </div>
                    {/* ── Sleep Duration Slider ── */}
                    <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-black uppercase text-slate-400">
                          {isRtl ? 'ساعات النوم' : 'Sleep Duration'}
                        </label>
                        <span className="text-xs font-black" style={{ color: sleepColor(Number(logSleep)) }}>
                          {logSleep}h — {sleepLabel(Number(logSleep))}
                        </span>
                      </div>
                      <input
                        id="sleep-slider"
                        type="range"
                        min="0.5"
                        max="14"
                        step="0.5"
                        value={logSleep}
                        onChange={(e) => setLogSleep(e.target.value)}
                        style={{
                          accentColor: sleepColor(Number(logSleep)),
                          width: '100%',
                          cursor: 'pointer',
                        }}
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                        <span>0.5h</span><span>4h</span><span>7h</span><span>10h</span><span>14h</span>
                      </div>
                    </div>
                    <div className="space-y-0.5 relative">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 block">
                          {isRtl ? 'الملاحظات' : 'Observations / Notes'}
                        </label>
                        {/* Voice Logger Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleVoiceLogging(e)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase transition-all shadow-sm border cursor-pointer ${
                            isListening
                              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                              : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-500 hover:text-white'
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          <span>{isListening ? (isRtl ? 'جاري الاستماع...' : 'Listening...') : (isRtl ? 'إدخال صوتي' : 'Voice Log')}</span>
                        </button>
                      </div>
                      {voiceError && (
                        <div className="text-[9px] text-rose-500 font-bold block mb-1">
                          ⚠️ {voiceError === 'not-allowed' ? 'Mic permission blocked' : `Voice log stopped: ${voiceError}`}
                        </div>
                      )}
                      <div className="relative">
                        <textarea
                          value={logNotes}
                          onChange={(e) => setLogNotes(e.target.value)}
                          placeholder={isRtl ? "أدخل الملاحظات أو اضغط على الإدخال الصوتي..." : "Enter notes or click Voice Log..."}
                          className="w-full p-2 pr-8 h-14 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none resize-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          required
                        />
                      </div>
                      
                      {/* Listening demo suggestions helper */}
                      {(isListening || voiceError === 'network' || voiceError === 'not-allowed') && (
                        <div className="absolute z-20 bottom-full left-0 right-0 mb-1 p-2.5 bg-indigo-50/95 border border-indigo-200 rounded-xl shadow-lg text-[10px] text-indigo-700 font-semibold animate-fade-in flex flex-col gap-1.5">
                          <p className="border-b border-indigo-100 pb-1">
                            {isListening
                              ? '🎤 Speak now, or click a demo utterance below to parse:'
                              : '⚠️ Speech Recognition offline. Click below to simulate voice logs:'}
                          </p>
                          <button
                            type="button"
                            onClick={() => simulateSpeech("Slept 6 hours but had a major meltdown in the evening")}
                            className="text-left hover:underline text-[9px] text-slate-500 block truncate cursor-pointer font-mono"
                          >
                            "Slept 6 hours but had a major meltdown in the evening"
                          </button>
                          <button
                            type="button"
                            onClick={() => simulateSpeech("He slept 9 hours and had no tantrum today")}
                            className="text-left hover:underline text-[9px] text-slate-500 block truncate cursor-pointer font-mono"
                          >
                            "He slept 9 hours and had no tantrum today"
                          </button>
                        </div>
                      )}
                    </div>
                    {/* ── Medication Checklist ── */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 block">
                        {isRtl ? 'الأدوية والمكملات الغذائية' : 'Medications & Supplements'}
                      </label>
                      <div className="space-y-1.5">
                        {logMedications.map((med, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => toggleMedication(i)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              med.taken
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-rose-50 border-rose-200 text-rose-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 ${
                                med.taken ? 'bg-emerald-500' : 'bg-rose-400'
                              }`}>
                                {med.taken ? '✓' : '✗'}
                              </span>
                              <div className="text-left">
                                <p className="font-extrabold leading-tight">{med.name}</p>
                                <p className="text-[9px] font-semibold opacity-70">{med.time}</p>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              med.taken ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
                            }`}>
                              {med.taken ? (isRtl ? 'أُخذ' : 'Taken') : (isRtl ? 'لم يُؤخذ' : 'Skipped')}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

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
                        <td>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${log.mood === 'very_happy' ? 'bg-emerald-100 text-emerald-700' :
                            log.mood === 'happy' ? 'bg-emerald-50 text-emerald-600' :
                              log.mood === 'neutral' ? 'bg-slate-100 text-slate-600' :
                                log.mood === 'anxious' ? 'bg-amber-50 text-amber-600' :
                                  'bg-rose-50 text-rose-600' // Falls back to red styling for bad days (sad, very_sad, angry)
                            }`}>
                            {log.mood.replace('_', ' ')}
                          </span>
                        </td>
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