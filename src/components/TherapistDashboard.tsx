"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users, Calendar, Clock, LogOut, CheckCircle2,
  Smile, Heart, ArrowRight, ShieldCheck, FileText, Settings,
  Activity, Sparkles, ChevronRight, UserPlus, ClipboardList, ChevronLeft
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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

      {/* 1. RESPONSIVE SIDEBAR */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base">T</div>
                <span className="text-sm font-black text-white tracking-tight">AutiCare <span className="text-sky-400">Therapist</span></span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 mx-auto cursor-pointer">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex flex-col space-y-1.5">
            <button onClick={() => { setActiveTab('dashboard'); setSelectedPatient(null); }} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'dashboard' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Activity className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </button>
            <button onClick={() => { setActiveTab('patients'); setSelectedPatient(null); }} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'patients' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Users className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Patients</span>}
            </button>
            <button onClick={() => { setActiveTab('behavior'); setSelectedPatient(null); }} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'behavior' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <FileText className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Behavior Tracker</span>}
            </button>
          </nav>
        </div>

        <button onClick={onLogout} className="w-full py-2 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-black flex items-center justify-center gap-2">
          <LogOut className="w-3.5 h-3.5" />
          {!sidebarCollapsed && <span>LOGOUT</span>}
        </button>
      </aside>

      {/* 2. HUB VIEWPORT */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6 md:p-8 space-y-6 text-left">
          <div className="border-b border-slate-200/80 pb-4">
            <h2 className="text-xl font-black text-slate-800">Welcome, {therapistUser.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">{therapistUser.clinic || 'Clinical Behavioral Advisor'}</p>
          </div>

          {activeTab === 'dashboard' && !selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">{s.label}</span>
                      <p className="text-xl font-black text-slate-800">{s.value}</p>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">{s.icon}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">Patient Registry</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 font-black text-slate-400 uppercase">
                        <th className="pb-2">Patient</th>
                        <th className="pb-2">Age</th>
                        <th className="pb-2">Diagnosis</th>
                        <th className="pb-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPatients.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 text-slate-600">
                          <td className="py-3 font-bold text-slate-800">{p.name}</td>
                          <td className="py-3">{p.age}</td>
                          <td className="py-3"><span className="bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-full">{p.level}</span></td>
                          <td className="py-3 text-right">
                            <button onClick={() => setSelectedPatient(p)} className="px-2.5 py-1 bg-slate-100 border border-slate-200 hover:bg-sky-500 hover:text-white rounded-lg transition-colors text-[10px] font-bold">View Profile</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {selectedPatient && (
            <div className="space-y-6 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-800">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedPatient.age} • {selectedPatient.level}</p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="px-3 py-1.5 bg-slate-50 border text-slate-600 text-xs font-bold rounded-xl">Close</button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedPatient.notes}</p>
            </div>
          )}

          {activeTab === 'behavior' && <BehavioralTracker language={language} />}
        </div>
      </main>
    </div>
  );
}