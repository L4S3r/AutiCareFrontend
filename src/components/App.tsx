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
import GeneticAIExplorer from './GeneticAIExplorer';
import BehavioralTracker from './BehavioralTracker';
import CareCoordinationHub from './CareCoordinationHub';
import DevelopmentGames from './DevelopmentGames';
import SecurityCompliance from './SecurityCompliance';
import SignUp from './SignUp';
import Login from './Login';
import Legal from './Legal';
import ChildDashboard from './ChildDashboard';
import ParentDashboard from './ParentDashboard';
import DoctorDashboard from './DoctorDashboard';
import TherapistDashboard from './TherapistDashboard';
import HelpDesk from './HelpDesk';
import Footer from './Footer';
import Testimonials from './Testimonials';
import { register, login, getMe, logout, getPatients, createPatient } from '../api';

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

interface AppProps {
  initialTab?: string;
}

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



  // Adjust document body text dir on initial load or language tweak
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Session Recovery
  useEffect(() => {
    const restoreSession = async () => {
      // 1. Try mock localStorage active user first
      const activeMockUser = typeof window !== 'undefined' ? localStorage.getItem('auticare_active_user') : null;
      if (activeMockUser) {
        try {
          const parsed = JSON.parse(activeMockUser);
          setCurrentUser(parsed);
          
          let mappedRole: UserRole = 'Parent';
          if (parsed.role === 'Doctor') mappedRole = 'Doctor';
          else if (parsed.role === 'Therapist') mappedRole = 'Therapist';
          setActiveRole(mappedRole);
          
          if (parsed.child) {
            setActiveChild(parsed.child);
          } else if (parsed.role === 'Parent') {
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
        } catch (e) {}
      }

      // 2. Fall back to backend token
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        setLoading(true);
        try {
          const userRes = await getMe();
          if (userRes.success) {
            setCurrentUser(userRes.user);
            
            // Map backend role to UI sandbox role
            let mappedRole: UserRole = 'Parent';
            if (userRes.user.role === 'doctor') mappedRole = 'Doctor';
            else if (userRes.user.role === 'therapist') mappedRole = 'Therapist';
            setActiveRole(mappedRole);

            // Load child profile details
            const patientsRes = await getPatients();
            if (patientsRes.success && patientsRes.data && patientsRes.data.length > 0) {
              const formattedChild = formatChildProfile(patientsRes.data[0]);
              setActiveChild(formattedChild);
              
              // Also update auticare_active_user to include child info
              const sessionUser = {
                ...userRes.user,
                role: mappedRole,
                child: formattedChild
              };
              localStorage.setItem('auticare_active_user', JSON.stringify(sessionUser));
            } else {
              const sessionUser = {
                ...userRes.user,
                role: mappedRole
              };
              localStorage.setItem('auticare_active_user', JSON.stringify(sessionUser));
            }
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

  const handleLoginSuccess = async (role: 'Parent' | 'Child' | 'Doctor' | 'Therapist', user: any) => {
    const sessionUser = {
      ...user,
      role: role
    };
    
    let mappedRole: UserRole = 'Parent';
    if (role === 'Doctor') mappedRole = 'Doctor';
    else if (role === 'Therapist') mappedRole = 'Therapist';
    setActiveRole(mappedRole);

    if (user.child) {
      const formattedChild = formatChildProfile(user.child);
      setActiveChild(formattedChild);
      sessionUser.child = formattedChild;
    } else if (role === 'Parent') {
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
        if (role === 'parent') {
          try {
            await createPatient({
              name: 'Sami Al-Farsi',
              dateOfBirth: new Date(2018, 5, 22),
              gender: 'male',
              asdLevel: 'level2',
              parentId: regRes.user._id
            });
          } catch (childErr) {
            console.error('Failed to create default child for parent:', childErr);
          }
        }
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
      
      {/* 1. COMPREHENSIVE HEADER NAVIGATION */}
      <Navigation
        language={language}
        setLanguage={setLanguage}
        currentTab={currentTab}
        setCurrentTab={handleSetTab}
        onOpenPortal={handleOpenPortal}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

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

          {/* DYNAMIC COMPREHENSIVE CARE PORTAL SECTION */}
          {currentTab === 'portal' && currentUser && (
            <div className="min-h-screen">
              {currentUser.role === 'Child' && (
                <ChildDashboard
                  language={language}
                  childUser={currentUser.child || activeChild || {
                    name: currentUser.name || 'Sami Al-Farsi',
                    username: currentUser.username || 'sami_al_farsi'
                  }}
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
