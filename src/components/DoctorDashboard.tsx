"use client";
import React, { useState, useEffect } from 'react';
import {
  Stethoscope, Users, Calendar, Clock, LogOut, CheckCircle2,
  Dna, Heart, ArrowRight, ShieldCheck, FileText, Settings,
  Activity, Sparkles, ChevronRight, UserPlus, ChevronLeft,
  Wand2, Check, AlertCircle, Plus, Upload
} from 'lucide-react';
import { Language } from '../types';
import { getPatients, getGeneticReports, generateNutritionPlan, approveNutritionPlan, getNutritionPlans, updateProfileAvatar } from '../api';

interface DoctorDashboardProps {
  language: Language;
  doctorUser: {
    name: string;
    email: string;
    clinic?: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export default function DoctorDashboard({ language, doctorUser, onLogout }: DoctorDashboardProps) {
  const isRtl = language === 'ar';
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'genetic' | 'settings'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [dummyState, setDummyState] = useState(0);

  // Identity Provisioning Data States
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [geneticReport, setGeneticReport] = useState<any | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);

  // Progress Flow Loading states
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [clinicalError, setClinicalError] = useState('');

  const stats = [
    { label: 'Active Case Profiles', value: patientsList.length.toString() || '24', icon: <Users className="w-5 h-5 text-sky-500" /> },
    { label: 'Pending Approvals', value: '3', icon: <Clock className="w-5 h-5 text-amber-500" /> },
    { label: 'HIPAA Validation', value: 'Compliant', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> }
  ];

  useEffect(() => {
    const fetchPatientsData = async () => {
      try {
        setLoadingPatients(true);
        const res = await getPatients();
        if (res.success && res.data) {
          setPatientsList(res.data);
        }
      } catch (err) {
        console.error("Error retrieving baseline user records:", err);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatientsData();
  }, []);

  const handleInspectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setGeneticReport(null);
    setNutritionPlan(null);
    setDoctorNotes('');

    try {
      const reportRes = await getGeneticReports(patient._id || patient.id);
      if (reportRes.success && reportRes.data && reportRes.data.length > 0) {
        setGeneticReport(reportRes.data[0]);

        const planRes = await getNutritionPlans(patient._id || patient.id);
        if (planRes.success && planRes.data && planRes.data.length > 0) {
          setNutritionPlan(planRes.data[0]);
          if (planRes.data[0].doctorNotes) setDoctorNotes(planRes.data[0].doctorNotes);
        }
      }
    } catch (err) {
      console.error("Error connecting with downstream database fields:", err);
    }
  };

  const handleTriggerAIEngine = async () => {
    if (!selectedPatient || !geneticReport) return;
    try {
      setIsGenerating(true);
      const res = await generateNutritionPlan(selectedPatient._id || selectedPatient.id, geneticReport._id || geneticReport.id);
      if (res.success) {
        setNutritionPlan(res.data);
        setActionSuccess('Genomic cofactor metrics compiled successfully by Gemini!');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error("AI execution layout error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!nutritionPlan) return;

    // ─── Clinical Safety Gate ─────────────────────────────────────────────────
    // Block approval if the doctor has typed adjustments but the note is too
    // short to constitute a proper clinical justification (< 15 chars).
    if (doctorNotes.trim().length > 0 && doctorNotes.trim().length < 15) {
      setClinicalError(
        'Clinical justification is too brief. Please provide at least 15 characters describing the override rationale before approving.'
      );
      return;
    }
    setClinicalError('');

    // Build structured override payload from the physician's typed notes
    const doctorEdits = doctorNotes.trim().length > 0
      ? { overrideNotes: doctorNotes.trim(), adjustedAt: new Date().toISOString() }
      : {};

    try {
      setIsApproving(true);
      const res = await approveNutritionPlan(nutritionPlan._id || nutritionPlan.id, doctorNotes, doctorEdits);
      if (res.success) {
        setNutritionPlan(res.data);
        setClinicalError('');
        setActionSuccess('Nutrition plan approved and synced to parental notification channels.');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Signature process aborted:', err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* SIDEBAR NAVIGATION BLOCK */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50`}>
        <div className="space-y-8">
          <div className="flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2.5 animate-fade-in">
                {doctorUser.avatar ? (
                  <img src={doctorUser.avatar} alt="Doctor" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base">D</div>
                )}
                <span className="text-sm font-black text-white tracking-tight">AutiCare <span className="text-sky-400">Doctor</span></span>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 mx-auto cursor-pointer transition-colors">
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          <nav className="flex flex-col space-y-1.5">
            <button onClick={() => { setActiveTab('dashboard'); setSelectedPatient(null); }} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'dashboard' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Activity className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Clinical Hub</span>}
            </button>
            <button onClick={() => { setActiveTab('settings'); setSelectedPatient(null); }} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'settings' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
              <Settings className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>Profile Settings</span>}
            </button>
          </nav>
        </div>

        <button onClick={onLogout} className="w-full py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
          <LogOut className="w-3.5 h-3.5" />
          {!sidebarCollapsed && <span>LOGOUT</span>}
        </button>
      </aside>

      {/* WORKSPACE HUB */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6 md:p-8 space-y-6 text-left select-none">
          <div className="border-b pb-4">
            <h2 className="text-xl font-black text-slate-800">Welcome, Dr. {doctorUser.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">{doctorUser.clinic || 'Autism Specialty Care & Clinical Telemetry Advisor'}</p>
          </div>

          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" /><span>{actionSuccess}</span>
            </div>
          )}

          {activeTab === 'dashboard' && !selectedPatient && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div><span className="text-[10px] uppercase font-bold text-slate-400">{s.label}</span><p className="text-xl font-black text-slate-800 mt-0.5">{s.value}</p></div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">{s.icon}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">Assigned Cases Directory</h3>
                {loadingPatients ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-mono">Running secure HIPAA context queries...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100 font-black text-slate-400 uppercase tracking-wider"><th>Patient Name</th><th>ASD Classification Scale</th><th className="text-right">Action Gateway</th></tr>
                      </thead>
                      <tbody className="text-slate-600 font-semibold">
                        {patientsList.map((p) => (
                          <tr key={p._id || p.id} className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors">
                            <td className="py-3 font-bold text-slate-800">{p.name}</td>
                            <td><span className="bg-sky-50 text-sky-600 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase">{p.asdLevel || 'level1'}</span></td>
                            <td className="text-right">
                              <button onClick={() => handleInspectPatient(p)} className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 hover:bg-sky-500 hover:text-white rounded-lg transition-all text-[10px] font-black cursor-pointer">Inspect Case & Nutrition</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EXPANDED PATIENT MEDICAL INSPECTOR PANEL */}
          {selectedPatient && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <div>
                  <h3 className="text-base font-black text-slate-800">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">Diagnostic Severity Index: {selectedPatient.asdLevel?.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="px-3 py-1.5 bg-slate-50 border text-slate-600 text-xs font-black rounded-xl cursor-pointer transition-colors hover:bg-slate-100">Back to Directory</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel Left: DNA Polymorphisms Extraction */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 border-b pb-2 flex items-center space-x-2"><Dna className="w-4 h-4 text-sky-500" /><span>Biomarker PDF Mappings</span></h4>
                  {geneticReport ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs font-semibold"><p className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Source Sequence Metadata</p><p className="font-mono text-slate-800 truncate">{geneticReport.reportFileName || 'dna_saliva_dump.pdf'}</p></div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {geneticReport.parsedMarkers?.map((m: any, i: number) => (
                          <div key={i} className="p-2.5 border border-slate-100 rounded-xl flex justify-between items-center text-xs bg-slate-50/40">
                            <div><span className="font-black text-slate-800 block">{m.marker}</span><span className="text-[10px] text-slate-400 font-medium">{m.notes || 'Biomarker variant aligned.'}</span></div>
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-black text-[9px] uppercase">{m.result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-xs bg-slate-50/50">No processed DNA sequence document maps exist for this record profile.</div>
                  )}
                </div>

                {/* Panel Right: Plan Generator and Compliance Signer */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 border-b pb-2 flex items-center space-x-2"><Sparkles className="w-4 h-4 text-emerald-500" /><span>Dietary Rule Orchestrator</span></h4>

                    {geneticReport && !nutritionPlan && (
                      <div className="p-6 text-center space-y-3">
                        <p className="text-xs text-slate-400 font-medium">Extracted mutations are online. Trigger the Generative AI models to construct a cyclic dietary plan framework.</p>
                        <button onClick={handleTriggerAIEngine} disabled={isGenerating} className="px-4 py-2 bg-sky-500 text-white text-xs font-black rounded-xl hover:bg-sky-600 transition-colors cursor-pointer flex items-center gap-1.5 shadow shadow-sky-500/10">
                          <Wand2 className="w-4 h-4" /><span>{isGenerating ? 'Gemini executing OCR arrays...' : 'Compile AI Framework Plan'}</span>
                        </button>
                      </div>
                    )}

                    {nutritionPlan && (
                      <div className="space-y-4 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1"><span className="text-[9px] font-black text-slate-400 block uppercase">Supplement Cofactor Matrix Summary</span><p className="font-semibold text-slate-600 truncate">{nutritionPlan.aiRecommendation?.supplements?.map((s: any) => s.name).join(', ') || 'No supplements compiled.'}</p></div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Specialist Clinical Overrides &amp; Notes</label>
                          <textarea
                            value={doctorNotes}
                            onChange={(e) => { setDoctorNotes(e.target.value); if (clinicalError) setClinicalError(''); }}
                            placeholder="Type custom overrides, exclusions, or titration dosage requirements for the parent dashboard view container..."
                            className="w-full p-2.5 h-20 bg-slate-50 border rounded-xl font-medium outline-none resize-none focus:border-brand-500 transition-colors"
                          />
                          {/* ── Clinical Safety Alert ── */}
                          {clinicalError && (
                            <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-300 rounded-xl animate-pulse">
                              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                              <p className="text-[11px] font-bold text-red-700 leading-snug">{clinicalError}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {!geneticReport && (
                      <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-xs bg-slate-50/50">Plan generation array dormant until a clinical DNA screening file is mapped.</div>
                    )}
                  </div>

                  {nutritionPlan && (
                    <button onClick={handleApprovePlan} disabled={isApproving || nutritionPlan.status === 'approved'} className={`w-full py-2.5 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors ${nutritionPlan.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow shadow-emerald-500/10 cursor-pointer'}`}>
                      <Check className="w-4 h-4" /><span>{nutritionPlan.status === 'approved' ? 'Plan Signed & Active' : isApproving ? 'Authorizing Signatures...' : 'Approve & Release to Parent'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-800">Profile & Settings</h3>
                  <p className="text-xs text-slate-400 font-semibold">Manage your doctor credentials and profile image.</p>
                </div>

                <div className="border border-slate-100 rounded-2xl p-6 space-y-4 relative bg-slate-50/50">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">Clinical Profile</h4>
                  <div className="flex items-center space-x-4">
                    <div className="relative group w-20 h-20 flex-shrink-0">
                      {doctorUser.avatar ? (
                        <img
                          src={doctorUser.avatar}
                          alt={doctorUser.name}
                          className="w-20 h-20 rounded-2xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-sky-50 flex items-center justify-center text-3xl font-black text-sky-600 border border-slate-100">
                          {doctorUser.name.charAt(0)}
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
                                const res = await updateProfileAvatar(e.target.files[0]);
                                if (res.success) {
                                  doctorUser.avatar = res.data.avatar;
                                  setDummyState(d => d + 1);
                                }
                              } catch (err: any) {
                                console.error(err);
                              } finally {
                                setLoading(false);
                              }
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-700">Dr. {doctorUser.name}</p>
                      <p className="text-xs text-slate-400 font-medium">{doctorUser.email}</p>
                      <p className="text-xs text-sky-600 font-bold mt-1">{doctorUser.clinic || 'Autism Specialty Care'}</p>
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