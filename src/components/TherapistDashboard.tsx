"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, Calendar, Clock, LogOut, CheckCircle2,
  Smile, Heart, ArrowRight, ShieldCheck, FileText, Settings,
  Activity, Sparkles, ChevronRight, UserPlus, ClipboardList
} from 'lucide-react';
import { Language } from '../types';
import BehavioralTracker from './BehavioralTracker';

interface TherapistDashboardProps {
  language: Language;
  therapistUser: {
    name: string;
    email: string;
    clinic?: string;
  };
  onLogout: () => void;
}

export default function TherapistDashboard({ language, therapistUser, onLogout }: TherapistDashboardProps) {
  const isRtl = language === 'ar';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'sessions' | 'behavior'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const stats = [
    { label: isRtl ? 'إجمالي الحالات' : 'Total Patients', value: '18', icon: <Users className="w-5 h-5 text-sky-500" /> },
    { label: isRtl ? 'جلسات اليوم' : "Today's Sessions", value: '4', icon: <ClipboardList className="w-5 h-5 text-emerald-500" /> },
    { label: isRtl ? 'طلبات جديدة' : 'Pending Requests', value: '2', icon: <Clock className="w-5 h-5 text-amber-500" /> }
  ];

  const recentPatients = [
    { id: 'PAT-01', name: 'Alex Doe', age: '6 Years', level: 'Level 1', progress: 40, gender: 'Male', notes: 'Responsive to memory tiles matching, shows improvements in visual cues.' },
    { id: 'PAT-02', name: 'Jane Smith', age: '8 Years', level: 'Level 2', progress: 70, gender: 'Female', notes: 'GFCF diet compliance is high. Motor coordination sessions are positive.' },
    { id: 'PAT-03', name: 'Sam Brown', age: '5 Years', level: 'Level 1', progress: 20, gender: 'Male', notes: 'Session was restless around late evening triggers. Recommended quiet sensory room.' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* 1. CLINICIAN SIDEBAR */}
      <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 ${isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'}`}>
        <div className="space-y-8">
          {/* Logo brand */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base shadow shadow-sky-500/35">
              T
            </div>
            <span className="text-sm font-black text-white tracking-tight">
              AutiCare <span className="text-sky-400">{isRtl ? 'بوابة المعالج' : 'Therapist Portal'}</span>
            </span>
          </div>

          {/* Menu items */}
          <nav className="flex flex-col space-y-1.5">
            <button
              onClick={() => { setActiveTab('dashboard'); setSelectedPatient(null); }}
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
              onClick={() => { setActiveTab('patients'); setSelectedPatient(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              } ${isRtl ? 'space-x-reverse text-right' : ''}`}
            >
              <Users className="w-4 h-4" />
              <span>{isRtl ? 'ملفات الحالات' : 'Patients'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('sessions'); setSelectedPatient(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              } ${isRtl ? 'space-x-reverse text-right' : ''}`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{isRtl ? 'جلسات العلاج ABA' : 'Sessions'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('behavior'); setSelectedPatient(null); }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left transition-all flex items-center space-x-3 cursor-pointer ${
                activeTab === 'behavior'
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              } ${isRtl ? 'space-x-reverse text-right' : ''}`}
            >
              <FileText className="w-4 h-4" />
              <span>{isRtl ? 'رصد السلوك والتنبؤ' : 'Behavior Tracker'}</span>
            </button>
          </nav>
        </div>

        {/* Clinician metadata & logout */}
        <div className="border-t border-slate-800 pt-5 space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-extrabold text-xs">
              T
            </div>
            <div className="truncate max-w-[140px]">
              <p className="text-xs font-extrabold text-white truncate">{therapistUser.name}</p>
              <p className="text-[9px] text-slate-500 font-semibold truncate">{therapistUser.email}</p>
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

      {/* 2. MAIN HUB VIEWPORT */}
      <main className="flex-1 p-8 overflow-y-auto space-y-8 select-none text-left">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {isRtl ? 'مرحباً، المعالج' : 'Welcome,'} {therapistUser.name}
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              {therapistUser.clinic || (isRtl ? 'مستشار ومرشد تحليل السلوك التطبيقي ABA.' : 'Clinical behavioral intervention consultant.')}
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping mr-1" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              {isRtl ? 'تزامن الأجهزة نشط' : 'Client Sync Safe'}
            </span>
          </div>
        </div>

        {/* WORKSPACE PAGES */}

        {/* PAGE A: CLINIC DASHBOARD HOME */}
        {activeTab === 'dashboard' && !selectedPatient && (
          <div className="space-y-6">
            
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((s, index) => (
                <div key={index} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{s.label}</span>
                    <span className="text-2xl font-black text-slate-800">{s.value}</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                    {s.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* Patients list table */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                  {isRtl ? 'المرضى المضافون مؤخراً' : 'RECENT PATIENTS LIST'}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Summary of clinical progress indicators and direct intervention portals.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-semibold text-slate-600">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider text-left">
                      <th className="pb-3">{isRtl ? 'اسم الطفل' : 'Patient Name'}</th>
                      <th className="pb-3">{isRtl ? 'العمر' : 'Age'}</th>
                      <th className="pb-3">{isRtl ? 'مستوى التشخيص' : 'Diagnosis'}</th>
                      <th className="pb-3">{isRtl ? 'معدل التقدم' : 'Progress'}</th>
                      <th className="pb-3 text-right">{isRtl ? 'الإجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <span className="font-extrabold text-slate-800 block">{p.name}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">{p.id}</span>
                        </td>
                        <td className="py-4 text-slate-500 font-bold">{p.age}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-sky-50 text-sky-600">
                            {p.level}
                          </span>
                        </td>
                        <td className="py-4 max-w-[120px]">
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${p.progress}%` }} />
                            </div>
                            <span className="font-bold text-slate-700 text-[10px]">{p.progress}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => setSelectedPatient(p)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-sky-500 hover:text-white border border-slate-200 hover:border-sky-600 text-slate-600 rounded-lg transition-all font-bold text-[10px]"
                          >
                            {isRtl ? 'عرض التقدم' : 'View Progress'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* CLINICAL PATIENT DETAILS VIEW CONTAINER */}
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header info */}
            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-700">
                  {isRtl ? 'ملف نشط' : 'Active Patient'}
                </span>
                <h3 className="text-lg font-black text-slate-800">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-400 font-semibold">{selectedPatient.age} • {selectedPatient.level}</p>
              </div>

              <button
                onClick={() => setSelectedPatient(null)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-extrabold rounded-xl border border-slate-200 transition-all cursor-pointer"
              >
                {isRtl ? 'رجوع للقائمة' : 'Back to Patients'}
              </button>
            </div>

            {/* Patient Clinical details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 font-mono border-b border-slate-100 pb-2">
                  {isRtl ? 'أعراض وحالة الطفل' : 'Clinical Diagnoses Details'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {selectedPatient.notes}
                </p>
                <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl text-[11px] text-slate-400 font-semibold leading-relaxed">
                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Observation Logs</span>
                  Visual tracking compliance is standard. Recommended to analyze DNA Polymorphisms using the OCR genetic parser below.
                </div>
              </div>

              {/* Quick Parser Trigger */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-3xl p-6 text-white shadow-md flex flex-col justify-between items-start space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block">Integrations</span>
                  <h4 className="text-sm font-black">AI Behavioral Analytics</h4>
                  <p className="text-[11px] text-slate-400 leading-normal font-semibold">Track daily mood shifts, meltdown severities and log coenzyme metafolin integrations.</p>
                </div>
                <button
                  onClick={() => { setActiveTab('behavior'); }}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <span>{isRtl ? 'افتح سجل رصد السلوك' : 'Open Behavior Tracker'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PAGE B: BEHAVIORAL TRACKER INTERFACE */}
        {activeTab === 'behavior' && (
          <div className="space-y-6">
            <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm flex items-center justify-between">
              <span className="text-xs text-slate-500 font-extrabold pl-1">
                {isRtl ? 'سجل تدوين ورصد السلوك بالذكاء الاصطناعي متكامل ونشط' : 'AI Behavioral tracker integrations active'}
              </span>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-xs font-black text-sky-600 hover:underline hover:text-sky-700"
              >
                {isRtl ? 'رجوع للرئيسية' : 'Back to Dashboard'}
              </button>
            </div>
            <BehavioralTracker language={language} />
          </div>
        )}

        {/* OTHER SECTIONS MOCK */}
        {activeTab === 'patients' && !selectedPatient && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">{isRtl ? 'كل الحالات المسجلة' : 'Patients Directory'}</h4>
            <p className="text-[10px] mt-1 font-semibold">Clinical records and OCR diagnostic backups are safely stored in HIPAA-compliant cloud storage.</p>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center text-slate-400">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">{isRtl ? 'جلسات العلاج ABA' : 'Sessions scheduler'}</h4>
            <p className="text-[10px] mt-1 font-semibold">Manages weekly session logs and progress metrics.</p>
          </div>
        )}

      </main>

    </div>
  );
}
