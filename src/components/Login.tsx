"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Lock, Info, ArrowRight, CheckCircle2, Sparkles,
  ShieldCheck, Check, Stethoscope, Users, Eye, EyeOff, Clock
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { login, firebaseLogin } from '../api';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface LoginProps {
  language: Language;
  onSuccess: (role: 'Parent' | 'Child' | 'Doctor' | 'Therapist', user: any) => void;
  onNavigateToSignUp: () => void;
}

export default function Login({ language, onSuccess, onNavigateToSignUp }: LoginProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // 1: Role Selection, 2: Login Form, 3: Account Pending Verification
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState<'Parent' | 'Doctor' | 'Therapist' | null>(null);

  // Form Fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNextStep = () => {
    if (!selectedRole) {
      setError(isRtl ? 'برجاء تحديد الدور أولاً' : 'Please select your role first');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailOrUsername.trim() || !password.trim()) {
      setError(isRtl ? 'برجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter your credentials');
      return;
    }

    setLoading(true);

    try {
      const isEmail = emailOrUsername.includes('@');

      if (isEmail) {
        // Firebase Authentication Flow
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, emailOrUsername.trim().toLowerCase(), password);
        } catch (fbErr: any) {
          throw new Error(isRtl ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email address or password');
        }

        const fbUser = userCredential.user;
        if (!fbUser.emailVerified) {
          await signOut(auth);
          throw new Error(
            isRtl 
              ? 'الرجاء تأكيد بريدك الإلكتروني أولاً. تم إرسال رابط التأكيد إلى بريدك الإلكتروني.' 
              : 'Please verify your email address. A confirmation link was sent to your email.'
          );
        }

        const idToken = await fbUser.getIdToken();
        const res = await firebaseLogin({ idToken });
        if (res.success && res.user) {
          let finalRole: 'Parent' | 'Doctor' | 'Therapist' | 'Child' = selectedRole || 'Parent';
          if (res.user.role === 'doctor') finalRole = 'Doctor';
          else if (res.user.role === 'therapist') finalRole = 'Therapist';
          
          onSuccess(finalRole, res.user);
          setLoading(false);
          return;
        }
      } else {
        // Standard API Login Flow (e.g. for child usernames or local testing)
        try {
          const res = await login({ email: emailOrUsername, password });
          if (res.success && res.user) {
            let finalRole: 'Parent' | 'Doctor' | 'Therapist' | 'Child' = selectedRole || 'Parent';
            if (res.user.role === 'doctor') finalRole = 'Doctor';
            else if (res.user.role === 'therapist') finalRole = 'Therapist';
            
            onSuccess(finalRole, res.user);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('Backend API login failed, attempting local mock DB check...', apiErr);
        }
      }

      // 2. Check mock database in localStorage
      const usersJson = localStorage.getItem('auticare_mock_db');
      const mockDB = usersJson ? JSON.parse(usersJson) : { users: [] };

      // Add default seeds if mockDB is empty
      if (mockDB.users.length === 0) {
        mockDB.users = [
          {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password',
            role: 'Parent',
            child: {
              name: 'Alex Doe',
              username: 'alex_doe',
              password: 'password',
              age: '6',
              level: 'Level 1',
              gender: 'Male'
            },
            status: 'approved'
          },
          {
            name: 'Sarah Connor',
            email: 'sarah.connor@example.com',
            password: 'password',
            role: 'Doctor',
            status: 'approved'
          },
          {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'password',
            role: 'Therapist',
            status: 'approved'
          }
        ];
        localStorage.setItem('auticare_mock_db', JSON.stringify(mockDB));
      }

      // Look up user
      const credentialClean = emailOrUsername.trim().toLowerCase();
      
      let matchedUser = mockDB.users.find((u: any) => {
        // Parent check - can match either parent email or child username
        if (u.role === 'Parent' && u.child && u.child.username.toLowerCase() === credentialClean) {
          return true;
        }
        return u.email.toLowerCase() === credentialClean;
      });

      if (!matchedUser) {
        throw new Error(isRtl ? 'اسم المستخدم أو البريد الإلكتروني غير صحيح' : 'Invalid email address or username');
      }

      if (matchedUser.password !== password && !(matchedUser.role === 'Parent' && matchedUser.child && matchedUser.child.password === password)) {
        throw new Error(isRtl ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
      }

      // Handle role-matching logic
      let finalRole: 'Parent' | 'Child' | 'Doctor' | 'Therapist' = 'Parent';
      
      if (matchedUser.role === 'Parent') {
        if (matchedUser.child && matchedUser.child.username.toLowerCase() === credentialClean) {
          finalRole = 'Child'; // Child logged in directly
        } else {
          finalRole = 'Parent';
        }
      } else if (matchedUser.role === 'Doctor') {
        finalRole = 'Doctor';
        if (matchedUser.status === 'pending') {
          setStep(3); // Go to pending screen
          setLoading(false);
          return;
        }
      } else if (matchedUser.role === 'Therapist') {
        finalRole = 'Therapist';
        if (matchedUser.status === 'pending') {
          setStep(3); // Go to pending screen
          setLoading(false);
          return;
        }
      }

      onSuccess(finalRole, matchedUser);
    } catch (err: any) {
      setError(err.message || (isRtl ? 'فشل تسجيل الدخول. يرجى مراجعة بياناتك.' : 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4 select-none">
      <AnimatePresence mode="wait">

        {/* STEP 1: LOGIN ROLE SELECTION */}
        {step === 1 && (
          <motion.div
            key="login-role-selection"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-xl mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="relative w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-sky-400/80 mix-blend-multiply filter blur-[0.5px]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500/85 mix-blend-multiply filter blur-[0.5px]" />
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-300/70 mix-blend-multiply filter blur-[0.5px]" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {t.authWelcomeBack}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {t.authSelectLoginRole}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              
              {/* Parent/Child Option */}
              <div
                onClick={() => setSelectedRole('Parent')}
                className={`flex items-center space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  selectedRole === 'Parent'
                    ? 'border-sky-500 bg-sky-50/50 shadow-md ring-1 ring-sky-500/20'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                } ${isRtl ? 'space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'Parent' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-black text-slate-800">{t.authLoginParent}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{t.authLoginParentDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedRole === 'Parent' ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`}>
                  {selectedRole === 'Parent' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Doctor Option */}
              <div
                onClick={() => setSelectedRole('Doctor')}
                className={`flex items-center space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  selectedRole === 'Doctor'
                    ? 'border-sky-500 bg-sky-50/50 shadow-md ring-1 ring-sky-500/20'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                } ${isRtl ? 'space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'Doctor' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-black text-slate-800">{t.authLoginDoctor}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{t.authLoginDoctorDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedRole === 'Doctor' ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`}>
                  {selectedRole === 'Doctor' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Therapist Option */}
              <div
                onClick={() => setSelectedRole('Therapist')}
                className={`flex items-center space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${
                  selectedRole === 'Therapist'
                    ? 'border-sky-500 bg-sky-50/50 shadow-md ring-1 ring-sky-500/20'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                } ${isRtl ? 'space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'Therapist' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-black text-slate-800">{t.authLoginTherapist}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{t.authLoginTherapistDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedRole === 'Therapist' ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`}>
                  {selectedRole === 'Therapist' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={onNavigateToSignUp}
                className="text-xs font-extrabold text-slate-400 hover:text-sky-600 transition-colors"
              >
                {t.authNoAccount}
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 cursor-pointer"
              >
                <span>{t.authNext}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: LOGIN SUBMIT FORM */}
        {step === 2 && (
          <motion.div
            key="login-form-submit"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {selectedRole === 'Doctor' ? t.authWelcomeDoc : selectedRole === 'Therapist' ? t.authWelcomeTherapist : t.authWelcomeBack}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {selectedRole === 'Doctor' ? t.authLoginDocSub : selectedRole === 'Therapist' ? t.authLoginTherapistSub : t.authLoginParentSub}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-left">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Email / Username */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">
                  {selectedRole === 'Parent' ? t.authUsernameOrEmail : t.authEmail}
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} text-slate-400`}>
                    {selectedRole === 'Parent' ? <User className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </span>
                  <input
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder={selectedRole === 'Parent' ? (isRtl ? 'البريد أو اسم مستخدم الطفل' : 'john@example.com or child_username') : 'john@example.com'}
                    className={`w-full py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold`}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">
                  {t.authPassword}
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} text-slate-400`}>
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full py-3 ${isRtl ? 'pr-11 pl-10' : 'pl-11 pr-10'} text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRtl ? 'left-4' : 'right-4'} text-slate-400 hover:text-sky-600 transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 select-none">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-sky-500 focus:ring-sky-400 border-slate-300 rounded cursor-pointer mt-0.5"
                  />
                  <span className={isRtl ? 'mr-2' : 'ml-2'}>{t.authRemember}</span>
                </label>
                
                <button
                  type="button"
                  onClick={() => alert(isRtl ? 'سيرسل نظام العيادة رابط استعادة كلمة المرور لبريدك.' : 'A password recovery link will be sent to your registered email.')}
                  className="text-sky-600 hover:underline hover:text-sky-700"
                >
                  {t.authForgot}
                </button>
              </div>

              {/* Log In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>{isRtl ? 'جاري التحقق...' : 'Verifying...'}</span>
                ) : (
                  <>
                    <span>{t.authLoginBtn}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

            </form>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
              >
                {isRtl ? 'تغيير الدور' : 'Change role'}
              </button>

              <button
                onClick={onNavigateToSignUp}
                className="text-xs font-black text-sky-600 hover:text-sky-700 hover:underline"
              >
                {t.authNoAccount}
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: ACCOUNT PENDING SCREEN */}
        {step === 3 && (
          <motion.div
            key="login-pending-verification"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6 text-center"
          >
            <div className="w-14 h-14 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-500 animate-pulse">
              <Clock className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {t.authPendingTitle}
              </h3>
              <p className="text-xs text-sky-600 font-extrabold">
                {t.authPendingThank}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-6 text-xs text-slate-500 space-y-3 leading-relaxed font-semibold">
              <p>{t.authPendingReview}</p>
              <p>{t.authPendingNotify}</p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setStep(1)}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-slate-900/10 cursor-pointer"
              >
                {t.authBackHome}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
