"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dna, LineChart, Users, Lock, Smile, Sparkles, BookOpen, AlertCircle,
  ArrowRight, ShieldCheck, HeartPulse, Activity, Languages, Info, CheckCircle2
} from 'lucide-react';

// Types and Translation Data
import { Language, UserRole } from '../types';
import { TRANSLATIONS } from '../data';

// Modular Workspace Components
import Navigation from './Navigation';
import Hero from './Hero';
import Features from './Features';
import Pricing from './Pricing';
import Contact from './Contact';
import SignUp from './SignUp';
import Login from './Login';
import Legal from './Legal';
import ChildDashboard from './ChildDashboard';
import ParentDashboard from './ParentDashboard';
import DoctorDashboard from './DoctorDashboard';
import TherapistDashboard from './TherapistDashboard';
import AdminDashboard from './AdminDashboard';
import HelpDesk from './HelpDesk';
import Footer from './Footer';
import Testimonials from './Testimonials';
import { register, login, getMe, logout, getPatients, createPatient, syncVerificationStatus, resendVerificationEmail } from '../api';

const formatChildProfile = (dbChild: any) => {
  if (!dbChild) return null;

  let level = 'Level 1';
  if (dbChild.asdLevel === 'level2') level = 'Level 2';
  else if (dbChild.asdLevel === 'level3') level = 'Level 3';
  else if (dbChild.asdLevel) {
    const cleaned = dbChild.asdLevel.replace(/\s+/g, '').toLowerCase();
    if (cleaned === 'level2') level = 'Level 2';
    else if (cleaned === 'level3') level = 'Level 3';
  } else if (dbChild.level) {
    level = dbChild.level;
  }

  const formattedName = dbChild.name ? dbChild.name.trim().replace(/\s+/g, '_').toLowerCase() : 'child';
  const childUsername = dbChild.username || `${formattedName}_user`;

  return {
    ...dbChild,
    name: dbChild.name,
    username: childUsername,
    age: dbChild.calculatedAge || dbChild.age || '6',
    level: level,
    gender: dbChild.gender ? (dbChild.gender.charAt(0).toUpperCase() + dbChild.gender.slice(1)) : 'Male'
  };
};

interface ChildOnboardingWizardProps {
  language: Language;
  onSuccess: (child: any) => void;
  onLogout: () => void;
}

