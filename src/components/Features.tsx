"use client";
import { motion } from 'motion/react';
import { 
  Dna, LineChart, Users2, ShieldAlert, BrainCircuit, Activity, 
  UserPlus, FileBadge, ArrowUpRight, CheckCircle2, FileHeart, Sliders
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface FeaturesProps {
  language: Language;
  onOpenPortal: () => void;
}

export default function Features({ language, onOpenPortal }: FeaturesProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const problems = [
    { title: t.probCard1Title, desc: t.probCard1Desc, bg: 'bg-indigo-50/50', icon: Users2, border: 'border-indigo-100', color: 'text-indigo-600' },
    { title: t.probCard2Title, desc: t.probCard2Desc, bg: 'bg-emerald-50/50', icon: Dna, border: 'border-emerald-100', color: 'text-emerald-600' },
    { title: t.probCard3Title, desc: t.probCard3Desc, bg: 'bg-amber-50/50', icon: ShieldAlert, border: 'border-amber-100', color: 'text-amber-600' },
    { title: t.probCard4Title, desc: t.probCard4Desc, bg: 'bg-rose-50/50', icon: Sliders, border: 'border-rose-100', color: 'text-rose-600' }
  ];

  const solutions = [
    { title: t.solCard1Title, desc: t.solCard1Desc, icon: Dna, accent: 'bg-sky-500', textAccent: 'text-sky-600' },
    { title: t.solCard2Title, desc: t.solCard2Desc, icon: LineChart, accent: 'bg-blue-500', textAccent: 'text-blue-600' },
    { title: t.solCard3Title, desc: t.solCard3Desc, icon: Users2, accent: 'bg-indigo-500', textAccent: 'text-indigo-600' },
    { title: t.solCard4Title, desc: t.solCard4Desc, icon: BrainCircuit, accent: 'bg-purple-500', textAccent: 'text-purple-600' },
    { title: t.solCard5Title, desc: t.solCard5Desc, icon: Activity, accent: 'bg-pink-500', textAccent: 'text-pink-600' },
    { title: t.solCard6Title, desc: t.solCard6Desc, icon: FileBadge, accent: 'bg-emerald-500', textAccent: 'text-emerald-600' }
  ];

  return (
    <div id="features-section" className="relative py-16 lg:py-24 bg-white">
      
      {/* 1. THE PROBLEM SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-rose-500 font-extrabold text-sm uppercase bg-rose-50 px-3.5 py-1.5 rounded-full tracking-wider">
            {t.problemHeader}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {isRtl ? 'المشكلة الحالية' : 'The Problem'}
          </h2>
          <p className="text-sm font-semibold text-slate-500 italic">
            {t.problemSub}
          </p>
          <p className="text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            {t.problemText}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((prob, idx) => {
            const Icon = prob.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-2xl border ${prob.border} ${prob.bg} transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className={`p-2.5 rounded-xl bg-white w-fit shadow-sm`}>
                    <Icon className={`w-5 h-5 ${prob.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">{prob.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{prob.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. OUR SOLUTION SECTION */}
      <div className="bg-gradient-to-b from-sky-50/40 via-sky-50/20 to-white py-20 border-t border-sky-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-black font-extrabold text-sm uppercase bg-white border border-slate-200 px-3.5 py-1.5 rounded-full tracking-wider">
              {t.solutionHeader}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRtl ? 'حلولنا المبتكرة' : 'Our Solution'}
            </h2>
            <p className="text-sm font-semibold text-slate-500 italic">
              {t.solutionSub}
            </p>
            <p className="text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t.solutionText}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  onClick={onOpenPortal}
                  className="bg-white rounded-2xl p-8 border border-sky-100 hover:border-sky-300 hover:shadow-xl transition-all duration-300 relative group cursor-pointer"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl ${sol.accent} bg-opacity-10 ${sol.textAccent} transition-all duration-300 group-hover:bg-opacity-20`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{sol.title}</h3>
                        <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{sol.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>

      {/* 3. OUR IMPACT METRIC CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-16">
          <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.impactTitle}</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest font-mono">AutiCare Clinical Effectiveness</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          <div className="bg-sky-50/50 border border-sky-100 p-6 rounded-2xl flex flex-col justify-between text-center min-h-[160px]">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>500+</span>
            <p className="text-sm font-bold text-slate-700 mt-2">{isRtl ? 'طفل مدعوم ومتابع' : 'Children Supported'}</p>
            <div className="w-12 h-1.5 bg-sky-400 rounded-full mx-auto mt-4" />
          </div>

          <div className="bg-sky-50/50 border border-sky-100 p-6 rounded-2xl flex flex-col justify-between text-center min-h-[160px]">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>10</span>
            <p className="text-sm font-bold text-slate-700 mt-2">{isRtl ? 'مؤشرات جينات محللة' : 'Genetic Markers Analysed'}</p>
            <div className="w-12 h-1.5 bg-blue-400 rounded-full mx-auto mt-4" />
          </div>

          <div className="bg-sky-50/50 border border-sky-100 p-6 rounded-2xl flex flex-col justify-between text-center min-h-[160px]">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>40+</span>
            <p className="text-sm font-bold text-slate-700 mt-2">{isRtl ? 'عيادة ومستشفى تفاعلي' : 'Clinics Using AutiCare'}</p>
            <div className="w-12 h-1.5 bg-indigo-400 rounded-full mx-auto mt-4" />
          </div>

          <div className="bg-sky-50/50 border border-sky-100 p-6 rounded-2xl flex flex-col justify-between text-center min-h-[160px]">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>98%</span>
            <p className="text-sm font-bold text-slate-700 mt-2">{isRtl ? 'نسبة موافقة أخصائيين' : 'Physician Approval Rate'}</p>
            <div className="w-12 h-1.5 bg-emerald-400 rounded-full mx-auto mt-4" />
          </div>

        </div>
      </div>

      {/* 4. WORKFLOW SECTION */}
      <div className="bg-slate-50 border-y border-slate-100 py-20 relative overflow-hidden">
        
        {/* Wavy line behind workflow */}
        <div className="absolute top-[60%] left-0 right-0 h-1 bg-sky-200/50 border-b border-dashed border-sky-200 z-0 invisible lg:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-black font-extrabold text-xs uppercase tracking-wider bg-white shadow-sm px-4 py-1.5 rounded-full border border-slate-200">
              AutiCare Systems
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isRtl ? 'خطوات العمل ومسار الرعاية' : 'Workflow'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl mx-auto">
              {t.workflowSub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4">
              <span className="text-4xl font-black text-sky-100 font-mono">01</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t.wfStep1}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Accepts standard saliva or cheek swab sequencing PDFs.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4">
              <span className="text-4xl font-black text-sky-100 font-mono">02</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t.wfStep2}</h4>
                <p className="text-[11px] text-slate-400 mt-1">OCR automatically identifies SNP variations without typing errors.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4">
              <span className="text-4xl font-black text-sky-100 font-mono">03</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t.wfStep3}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Cross-references verified scientific genome literature databases.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4">
              <span className="text-4xl font-black text-sky-100 font-mono">04</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t.wfStep4}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Enables clinicians to customize milligram dosage and meal exclusions.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4">
              <span className="text-4xl font-black text-sky-100 font-mono">05</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t.wfStep5}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Generates encrypted, downloadable clinical plans for authorization.</p>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start space-x-4">
              <span className="text-4xl font-black text-sky-100 font-mono">06</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t.wfStep6}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Instant updates inside parent portal with meal triggers and alerts.</p>
              </div>
            </div>

          </div>

          {/* Quick Sandbox Trigger CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={onOpenPortal}
              className="inline-flex items-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl shadow transition-all cursor-pointer text-xs uppercase tracking-wider"
              id="features-quick-test-btn"
            >
              <span>{isRtl ? 'افتح بوابة محاكاة الجينات والتغذية' : 'Test AI Genetic & Meal Engine'}</span>
              <FileHeart className="w-4 h-4 text-white" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
