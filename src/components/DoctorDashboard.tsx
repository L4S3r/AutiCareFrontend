"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope, Users, Calendar, Clock, LogOut, CheckCircle2,
  Dna, Heart, ArrowRight, ShieldCheck, FileText, Settings,
  Activity, Sparkles, ChevronRight, UserPlus, ChevronLeft,
  Wand2, Check, AlertCircle, FilePlus
} from 'lucide-react';
import { Language } from '../types';
import { getPatients, getGeneticReports, generateNutritionPlan, approveNutritionPlan, getNutritionPlans } from '../api';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'genetic'>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // 系統數據流狀態
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [geneticReport, setGeneticReport] = useState<any | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<any | null>(null);

  // 各種操作按鈕的 Loading 狀態
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const stats = [
    { label: isRtl ? 'إجمالي المرضى' : 'Total Active Cases', value: patientsList.length.toString() || '24', icon: <Users className="w-5 h-5 text-sky-500" /> },
    { label: 'Pending Approvals', value: '3', icon: <Clock className="w-5 h-5 text-amber-500" /> },
    { label: 'System Schema', value: 'Secure', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> }
  ];

  // 初始化載入患者清單
  useEffect(() => {
    const fetchPatientsData = async () => {
      try {
        setLoadingPatients(true);
        const res = await getPatients();
        if (res.success && res.data) {
          setPatientsList(res.data);
        }
      } catch (err) {
        console.error("Error retrieving case documents:", err);
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatientsData();
  }, []);

  // 當醫生點擊特定患者時，讀取其基因報告與現有營養計畫
  const handleInspectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setGeneticReport(null);
    setNutritionPlan(null);
    setDoctorNotes('');

    try {
      // 獲取該兒童的基因報告
      const reportRes = await getGeneticReports(patient._id || patient.id);
      if (reportRes.success && reportRes.data && reportRes.data.length > 0) {
        setGeneticReport(reportRes.data[0]);

        // 獲取現有的營養計畫
        const planRes = await getNutritionPlans(patient._id || patient.id);
        if (planRes.success && planRes.data && planRes.data.length > 0) {
          setNutritionPlan(planRes.data[0]);
          if (planRes.data[0].doctorNotes) setDoctorNotes(planRes.data[0].doctorNotes);
        }
      }
    } catch (err) {
      console.error("Error logging contextual metadata:", err);
    }
  };

  // 呼叫 Gemini 自動提取突變並生成微量元素與餐單配置
  const handleTriggerAIEngine = async () => {
    if (!selectedPatient || !geneticReport) return;
    try {
      setIsGenerating(true);
      const res = await generateNutritionPlan(selectedPatient._id || selectedPatient.id, geneticReport._id || geneticReport.id);
      if (res.success) {
        setNutritionPlan(res.data);
        setActionSuccess('Genomic plan drafted successfully by Gemini 2.5 Flash!');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error("AI Generation execution failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 醫生審查完畢，簽章批准計畫並同步給家長
  const handleApprovePlan = async () => {
    if (!nutritionPlan) return;
    try {
      setIsApproving(true);
      const res = await approveNutritionPlan(nutritionPlan._id || nutritionPlan.id, doctorNotes, {});
      if (res.success) {
        setNutritionPlan(res.data);
        setActionSuccess('Nutrition metrics signed and synchronized to parent device token!');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      console.error("Authorization failed:", err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">

      {/* RESPONSIVE SIDEBAR */}
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
          </nav>
        </div>

        <button onClick={onLogout} className="w-full py-2 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-black flex items-center justify-center gap-2">
          <LogOut className="w-3.5 h-3.5" />
          {!sidebarCollapsed && <span>LOGOUT</span>}
        </button>
      </aside>

      {/* CORE HUB STAGE */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
        <div className="p-6 md:p-8 space-y-6 text-left">
          <div className="border-b border-slate-200/80 pb-4">
            <h2 className="text-xl font-black text-slate-800">Welcome, Dr. {doctorUser.name}</h2>
            <p className="text-xs text-slate-400 font-semibold">{doctorUser.clinic || 'Autism Care & Genetic Advisor'}</p>
          </div>

          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" /><span>{actionSuccess}</span>
            </div>
          )}

          {activeTab === 'dashboard' && !selectedPatient && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                    <div><span className="text-[10px] uppercase font-bold text-slate-400">{s.label}</span><p className="text-xl font-black text-slate-800">{s.value}</p></div>
                    <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl">{s.icon}</div>
                  </div>
                ))}
              </div>

              {/* Patient Registry list */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-4">Assigned Cases</h3>
                {loadingPatients ? (
                  <div className="p-6 text-center text-slate-400 text-xs">Querying database users registry...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-100 font-black text-slate-400 uppercase">
                          <th className="pb-2">Name</th>
                          <th className="pb-2">ASD Level</th>
                          <th className="pb-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientsList.map((p) => (
                          <tr key={p._id || p.id} className="border-b border-slate-50 text-slate-600">
                            <td className="py-3 font-bold text-slate-800">{p.name}</td>
                            <td className="py-3"><span className="bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-full">{p.asdLevel || 'level1'}</span></td>
                            <td className="py-3 text-right">
                              <button onClick={() => handleInspectPatient(p)} className="px-2.5 py-1 bg-slate-100 border border-slate-200 hover:bg-sky-500 hover:text-white rounded-lg transition-colors text-[10px] font-bold cursor-pointer">Inspect Case & Nutrition</button>
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

          {/* INSPECT PATIENT MODE (INCLUDES FULL NUTRITIONAL MANAGEMENT ENGINE) */}
          {selectedPatient && (
            <div className="space-y-6">
              {/* Header Context Bar */}
              <div className="flex justify-between items-center bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                <div>
                  <h3 className="text-base font-black text-slate-800">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">Diagnostic Scale: {selectedPatient.asdLevel?.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="px-3 py-1.5 bg-slate-50 border text-slate-600 text-xs font-bold rounded-xl cursor-pointer">Back to Directory</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Block 1: Genetic Markers Status */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-sky-800 border-b pb-2 flex items-center space-x-2">
                    <Dna className="w-4 h-4 text-sky-500" />
                    <span>DNA Screening Reports</span>
                  </h4>
                  {geneticReport ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs font-semibold text-slate-700">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Source Target File</p>
                        <p className="font-mono text-slate-800">{geneticReport.reportFileName || 'saliva_sequencing_dump.pdf'}</p>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {geneticReport.parsedMarkers?.map((m: any, i: number) => (
                          <div key={i} className="p-2.5 border rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <span className="font-black text-slate-800 block">{m.marker}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{m.notes || 'No extracted notes.'}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-black text-[9px] uppercase">{m.result}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-xs">No parsed biomarkers file currently online for this entity.</div>
                  )}
                </div>

                {/* Block 2: AI Recommendation Controller / Draft Editor */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 border-b pb-2 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Genomic Nutrition Orchestrator</span>
                    </h4>

                    {geneticReport && !nutritionPlan && (
                      <div className="p-6 text-center space-y-3">
                        <p className="text-xs text-slate-400 font-medium">A verified genetic report exists. Trigger the AI models to build a dietary cofactor matrix.</p>
                        <button onClick={handleTriggerAIEngine} disabled={isGenerating} className="px-4 py-2 bg-sky-500 text-white text-xs font-black rounded-xl hover:bg-sky-600 transition-colors cursor-pointer flex items-center justify-center mx-auto gap-1.5">
                          <Wand2 className="w-4 h-4" />
                          <span>{isGenerating ? 'Gemini processing algorithms...' : 'Generate AI Nutrition Plan'}</span>
                        </button>
                      </div>
                    )}

                    {nutritionPlan && (
                      <div className="space-y-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
                          <span className="text-[9px] font-black text-slate-400 block uppercase">AI Supplement Summary Plan</span>
                          <p className="font-semibold text-slate-600 truncate">
                            {nutritionPlan.aiRecommendation?.supplements?.map((s: any) => s.name).join(', ') || 'No cofactors generated.'}
                          </p>
                        </div>

                        {/* Doctor edits field block */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Physician Approval Notes & Exclusions</label>
                          <textarea value={doctorNotes} onChange={(e) => setDoctorNotes(e.target.value)} placeholder="Type clinical overrides, titration adjustments, or meal guidelines for the parent view..." className="w-full p-2 h-20 bg-slate-50 border rounded-xl font-medium outline-none resize-none" />
                        </div>
                      </div>
                    )}

                    {!geneticReport && (
                      <div className="p-8 border border-dashed rounded-2xl text-center text-slate-400 text-xs">AI pipeline dormant until a clinical DNA payload is processed via OCR.</div>
                    )}
                  </div>

                  {nutritionPlan && (
                    <button onClick={handleApprovePlan} disabled={isApproving || nutritionPlan.status === 'approved'} className={`w-full py-2.5 text-xs font-black tracking-wider uppercase rounded-xl flex items-center justify-center gap-1.5 transition-colors ${nutritionPlan.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer'}`}>
                      <Check className="w-4 h-4" />
                      <span>{nutritionPlan.status === 'approved' ? 'Plan Approved & Live' : isApproving ? 'Signing Plan Data...' : 'Approve & Sync Plan to Parent'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}