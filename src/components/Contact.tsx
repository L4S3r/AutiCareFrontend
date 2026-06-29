"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, CalendarCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { submitContactForm } from '../api';

interface ContactProps {
  language: Language;
}

export default function Contact({ language }: ContactProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) {
      setFormError(language === 'en' ? 'Please supply at least an Email and Message before submission.' : 'يرجى إدخال البريد الإلكتروني وتفاصيل الطلب أولاً.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      await submitContactForm(formData);
      setFormSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setFormError(err.message || (language === 'en' ? 'An unexpected error occurred. Please try again.' : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-sky-50/20 to-sky-50/50 relative overflow-hidden" id="contact-section">
      
      {/* Background waves dotted path */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg className="absolute w-full h-[120%] opacity-15 text-sky-400" viewBox="0 0 1440 800" fill="none">
          <path d="M-50,300 C400,100 800,500 1300,200" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-sky-600 font-extrabold text-sm uppercase bg-sky-50 px-3.5 py-1.5 rounded-full tracking-wider">
            {t.navContact}
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isRtl ? 'يسعدنا تواصلكم الدائم معنا' : 'We Hold Ourselves to Key Clinical Standards'}
          </h2>
          <p className="text-xs text-slate-400 capitalize hover:text-sky-600 cursor-pointer font-bold tracking-widest font-mono">
            {isRtl ? 'فريق أوتي كير دائمًا في خدمتكم' : 'Direct secure connection lines'}
          </p>
        </div>

        {/* Outer card resembling screenshots in layout perfectly */}
        <div className="bg-white rounded-3xl border border-sky-100 shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left form container */}
            <div className={`p-8 lg:p-12 lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-sky-50 ${isRtl ? 'lg:border-r-0 lg:border-l' : ''}`}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{t.contactHeader}</h3>
                  <p className="text-xs text-slate-400 mt-1">Fields marked as standard can be analyzed by systems immediately if requested.</p>
                </div>

                {formSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center space-y-3"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <p className="text-sm font-bold text-emerald-800">{t.contactSuccess}</p>
                    <button
                      onClick={() => setFormSuccess(false)}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer mt-2"
                    >
                      {isRtl ? 'إرسال رسالة أخرى' : 'Send another submission'}
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-5">
                    
                    {formError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-sky-500" />
                        <span>{isRtl ? 'البريد الإلكتروني للوالد أو العيادة' : 'Email Address'}</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder={t.placeholderEmail}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:bg-white rounded-xl transition-all outline-none disabled:opacity-60"
                      />
                    </div>

                    {/* Phone Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-sky-500" />
                        <span>{isRtl ? 'رقم الهاتف للمتابعة السريعة' : 'Contact Number'}</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder={t.placeholderPhone}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:bg-white rounded-xl transition-all outline-none disabled:opacity-60"
                      />
                    </div>

                    {/* Message Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600 flex items-center space-x-2">
                        <span>{isRtl ? 'تفاصيل الاستفسار أو طلب الاستشارة' : 'Message'}</span>
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        rows={4}
                        placeholder={t.placeholderMsg}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 hover:border-sky-300 focus:border-sky-500 focus:bg-white rounded-xl transition-all outline-none resize-none disabled:opacity-60"
                      />
                    </div>

                    {/* Submit Button containing Checkmark matching screenshot layout */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-3 bg-sky-700 hover:bg-sky-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-sky-600/20 disabled:opacity-60"
                      id="contact-form-submit-btn"
                    >
                      <span>{isSubmitting ? (isRtl ? 'جاري الإرسال...' : 'Sending...') : t.submit}</span>
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <span className="font-extrabold">✓</span>
                      )}
                    </button>

                  </form>
                )}
              </div>
            </div>

            {/* Right info panel with dark slate pills exactly as in screenshot #3 */}
            <div className="p-8 lg:p-12 lg:col-span-5 bg-sky-50/40 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                
                {/* Email Pill */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t.contactEmail}</span>
                  </h4>
                  <div className="bg-slate-700 text-slate-100 font-mono text-xs sm:text-sm font-bold px-4 py-3 rounded-xl shadow-inner select-all">
                    auticare1@gmail.com
                  </div>
                </div>

                {/* Headquarters Pill */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t.contactHQ}</span>
                  </h4>
                  <div className="bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold px-4 py-3 rounded-xl shadow-inner">
                    {t.contactHQVal}
                  </div>
                </div>

                {/* Support Hours Pill */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 font-mono flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t.contactHours}</span>
                  </h4>
                  <div className="bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold px-4 py-3 rounded-xl shadow-inner">
                    {t.contactHoursVal}
                  </div>
                </div>

              </div>

              {/* Schedule Demo Action Block */}
              <div className="pt-6 border-t border-sky-100">
                <button
                  onClick={() => alert(isRtl ? 'تم فتح خيارات الحجز الطبي. جاري مزامنة المواعيد.' : 'Opening clinician booking slots synchronization.')}
                  className="w-full py-4 px-6 bg-slate-700 hover:bg-slate-800 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow shadow-slate-600/35"
                  id="contact-schedule-demo-btn"
                >
                  <CalendarCheck className="w-4 h-4 text-sky-400" />
                  <span>{t.scheduleDemo}</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
