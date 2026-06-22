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
      icon: <Brain className="w-8 h-8 text-sky-500 animate-pulse" />,
      color: 'from-sky-100 to-sky-200/50 border-sky-200 hover:shadow-sky-200/50',
      badge: isRtl ? 'نقاط مزدوجة' : 'Double Points',
      emoji: '🧠'
    },
    {
      id: 'emotion',
      title: isRtl ? 'مستكشف المشاعر' : 'Emotion Explorer',
      desc: isRtl ? 'تعرف على تعابير وجوه أصدقائك الرائعة!' : 'Identify matching expressions on friendly faces!',
      icon: <Smile className="w-8 h-8 text-emerald-500 animate-bounce" />,
      color: 'from-emerald-100 to-emerald-200/50 border-emerald-200 hover:shadow-emerald-200/50',
      badge: isRtl ? 'رائع وممتع' : 'Fun & Easy',
      emoji: '😊'
    },
    {
      id: 'bubbles',
      title: isRtl ? 'فرقعة الفقاعات' : 'Attention Bubbles',
      desc: isRtl ? 'فرقع الفقاعات الملونة بسرعة وانتباه!' : 'Pop the floating bubbles matching target color!',
      icon: <Target className="w-8 h-8 text-amber-500" />,
      color: 'from-amber-100 to-amber-200/50 border-amber-200 hover:shadow-amber-200/50',
      badge: isRtl ? 'ألعاب سرعة' : 'Speed Reflex',
      emoji: '🎈'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-cyan-50/50 to-white pb-16 font-sans">
      
      {/* 1. PLAYFUL PROFILE HEADER BAR */}
      <header className="bg-white/80 backdrop-blur-md border-b border-sky-100/60 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        
        {/* Play Corner Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-white shadow shadow-sky-400/30">
            <Gamepad2 className="w-5 h-5 animate-spin-slow" />
          </div>
          <span className="text-sm font-black text-slate-800 tracking-tight">
            AutiCare <span className="text-sky-500">{isRtl ? 'ركن الألعاب' : 'Play Corner'}</span>
          </span>
        </div>

        {/* Profile Card & Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-sky-50 border border-sky-100/50 rounded-full py-1 pl-1 pr-3 shadow-inner">
            <div className="w-7 h-7 rounded-full bg-sky-500 border border-white flex items-center justify-center text-white font-black text-xs">
              {childUser.name.charAt(0)}
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-700 truncate max-w-[80px]">{childUser.name}</p>
              <p className="text-[8px] font-bold text-sky-600 uppercase tracking-widest">{isRtl ? 'بطل خارق' : 'Super Kid'}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors cursor-pointer"
            title={isRtl ? 'تسجيل الخروج' : 'Logout'}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN HUB CONTENT */}
      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-8 select-none">
        
        <AnimatePresence mode="wait">
          {!playingGame ? (
            <motion.div
              key="game-selection-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Cute Banners */}
              <div className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-sky-300/20 text-center">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                
                <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider border border-white/10">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>{isRtl ? 'مرحباً بك في عالمنا السعيد!' : 'WELCOME TO OUR HAPPY SPACE!'}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black">{isRtl ? 'مرحباً بك في ركن الألعاب!' : 'Welcome to Play Corner!'}</h2>
                  <p className="text-[11px] sm:text-xs text-sky-100 font-semibold">{isRtl ? 'دعنا نلعب بعض الألعاب الرائعة ونكسب الكثير من النجوم!' : "Let's play some super fun games and collect glowing stars!"}</p>
                </div>
              </div>

              {/* Games Grid */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                  {isRtl ? 'اختر لعبتك المفضلة' : 'CHOOSE YOUR FAVORITE GAME'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {games.map((g) => (
                    <motion.div
                      key={g.id}
                      whileHover={{ y: -6 }}
                      className={`bg-gradient-to-b ${g.color} border rounded-3xl p-6 shadow hover:shadow-lg transition-all duration-300 flex flex-col justify-between items-center text-center relative overflow-hidden`}
                    >
                      <span className="absolute -top-2 -right-2 text-7xl opacity-10 pointer-events-none select-none">
                        {g.emoji}
                      </span>
                      
                      <div className="space-y-3.5 flex flex-col items-center">
                        <span className="text-xs font-black uppercase text-sky-700 bg-white/80 border border-sky-100 rounded-full px-3 py-1 shadow-sm">
                          {g.badge}
                        </span>
                        
                        <div className="p-3.5 rounded-2xl bg-white border border-slate-100/50 shadow-inner">
                          {g.icon}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-black text-slate-800">{g.title}</h4>
                          <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">{g.desc}</p>
                        </div>
                      </div>

                      <div className="w-full pt-6">
                        <button
                          onClick={() => setPlayingGame(g.id as any)}
                          className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs tracking-wider transition-colors shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center space-x-1"
                        >
                          <span>{isRtl ? 'العب الآن' : 'Play Now'}</span>
                          <Star className="w-3.5 h-3.5 fill-current text-yellow-300 ml-1 animate-pulse" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Learning stats summary for kid */}
              <div className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3.5 text-left">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{isRtl ? 'سجل الأبطال اليومي' : 'Daily Champion Board'}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{isRtl ? 'العب بانتظام لتحقق لقب النجم الساطع' : 'Keep playing to keep your shiny star streak alive!'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 font-black text-xs text-amber-500">
                  <Star className="w-4 h-4 fill-current animate-bounce" />
                  <span>{isRtl ? '٥ نجوم متبقية' : '5 Stars Earned'}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game-stage-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Back to Corner control */}
              <div className="flex justify-between items-center bg-white p-4 px-5 rounded-2xl border border-sky-100 shadow-sm">
                <button
                  onClick={() => setPlayingGame(null)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-extrabold rounded-xl border border-slate-200 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>{isRtl ? 'العودة لساحة الألعاب' : 'Back to Play Corner'}</span>
                </button>

                <div className="flex items-center space-x-1.5 text-xs text-sky-600 font-black">
                  <Gamepad2 className="w-4 h-4 animate-spin-slow" />
                  <span>
                    {playingGame === 'memory' ? (isRtl ? 'تطابق الذاكرة' : 'Memory Match') :
                     playingGame === 'emotion' ? (isRtl ? 'مستكشف المشاعر' : 'Emotion Explorer') :
                     (isRtl ? 'فرقعة الفقاعات' : 'Attention Bubbles')}
                  </span>
                </div>
              </div>

              {/* Game Stage Sandbox Container */}
              <div className="bg-white border border-sky-100 rounded-3xl p-2.5 shadow-md">
                <DevelopmentGames language={language} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

    </div>
  );
}
