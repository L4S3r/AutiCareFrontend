"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Stethoscope, Users, Calendar, Clock, LogOut, CheckCircle2,
  Dna, Heart, ArrowRight, ShieldCheck, FileText, Settings,
  Activity, Sparkles, ChevronRight, UserPlus, ChevronLeft
} from 'lucide-react';
import { Language } from '../types';
import GeneticAIExplorer from './GeneticAIExplorer';

interface DoctorDashboardProps {
  language: Language;
  doctorUser: {
    name: string;
    email: string;
    clinic?: string;
  };
  onLogout: () => void;
}

export default function DoctorDashboard({ language, doctorUser, onLogout }: DoctorDashboardProps) {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'appointments' | 'genetic'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const stats = [
    { label: isRtl ? 'إجمالي المرضى' : 'Total Patients', value: '24', icon: <Users className="w-5 h-5 text-sky-500" /> },
    { label: isRtl ? 'موعد اليوم' : "Today's Appointments", value: '6', icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
    { label: isRtl ? 'طلبات بانتظار المراجعة' : 'Pending Requests', value: '3', icon: <Clock className="w-5 h-5 text-amber-500" /> }
  ];

  const recentPatients = [
    { id: 'PAT-01', name: 'Alex Doe', age: '6 Years', level: 'Level 1', symptoms: 'Mild sensory stimming, co-occurring folate cycles mismatch.' },
    { id: 'PAT-02', name: 'Jane Smith', age: '8 Years', level: 'Level 2', symptoms: 'Medium speech bottlenecks, gluten allergies diagnosed.' },
    { id: 'PAT-03', name: 'Sam Brown', age: '5 Years', level: 'Level 1', symptoms: 'Hyperactivity traits, Vitamin D pathway deficiency.' }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* 1. RESPONSIVE SIDEBAR */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base">D</div>
                <span className="text-sm font-black text-white tracking-tight">AutiCare <span className="text-sky-400">Doctor</span></span>
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
            <button onClick={() => { setActiveTab('genetic'); setSelectedPatient(null); }} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'genetic' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Dna className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Genetic Parser</span>}
            </button>
          </nav>
        </div>

        <button onClick={onLogout} className="w-full py-2 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-black flex items-center justify-center gap-2">
          <LogOut className="w-3.5 h-3.5" />
          {!sidebarCollapsed && <span>LOGOUT</span>}
        </button>
      </aside>

      {/* 2. MAIN hub STAGE */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6 md:p-8 space-y-6 text-left">
          <div className="border-b border-slate-200/80 pb-4">
            <h2 className="text-xl font-black text-slate-800">Welcome, Dr. {doctorUser.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">{doctorUser.clinic || 'Autism Care & Genetic AI Advisor'}</p>
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
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">Assigned Cases</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-100 font-black text-slate-400 uppercase">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Age</th>
                        <th className="pb-2">Classification</th>
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
                            <button onClick={() => setSelectedPatient(p)} className="px-2.5 py-1 bg-slate-100 border border-slate-200 hover:bg-sky-500 hover:text-white rounded-lg transition-colors text-[10px] font-bold">Inspect Case</button>
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
                <button onClick={() => setSelectedPatient(null)} className="px-3 py-1.5 bg-slate-50 border text-slate-600 text-xs font-bold rounded-xl">Back</button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedPatient.symptoms}</p>
            </div>
          )}

          {activeTab === 'genetic' && <GeneticAIExplorer language={language} />}
        </div>
      </main>
    </div>
  );
}