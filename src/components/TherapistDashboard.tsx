"use client";
import React, { useState } from 'react';
import {
  Users, Calendar, Clock, LogOut, CheckCircle2, AlertCircle,
  Smile, Heart, ArrowRight, ShieldCheck, FileText, Settings,
  Activity, Sparkles, ChevronRight, UserPlus, ClipboardList, ChevronLeft,
  Plus, Upload, Stethoscope
} from 'lucide-react';
import { Language } from '../types';
import BehavioralTracker from './BehavioralTracker';
import { updateProfileAvatar } from '../api';

interface TherapistDashboardProps {
  language: Language;
  therapistUser: {
    name: string;
    email: string;
    clinic?: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export default function TherapistDashboard({ language, therapistUser, onLogout }: TherapistDashboardProps) {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'sessions' | 'behavior' | 'settings'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dummyState, setDummyState] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

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

  const handleAssignDoctorOptimistic = (doctorId: string, doctorName: string) => {
    if (!selectedPatient) return;

    // Build the updated doctor sub-object structure optimistically
    const updatedPatient = {
      ...selectedPatient,
      assignedDoctor: {
        _id: doctorId,
        name: doctorName,
        specialization: isRtl ? 'استشاري طب أعصاب الأطفال' : 'Pediatric Neurology Specialist'
      }
    };

    // Mutate local state layers concurrently for zero-latency UI response
    setSelectedPatient(updatedPatient);
    setDummyState(prev => prev + 1); // Triggers re-render pass for matching trees
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* 1. RESPONSIVE SIDEBAR */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5">
                {therapistUser.avatar ? (
                  <img src={therapistUser.avatar} alt="Therapist" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base">T</div>
                )}
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
            <button onClick={() => { setActiveTab('settings'); setSelectedPatient(null); }} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'settings' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Profile Settings</span>}
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

          {/* OPTIMISTIC MEDICAL COORDINATION GATEWAY */}
          {selectedPatient && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm mb-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Stethoscope size={14} className="text-brand-500" />
                  {isRtl ? 'الطبيب السريري المشرف' : 'Supervising Clinical Physician'}
                </h4>
                <span className="text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md font-semibold">
                  {isRtl ? 'تزامن فوري' : 'In-Memory Sync'}
                </span>
              </div>

              {/* Assigned Doctor Metadata Card */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-base">
                  👨‍⚕️
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {selectedPatient.assignedDoctor ? selectedPatient.assignedDoctor.name : (isRtl ? 'لم يتم تعيين طبيب مشرف' : 'Unassigned Primary Doctor')}
                  </h5>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {selectedPatient.assignedDoctor?.specialization || (isRtl ? 'طب أعصاب الأطفال' : 'Pediatric Specialist')}
                  </p>
                </div>
              </div>

              {/* Quick In-Memory Overrides Controls */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">
                  {isRtl ? 'تعديل الطبيب المسؤول (دون حظر الشبكة):' : 'Modify Assigned Clinical Lead (Zero Round-Trip):'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAssignDoctorOptimistic('doc-karim', 'Dr. Karim Al-Saeed')}
                    className="btn btn-sm btn-outline-light text-[11px] py-1 px-2.5 hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    Sync: Dr. Karim
                  </button>
                  <button
                    onClick={() => handleAssignDoctorOptimistic('doc-sarah', 'Dr. Sarah Al-Mansouri')}
                    className="btn btn-sm btn-outline-light text-[11px] py-1 px-2.5 hover:border-brand-300 hover:bg-brand-50/50"
                  >
                    Sync: Dr. Sarah
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'behavior' && <BehavioralTracker language={language} />}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Profile & Settings</h3>
                  <p className="text-xs text-slate-400 font-semibold">Manage your therapist credentials and profile image.</p>
                </div>

                {uploadError && (
                  <div className="flex items-center space-x-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-700 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-700 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span>{uploadSuccess}</span>
                  </div>
                )}

                <div className="border border-slate-100 rounded-2xl p-6 space-y-4 relative bg-slate-50/50">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">Therapist Profile</h4>
                  <div className="flex items-center space-x-4">
                    <div className="relative group w-20 h-20 flex-shrink-0">
                      {therapistUser.avatar ? (
                        <img
                          src={therapistUser.avatar}
                          alt={therapistUser.name}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl font-black text-sky-600 border border-slate-100">
                          {therapistUser.name.charAt(0)}
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                        <Plus className="w-6 h-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            if (e.target.files?.[0]) {
                              try {
                                setLoading(true);
                                setUploadError('');
                                setUploadSuccess('');
                                const res = await updateProfileAvatar(e.target.files[0]);
                                if (res.success) {
                                  therapistUser.avatar = res.data.avatar;
                                  setUploadSuccess('Profile photo updated successfully.');
                                  setDummyState(d => d + 1);
                                }
                              } catch (err: any) {
                                console.error(err);
                                setUploadError(err.message || 'Failed to upload profile photo.');
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">{therapistUser.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{therapistUser.email}</p>
                      <p className="text-xs text-sky-600 font-bold mt-1">{therapistUser.clinic || 'Clinical Behavioral Advisor'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}