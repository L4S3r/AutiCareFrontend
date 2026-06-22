"use client";
import { motion } from 'motion/react';
import { Languages, ShieldCheck, HeartPulse, Menu, X, Rocket } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { useState } from 'react';

interface NavigationProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenPortal: () => void;
  currentUser?: any;
  onLogout?: () => void;
}

export default function Navigation({
  language,
  setLanguage,
  currentTab,
  setCurrentTab,
  onOpenPortal,
  currentUser,
  onLogout
}: NavigationProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'features', label: t.navFeatures },
    { id: 'pricing', label: t.navPricing },
    { id: 'contact', label: t.navContact }
  ];

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    // Adjust document body direction
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo element with circular motif matching screenshots */}
          <div 
            onClick={() => { 
              if (currentUser) {
                setCurrentTab('portal');
              } else {
                setCurrentTab('home'); 
              }
              setMobileMenuOpen(false); 
            }}
            className="flex items-center space-x-3 cursor-pointer select-none group focus:outline-none"
            id="logo-container"
          >
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-sky-400/80 mix-blend-multiply filter blur-[0.5px]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500/85 mix-blend-multiply filter blur-[0.5px]" />
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-300/70 mix-blend-multiply filter blur-[0.5px]" />
            </div>
            <span className={`text-2xl font-bold tracking-tight text-slate-800 group-hover:text-sky-600 transition-colors ${isRtl ? 'mr-3' : 'ml-2'}`}>
              {t.brandName}
            </span>
          </div>

          {/* Desktop Navigation Links (Always Visible) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-8">
            <div className={`flex items-center space-x-6 lg:space-x-8 ${isRtl ? 'space-x-reverse' : ''}`}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`text-sm font-medium transition-all duration-200 relative py-1 px-1 focus:outline-none cursor-pointer ${
                    currentTab === item.id 
                      ? 'text-sky-600 font-semibold' 
                      : 'text-slate-600 hover:text-sky-500'
                  }`}
                  id={`nav-link-${item.id}`}
                >
                  {item.label}
                  {currentTab === item.id && (
                    <motion.div 
                      layoutId="nav-underline" 
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Actions panel */}
          <div className={`hidden md:flex items-center space-x-4 ${isRtl ? 'space-x-reverse' : ''}`}>
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-50 rounded-full transition-all border border-slate-200 cursor-pointer"
              title="Switch Language"
              id="lang-toggle-btn"
            >
              <Languages className="w-4 h-4 text-slate-500" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {currentUser ? (
              <>
                {/* Return to Portal Button if browsing landing page */}
                {currentTab !== 'portal' && (
                  <button
                    onClick={onOpenPortal}
                    className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold text-white rounded-full group bg-gradient-to-br from-sky-400 to-blue-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-sky-200 cursor-pointer"
                    id="header-demo-portal-btn"
                  >
                    <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-slate-900 group-hover:bg-opacity-0 rounded-full flex items-center space-x-1.5">
                      <Rocket className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
                      <span>{t.navPlatform}</span>
                    </span>
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-5 py-2.5 rounded-full shadow transition-all duration-200 cursor-pointer"
                  id="header-logout-btn"
                >
                  {isRtl ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
              </>
            ) : (
              <>
                {/* Quick Demo portal launcher */}
                <button
                  onClick={onOpenPortal}
                  className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold text-white rounded-full group bg-gradient-to-br from-sky-400 to-blue-600 hover:text-white focus:ring-4 focus:outline-none focus:ring-sky-200 cursor-pointer"
                  id="header-demo-portal-btn"
                >
                  <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-slate-900 group-hover:bg-opacity-0 rounded-full flex items-center space-x-1.5">
                    <Rocket className="w-3.5 h-3.5 text-sky-400 group-hover:text-white" />
                    <span>{t.navPlatform}</span>
                  </span>
                </button>

                {/* Sign in and sign up hooks */}
                <button 
                  onClick={() => setCurrentTab('login')} 
                  className="text-xs font-semibold text-slate-600 hover:text-sky-600 px-3 py-2 cursor-pointer"
                  id="header-login-btn"
                >
                  {t.login}
                </button>
                <button 
                  onClick={() => setCurrentTab('signup')} 
                  className="text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-full shadow-sm transition-all duration-200 cursor-pointer"
                  id="header-signup-btn"
                >
                  {t.signUp}
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center space-x-3">
            {currentUser ? (
              <button
                onClick={onLogout}
                className="text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 px-4 py-2 rounded-full shadow transition-all duration-200 cursor-pointer"
                id="header-logout-btn-mobile"
              >
                {isRtl ? 'خروج' : 'Sign Out'}
              </button>
            ) : (
              <>
                <button
                  onClick={toggleLanguage}
                  className="p-1 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200 flex items-center space-x-1"
                  id="lang-toggle-mobile"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'AR' : 'EN'}</span>
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 focus:outline-none text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  id="mobile-menu-hamburger"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Mobile drawer drop */}
      {!currentUser && mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-slate-100 bg-white shadow-inner px-4 pt-2 pb-6 space-y-3"
          id="mobile-menu-drawer"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left py-2 px-3 text-base font-medium rounded-lg ${
                currentTab === item.id 
                  ? 'bg-sky-55 text-sky-600 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-55'
              }`}
              id={`mobile-nav-${item.id}`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2.5">
            <button
              onClick={() => {
                onOpenPortal();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold py-2.5 px-4 rounded-full text-sm shadow flex items-center justify-center space-x-2 cursor-pointer"
              id="mobile-portal-btn"
            >
              <Rocket className="w-4 h-4 text-white" />
              <span>{t.navPlatform}</span>
            </button>
            <div className="flex justify-between items-center px-3 pt-2">
              <button 
                onClick={() => { setCurrentTab('contact'); setMobileMenuOpen(false); }}
                className="text-sm font-semibold text-slate-600"
              >
                {t.login}
              </button>
              <button 
                onClick={() => { setCurrentTab('signup'); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-full cursor-pointer"
              >
                {t.signUp}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
