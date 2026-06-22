"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Calendar, AlertCircle, Sparkles, Plus, Check, FileDown, Eye, CheckSquare } from 'lucide-react';
import { DailyBehaviorLog, Language } from '../types';
import { INITIAL_BEHAVIOR_LOGS, TRANSLATIONS } from '../data';
import { getBehaviorLogs, createBehaviorLog, getAIPrediction, getPatients } from '../api';

interface BehavioralTrackerProps {
  language: Language;
}

export default function BehavioralTracker({ language }: BehavioralTrackerProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [logs, setLogs] = useState<DailyBehaviorLog[]>(INITIAL_BEHAVIOR_LOGS);
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [loadingPrediction, setLoadingPrediction] = useState<boolean>(false);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  
  // Todays input form values
  const [formDate, setFormDate] = useState('2026-06-22');
  const [formMood, setFormMood] = useState<'excellent' | 'good' | 'neutral' | 'unsettled' | 'distressed'>('good');
  const [formSleepHours, setFormSleepHours] = useState(8);
  const [formMeltdowns, setFormMeltdowns] = useState<'none' | 'mild' | 'moderate' | 'severe'>('none');
  const [formMedication, setFormMedication] = useState(true);
  const [formNotes, setFormNotes] = useState('');

  // Selected hover day in chart
  const [activeHoverIdx, setActiveHoverIdx] = useState<number | null>(6);

  // Load child profile and behavioral logs on load
  useEffect(() => {
    const initTracker = async () => {
      try {
        const patientsRes = await getPatients();
        if (patientsRes.success && patientsRes.data.length > 0) {
          const childId = patientsRes.data[0]._id;
          setActiveChildId(childId);
          
          // Fetch logs
          const logsRes = await getBehaviorLogs(childId);
          if (logsRes.success && logsRes.data.length > 0) {
            const mapped = logsRes.data.map((l: any) => ({
              id: l._id,
              date: l.date.split('T')[0],
              mood: l.mood === 'happy' ? 'good' : l.mood === 'neutral' ? 'neutral' : 'unsettled',
              sleepHours: l.sleepHours,
              mealsLogged: ['breakfast', 'lunch', 'dinner'],
              meltdownSeverity: l.meltdownSeverity || 'none',
              medicationCompliance: l.medication && l.medication[0] ? l.medication[0].taken : true,
              notes: l.notes,
              meltdownRiskScore: l.aiRiskScore || 15
            })).reverse(); // Sort chronological for the SVG chart
            setLogs(mapped);
            setActiveHoverIdx(mapped.length - 1);
          }

          // Fetch prediction
          setLoadingPrediction(true);
          const predRes = await getAIPrediction(childId, language);
          if (predRes.success) {
            setPredictionData(predRes.data);
            if (predRes.data && predRes.data.riskScore >= 70) {
              setShowRiskModal(true);
            }
          }
          setLoadingPrediction(false);
        }
      } catch (err) {
        console.error('Error loading behavioral tracker data:', err);
      }
    };
    initTracker();
  }, [language]);


  // Lists from screenshots #8 and #9
  const analyticsChecklist = [
    { label: isRtl ? 'استمارات وجداول تدوين السلوك اليومية' : 'Daily behavior log forms', checked: true },
    { label: isRtl ? 'رسوم ومؤشرات الاتجاهات لـ 7 أيام' : '7-day trend charts', checked: true },
    { label: isRtl ? 'رصد وتحليل نمط الانهيار السلوكي' : 'Meltdown pattern analysis', checked: true },
    { label: isRtl ? 'متابعة جودة ومقاييس فترات النوم' : 'Sleep quality tracking', checked: true },
    { label: isRtl ? 'توثيق الالتزام بالمكملات والمذيبات' : 'Medication compliance logging', checked: true },
    { label: isRtl ? 'تصدير وتحميل التقارير الطبية الكاملة' : 'Downloadable report', checked: true },
  ];

  const predictionChecklist = [
    { label: isRtl ? 'رصد درجات حتمية الأزمة السلوكية (0-100)' : 'Meltdown risk scoring (0-100)', checked: true },
    { label: isRtl ? 'التنبؤ باضطرابات وصعوبات النوم' : 'Sleep issue prediction', checked: true },
    { label: isRtl ? 'إرسال إنذارات حتمية التراجع السلوكي' : 'Regression risk alerts', checked: true },
    { label: isRtl ? 'مقترحات آلية للتدخل السريع والاستباق' : 'Automated intervention suggestions', checked: true },
    { label: isRtl ? 'إشعارات الإنذار المبكر الفورية لمقدمي الخدمة' : 'Early warning notifications', checked: true },
    { label: isRtl ? 'نافذة تنبؤية مستقبلية صالحة لـ 7 أيام كاملة' : '7-day predictive window', checked: true },
  ];

  // Submit today's behavior log
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;

    try {
      let dbMood = 'neutral';
      if (formMood === 'excellent') dbMood = 'very_happy';
      else if (formMood === 'good') dbMood = 'happy';
      else if (formMood === 'unsettled') dbMood = 'anxious';
      else if (formMood === 'distressed') dbMood = 'angry';

      const logData = {
        childId: activeChildId,
        date: new Date(formDate),
        mood: dbMood,
        sleepHours: Number(formSleepHours),
        sleepQuality: formSleepHours >= 8 ? 'excellent' : formSleepHours >= 6 ? 'good' : 'poor',
        meltdownSeverity: formMeltdowns,
        meltdowns: formMeltdowns === 'none' ? 0 : formMeltdowns === 'mild' ? 1 : formMeltdowns === 'moderate' ? 2 : 3,
        medication: [{ name: 'Metafolin', taken: formMedication }],
        notes: formNotes || 'User logged daily behavioral stats.',
      };

      const createRes = await createBehaviorLog(logData);
      
      if (createRes.success) {
        setLoadingPrediction(true);
        const predRes = await getAIPrediction(activeChildId, language);
        if (predRes.success) {
          setPredictionData(predRes.data);
          if (predRes.data && predRes.data.riskScore >= 70) {
            setShowRiskModal(true);
          }
        }
        
        const logsRes = await getBehaviorLogs(activeChildId);
        if (logsRes.success && logsRes.data.length > 0) {
          const mapped = logsRes.data.map((l: any) => ({
            id: l._id,
            date: l.date.split('T')[0],
            mood: l.mood === 'happy' || l.mood === 'very_happy' ? 'good' : l.mood === 'neutral' ? 'neutral' : 'unsettled',
            sleepHours: l.sleepHours,
            mealsLogged: ['breakfast', 'lunch', 'dinner'],
            meltdownSeverity: l.meltdownSeverity || 'none',
            medicationCompliance: l.medication && l.medication[0] ? l.medication[0].taken : true,
            notes: l.notes,
            meltdownRiskScore: l.aiRiskScore || 15
          })).reverse();
          setLogs(mapped);
          setActiveHoverIdx(mapped.length - 1);
        }
        setLoadingPrediction(false);
      }

      setFormNotes('');
      const parts = formDate.split('-');
      const nextDayNum = Number(parts[2]) + 1;
      setFormDate(`${parts[0]}-${parts[1]}-${nextDayNum < 10 ? '0' + nextDayNum : nextDayNum}`);
    } catch (err) {
      console.error('Failed to add behavior log:', err);
    }
  };


  // SVG dimensions for the 7-day trend chart
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates for risk score points (0 to 100)
  const getPoints = () => {
    return logs.map((log, idx) => {
      const x = paddingLeft + (idx / (logs.length - 1)) * chartWidth;
      // Invert Y coordinate because SVG 0 is top
      const y = paddingTop + chartHeight - (log.meltdownRiskScore / 100) * chartHeight;
      return { x, y, ...log };
    });
  };

  const points = getPoints();
  const activeLog = activeHoverIdx !== null && logs[activeHoverIdx] ? logs[activeHoverIdx] : logs[logs.length - 1];

  // Logic to calculate warnings
  const isHighRisk = activeLog?.meltdownRiskScore > 65;

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md p-6 sm:p-8" id="behavioral-tracker-workspace">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sky-100 pb-6 mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <LineChart className="w-5 h-5 text-sky-500" />
            <span>{t.portalBehavior}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Log behaviors to see predictive meltdown scoring update. AI alerts help prevent crises.</p>
        </div>
        
        {/* Helper report trigger */}
        <button
          onClick={() => alert('Download requested. Generating encrypted medical clinical behavioral trend report (PDF)...')}
          className="px-4 py-2 border border-slate-200 hover:border-sky-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <FileDown className="w-4 h-4 text-sky-500" />
          <span>{isRtl ? 'تحميل ملف التقرير' : 'Download Complete Report'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Col 1: Today's behavior logger */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleAddLog} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Log Daily Parameters</h4>

            {/* Date Picker */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Select Log Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none"
              />
            </div>

            {/* Sleep Hours Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase font-mono">
                <span>Sleep duration</span>
                <span className="text-sky-600 font-mono font-bold text-[11px]">{formSleepHours} hrs</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={formSleepHours}
                onChange={(e) => setFormSleepHours(Number(e.target.value))}
                className="w-full h-1.5 bg-sky-100 rounded-lg appearance-none cursor-pointer accent-sky-600"
              />
            </div>

            {/* Mood selection */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono block">Patient Mood State</label>
              <div className="grid grid-cols-5 gap-1 pt-1">
                {(['excellent', 'good', 'neutral', 'unsettled', 'distressed'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFormMood(m)}
                    className={`p-1.5 rounded-lg text-lg text-center border capitalize transition-all focus:outline-none cursor-pointer ${
                      formMood === m
                        ? 'bg-sky-500 border-sky-600 text-white font-bold scale-105'
                        : 'bg-white border-slate-200 hover:border-sky-200'
                    }`}
                    title={m}
                  >
                    {m === 'excellent' ? '😊' : m === 'good' ? '🙂' : m === 'neutral' ? '😐' : m === 'unsettled' ? '😟' : '😫'}
                  </button>
                ))}
              </div>
            </div>

            {/* Meltdown severity */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">Meltdown Severity today</label>
              <select
                value={formMeltdowns}
                onChange={(e: any) => setFormMeltdowns(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs outline-none cursor-pointer"
              >
                <option value="none">None / Steady focus</option>
                <option value="mild">Mild stimming / easily calmed</option>
                <option value="moderate">Moderate tantrums / sensory trigger</option>
                <option value="severe">Severe meltdown / intense crisis</option>
              </select>
            </div>

            {/* Medication toggling */}
            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3">
              <span className="text-xs font-bold text-slate-600">Supplements taken according to formula?</span>
              <button
                type="button"
                onClick={() => setFormMedication(!formMedication)}
                className={`w-9 h-5 rounded-full relative transition-colors ${formMedication ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${formMedication ? 'left-4.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Notes description text */}
            <div className="space-y-1">
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Log secondary descriptors (e.g., highly focused at play, minor sensory agitation...)"
                rows={2}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-colors shadow shadow-sky-400/20"
            >
              Add Metrics To 7-Day Model
            </button>

          </form>
        </div>

        {/* Col 2: High-impact analytical graph & Interactive Early Alert display */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Custom SVG Graph representing 7 day tracking */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-sky-50 pb-2.5">
              <div>
                <span className="text-xs font-black text-slate-800 block">{t.alertRiskTitle}</span>
                <span className="text-[9px] font-medium text-slate-400 block">{t.alertRiskSub}</span>
              </div>
              <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${isHighRisk ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-sky-50 text-sky-700 border border-sky-100'}`}>
                {activeLog ? `${isRtl ? 'اليوم المحدد:' : 'Focused Day:'} ${activeLog.date}` : ''}
              </span>
            </div>

            {/* Embedded interactive SVG chart */}
            <div className="relative overflow-visible">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
                
                {/* Horizontal threshold zones (Green, Yellow, Red) */}
                {/* Red zone */}
                <rect x={paddingLeft} y={paddingTop} width={chartWidth} height={chartHeight * 0.35} fill="#fecdd3" opacity="0.25" />
                {/* Yellow zone */}
                <rect x={paddingLeft} y={paddingTop + chartHeight * 0.35} width={chartWidth} height={chartHeight * 0.35} fill="#fef3c7" opacity="0.25" />
                {/* Green zone */}
                <rect x={paddingLeft} y={paddingTop + chartHeight * 0.70} width={chartWidth} height={chartHeight * 0.30} fill="#d1fae5" opacity="0.2" />

                {/* Grid guidelines */}
                <line x1={paddingLeft} y1={paddingTop} x2={width - paddingRight} y2={paddingTop} stroke="#f1f5f9" strokeWidth="1" />
                <line x1={paddingLeft} y1={paddingTop + chartHeight * 0.35} x2={width - paddingRight} y2={paddingTop + chartHeight * 0.35} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={paddingLeft} y1={paddingTop + chartHeight * 0.70} x2={width - paddingRight} y2={paddingTop + chartHeight * 0.70} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                <line x1={paddingLeft} y1={paddingTop + chartHeight} x2={width - paddingRight} y2={paddingTop + chartHeight} stroke="#475569" strokeWidth="1.5" />

                {/* Y Axis labels */}
                <text x={paddingLeft - 8} y={paddingTop + 4} textAnchor="end" className="text-[9px] font-bold font-mono fill-rose-500">100</text>
                <text x={paddingLeft - 8} y={paddingTop + chartHeight * 0.35 + 4} textAnchor="end" className="text-[9px] font-bold font-mono fill-amber-500">65</text>
                <text x={paddingLeft - 8} y={paddingTop + chartHeight * 0.70 + 4} textAnchor="end" className="text-[9px] font-bold font-mono fill-emerald-500">30</text>
                <text x={paddingLeft - 8} y={paddingTop + chartHeight + 4} textAnchor="end" className="text-[9px] font-bold font-mono fill-slate-400">0</text>

                {/* Drawn trend line for the rolling risk score coordinates */}
                <path
                  d={points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points circles overlay */}
                {points.map((p, idx) => (
                  <g key={idx} className="cursor-pointer group" onClick={() => setActiveHoverIdx(idx)}>
                    {/* Hover halo pulse */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={activeHoverIdx === idx ? 9 : 5}
                      className="fill-sky-400/30 font-bold hover:fill-sky-400/50 transition-all"
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={ activeHoverIdx === idx ? 5.5 : 3.5 }
                      className="fill-sky-600 stroke-white stroke-2 group-hover:fill-sky-800 transition-all animate-none"
                    />
                    {/* X axis short dates ticks label */}
                    <text
                      x={p.x}
                      y={paddingTop + chartHeight + 16}
                      textAnchor="middle"
                      className={`text-[8px] font-black font-mono transition-colors ${
                        activeHoverIdx === idx ? 'fill-sky-600 font-extrabold' : 'fill-slate-400'
                      }`}
                    >
                      {p.date.split('-')[2]}
                    </text>
                  </g>
                ))}

              </svg>
            </div>

            {/* Diagnostic readout below the interactive curve */}
            {activeLog && (
              <div className="bg-sky-50/50 rounded-xl p-3.5 border border-sky-100 flex items-center justify-between space-x-3">
                <div className="space-y-1 select-none">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-sky-500 block">SENSORY COMPLIANCE READOUT</span>
                  <p className="text-xs text-slate-700 leading-normal font-medium">{activeLog.notes}</p>
                </div>
                <div className="text-center bg-white border border-sky-100 p-2 rounded-xl flex-shrink-0 min-w-[70px]">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block font-mono">CRISIS INDEX</span>
                  <span className={`text-base font-black font-mono tracking-tight block leading-none mt-1 ${
                    activeLog.meltdownRiskScore > 65 ? 'text-rose-600 animate-pulse' : 'text-sky-600'
                  }`}>
                    {activeLog.meltdownRiskScore}/100
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Interactive triggering warning component matching screenshots */}
          <AnimatePresence mode="wait">
            {loadingPrediction ? (
              <motion.div
                key="loading-pred"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 bg-sky-50/50 border border-sky-100 rounded-3xl text-center flex items-center justify-center space-x-2 text-sky-700"
              >
                <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold font-mono">AutiCare AI Analyzing Trends...</span>
              </motion.div>
            ) : predictionData ? (
              <motion.div
                key="ai-pred-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-5 rounded-3xl space-y-3 relative overflow-hidden shadow-sm border ${
                  predictionData.riskScore > 50
                    ? 'bg-rose-50 border-rose-100 text-rose-800'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                }`}
              >
                <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-2 h-full ${predictionData.riskScore > 50 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <div className="flex items-center space-x-2">
                  {predictionData.riskScore > 50 ? (
                    <>
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping flex-shrink-0" />
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <h4 className="text-xs font-black uppercase tracking-wider font-mono">{t.earlyWarning}</h4>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Sensory Calibration System Normal</h4>
                    </>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed font-semibold">
                  {predictionData.message}
                </p>
                {predictionData.interventions && predictionData.interventions.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/40 space-y-1">
                    <span className="text-[9px] font-mono font-bold block uppercase tracking-wider">AI Quick Actions:</span>
                    <ul className="list-disc list-inside text-[10px] space-y-0.5">
                      {predictionData.interventions.slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx} className="font-semibold">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : isHighRisk ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 bg-rose-50 border border-rose-100 rounded-3xl space-y-3 relative overflow-hidden shadow-sm"
              >
                <div className="absolute top-0 right-0 w-2 h-full bg-rose-500" />
                <div className="flex items-center space-x-2 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping flex-shrink-0" />
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono">{t.earlyWarning}</h4>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed font-semibold">
                  {t.triggerAlert}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 bg-sky-50 border border-sky-100 rounded-3xl space-y-2 relative overflow-hidden"
              >
                <div className="flex items-center space-x-2 text-sky-700">
                  <Sparkles className="w-4 h-4 text-sky-500 flex-shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Sensory Calibration System Normal</h4>
                </div>
                <p className="text-[11px] text-sky-600 leading-relaxed font-semibold">
                  {t.triggerCalm}
                </p>
              </motion.div>
            )}
          </AnimatePresence>


        </div>

        {/* Col 3: Bullet feature checklist display from screenshots */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sliced Checklist #1 */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Behavioral Analytics check</h4>
            <ul className="space-y-2.5">
              {analyticsChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-[11px] text-slate-600">
                  <span className="bg-sky-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sliced Checklist #2 */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">Prediction Engine check</h4>
            <ul className="space-y-2.5">
              {predictionChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-[11px] text-slate-600">
                  <span className="bg-sky-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Real-time High Risk Alert Modal */}
      <AnimatePresence>
        {showRiskModal && predictionData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            id="high-risk-alert-modal"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border border-rose-100 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full overflow-hidden relative text-left"
            >
              {/* Top Warning Banner Stripe */}
              <div className="absolute top-0 inset-x-0 h-2 bg-rose-500" />
              
              <div className="flex items-center space-x-3 text-rose-600 mb-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-slate-800 uppercase font-mono">
                    {isRtl ? 'تحذير: مؤشر خطورة مرتفع للأزمة' : 'CRITICAL MELTDOWN RISK DETECTED'}
                  </h3>
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider font-mono">
                    {isRtl ? 'تحليل سلوكي فوري بالذكاء الاصطناعي' : 'Real-time AI Behavioral Analysis'}
                  </p>
                </div>
              </div>

              {/* Score Display Card */}
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block font-mono">
                    {isRtl ? 'درجة الخطورة المتوقعة' : 'AI PREDICTIVE CRISIS SCORE'}
                  </span>
                  <span className="text-xs text-rose-600 font-semibold block mt-0.5">
                    {isRtl ? 'بناءً على السجلات الأخيرة والمدخلات الحيوية' : 'Based on latest parameters and biometric regressions'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black font-mono text-rose-600 leading-none block">
                    {predictionData.riskScore}%
                  </span>
                  <span className="text-[8px] font-mono font-black bg-rose-600 text-white px-2 py-0.5 rounded-full mt-1.5 inline-block">
                    {isRtl ? 'خطر حرج' : 'CRITICAL ZONE'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-slate-700 uppercase font-mono mb-1">{isRtl ? 'ملخص التقييم السلوكي:' : 'Behavioral Assessment Summary:'}</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-xl p-3.5 font-medium max-h-48 overflow-y-auto">
                  {predictionData.message}
                </p>
              </div>

              {/* Quick Interventions */}
              {predictionData.interventions && predictionData.interventions.length > 0 && (
                <div className="mb-6 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">
                    {isRtl ? 'التدخلات العاجلة الموصى بها:' : 'Recommended Immediate Interventions:'}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
                    {predictionData.interventions.map((item: string, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-slate-700 font-medium hover:bg-rose-50/20 hover:border-rose-100 transition-colors">
                        <CheckSquare className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex space-x-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md shadow-rose-500/20 cursor-pointer text-center"
                >
                  {isRtl ? 'تطبيق وإغلاق التنبيه' : 'Acknowledge & Implement'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  className="py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold rounded-xl text-xs uppercase transition-colors cursor-pointer"
                >
                  {isRtl ? 'إغلاق مؤقت' : 'Close'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