function ChildOnboardingWizard({ language, onSuccess, onLogout }: ChildOnboardingWizardProps) {
  const isRtl = language === 'ar';
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [asdLevel, setAsdLevel] = useState('level1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) {
      setError(isRtl ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await createPatient({
        name,
        dateOfBirth: dob,
        gender,
        asdLevel,
      });
      if (res.success && res.data) {
        onSuccess(formatChildProfile(res.data));
      } else {
        setError(res.error || 'Failed to create child profile');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center antialiased font-sans">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl space-y-6 text-left">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {isRtl ? 'إعداد ملف الطفل 👦' : 'Child Profile Setup 👦'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {isRtl
              ? 'يرجى إكمال إدخال بيانات طفلك للوصول إلى لوحة التحكم.'
              : 'Please complete your child\'s profile details to unlock the care dashboard.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isRtl ? 'اسم الطفل' : 'Child\'s Name'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sami"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {isRtl ? 'تاريخ الميلاد' : 'Date of Birth'} *
            </label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {isRtl ? 'الجنس' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="male">{isRtl ? 'ذكر' : 'Male'}</option>
                <option value="female">{isRtl ? 'أنثى' : 'Female'}</option>
                <option value="other">{isRtl ? 'آخر' : 'Other'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {isRtl ? 'مستوى التوحد (ASD)' : 'ASD Level'}
              </label>
              <select
                value={asdLevel}
                onChange={(e) => setAsdLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="level1">{isRtl ? 'المستوى ١' : 'Level 1'}</option>
                <option value="level2">{isRtl ? 'المستوى ٢' : 'Level 2'}</option>
                <option value="level3">{isRtl ? 'المستوى ٣' : 'Level 3'}</option>
                <option value="not_specified">{isRtl ? 'غير محدد' : 'Not Specified'}</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-white transition-colors duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {isRtl ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                isRtl ? 'حفظ وإكمال ✔️' : 'Save and Continue ✔️'
              )}
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium text-center"
            >
              {isRtl ? 'تسجيل الخروج والعودة' : 'Sign out and go back'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AppProps {
  initialTab?: string;
}

// ─── Shared role normaliser ───────────────────────────────────────────────────
// Handles both the capitalised values stored in localStorage (e.g. 'Admin') and
// the lowercase values returned directly by the backend API (e.g. 'admin').
// Having a single source of truth here prevents the "Admin lands on Parent
// dashboard" class of bugs caused by missing branches in ad-hoc if-chains.
const mapRole = (raw: string | undefined): UserRole => {
  switch ((raw ?? '').toLowerCase()) {
    case 'doctor': return 'Doctor';
    case 'therapist': return 'Therapist';
    case 'admin': return 'Admin';
    case 'child': return 'Child';
    default: return 'Parent';
  }
};


export default function App({ initialTab = 'home' }: AppProps) {
  // Localization states
  const [language, setLanguage] = useState<Language>('en');
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // Primary routing: 'home' | 'features' | 'pricing' | 'contact' | 'portal' | 'legal'
  const [currentTab, setCurrentTab] = useState<string>(initialTab);
  const [activeLegalTab, setActiveLegalTab] = useState<'terms' | 'privacy' | 'cookie' | 'hipaa'>('privacy');

  const handleSetTab = (tab: string) => {
    if (tab.startsWith('legal-')) {
      const doc = tab.split('-')[1] as 'terms' | 'privacy' | 'cookie' | 'hipaa';
      setActiveLegalTab(doc);
      setCurrentTab('legal');
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentTab(tab);
      if (tab !== 'portal') {
        setTimeout(() => {
          const element = document.getElementById(`${tab}-section`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // User Signup registration flow states
  const [signupData, setSignupData] = useState<{ name: string; email: string; password?: string; info: string } | null>(null);
  const [pendingPlan, setPendingPlan] = useState<string | null>(null);
  const [registeredPlan, setRegisteredPlan] = useState<string | null>(null);

  // Active simulated role inside the portal sandbox
  const [activeRole, setActiveRole] = useState<UserRole>('Parent');

  // Active portal workspace sub-tab: 'genetic' | 'behavior' | 'coordination' | 'games' | 'security'
  const [portalTab, setPortalTab] = useState<string>('genetic');

  // Backend session states
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeChild, setActiveChild] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isVerificationChecking, setIsVerificationChecking] = useState<boolean>(false);
  const [verificationSyncError, setVerificationSyncError] = useState<string>('');
  const [isResendingVerification, setIsResendingVerification] = useState<boolean>(false);
  const [resendVerificationSuccess, setResendVerificationSuccess] = useState<boolean>(false);



  // Adjust document body text dir on initial load or language tweak
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Session Recovery
  useEffect(() => {
    const restoreSession = async () => {
      // 1. Try localStorage cached user.
      // Guard: if a backend token also exists and the cached role is 'Parent',
      // we can't be sure the role wasn't corrupted by an earlier bug (e.g. Admin
      // being mapped to Parent). Fall through to the live /me call in that case
      // so the authoritative backend role always wins.
      const cachedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const activeMockUser = typeof window !== 'undefined' ? localStorage.getItem('auticare_active_user') : null;
      const cachedRoleIsTrusted = (role: string | undefined) =>
        ['Doctor', 'Therapist', 'Admin', 'Child'].includes(role ?? '');

      if (activeMockUser && (!cachedToken || cachedRoleIsTrusted(JSON.parse(activeMockUser)?.role))) {
        try {
          const parsed = JSON.parse(activeMockUser);
          setCurrentUser(parsed);

          const mappedRole = mapRole(parsed.role);
          setActiveRole(mappedRole);

          if (parsed.child) {
            setActiveChild(parsed.child);
          } else if (mappedRole === 'Parent' || mappedRole === 'Child') {
            try {
              const patientsRes = await getPatients();
              if (patientsRes.success && patientsRes.data && patientsRes.data.length > 0) {
                const formattedChild = formatChildProfile(patientsRes.data[0]);
                setActiveChild(formattedChild);
                parsed.child = formattedChild;
                localStorage.setItem('auticare_active_user', JSON.stringify(parsed));
              }
            } catch (err) {
              console.error('Failed to fetch patient on session restoration:', err);
            }
          }
          return;
        } catch (e) { }
      }

      // 2. Fall back to backend token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        setLoading(true);
        try {
          const userRes = await getMe();
          if (userRes.success) {
            // Map backend role to UI sandbox role (handles all 5 roles)
            const mappedRole = mapRole(userRes.user.role);
            setActiveRole(mappedRole);

            // Only Parent / Child accounts have a linked child profile.
            // Fetching /patients for Admin/Doctor/Therapist would return a
            // 403 from the assignment guard and pollute the error log.
            const needsChild = mappedRole === 'Parent' || mappedRole === 'Child';
            let formattedChild = null;
            if (needsChild) {
              try {
                const patientsRes = await getPatients();
                if (patientsRes.success && patientsRes.data && patientsRes.data.length > 0) {
                  formattedChild = formatChildProfile(patientsRes.data[0]);
                  setActiveChild(formattedChild);
                }
              } catch (err) {
                console.error('Failed to fetch patient on session restoration:', err);
              }
            }

            const sessionUser = {
              ...userRes.user,
              role: mappedRole,
              ...(formattedChild ? { child: formattedChild } : {}),
            };
            localStorage.setItem('auticare_active_user', JSON.stringify(sessionUser));
            setCurrentUser(sessionUser);
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      }
    };
    restoreSession();
  }, []);
  // Listen for administrative suspension and force logout
  useEffect(() => {
    const handleAccountDisabled = (e: Event) => {
      const customEvent = e as CustomEvent;
      const errorMsg = customEvent.detail || 'Account suspended. Contact your clinical administrator.';

      setCurrentUser(null);
      setActiveChild(null);
      localStorage.removeItem('token');
      localStorage.removeItem('auticare_active_user');
      setAuthError(errorMsg);
      setCurrentTab('login');
    };

    window.addEventListener('auticare_account_disabled', handleAccountDisabled);
    return () => {
      window.removeEventListener('auticare_account_disabled', handleAccountDisabled);
    };
  }, []);

  // Handle auto-scroll on direct route entry
  useEffect(() => {
    if (initialTab && initialTab !== 'home' && initialTab !== 'portal' && initialTab !== 'login') {
      setTimeout(() => {
        const element = document.getElementById(`${initialTab}-section`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, [initialTab]);

  // Handle direct navigation to Portal
  const handleOpenPortal = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const activeMockUser = typeof window !== 'undefined' ? localStorage.getItem('auticare_active_user') : null;
    if (token || activeMockUser || currentUser) {
      setCurrentTab('portal');
    } else {
      setCurrentTab('login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = async (role: 'Parent' | 'Child' | 'Doctor' | 'Therapist' | 'Admin', user: any) => {
    const mappedRole = mapRole(role);
    setActiveRole(mappedRole);

    const sessionUser: any = { ...user, role: mappedRole };

    if (user.child) {
      const formattedChild = formatChildProfile(user.child);
      setActiveChild(formattedChild);
      sessionUser.child = formattedChild;
    } else if (mappedRole === 'Parent' || mappedRole === 'Child') {
      try {
        const patientsRes = await getPatients();
        if (patientsRes.success && patientsRes.data && patientsRes.data.length > 0) {
          const formattedChild = formatChildProfile(patientsRes.data[0]);
          setActiveChild(formattedChild);
          sessionUser.child = formattedChild;
        }
      } catch (err) {
        console.error('Failed to fetch patient on login:', err);
      }
    }

    localStorage.setItem('auticare_active_user', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    setCurrentTab('portal');
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      setCurrentUser(null);
      setActiveChild(null);
      localStorage.removeItem('token');
      localStorage.removeItem('auticare_active_user');
      setCurrentTab('login');
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (sData: any, plan: string) => {
    if (!sData) return;
    setLoading(true);
    setAuthError('');
    try {
      const role = sData.info.toLowerCase().includes('clinic') || sData.info.toLowerCase().includes('dr') ? 'doctor' : 'parent';
      const regData = {
        name: sData.name,
        email: sData.email,
        password: sData.password || 'auticare123',
        role: role,
        clinic: sData.info
      };

      const regRes = await register(regData);
      if (regRes.success) {
        setRegisteredPlan(plan);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed');
      setCurrentTab('signup');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans select-none antialiased">

      {/* Swapped out unconditional rendering for a clean structural check */}
      {currentTab !== 'portal' && (
        <Navigation
          language={language}
          setLanguage={setLanguage}
          currentTab={currentTab}
          setCurrentTab={handleSetTab}
          onOpenPortal={handleOpenPortal}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}

      {/* 2. DYNAMIC CONTENT VIEWER */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">

          {currentTab === 'signup' ? (
            <SignUp
              language={language}
              onSuccess={(role, userData) => {
                handleLoginSuccess(role, userData);
              }}
              onNavigateToLogin={() => setCurrentTab('login')}
            />
          ) : currentTab === 'login' ? (
            <Login
              language={language}
              onSuccess={(role, user) => {
                handleLoginSuccess(role, user);
              }}
              onNavigateToSignUp={() => setCurrentTab('signup')}
            />
          ) : currentTab === 'legal' ? (
            <Legal
              language={language}
              initialDoc={activeLegalTab}
              onBack={() => setCurrentTab('home')}
            />
          ) : currentTab !== 'portal' ? (
            <motion.div
              key="landing-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0"
            >
              {/* Hero presentation with mission / vision cards */}
              <Hero
                language={language}
                onOpenPortal={handleOpenPortal}
                onNavigateToContact={() => {
                  setCurrentTab('contact');
                  setTimeout(() => {
                    document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              />

              {/* Fragmented Problems, 6 solution modules grid, impact counts & workflows */}
              <Features language={language} onOpenPortal={handleOpenPortal} />

              {/* Subscription grids and FAQ FAQs cards */}
              <Pricing
                language={language}
                onSelectPlan={(planName) => {
                  setPendingPlan(planName);
                  setCurrentTab('signup');
                }}
              />

              {/* Informational administration and validation feedback form */}
              <Contact language={language} />

              {/* Testimonials section */}
              <Testimonials language={language} />

              {/* Reach our Help Desk for support (Newsletter CTA) */}
              <HelpDesk language={language} />
            </motion.div>
          ) : null}

          {/* ─── EMAIL NOT VERIFIED FULLSCREEN GATE ──────────────────────────
               Intercepts dashboard hydration for users who signed up via
               email/password and haven't clicked their verification link yet.
               Firebase/Google accounts are always pre-verified and skip this.
          ──────────────────────────────────────────────────────────────────── */}
          {currentUser && currentUser.isVerified === false && (
            <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center antialiased font-sans">
              <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl space-y-6">

                {/* Animated mail icon */}
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 rounded-2xl flex items-center justify-center mx-auto text-blue-600 animate-pulse">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                  </svg>
                </div>

                {/* Bilingual heading + body */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isRtl ? 'تأكيد الحساب مطلوب ✉️' : 'Email Verification Required ✉️'}
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                    {isRtl
                      ? 'يرجى تفعيل الحساب عبر رابط التأكيد المرسل لبريدك الإلكتروني أولاً لتنشيط لوحة التحكم الخاصة بك.'
                      : 'Please go ahead and verify/confirm your email via the secure activation link sent to your inbox to unlock your clinical care workspace.'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {isRtl ? `تم الإرسال إلى: ${currentUser.email}` : `Sent to: ${currentUser.email}`}
                  </p>
                </div>

                {/* Sync error feedback */}
                {verificationSyncError && (
                  <p className="text-xs text-red-500 font-semibold -mt-2">{verificationSyncError}</p>
                )}

                {/* CTA: re-check backend state */}
                <div className="pt-2 space-y-3">
                  <button
                    id="btn-verify-confirmed"
                    disabled={isVerificationChecking}
                    onClick={async () => {
                      setIsVerificationChecking(true);
                      setVerificationSyncError('');
                      try {
                        const res = await syncVerificationStatus();
                        if (res.verified && res.user) {
                          // Stamp verified flag and persist to localStorage
                          const refreshed = { ...currentUser, ...res.user, isVerified: true };
                          localStorage.setItem('auticare_active_user', JSON.stringify(refreshed));
                          setCurrentUser(refreshed);
                        } else if (res.verified) {
                          const refreshed = { ...currentUser, isVerified: true };
                          localStorage.setItem('auticare_active_user', JSON.stringify(refreshed));
                          setCurrentUser(refreshed);
                        } else {
                          setVerificationSyncError(
                            isRtl
                              ? 'لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من صندوق الوارد.'
                              : 'Email not yet verified. Please check your inbox and click the link.'
                          );
                        }
                      } catch {
                        setVerificationSyncError(
                          isRtl
                            ? 'تعذّر الاتصال بالخادم. حاول مجدداً.'
                            : 'Could not reach the server. Please try again.'
                        );
                      } finally {
                        setIsVerificationChecking(false);
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-white transition-colors duration-200 cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    {isVerificationChecking ? (
                      <>
                        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {isRtl ? 'جارٍ التحقق...' : 'Checking...'}
                      </>
                    ) : (
                      isRtl ? 'لقد قمت بالتأكيد — تحقق الآن ✔️' : 'I Have Confirmed My Account ✔️'
                    )}
                  </button>

                  {/* Resend verification link */}
                  <button
                    id="btn-resend-verification"
                    disabled={isResendingVerification}
                    onClick={async () => {
                      setIsResendingVerification(true);
                      setResendVerificationSuccess(false);
                      try {
                        await resendVerificationEmail(currentUser.email);
                        setResendVerificationSuccess(true);
                      } catch {
                        setVerificationSyncError(
                          isRtl
                            ? 'فشل إرسال رابط التأكيد. حاول مجدداً.'
                            : 'Failed to resend confirmation link. Try again.'
                        );
                      } finally {
                        setIsResendingVerification(false);
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed font-bold text-xs transition-colors duration-200 cursor-pointer"
                  >
                    {isResendingVerification ? (
                      isRtl ? 'جار الإرسال...' : 'Sending...'
                    ) : (
                      isRtl ? 'إعادة إرسال رابط التأكيد' : 'Resend Confirmation Link'
                    )}
                  </button>
                  {resendVerificationSuccess && (
                    <p className="text-[10px] text-emerald-600 font-bold text-center">
                      {isRtl ? 'تم إرسال رابط التأكيد الجديد!' : 'New confirmation link sent!'}
                    </p>
                  )}

                  {/* Logout escape hatch */}
                  <button
                    id="btn-verify-logout"
                    onClick={handleLogout}
                    className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors font-medium"
                  >
                    {isRtl ? 'تسجيل الخروج والعودة' : 'Sign out and go back'}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* DYNAMIC COMPREHENSIVE CARE PORTAL SECTION */}
          {currentTab === 'portal' && currentUser && (
            <div className="min-h-screen">
              {currentUser.role === 'Parent' && !(currentUser.child || activeChild) ? (
                <ChildOnboardingWizard
                  language={language}
                  onSuccess={(child) => {
                    const updatedUser = { ...currentUser, child };
                    localStorage.setItem('auticare_active_user', JSON.stringify(updatedUser));
                    setCurrentUser(updatedUser);
                    setActiveChild(child);
                  }}
                  onLogout={handleLogout}
                />
              ) : (
                <>
                  {currentUser.role === 'Child' && (
                    <ChildDashboard
                      language={language}
                      childUser={currentUser.child || activeChild || currentUser}
                      onLogout={handleLogout}
                    />
                  )}
                  {currentUser.role === 'Parent' && (
                    <ParentDashboard
                      language={language}
                      parentUser={{
                        ...currentUser,
                        child: currentUser.child || activeChild
                      }}
                      onLogout={handleLogout}
                    />
                  )}
                  {currentUser.role === 'Doctor' && (
                    <DoctorDashboard
                      language={language}
                      doctorUser={currentUser}
                      onLogout={handleLogout}
                    />
                  )}
                  {currentUser.role === 'Therapist' && (
                    <TherapistDashboard
                      language={language}
                      therapistUser={currentUser}
                      onLogout={handleLogout}
                    />
                  )}
                  {currentUser.role === 'Admin' && (
                    <AdminDashboard
                      language={language}
                      adminUser={{ name: currentUser.name, email: currentUser.email }}
                      onLogout={handleLogout}
                    />
                  )}
                </>
              )}
            </div>
          )}

        </AnimatePresence>
      </main>

      {/* 3. DESIGN COMPLIANT LIGHT FOOTER */}
      <Footer
        language={language}
        setCurrentTab={handleSetTab}
      />

    </div>
  );
}
