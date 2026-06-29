"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smile, Brain, Target, Star, Trophy, Gamepad2, LogOut, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import DevelopmentGames from './DevelopmentGames';

interface ChildDashboardProps {
  language: Language;
  childUser: {
    name: string;
    username: string;
    age?: string | number;
    level?: string;
    gender?: string;
  };
  onLogout: () => void;
}

export default function ChildDashboard({ language, childUser, onLogout }: ChildDashboardProps) {
  const isRtl = language === 'ar';
  const [playingGame, setPlayingGame] = useState<'memory' | 'emotion' | 'bubbles' | null>(null);

  const games = [
    {
      id: 'memory',
      title: isRtl ? 'تطابق الذاكرة' : 'Memory Match',
      desc: isRtl ? 'طابق الكروت المتشابهة لتمرن ذاكرتك!' : 'Match twin cards to boost your brain focus!',
      icon: <Brain className="w-8 h-8 text-sky-500" />,
      color: 'from-sky-100 to-sky-200/50 border-sky-200 shadow-sm',
      badge: isRtl ? 'نقاط مزدوجة' : 'Double Points',
      emoji: '🧠'
    },
    {
      id: 'emotion',
      title: isRtl ? 'مستكشف المشاعر' : 'Emotion Explorer',
      desc: isRtl ? 'تعرف على تعابير وجوه أصدقائك الرائعة!' : 'Identify matching expressions on friendly faces!',
      icon: <Smile className="w-8 h-8 text-emerald-500" />,
      color: 'from-emerald-100 to-emerald-200/50 border-emerald-200 shadow-sm',
      badge: isRtl ? 'رائع وممتع' : 'Fun & Easy',
      emoji: '😊'
    },
    {
      id: 'bubbles',
      title: isRtl ? 'فرقعة الفقاعات' : 'Attention Bubbles',
      desc: isRtl ? 'فرقع الفقاعات الملونة بسرعة وانتباه!' : 'Pop the floating bubbles matching target color!',
      icon: <Target className="w-8 h-8 text-amber-500" />,
      color: 'from-amber-100 to-amber-200/50 border-amber-200 shadow-sm',
      badge: isRtl ? 'ألعاب سرعة' : 'Speed Reflex',
      emoji: '🎈'
    },
    {
      id: 'shape_sorter',
      title: isRtl ? 'فرز الأشكال' : 'Shape Sorter',
      desc: isRtl ? 'طابق الأشكال الملونة وظلالها لتدريب انتباهك!' : 'Arrange shapes by their types and shadows!',
      icon: <Star className="w-8 h-8 text-indigo-500" />,
      color: 'from-indigo-100 to-indigo-200/50 border-indigo-200 shadow-sm',
      badge: isRtl ? 'تطابق حسي' : 'Sensory Matching',
      emoji: '🔷'
    },
    {
      id: 'brain_puzzle',
      title: isRtl ? 'تركيب الأحجية' : 'Brain Puzzle',
      desc: isRtl ? 'حل القطع المتداخلة لترتيب صورة الحيوان!' : 'Solve interactive animal puzzle block positions!',
      icon: <Trophy className="w-8 h-8 text-rose-500" />,
      color: 'from-rose-100 to-rose-200/50 border-rose-200 shadow-sm',
      badge: isRtl ? 'تفكير منطقي' : 'Logical Thinking',
      emoji: '🧩'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50/50 to-white pb-16 font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100/60 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-white">
            <Gamepad2 className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight">
            AutiCare <span className="text-sky-500">{isRtl ? 'ركن الألعاب' : 'Play Corner'}</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-sky-50 border border-sky-100/50 rounded-full py-1 pl-1 pr-3">
            <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white font-black text-xs">
              {childUser.name.charAt(0)}
            </div>
            <p className="text-[10px] font-black text-slate-700 max-w-[80px] truncate">{childUser.name}</p>
          </div>
          <button onClick={onLogout} className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-8 space-y-8 select-none">
        <AnimatePresence mode="wait">
          {!playingGame ? (
            <motion.div key="hub" className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-3xl p-6 text-white relative shadow-lg text-center">
                <h2 className="text-xl sm:text-2xl font-black">{isRtl ? 'مرحباً بك في ركن الألعاب!' : 'Welcome to Play Corner!'}</h2>
                <p className="text-[11px] sm:text-xs text-sky-100 font-semibold mt-1">{isRtl ? 'دعنا نلعب بعض الألعاب الرائعة ونكسب الكثير من النجوم!' : "Let's play some super fun games and collect glowing stars!"}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">{isRtl ? 'اختر لعبتك المفضلة' : 'CHOOSE YOUR FAVORITE GAME'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {games.map((g) => (
                    <div key={g.id} className={`bg-gradient-to-b ${g.color} border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center relative`}>
                      <div className="space-y-3 flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase text-sky-700 bg-white/80 rounded-full px-2.5 py-0.5 border border-sky-100">{g.badge}</span>
                        <div className="p-3 bg-white rounded-2xl border border-slate-50 shadow-inner">{g.icon}</div>
                        <h4 className="text-sm font-black text-slate-800">{g.title}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{g.desc}</p>
                      </div>
                      <button onClick={() => setPlayingGame(g.id as any)} className="w-full mt-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1">
                        <span>Play Now</span><Star className="w-3 h-3 fill-current text-yellow-300" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="game" className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex justify-between items-center bg-white p-3 px-4 rounded-2xl border border-sky-100 shadow-sm">
                <button onClick={() => setPlayingGame(null)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-extrabold rounded-xl flex items-center gap-1 cursor-pointer">
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>{isRtl ? 'العودة لساحة الألعاب' : 'Back to Corner'}</span>
                </button>
                <span className="text-xs text-sky-600 font-black flex items-center gap-1">
                  <Gamepad2 className="w-4 h-4" />
                  {playingGame.toUpperCase()} MODE
                </span>
              </div>
              <div className="bg-white border border-sky-100 rounded-3xl p-2 shadow-md">
                <DevelopmentGames language={language} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}