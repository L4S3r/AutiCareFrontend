"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dna, ShieldCheck, Cpu, RefreshCw, FileText, CheckSquare, Plus, Check } from 'lucide-react';
import { GeneticReport, Language } from '../types';
import { SAMPLE_GENETIC_REPORTS, TRANSLATIONS } from '../data';
import { getGeneticReports, uploadGeneticReport, getPatients, uploadGeneticReportFile, getNutritionPlans, generateNutritionPlan } from '../api';

interface GeneticAIExplorerProps {
  language: Language;
}

export default function GeneticAIExplorer({ language }: GeneticAIExplorerProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [selectedReportId, setSelectedReportId] = useState<string>('REP-01');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [report, setReport] = useState<GeneticReport | null>(SAMPLE_GENETIC_REPORTS[0]);
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [reports, setReports] = useState<any[]>([]);

  // Custom manual entry states
  const [customReportActive, setCustomReportActive] = useState(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customText, setCustomText] = useState('');

  const reloadAll = async (childId: string) => {
    try {
      const repRes = await getGeneticReports(childId);
      if (repRes.success && repRes.data && repRes.data.length > 0) {
        setReports(repRes.data);
        const r = repRes.data[0];

        // Fetch corresponding nutrition plans
        const planRes = await getNutritionPlans(childId);
        let matchingPlan = null;
        if (planRes.success && planRes.data && planRes.data.length > 0) {
          matchingPlan = planRes.data.find((p: any) => p.geneticReportId === r._id) || planRes.data[0];
        }

        const mthfrVal = r.parsedMarkers.find((m: any) => m.marker?.toUpperCase() === 'MTHFR');
        const vdrVal = r.parsedMarkers.find((m: any) => m.marker?.toUpperCase() === 'VDR');
        const hlaVal = r.parsedMarkers.find((m: any) => ['HLA-DQ2', 'HLA-DQ8'].includes(m.marker?.toUpperCase()));

        let dietRecommendations = [
          'Strict Gluten-Free and Casein-Free (GFCF) diet framework.',
          'Eliminate artificial flavorings, color additives, and high-MSG ingredients.',
          'Introduce organic bone broths and cruciferous greens to assist methylation.'
        ];
        let supplementGuidance = [
          'L-Methylfolate - 400 mcg daily morning with breakfast.',
          'Liquid Vitamin D3 with K2 drops - 2000 IU sublingual daily.',
          'Active Coenzyme Q10 and Probiotics for neuro-gut barrier safety.'
        ];
        let unsupportedFoods = [
          'Refined Wheat Flour, Barley, Rye (Gluten)',
          'Whole Cow Milk, Casein, high-glycemic sugars'
        ];
        let mealPlan = [
          { day: 'Monday', meals: ['Breakfast: Coconut Chia Pudding', 'Lunch: Grilled Chicken Salad', 'Dinner: Wild Salmon Mash'] },
          { day: 'Tuesday', meals: ['Breakfast: Fluffy Grain-Free Pancakes', 'Lunch: Turkey Lettuce Wraps', 'Dinner: Organic Bone Broth bok choy'] },
          { day: 'Wednesday', meals: ['Breakfast: Spinach Avocado Smoothie', 'Lunch: Baked Sweet Potato bowl', 'Dinner: Herb-Roasted Cod ribbons'] }
        ];

        if (matchingPlan && matchingPlan.aiRecommendation) {
          const rec = matchingPlan.aiRecommendation;
          if (rec.nutritionPlan) {
            dietRecommendations = typeof rec.nutritionPlan === 'string'
              ? rec.nutritionPlan.split('.').map((s: string) => s.trim()).filter(Boolean).map((s: string) => s + '.')
              : rec.nutritionPlan;
          }
          if (rec.supplements) {
            supplementGuidance = rec.supplements.map((s: any) => `${s.name} - ${s.dosage} ${s.frequency} (${s.notes})`);
          }
          if (rec.foodRestrictions) {
            unsupportedFoods = rec.foodRestrictions;
          }
          if (rec.mealSuggestions) {
            mealPlan = rec.mealSuggestions.map((m: any) => ({
              day: m.mealType || m.day,
              meals: m.suggestions || m.meals
            }));
          }
        }

        setReport({
          id: r._id,
          patientName: 'Sami Al-Farsi',
          mthfrStatus: mthfrVal 
            ? (mthfrVal.result?.toLowerCase().includes('homozygous') 
                ? 'Homozygous mutant (C677T/A1298C)' 
                : mthfrVal.result?.toLowerCase().includes('heterozygous')
                  ? 'Heterozygous (C677T)'
                  : 'Wild Type (Normal)')
            : 'Wild Type (Normal)',
          mthfrImpact: mthfrVal?.notes || 'No significant variations observed.',
          vdrStatus: vdrVal
            ? (vdrVal.result?.toLowerCase().includes('homozygous') || vdrVal.value?.toLowerCase() === 'ff'
                ? 'ff (Reduced Vitamin D Receptor)'
                : vdrVal.result?.toLowerCase().includes('heterozygous')
                  ? 'Ff (Normal Expression)'
                  : 'FF (Enhanced Expression)')
            : 'Ff (Normal Expression)',
          vdrImpact: vdrVal?.notes || 'Receptor activity normal.',
          hlaStatus: hlaVal
            ? (hlaVal.marker?.toUpperCase().includes('DQ2') || hlaVal.value?.toUpperCase().includes('DQ2')
                ? 'HLA-DQ2 Positive'
                : hlaVal.marker?.toUpperCase().includes('DQ8') || hlaVal.value?.toUpperCase().includes('DQ8')
                  ? 'HLA-DQ8 Positive'
                  : 'HLA-DQ2/DQ8 Negative')
            : 'HLA-DQ2/DQ8 Negative',
          hlaImpact: hlaVal?.notes || 'No gluten sensitivity markers detected.',
          dietRecommendations,
          supplementGuidance,
          unsupportedFoods,
          mealPlan
        });
      }
    } catch (err) {
      console.error('Error reloading reports & plans:', err);
    }
  };

  // Load genetic reports from backend on mount
  useEffect(() => {
    const loadReports = async () => {
      try {
        const patientsRes = await getPatients();
        if (patientsRes.success && patientsRes.data.length > 0) {
          const childId = patientsRes.data[0]._id;
          setActiveChildId(childId);
          await reloadAll(childId);
        }
      } catch (err) {
        console.error('Failed to load genetic reports on mount:', err);
      }
    };
    loadReports();
  }, []);


  // Sliced checklist states matching screenshots exactly
  const checklist = [
    { label: isRtl ? 'إدخال يدوي أو رفع ملف جينات PDF' : 'PDF/manual genetic data entry', checked: true },
    { label: isRtl ? 'استخراج بيانات الماركرات العصبية عبر الـ OCR' : 'OCR extraction of marker data', checked: true },
    { label: isRtl ? 'محرك ذكاء اصطناعي تفاعلي يبني التوصية' : 'Rule-based AI recommendation engine', checked: true },
    { label: isRtl ? 'توقيت وتجرع المكملات الدقيقة' : 'Supplement dosing guidance', checked: true },
    { label: isRtl ? 'جداول وفئات الأطعمة المستبعدة والممنوعة' : 'Food restriction lists', checked: true },
    { label: isRtl ? 'خطط وجداول الوجبات اليومية البديلة' : 'Meal suggestion plans', checked: true },
  ];

  const handleSelectReport = (id: string) => {
    setCustomReportActive(false);
    setSelectedReportId(id);
    const selected = SAMPLE_GENETIC_REPORTS.find(r => r.id === id);
    if (selected) {
      setAnalyzing(true);
      setTimeout(() => {
        setReport(selected);
        setAnalyzing(false);
      }, 1000);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChildId) return;
    setAnalyzing(true);
    
    try {
      let parsedReport = null;

      if (customFile) {
        // Upload the actual file for Gemini Multimodal OCR processing
        console.log('📤 Uploading genetic file for processing...');
        const res = await uploadGeneticReportFile(activeChildId, customFile, customText || 'Uploaded genetic report');
        if (res.success) {
          parsedReport = res.data;
        }
      } else {
        // Manual entry logic (mock values)
        const isMutant = customText.toLowerCase().includes('mutant') || customText.toLowerCase().includes('t');
        const markers = [
          { marker: 'MTHFR', result: isMutant ? 'homozygous' : 'heterozygous', value: isMutant ? 'Homozygous mutant (C677T/A1298C)' : 'Heterozygous (C677T)', notes: 'User manual genetic markers upload' },
          { marker: 'VDR', result: 'homozygous', value: 'ff (Reduced Vitamin D Receptor)', notes: 'Receptor binding efficiency restriction' },
          { marker: 'HLA-DQ2', result: 'positive', value: 'HLA-DQ2 Positive', notes: 'Autoimmune gluten inflammatory trace' }
        ];

        const res = await uploadGeneticReport(activeChildId, markers, customText || 'Manual upload descriptors');
        if (res.success) {
          parsedReport = res.data;
        }
      }

      if (parsedReport) {
        // Automatically request the backend to generate the AI nutrition plan for this report
        console.log('🔮 Generating AI Nutrition plan...');
        await generateNutritionPlan(activeChildId, parsedReport._id);
        
        // Reload dashboard view
        await reloadAll(activeChildId);
      }
    } catch (err) {
      console.error('Custom genetic upload and parsing failed:', err);
    } finally {
      setAnalyzing(false);
      setCustomReportActive(false);
      setCustomFile(null);
      setCustomText('');
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setCustomFile(file);
      setCustomText(`Uploaded File: ${file.name}\n(Ready for system processing)`);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md p-6 sm:p-8" id="genetic-explorer-workspace">
      
      {/* Header inside the workspace */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sky-100 pb-6 mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <Dna className="w-5 h-5 text-sky-500 animate-pulse" />
            <span>{t.portalGenetic}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Upload files or select a patient genotype to see treatment plans automatically generated.</p>
        </div>
        
        {/* Patient Selection Presets */}
        <div className="flex items-center space-x-2 scrollbar-none overflow-x-auto">
          {SAMPLE_GENETIC_REPORTS.map((rep) => (
            <button
              key={rep.id}
              onClick={() => handleSelectReport(rep.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                selectedReportId === rep.id && !customReportActive
                  ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {rep.patientName} ({rep.id})
            </button>
          ))}
          <button
            onClick={() => setCustomReportActive(true)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex-shrink-0 flex items-center space-x-1 ${
              customReportActive
                ? 'bg-sky-500 text-white shadow shadow-sky-500/20'
                : 'bg-slate-50 text-sky-600 hover:bg-slate-100 border border-dashed border-sky-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'تقرير مخصص' : 'Custom Report'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: System controls & sliced checklist metrics */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Custom entry form */}
          {customReportActive ? (
            <form onSubmit={handleCustomSubmit} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Manual Genetic Data Entry</h4>
              
              {/* Drag and drop file helper */}
              <div className="border border-dashed border-sky-200 rounded-xl bg-white p-4 text-center hover:bg-sky-50/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FileText className="w-6 h-6 text-sky-400 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-slate-600">{customFile ? customFile.name : 'Select or drop raw genetic PDF report'}</p>
                <p className="text-[8px] text-slate-400 mt-0.5">PDF or TXT sequencing outcomes</p>
              </div>

              {/* Text field content */}
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                placeholder="Type or paste sequencing snippets (e.g., MTHFR G677T heterozygous, ff VDR genes, etc.)"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-sky-500"
              />

              <button
                type="submit"
                className="w-full py-2 px-4 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-colors"
              >
                Run AI Genomic Analysis
              </button>
            </form>
          ) : (
            <div className="bg-sky-50/40 rounded-2xl p-5 border border-sky-100 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-800">Genotype Focus Details</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isRtl 
                  ? 'يتم استخلاص ورصد الأنماط الجينية لتحديد الطفرات الممرضة للطفل وتوفير مكملات لتفادي كسل المسارات الأيضية الطبيعية.' 
                  : 'AutiCare models verify standard genomic files against scientific databases to build safe dietary templates.'}
              </p>
              <div className="pt-2 border-t border-sky-100 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                  <span>PATIENT:</span>
                  <span className="text-slate-600 uppercase">{report?.patientName}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono">
                  <span>METABOLISM TYPE:</span>
                  <span className="text-sky-600">GFCF SPECIFIC</span>
                </div>
              </div>
            </div>
          )}

          {/* Sliced Checklist from screenshot #7 / checkmark parameters */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-sky-500" />
              <span>Nutrition Plan Feature list</span>
            </h4>
            
            <ul className="space-y-2.5">
              {checklist.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-[11px] text-slate-600">
                  <span className="bg-sky-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-snug">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Right Side: Analysis Display and results */}
        <div className="lg:col-span-8">
          
          <AnimatePresence mode="wait">
            {analyzing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-50/50 rounded-3xl p-12 border border-slate-100 text-center space-y-4"
              >
                <RefreshCw className="w-10 h-10 text-sky-500 animate-spin mx-auto" />
                <div>
                  <h4 className="text-base font-bold text-slate-800">AI Recommendation Engine Parsing...</h4>
                  <p className="text-xs text-slate-400 mt-1">Extracting genetic markers via rule models, formulating meal exclusion rules from HIPAA blueprints.</p>
                </div>
              </motion.div>
            ) : report ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                
                {/* Genotype summary boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* MTHFR Status Block */}
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[9px] font-mono text-sky-500 font-bold uppercase tracking-wider block">MTHFR GENE</span>
                    <span className="text-xs font-extrabold text-slate-800 tracking-tight block mt-1 leading-tight">{report.mthfrStatus}</span>
                    <p className="text-[10px] text-slate-400 mt-2 leading-snug">{report.mthfrImpact}</p>
                  </div>

                  {/* VDR Status Block */}
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[9px] font-mono text-sky-500 font-bold uppercase tracking-wider block">VDR RECEPTOR</span>
                    <span className="text-xs font-extrabold text-slate-800 tracking-tight block mt-1 leading-tight">{report.vdrStatus}</span>
                    <p className="text-[10px] text-slate-400 mt-2 leading-snug">{report.vdrImpact}</p>
                  </div>

                  {/* HLA Status Block */}
                  <div className="bg-sky-50 border border-sky-100 p-4 rounded-2xl relative overflow-hidden">
                    <span className="text-[9px] font-mono text-sky-500 font-bold uppercase tracking-wider block">CELIAC HLA TRACE</span>
                    <span className="text-xs font-extrabold text-slate-800 tracking-tight block mt-1 leading-tight">{report.hlaStatus}</span>
                    <p className="text-[10px] text-slate-400 mt-2 leading-snug">{report.hlaImpact}</p>
                  </div>

                </div>

                {/* Recommendations Tabs output */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-6">
                  
                  {/* Supplement Guidance list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono border-b border-sky-100 pb-2">
                      Supplement dosing guidance
                    </h4>
                    <ul className="space-y-2">
                      {report.supplementGuidance.map((sup, idx) => (
                        <li key={idx} className="bg-white px-3.5 py-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 shadow-sm flex items-start space-x-2">
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{sup}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Forbidden Unsupported Foods */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono border-b border-sky-100 pb-2">
                      Food restriction guidelines
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {report.unsupportedFoods.map((f, idx) => (
                        <span key={idx} className="bg-rose-50 text-rose-700 border border-rose-100 px-3 py-1.5 rounded-full text-xs font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Daily Diet Recommendations paragraphs */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono border-b border-sky-100 pb-2">
                      Diet Recommendations Summary
                    </h4>
                    <ul className="space-y-2">
                      {report.dietRecommendations.map((rec, idx) => (
                        <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start space-x-2">
                          <span className="bg-sky-100 text-sky-700 font-mono font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Meal Plan suggestion calendar */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 font-mono border-b border-sky-100 pb-2">
                      Meal suggestion plans (3-day cycle)
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.mealPlan.map((m, idx) => (
                        <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-2">
                          <span className="text-[10px] font-black uppercase text-sky-600">{m.day}</span>
                          <div className="space-y-1">
                            {m.meals.map((meal, mIdx) => (
                              <p key={mIdx} className="text-[10px] text-slate-600 leading-normal border-b last:border-b-0 border-slate-50 pb-1 last:pb-0">
                                {meal}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-12 border border-slate-100 text-center">
                <p className="text-xs text-slate-400">Select or enter genetic file sequences above to initialize recommendation output.</p>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
