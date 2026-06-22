"use client";
import { motion } from 'motion/react';
import { Play, Sparkles, AlertCircle, TrendingUp, CheckCircle2, ChevronRight, Apple, PlayCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface HeroProps {
  language: Language;
  onOpenPortal: () => void;
  onNavigateToContact: () => void;
}

export default function Hero({ language, onOpenPortal, onNavigateToContact }: HeroProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-sky-50/20 py-16 lg:py-24" id="home-section">
      
      {/* Background SVG wavy dotted curves from screenshot #1 and #14 */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="absolute w-[150%] h-full opacity-30 text-sky-400" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Wave 1 */}
          <path 
            d="M-100,250 C300,450 600,100 1100,300 C1300,380 1500,200 1600,150" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeDasharray="8 8" 
            fill="none" 
          />
          {/* Wave 2 */}
          <path 
            d="M-50,600 C400,450 700,750 1200,500 C1400,400 1550,550 1650,520" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeDasharray="6 6" 
            fill="none" 
          />
          {/* Dotted circle vectors */}
          <circle cx="120" cy="180" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" fill="none" />
          <circle cx="1320" cy="520" r="70" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" fill="none" />
          {/* Dots clusters */}
          <g fill="currentColor" opacity="0.4">
            <circle cx="80" cy="620" r="3" />
            <circle cx="100" cy="610" r="3" />
            <circle cx="120" cy="630" r="3" />
            <circle cx="94" cy="640" r="3.5" />
            <circle cx="140" cy="625" r="2.5" />
            <circle cx="1380" cy="220" r="3" />
            <circle cx="1395" cy="240" r="2.5" />
            <circle cx="1410" cy="210" r="3.5" />
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero text panel */}
          <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
            
            {/* AI badge */}
            <div className={`inline-flex items-center space-x-2 bg-sky-50 text-sky-700 px-4 py-1.5 rounded-full text-xs font-semibold self-center lg:self-start border border-sky-100 shadow-sm ${isRtl ? 'space-x-reverse' : ''}`}>
              <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
              <span>{isRtl ? 'الذكاء الوراثي والتنبؤ السلوكي' : 'Genetic AI & Behavioral Prediction'}</span>
            </div>

            {/* Primary Headline Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              {t.heroTitle}
            </h1>

            {/* Sub-headline slogan */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {t.heroSub}
            </p>

            {/* CTAs */}
            <div className={`flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
              <button
                onClick={onOpenPortal}
                className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-lg shadow-sky-400/20 hover:shadow-sky-400/40 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
                id="hero-launch-portal-btn"
              >
                <span>{language === 'en' ? 'Launch Care Simulator' : 'تشغيل بوابة المحاكاة'}</span>
                <ChevronRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={onNavigateToContact}
                className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                id="hero-book-demo-btn"
              >
                <PlayCircle className="w-5 h-5 text-sky-400" />
                <span>{t.bookDemo}</span>
              </button>
            </div>

            {/* App download section from images */}
            <div className="pt-6 border-t border-slate-100/80 flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 justify-center lg:justify-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t.downloadApp}:
              </span>
              <div className="flex items-center space-x-3">
                {/* Google Play Mock */}
                <div className="flex items-center space-x-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors">
                  <Play className="w-4 h-4 text-sky-400 fill-sky-400" />
                  <div className="text-left font-sans">
                    <p className="text-[9px] uppercase tracking-wide text-slate-400 font-medium">Get it on</p>
                    <p className="text-xs font-semibold tracking-tight -mt-0.5">Google Play</p>
                  </div>
                </div>
                {/* App Store Mock */}
                <div className="flex items-center space-x-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-sm cursor-pointer hover:bg-slate-800 transition-colors">
                  <Apple className="w-4 h-4 text-slate-100" />
                  <div className="text-left font-sans">
                    <p className="text-[9px] uppercase tracking-wide text-slate-400 font-medium">Download on the</p>
                    <p className="text-xs font-semibold tracking-tight -mt-0.5">App Store</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust banner illustration quote block */}
            <div className="bg-sky-50/50 border border-sky-100/50 rounded-2xl p-4 flex items-start space-x-3 text-left mt-4 max-w-xl mx-auto lg:mx-0">
              <span className="text-4xl text-sky-400 font-serif leading-none">“</span>
              <p className="text-xs text-sky-900/80 italic font-medium pt-1">
                {t.quoteText}
              </p>
            </div>

          </div>

          {/* Graphical Care Team / AI Robot vector representation */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-gradient-to-tr from-sky-400/10 to-blue-500/10 p-6 flex items-center justify-center border border-sky-100/50 shadow-inner">
              
              {/* Spinning orbiting orbits */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border border-dashed border-sky-200 pointer-events-none"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-12 rounded-full border border-dotted border-blue-200 pointer-events-none"
              />

              {/* Floating DNA / nutrient icons representing AutiCare's genetic AI science */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-8 left-12 w-12 h-12 rounded-full bg-white shadow-md border border-sky-100 flex items-center justify-center text-sky-500 text-xs font-bold"
                title="MTHFR"
              >
                MTHFR
              </motion.div>
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-10 left-8 w-11 h-11 rounded-full bg-white shadow-md border border-sky-100 flex items-center justify-center text-cyan-500 text-xs font-bold"
                title="VDR"
              >
                VDR
              </motion.div>
              <motion.div 
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-16 right-8 w-12 h-12 rounded-full bg-white shadow-md border border-sky-100 flex items-center justify-center text-blue-500 text-xs font-bold"
                title="HLA-DQ"
              >
                HLA
              </motion.div>

              {/* Interactive Child & Robot Illustration Graphic (pure SVG-CSS craft for instant loading) */}
              <div className="relative w-[85%] h-[85%] bg-white/70 backdrop-blur-sm rounded-2xl border border-sky-100/50 shadow-md p-4 flex flex-col justify-between overflow-hidden">
                
                {/* Header title inside widget */}
                <div className="flex justify-between items-center border-b border-sky-100 pb-2.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">AutiCare Active Engine</span>
                  </div>
                  <span className="text-[9px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-mono">SYSTEM SAFE (HIPAA)</span>
                </div>

                {/* Vector graphics of Kid and Companion Robot */}
                <div className="flex-1 flex items-center justify-between px-2 py-6">
                  {/* Human Child placeholder avatar */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center overflow-hidden">
                      {/* Avatar design */}
                      <svg className="w-14 h-14 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-700">Sami (Patient)</span>
                  </div>

                  {/* Connected visual pulses */}
                  <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <div className="w-full flex justify-between px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    </div>
                    <div className="h-[2px] w-full bg-sky-200 relative my-2">
                      <motion.div 
                        animate={{ left: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute top-[-2px] w-2 h-2 rounded-full bg-blue-500" 
                      />
                    </div>
                    <span className="text-[8px] font-mono text-slate-400 text-center uppercase tracking-wide">Sync 256-bit</span>
                  </div>

                  {/* Healthy caring companion robot */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-sky-400 flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                      {/* Robot eyes screen */}
                      <div className="w-[85%] h-[40%] bg-sky-950 rounded-md border border-sky-700/80 flex items-center justify-center space-x-1.5">
                        <motion.span 
                          animate={{ scaleY: [1, 0.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1] }}
                          className="w-3 h-2 rounded-full bg-sky-400 inline-block" 
                        />
                        <motion.span 
                          animate={{ scaleY: [1, 0.1, 1] }} 
                          transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1] }}
                          className="w-3 h-2 rounded-full bg-sky-400 inline-block" 
                        />
                      </div>
                      <div className="mt-1 w-5 h-1.5 bg-sky-500/50 rounded-full animate-pulse" />
                      {/* Antenna */}
                      <div className="absolute top-0 w-1 h-3 bg-sky-400" />
                      <div className="absolute top-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-700">AutiCare AI Bot</span>
                  </div>
                </div>

                {/* Interactive metrics footer inside the widget */}
                <div className="bg-sky-50 rounded-xl p-2 border border-sky-100 flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-[8px] text-slate-400 uppercase font-bold">Methylation</p>
                    <p className="text-xs font-bold text-sky-600 font-mono">Metafolin+</p>
                  </div>
                  <div className="h-6 w-[1px] bg-sky-200" />
                  <div className="text-center flex-1">
                    <p className="text-[8px] text-slate-400 uppercase font-bold">GI Intestinal</p>
                    <p className="text-xs font-bold text-emerald-600 font-mono">94% Safe</p>
                  </div>
                  <div className="h-6 w-[1px] bg-sky-200" />
                  <div className="text-center flex-1">
                    <p className="text-[8px] text-slate-400 uppercase font-bold">Meltdown Risk</p>
                    <p className="text-xs font-bold text-slate-700 font-mono">15% Low</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Purpose block under the fold (Built with Purpose, Driven by Science) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-16 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-sky-600 font-extrabold text-sm uppercase tracking-wider">
            {t.purposeTitle}
          </p>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {language === 'en' ? 'Grounded in Evidence & Medical Empathy' : 'قائم على الدليل الطبي والتعاطف الإنساني'}
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            {t.purposeText}
          </p>
        </div>

        {/* Mission and Vision Grid from screenshot #1 and #12 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Mission Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-8 border border-sky-100 hover:border-sky-300 shadow-md transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-sky-400" />
            <h3 className="text-2xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.missionTitle}</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {t.missionDesc}
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl p-8 border border-sky-100 hover:border-sky-300 shadow-md transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
            <h3 className="text-2xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.visionTitle}</h3>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {t.visionDesc}
            </p>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
