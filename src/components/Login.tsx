"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Lock, Info, ArrowRight, CheckCircle2, Sparkles,
  ShieldCheck, Check, Stethoscope, Users, Eye, EyeOff, Clock, Copy, ChevronRight
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { login, firebaseLogin, checkEmail } from '../api';
import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

interface LoginProps {
  language: Language;
  onSuccess: (role: 'Parent' | 'Child' | 'Doctor' | 'Therapist', user: any) => void;
  onNavigateToSignUp: () => void;
}

export default function Login({ language, onSuccess, onNavigateToSignUp }: LoginProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // 1: Role Selection, 2: Login Form, 3: Account Pending Verification, 4: Forgot Password Form
  // 1: Role Selection, 2: Login Form, 3: Account Pending Verification, 4: Forgot Password Form, 5: Google Child Setup Screen, 6: Google Signup Success Screen
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedRole, setSelectedRole] = useState<'Parent' | 'Doctor' | 'Therapist' | null>(null);

  // Form Fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Google Sign-In State
  const [googleUser, setGoogleUser] = useState<{ email: string; displayName: string; idToken: string } | null>(null);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [childGender, setChildGender] = useState('');
  const [diagnosisLevel, setDiagnosisLevel] = useState('');

  // Google Signup Success State
  const [generatedChildCreds, setGeneratedChildCreds] = useState<{ username: string; pass: string } | null>(null);
  const [showChildPassword, setShowChildPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [googleSuccessUser, setGoogleSuccessUser] = useState<any>(null);

  const handleCopyChildCreds = () => {
    if (generatedChildCreds) {
      navigator.clipboard.writeText(
        `Username: ${generatedChildCreds.username}\nPassword: ${generatedChildCreds.pass}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const forgotT = {
    en: {
      title: 'Reset Password',
      desc: 'Enter your registered email address, and we will send you a recovery link.',
      emailLabel: 'Email Address',
      emailPlaceholder: 'john@example.com',
      sendBtn: 'Send Recovery Link',
      sendingBtn: 'Sending Link...',
      backBtn: 'Back to Login',
      successMsg: 'A password recovery link has been sent to your email! Please check your inbox.',
      errorInvalidEmail: 'Please enter a valid email address.',
    },
    ar: {
      title: 'استعادة كلمة المرور',
      desc: 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابط استعادة كلمة المرور.',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'john@example.com',
      sendBtn: 'إرسال رابط الاستعادة',
      sendingBtn: 'جاري الإرسال...',
      backBtn: 'عودة لتسجيل الدخول',
      successMsg: 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني! يرجى مراجعة صندوق الوارد.',
      errorInvalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
    }
  }[language] || {
    title: 'Reset Password',
    desc: 'Enter your registered email address, and we will send you a recovery link.',
    emailLabel: 'Email Address',
    emailPlaceholder: 'john@example.com',
    sendBtn: 'Send Recovery Link',
    sendingBtn: 'Sending Link...',
    backBtn: 'Back to Login',
    successMsg: 'A password recovery link has been sent to your email! Please check your inbox.',
    errorInvalidEmail: 'Please enter a valid email address.',
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setError(forgotT.errorInvalidEmail);
      return;
    }
    
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim().toLowerCase());
      setResetSent(true);
    } catch (fbErr: any) {
      if (fbErr.code === 'auth/user-not-found') {
        setError(isRtl ? 'البريد الإلكتروني غير مسجل لدينا.' : 'No user found with this email address.');
      } else {
        setError(fbErr.message || (isRtl ? 'فشل إرسال رابط الاستعادة. يرجى المحاولة لاحقاً.' : 'Failed to send recovery link. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();
      const email = user.email || '';
      const displayName = user.displayName || '';

      // 1. Check if email is already registered
      const checkRes = await checkEmail(email);

      if (checkRes.exists && (checkRes.role !== 'parent' || checkRes.hasChild)) {
        // 2. Existing user (with child profile if parent) - proceed with login
        const loginRes = await firebaseLogin({ idToken });
        if (loginRes.success && loginRes.user) {
          let finalRole: 'Parent' | 'Doctor' | 'Therapist' | 'Child' = selectedRole || 'Parent';
          if (loginRes.user.role === 'doctor') finalRole = 'Doctor';
          else if (loginRes.user.role === 'therapist') finalRole = 'Therapist';
          
          onSuccess(finalRole, loginRes.user);
        }
      } else {
        // 3. New user or parent lacking a child profile
        if (selectedRole !== 'Parent') {
          // Clinicians must use standard registration because they need to upload licenses/CVs
          throw new Error(isRtl 
            ? 'حساب الطبيب/المعالج غير مسجل. يرجى إنشاء حساب جديد أولاً من صفحة التسجيل.' 
            : 'Clinician account not found. Please register first using the Sign Up page.');
        }

        // Save Google info and transition to Step 5 (Simplified Child Setup)
        setGoogleUser({ email, displayName, idToken });
        setStep(5);
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err.message || (isRtl ? 'فشل تسجيل الدخول باستخدام Google.' : 'Google Sign-In failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleChildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!googleUser) return;
    
    if (!childName.trim() || !childAge.trim() || !childGender || !diagnosisLevel) {
      setError(isRtl ? 'برجاء ملء جميع الحقول المطلوبة للطفل' : 'Please fill in all required fields for the child');
      return;
    }
    
    setLoading(true);
    try {
      const formattedChildName = childName.trim().replace(/\s+/g, '_').toLowerCase();
      const randomNum = Math.floor(100 + Math.random() * 900);
      const childUsername = `${formattedChildName}_${randomNum}`;
      const childPass = `child_${Math.floor(100000 + Math.random() * 900000)}`;

      // Register Parent + Child in MongoDB
      const res = await firebaseLogin({
        idToken: googleUser.idToken,
        name: googleUser.displayName,
        role: 'parent',
        childName,
        childAge,
        childGender,
        diagnosisLevel
      });

      if (res.success && res.user) {
        // Sync custom local mock storage
        const usersJson = localStorage.getItem('auticare_mock_db');
        const mockDB = usersJson ? JSON.parse(usersJson) : { users: [] };
        
        let parentInMock = mockDB.users.find((u: any) => u.email.toLowerCase() === googleUser.email.toLowerCase());
        
        const childData = {
          name: childName,
          username: childUsername,
          password: childPass,
          age: childAge,
          level: diagnosisLevel,
          gender: childGender
        };

        if (parentInMock) {
          parentInMock.child = childData;
        } else {
          const newUser = {
            name: googleUser.displayName,
            email: googleUser.email.toLowerCase(),
            password: `fb_${googleUser.idToken.slice(0, 10)}`,
            role: 'Parent',
            child: childData,
            status: 'approved'
          };
          mockDB.users.push(newUser);
        }
        localStorage.setItem('auticare_mock_db', JSON.stringify(mockDB));

        setGeneratedChildCreds({ username: childUsername, pass: childPass });
        setGoogleSuccessUser(res.user);
        setStep(6);
      }
    } catch (err: any) {
      console.error('Child registration error:', err);
      setError(err.message || (isRtl ? 'فشل إكمال التسجيل.' : 'Failed to complete registration.'));
    } finally {
      setLoading(false);
    }
  };

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

  const googleSetupT = {
    en: {
      title: 'Complete Child Setup',
      desc: "Please provide your child's basic details to complete your registration.",
      childName: "Child's Name",
      childNamePlaceholder: "Enter child's full name",
      childAge: "Child's Age",
      childAgePlaceholder: 'e.g. 6',
      gender: "Child's Gender",
      genderPlaceholder: 'Select gender',
      asdLevel: 'Diagnosis Level',
      asdLevelPlaceholder: 'Select level',
      submitBtn: 'Complete Registration',
      submittingBtn: 'Registering...',
      backBtn: 'Cancel',
    },
    ar: {
      title: 'إكمال إعداد ملف الطفل',
      desc: 'يرجى تزويدنا بالمعلومات الأساسية للطفل لإتمام عملية التسجيل.',
      childName: 'اسم الطفل',
      childNamePlaceholder: 'أدخل اسم الطفل بالكامل',
      childAge: 'عمر الطفل',
      childAgePlaceholder: 'مثال: 6',
      gender: 'جنس الطفل',
      genderPlaceholder: 'اختر الجنس',
      asdLevel: 'مستوى التشخيص',
      asdLevelPlaceholder: 'اختر المستوى',
      submitBtn: 'إكمال التسجيل',
      submittingBtn: 'جاري التسجيل...',
      backBtn: 'إلغاء',
    }
  }[language] || {
    title: 'Complete Child Setup',
    desc: "Please provide your child's basic details to complete your registration.",
    childName: "Child's Name",
    childNamePlaceholder: "Enter child's full name",
    childAge: "Child's Age",
    childAgePlaceholder: 'e.g. 6',
    gender: "Child's Gender",
    genderPlaceholder: 'Select gender',
    asdLevel: 'Diagnosis Level',
    asdLevelPlaceholder: 'Select level',
    submitBtn: 'Complete Registration',
    submittingBtn: 'Registering...',
    backBtn: 'Cancel',
  };

  const childGenderOptions = [
    { value: 'Male', label: isRtl ? 'ذكر' : 'Male' },
    { value: 'Female', label: isRtl ? 'أنثى' : 'Female' },
    { value: 'Other', label: isRtl ? 'آخر' : 'Other' }
  ];

  const childDiagLevels = [
    { value: 'Level 1', label: isRtl ? 'مستوى 1 - خفيف' : 'Level 1 - Mild' },
    { value: 'Level 2', label: isRtl ? 'مستوى 2 - متوسط' : 'Level 2 - Moderate' },
    { value: 'Level 3', label: isRtl ? 'مستوى 3 - شديد' : 'Level 3 - Severe' }
  ];

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
                  onClick={() => {
                    setError('');
                    setResetEmail(emailOrUsername.includes('@') ? emailOrUsername : '');
                    setResetSent(false);
                    setStep(4);
                  }}
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

              {/* OR divider */}
              <div className="relative flex items-center justify-center my-5">
                <div className="border-t border-slate-200 w-full" />
                <span className="absolute bg-white px-3 text-[10px] font-black uppercase text-slate-400">
                  {isRtl ? 'أو' : 'OR'}
                </span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${isRtl ? 'space-x-reverse' : ''} cursor-pointer shadow-sm hover:shadow`}
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#ea4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.513 0-6.386-2.87-6.386-6.386 0-3.513 2.873-6.386 6.386-6.386 1.625 0 3.08.618 4.2 1.629l3.076-3.076C19.34 2.385 15.98 1 12.24 1 6.033 1 12.24 1.033 12.24 1.033S6.033 1 12.24 1c-6.207 0-11.24 5.033-11.24 11.24s5.033 11.24 11.24 11.24c5.897 0 10.867-4.247 10.867-11.24 0-.668-.063-1.31-.183-1.955H12.24z"
                  />
                </svg>
                <span>
                  {isRtl ? 'تسجيل الدخول باستخدام Google' : 'Sign in with Google'}
                </span>
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

        {/* STEP 4: FORGOT PASSWORD FORM */}
        {step === 4 && (
          <motion.div
            key="forgot-password-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {forgotT.title}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {forgotT.desc}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-left">
                {error}
              </div>
            )}

            {resetSent ? (
              <div className="space-y-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 animate-bounce" />
                </div>
                <p className="text-xs font-bold text-slate-600 leading-relaxed">
                  {forgotT.successMsg}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setError('');
                  }}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {forgotT.backBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    {forgotT.emailLabel}
                  </label>
                  <div className="relative flex items-center">
                    <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} text-slate-400`}>
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder={forgotT.emailPlaceholder}
                      className={`w-full py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold`}
                      required
                    />
                  </div>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>{forgotT.sendingBtn}</span>
                  ) : (
                    <>
                      <span>{forgotT.sendBtn}</span>
                      <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    setError('');
                  }}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center font-bold"
                >
                  {forgotT.backBtn}
                </button>

              </form>
            )}
          </motion.div>
        )}

        {/* STEP 5: SIMPLIFIED CHILD SETUP SCREEN FOR GOOGLE SIGNUPS */}
        {step === 5 && (
          <motion.div
            key="google-child-setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-md mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="relative w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-sky-400/80 mix-blend-multiply filter blur-[0.5px]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500/85 mix-blend-multiply filter blur-[0.5px]" />
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-cyan-300/70 mix-blend-multiply filter blur-[0.5px]" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {googleSetupT.title}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {googleSetupT.desc}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-left font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleGoogleChildSubmit} className="space-y-4 text-left">
              
              {/* Child Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">
                  {googleSetupT.childName}
                </label>
                <div className="relative flex items-center">
                  <span className={`absolute ${isRtl ? 'right-4' : 'left-4'} text-slate-400`}>
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder={googleSetupT.childNamePlaceholder}
                    className={`w-full py-3 ${isRtl ? 'pr-11 pl-4' : 'pl-11 pr-4'} text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Child Age */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    {googleSetupT.childAge}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    placeholder={googleSetupT.childAgePlaceholder}
                    className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                    required
                  />
                </div>

                {/* Child Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500 block">
                    {googleSetupT.gender}
                  </label>
                  <select
                    value={childGender}
                    onChange={(e) => setChildGender(e.target.value)}
                    className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                    required
                  >
                    <option value="">{googleSetupT.genderPlaceholder}</option>
                    {childGenderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Diagnosis Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500 block">
                  {googleSetupT.asdLevel}
                </label>
                <select
                  value={diagnosisLevel}
                  onChange={(e) => setDiagnosisLevel(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                  required
                >
                  <option value="">{googleSetupT.asdLevelPlaceholder}</option>
                  {childDiagLevels.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span>{googleSetupT.submittingBtn}</span>
                ) : (
                  <>
                    <span>{googleSetupT.submitBtn}</span>
                    <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  setGoogleUser(null);
                  setError('');
                }}
                className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer text-center font-bold"
              >
                {googleSetupT.backBtn}
              </button>

            </form>
          </motion.div>
        )}

        {/* STEP 6: GOOGLE SIGNUP SUCCESS SCREEN */}
        {step === 6 && generatedChildCreds && googleUser && (
          <motion.div
            key="google-signup-parent-success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6 text-center"
          >
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {t.authSuccessTitle}
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                {t.authSuccessSub}
              </p>
            </div>

            {/* Twin Credentials Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Parent Credentials Card */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 text-left space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                  {t.authParentAccountDetails}
                </span>
                <div className="space-y-1.5 text-xs text-slate-600 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-400 uppercase">Parent Name</span>
                    <span className="font-extrabold text-slate-800 truncate">{googleUser.displayName}</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-[9px] text-slate-400 uppercase">Email</span>
                    <span className="font-extrabold text-slate-800 truncate">{googleUser.email}</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-[9px] text-slate-400 uppercase">Auth Provider</span>
                    <span className="font-extrabold text-slate-800 truncate">Google Sign-In</span>
                  </div>
                </div>
              </div>

              {/* Child Credentials Card */}
              <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5 text-left space-y-3 relative overflow-hidden">
                <span className="text-[10px] font-black uppercase text-sky-700 block tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{t.authChildAccountDetails}</span>
                </span>
                
                <div className="space-y-1.5 text-xs text-slate-600 font-semibold relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-sky-600 uppercase">Child Username</span>
                    <span className="font-extrabold text-slate-800 truncate">{generatedChildCreds.username}</span>
                  </div>
                  
                  <div className="flex flex-col pt-1">
                    <span className="text-[9px] text-sky-600 uppercase">Child Password</span>
                    <div className="flex items-center justify-between bg-white border border-sky-100 rounded-lg px-2 py-1 mt-0.5">
                      <span className="font-mono font-bold text-slate-800 truncate select-all">
                        {showChildPassword ? generatedChildCreds.pass : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowChildPassword(!showChildPassword)}
                        className="text-slate-400 hover:text-sky-600 transition-colors ml-1"
                      >
                        {showChildPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleCopyChildCreds}
                      className="w-full py-1 bg-white hover:bg-sky-50 text-[10px] text-sky-700 font-bold border border-sky-200 rounded-lg transition-colors flex items-center justify-center space-x-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ بيانات الطفل' : 'Copy child credentials')}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <p className="text-[11px] text-slate-400 leading-normal font-semibold">
              {t.authSaveCreds}
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  if (googleSuccessUser) {
                    onSuccess('Parent', {
                      ...googleSuccessUser,
                      child: {
                        name: childName,
                        username: generatedChildCreds.username,
                        password: generatedChildCreds.pass,
                        age: childAge,
                        level: diagnosisLevel,
                        gender: childGender
                      }
                    });
                  }
                }}
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{t.authGoDashboard}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
