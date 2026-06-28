"use client";
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Mail, Lock, Info, ArrowRight, CheckCircle2, Sparkles,
  Upload, FileText, Clock, Eye, EyeOff, Copy, ChevronRight,
  ShieldCheck, Check, Stethoscope, Users
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { register, createPatient } from '../api';

interface SignUpProps {
  language: Language;
  onSuccess: (role: 'Parent' | 'Doctor' | 'Therapist' | 'Admin', userData: any) => void;
  onNavigateToLogin: () => void;
}

// Reusable Drag and Drop File Uploader Component
// Reimplement Later
function FileUploader({
  label,
  subtext,
  onFileSelect,
  file
}: {
  label: string;
  subtext: string;
  onFileSelect: (file: File | null) => void;
  file: File | null
}) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${dragActive ? 'border-sky-400 bg-sky-50/50' : 'border-slate-200 hover:border-sky-300 bg-slate-50'
        }`}
    >
      <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
      {file ? (
        <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-2 px-3 text-xs text-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-left font-semibold truncate max-w-[160px]">
              <p className="truncate font-bold text-slate-700">{file.name}</p>
              <p className="text-[9px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
            className="w-5 h-5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-500 font-bold text-xs flex items-center justify-center transition-all"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 py-1">
          <div className="w-8 h-8 rounded-full bg-sky-100/50 flex items-center justify-center text-sky-500 mx-auto">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-extrabold text-sky-600">{label}</p>
          <p className="text-[9px] text-slate-400 leading-normal">{subtext}</p>
        </div>
      )}
    </div>
  );
}

export default function SignUp({ language, onSuccess, onNavigateToLogin }: SignUpProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  // 1: Role Selection, 2: Registration Form, 3: Success Screen (Parent), 4: Success Screen (Clinician)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRole, setSelectedRole] = useState<'Parent' | 'Doctor' | 'Therapist' | null>(null);

  // Form Fields - Common
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields - Parent Flow
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [diagnosisLevel, setDiagnosisLevel] = useState('');
  const [childGender, setChildGender] = useState('');
  const [childPhoto, setChildPhoto] = useState<File | null>(null);
  const [birthCert, setBirthCert] = useState<File | null>(null);

  // Form Fields - Clinician Flow
  const [yearsExp, setYearsExp] = useState('');
  const [profTitle, setProfTitle] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [nationalIdDoc, setNationalIdDoc] = useState<File | null>(null);
  const [medLicenseDoc, setMedLicenseDoc] = useState<File | null>(null);
  const [cvDoc, setCvDoc] = useState<File | null>(null);

  // Generated child credentials for Parent Success screen
  const [generatedChildCreds, setGeneratedChildCreds] = useState<{ username: string; pass: string } | null>(null);
  const [showChildPassword, setShowChildPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<any>(null);

  const strengthT = {
    en: {
      strengthLabel: 'Password Strength',
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
      reqLength: 'At least 8 characters',
      reqUpper: 'At least one uppercase letter (A-Z)',
      reqLower: 'At least one lowercase letter (a-z)',
      reqNumber: 'At least one number (0-9)',
      reqSpecial: 'At least one special character (@$!%*?&)',
      reqNoUsername: 'Cannot contain username (email prefix)',
      commonPasswordError: 'This password is too common or weak. Please choose a stronger password.',
    },
    ar: {
      strengthLabel: 'قوة كلمة المرور',
      weak: 'ضعيفة',
      fair: 'مقبولة',
      good: 'جيدة',
      strong: 'قوية جداً',
      reqLength: '8 أحرف على الأقل',
      reqUpper: 'حرف كبير واحد على الأقل (A-Z)',
      reqLower: 'حرف صغير واحد على الأقل (a-z)',
      reqNumber: 'رقم واحد على الأقل (0-9)',
      reqSpecial: 'رمز خاص واحد على الأقل (@$!%*?&)',
      reqNoUsername: 'يجب ألا تحتوي على اسم المستخدم (جزء البريد الإلكتروني)',
      commonPasswordError: 'كلمة المرور هذه شائعة أو ضعيفة جداً. يرجى اختيار كلمة مرور أقوى.',
    }
  }[language] || {
    strengthLabel: 'Password Strength',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',
    reqLength: 'At least 8 characters',
    reqUpper: 'At least one uppercase letter (A-Z)',
    reqLower: 'At least one lowercase letter (a-z)',
    reqNumber: 'At least one number (0-9)',
    reqSpecial: 'At least one special character (@$!%*?&)',
    reqNoUsername: 'Cannot contain username (email prefix)',
    commonPasswordError: 'This password is too common or weak. Please choose a stronger password.',
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    const emailPrefix = email ? email.split('@')[0].toLowerCase().trim() : '';
    const containsUsername = emailPrefix && emailPrefix.length >= 3 && pass.toLowerCase().includes(emailPrefix);

    const checks = {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass),
      noUsername: !containsUsername,
    };

    if (checks.length) score += 1;
    if (checks.upper) score += 0.75;
    if (checks.lower) score += 0.75;
    if (checks.number) score += 0.75;
    if (checks.special) score += 0.75;

    const finalScore = Math.min(4, Math.floor(score));
    const isCommon = ['12345678', 'password', '123456789', 'auticare123', 'auticare', 'password123'].includes(pass.toLowerCase());

    return {
      score: (isCommon || containsUsername) ? 0 : finalScore,
      checks,
      isCommon,
      containsUsername,
    };
  };

  const strengthInfo = getPasswordStrength(password);

  // Form selections and items
  const genderOptions = [
    { value: 'Male', label: isRtl ? 'ذكر' : 'Male' },
    { value: 'Female', label: isRtl ? 'أنثى' : 'Female' },
    { value: 'Other', label: isRtl ? 'آخر' : 'Other' }
  ];

  const diagLevels = [
    { value: 'Level 1', label: isRtl ? 'مستوى 1 - خفيف' : 'Level 1 - Mild' },
    { value: 'Level 2', label: isRtl ? 'مستوى 2 - متوسط' : 'Level 2 - Moderate' },
    { value: 'Level 3', label: isRtl ? 'مستوى 3 - شديد' : 'Level 3 - Severe' }
  ];

  const profTitles = [
    { value: 'Pediatrician', label: isRtl ? 'طبيب أطفال' : 'Pediatrician' },
    { value: 'Neurologist', label: isRtl ? 'طبيب أعصاب' : 'Neurologist' },
    { value: 'Child Psychiatrist', label: isRtl ? 'طبيب نفسي للأطفال' : 'Child Psychiatrist' },
    { value: 'Clinical Psychologist', label: isRtl ? 'أخصائي نفسي سريري' : 'Clinical Psychologist' },
    { value: 'Behavioral Therapist', label: isRtl ? 'معالج سلوكي' : 'Behavioral Therapist' },
    { value: 'ABA Specialist', label: isRtl ? 'أخصائي تحليل سلوك تطبيقي' : 'ABA Specialist' },
    { value: 'Other', label: isRtl ? 'آخر' : 'Other' }
  ];

  const specializations = [
    { value: 'ASD Diagnostic', label: isRtl ? 'تشخيص طيف التوحد' : 'ASD Diagnostic' },
    { value: 'ABA Therapy', label: isRtl ? 'علاج تحليل السلوك التطبيقي' : 'ABA Therapy' },
    { value: 'Speech & Language', label: isRtl ? 'تخاطب ونطق' : 'Speech & Language' },
    { value: 'Sensory Integration', label: isRtl ? 'تكامل حسي' : 'Sensory Integration' },
    { value: 'Genetic Analysis', label: isRtl ? 'تحليلات جينية وتغذية' : 'Genetic Analysis' },
    { value: 'Other', label: isRtl ? 'آخر' : 'Other' }
  ];

  const handleNextStepSelection = () => {
    if (!selectedRole) {
      setError(isRtl ? 'برجاء تحديد نوع الحساب أولاً' : 'Please select your role first');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCopyChildCreds = () => {
    if (generatedChildCreds) {
      navigator.clipboard.writeText(
        `Username: ${generatedChildCreds.username}\nPassword: ${generatedChildCreds.pass}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Common Val
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(isRtl ? 'برجاء ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError(isRtl ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    const sInfo = getPasswordStrength(password);
    if (sInfo.isCommon) {
      setError(strengthT.commonPasswordError);
      return;
    }
    if (sInfo.containsUsername) {
      setError(isRtl
        ? 'لا يمكن أن تحتوي كلمة المرور على اسم المستخدم أو جزء من بريدك الإلكتروني.'
        : 'Password cannot contain your username or email prefix.');
      return;
    }
    if (sInfo.score < 3) {
      setError(isRtl
        ? 'يرجى اختيار كلمة مرور أقوى تلبي معظم متطلبات الحماية.'
        : 'Please choose a stronger password that meets most security requirements.');
      return;
    }

    if (!agreeTerms) {
      setError(isRtl ? 'يجب الموافقة على شروط الخدمة وسياسة الخصوصية' : 'You must agree to the terms of service and privacy policy');
      return;
    }

    // Role-specific validation
    if (selectedRole === 'Parent') {
      if (!childName.trim() || !childAge.trim() || !diagnosisLevel || !childGender) {
        setError(isRtl ? 'برجاء إدخال بيانات الطفل الأساسية' : 'Please enter child details');
        return;
      }
      if (!birthCert) {
        setError(isRtl ? 'برجاء تحميل شهادة الميلاد أو وثيقة إثبات هوية الطفل للتحقق' : 'Please upload child birth certificate/verification document');
        return;
      }
    } else {
      // Clinician validation
      if (!gender || !yearsExp.trim() || !profTitle || !specialization || !clinicName.trim() || !clinicAddress.trim()) {
        setError(isRtl ? 'برجاء ملء كافة البيانات المهنية والشخصية' : 'Please fill in all personal and professional details');
        return;
      }
      if (!nationalIdDoc || !medLicenseDoc || !cvDoc) {
        setError(isRtl ? 'برجاء رفع كافة وثائق التحقق المهنية المطلوبة' : 'Please upload all professional verification documents');
        return;
      }
    }

    setLoading(true);

    try {
      const backendRole = selectedRole === 'Doctor' ? 'doctor' : selectedRole === 'Therapist' ? 'therapist' : 'parent';

      if (selectedRole === 'Parent') {
        const formattedChildName = childName.trim().replace(/\s+/g, '_').toLowerCase();
        const randomNum = Math.floor(100 + Math.random() * 900);
        const childUsername = `${formattedChildName}_${randomNum}`;
        const childPass = `child_${Math.floor(100000 + Math.random() * 900000)}`;

        const registerRes = await register({
          name: fullName,
          email,
          password,
          role: backendRole,
          childName: childName.trim(),
          childAge,
          childGender: childGender.toLowerCase(),
          diagnosisLevel: diagnosisLevel.replace(/\s+/g, '').toLowerCase(),
          childUsername,
          childPassword: childPass,
        });

        if (!registerRes.success) {
          throw new Error(registerRes.error || 'Registration failed');
        }

        setRegisteredUser(registerRes.user);
        setGeneratedChildCreds({ username: childUsername, pass: childPass });
        setStep(3);

      } else {
        // Clinician flow
        const registerRes = await register({
          name: fullName,
          email,
          password,
          role: backendRole,
          clinic: `${profTitle} - ${clinicName}`,
        });

        if (!registerRes.success) {
          throw new Error(registerRes.error || 'Registration failed');
        }

        setStep(4);
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? 'فشل التسجيل. يرجى المحاولة لاحقاً.' : 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-12 px-4 select-none">
      <AnimatePresence mode="wait">

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <motion.div
            key="signup-role-selection"
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
                {t.authHeaderJoin}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {t.authSubRole}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            {/* Role cards selection grid */}
            <div className="grid grid-cols-1 gap-4">

              {/* Parent Option Card */}
              <div
                onClick={() => setSelectedRole('Parent')}
                className={`flex items-center space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedRole === 'Parent'
                  ? 'border-sky-500 bg-sky-50/50 shadow-md ring-1 ring-sky-500/20'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  } ${isRtl ? 'space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'Parent' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-black text-slate-800">{t.authParent}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{t.authParentDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedRole === 'Parent' ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`}>
                  {selectedRole === 'Parent' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Doctor Option Card */}
              <div
                onClick={() => setSelectedRole('Doctor')}
                className={`flex items-center space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedRole === 'Doctor'
                  ? 'border-sky-500 bg-sky-50/50 shadow-md ring-1 ring-sky-500/20'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  } ${isRtl ? 'space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'Doctor' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-black text-slate-800">{t.authDoctor}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{t.authDoctorDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedRole === 'Doctor' ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`}>
                  {selectedRole === 'Doctor' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Therapist Option Card */}
              <div
                onClick={() => setSelectedRole('Therapist')}
                className={`flex items-center space-x-4 p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedRole === 'Therapist'
                  ? 'border-sky-500 bg-sky-50/50 shadow-md ring-1 ring-sky-500/20'
                  : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                  } ${isRtl ? 'space-x-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === 'Therapist' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-xs font-black text-slate-800">{t.authTherapist}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-relaxed">{t.authTherapistDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedRole === 'Therapist' ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300'}`}>
                  {selectedRole === 'Therapist' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={onNavigateToLogin}
                className="text-xs font-extrabold text-slate-400 hover:text-sky-600 transition-colors"
              >
                {t.authAlready}
              </button>
              <button
                onClick={handleNextStepSelection}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 cursor-pointer"
              >
                <span>{t.authNext}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: DETAILS REGISTRATION FORM */}
        {step === 2 && (
          <motion.div
            key="signup-details-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl border border-sky-100 shadow-xl p-8 space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                {selectedRole === 'Parent' ? t.authJoinParent : t.authJoinClinician}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                {t.authCreateStart}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-6">

              {/* --- SECTION 1: PARENT OR PERSONAL INFO --- */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-sky-800 border-b border-sky-50 pb-2">
                  {selectedRole === 'Parent' ? t.authParentInfo : t.authPersonalInfo}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {t.authFullName}
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isRtl ? 'مثال: أحمد محمد' : 'e.g. John Doe'}
                      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {t.authEmail}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {t.authPassword}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                      required
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-500 block">
                      {t.authConfirmPassword}
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="space-y-2 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-left">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-500">
                      <span>{strengthT.strengthLabel}</span>
                      <span className={
                        strengthInfo.score === 4 ? 'text-emerald-500' :
                          strengthInfo.score === 3 ? 'text-teal-500' :
                            strengthInfo.score === 2 ? 'text-amber-500' :
                              'text-rose-500'
                      }>
                        {strengthInfo.isCommon ? strengthT.weak + ' (Common)' :
                          strengthInfo.score === 4 ? strengthT.strong :
                            strengthInfo.score === 3 ? strengthT.good :
                              strengthInfo.score === 2 ? strengthT.fair :
                                strengthT.weak}
                      </span>
                    </div>

                    {/* 4-bar indicator */}
                    <div className="grid grid-cols-4 gap-1.5 h-1.5">
                      {[1, 2, 3, 4].map((stepVal) => (
                        <div
                          key={stepVal}
                          className={`h-full rounded-full transition-all duration-300 ${stepVal <= strengthInfo.score
                            ? (strengthInfo.score === 4 ? 'bg-emerald-500' :
                              strengthInfo.score === 3 ? 'bg-teal-500' :
                                strengthInfo.score === 2 ? 'bg-amber-500' :
                                  'bg-rose-500')
                            : 'bg-slate-200'
                            }`}
                        />
                      ))}
                    </div>

                    {/* Checklist items */}
                    <div className={`space-y-1 pt-1 text-[10px] font-bold text-slate-500`}>
                      <div className={`flex items-center space-x-1.5 ${isRtl ? 'space-x-reverse' : ''}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white transition-colors ${strengthInfo.checks.length ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{strengthT.reqLength}</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${isRtl ? 'space-x-reverse' : ''}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white transition-colors ${strengthInfo.checks.upper ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{strengthT.reqUpper}</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${isRtl ? 'space-x-reverse' : ''}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white transition-colors ${strengthInfo.checks.lower ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{strengthT.reqLower}</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${isRtl ? 'space-x-reverse' : ''}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white transition-colors ${strengthInfo.checks.number ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{strengthT.reqNumber}</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${isRtl ? 'space-x-reverse' : ''}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white transition-colors ${strengthInfo.checks.special ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{strengthT.reqSpecial}</span>
                      </div>
                      <div className={`flex items-center space-x-1.5 ${isRtl ? 'space-x-reverse' : ''}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-white transition-colors ${strengthInfo.checks.noUsername ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{strengthT.reqNoUsername}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Clinician Personal Info */}
                {selectedRole !== 'Parent' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clinician Gender */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authGender}
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      >
                        <option value="">{t.authGenderSelect}</option>
                        {genderOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Clinician Years Experience */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authYearsExp}
                      </label>
                      <input
                        type="number"
                        value={yearsExp}
                        onChange={(e) => setYearsExp(e.target.value)}
                        placeholder="e.g. 5"
                        min="0"
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* --- SECTION 2: CHILD INFO (PARENT FLOW ONLY) --- */}
              {selectedRole === 'Parent' && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-sky-800 border-b border-sky-50 pb-2">
                    {t.authChildInfo}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Child Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authChildName}
                      </label>
                      <input
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder={isRtl ? 'اسم الطفل' : "Child's Name"}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      />
                    </div>

                    {/* Child Age */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authChildAge}
                      </label>
                      <input
                        type="number"
                        value={childAge}
                        onChange={(e) => setChildAge(e.target.value)}
                        placeholder={isRtl ? 'عمر الطفل' : "Child's Age"}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Diagnosis Level */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authDiagnosisLevel}
                      </label>
                      <select
                        value={diagnosisLevel}
                        onChange={(e) => setDiagnosisLevel(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      >
                        <option value="">{t.authLevelSelect}</option>
                        {diagLevels.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Child Gender */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authGender}
                      </label>
                      <select
                        value={childGender}
                        onChange={(e) => setChildGender(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      >
                        <option value="">{t.authGenderSelect}</option>
                        {genderOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Document & Photo Uploaders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authChildPhoto}
                      </label>
                      <FileUploader
                        label={t.authUploadPhoto}
                        subtext={t.authUploadPhotoDesc}
                        file={childPhoto}
                        onFileSelect={setChildPhoto}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authBirthCert}
                      </label>
                      <FileUploader
                        label={t.authUploadDoc}
                        subtext={t.authUploadDocDesc}
                        file={birthCert}
                        onFileSelect={setBirthCert}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- SECTION 2: PROFESSIONAL INFO (CLINICIANS ONLY) --- */}
              {selectedRole !== 'Parent' && (
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-sky-800 border-b border-sky-50 pb-2">
                    {t.authProfessionalInfo}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Professional Title */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authTitle}
                      </label>
                      <select
                        value={profTitle}
                        onChange={(e) => setProfTitle(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      >
                        <option value="">{t.authTitleSelect}</option>
                        {profTitles.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Specialization */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authSpecialization}
                      </label>
                      <select
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      >
                        <option value="">{t.authSpecSelect}</option>
                        {specializations.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Clinic Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authClinicName}
                      </label>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder={isRtl ? 'اسم العيادة' : 'Clinic Name'}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      />
                    </div>

                    {/* Clinic Address */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authClinicAddress}
                      </label>
                      <input
                        type="text"
                        value={clinicAddress}
                        onChange={(e) => setClinicAddress(e.target.value)}
                        placeholder={isRtl ? 'عنوان العيادة' : 'Clinic Address'}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-sky-500 focus:bg-white transition-all font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Clinician Verify Uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authNationalID}
                      </label>
                      <FileUploader
                        label={t.authUploadDoc}
                        subtext={t.authUploadDocDesc}
                        file={nationalIdDoc}
                        onFileSelect={setNationalIdDoc}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authMedicalLicense}
                      </label>
                      <FileUploader
                        label={t.authUploadDoc}
                        subtext={t.authUploadDocDesc}
                        file={medLicenseDoc}
                        onFileSelect={setMedLicenseDoc}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500 block">
                        {t.authCV}
                      </label>
                      <FileUploader
                        label={t.authUploadDoc}
                        subtext={t.authUploadDocDesc}
                        file={cvDoc}
                        onFileSelect={setCvDoc}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-3 pt-2 select-none">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4.5 h-4.5 text-sky-500 focus:ring-sky-400 border-slate-300 rounded cursor-pointer mt-0.5"
                  required
                />
                <label htmlFor="agree-terms" className="text-xs text-slate-500 font-semibold cursor-pointer">
                  {t.authTermsCheck}
                </label>
              </div>

              {/* Form Navigation Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-black text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {isRtl ? 'الرجوع لاختيار الدور' : 'Go back to Step 1'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-300 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 cursor-pointer flex items-center space-x-2"
                >
                  {loading ? (
                    <span>{isRtl ? 'جاري التحقق والتسجيل...' : 'Signing Up...'}</span>
                  ) : (
                    <>
                      <span>{t.authSignUp}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}

        {/* STEP 3: PARENT REGISTRATION SUCCESS SCREEN */}
        {step === 3 && generatedChildCreds && (
          <motion.div
            key="signup-parent-success"
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
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold leading-normal text-left">
                {isRtl
                  ? '⚠️ تم إرسال رابط تأكيد إلى بريدك الإلكتروني. يرجى الضغط عليه لتأكيد حسابك قبل تسجيل الدخول.'
                  : '⚠️ A confirmation link has been sent to your email. Please click it to verify your account before you can log in.'}
              </div>
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
                    <span className="font-extrabold text-slate-800 truncate">{fullName}</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-[9px] text-slate-400 uppercase">Email</span>
                    <span className="font-extrabold text-slate-800 truncate">{email}</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-[9px] text-slate-400 uppercase">Password</span>
                    <span className="font-extrabold text-slate-800 truncate">••••••••</span>
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
                  const baseUser = registeredUser || { name: fullName, email, role: 'parent', isVerified: false };
                  const mergedUser = {
                    ...baseUser,
                    child: generatedChildCreds
                  };
                  onSuccess('Parent', mergedUser);
                }}
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{t.authGoDashboard}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </motion.div>
        )}

        {/* STEP 4: CLINICIAN REGISTRATION PENDING SCREEN */}
        {step === 4 && (
          <motion.div
            key="signup-clinician-pending"
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
              <p>{t.authPendingNotify} <span className="font-extrabold text-slate-800">({email})</span>.</p>
            </div>

            <div className="pt-2">
              <button
                onClick={onNavigateToLogin}
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
