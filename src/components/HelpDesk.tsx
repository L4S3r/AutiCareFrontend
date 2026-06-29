"use client";
import React, { useState } from "react";
import { ArrowRight, CheckCircle2, User, Mail, Loader2, AlertCircle } from "lucide-react";
import { Language } from "../types";
import { TRANSLATIONS } from "../data";
import { submitContactForm } from "../api";

interface HelpDeskProps {
  language: Language;
}

export default function HelpDesk({ language }: HelpDeskProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === "ar";

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !firstName) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      await submitContactForm({
        name: firstName.trim(),
        email: email.trim(),
        message: isRtl 
          ? "طلب تواصل وتلقي المساعدة عبر مكتب الدعم الفني." 
          : "Help Desk Connection Request: Please reach out to me for assistance.",
      });
      setSubmitted(true);
      setFirstName("");
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err.message || (isRtl ? "فشل إرسال الطلب. يرجى المحاولة لاحقاً." : "Failed to submit request. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-sky-50/50 border-t border-sky-100 relative overflow-hidden" id="help-desk-section">
      {/* Background vector circles matching other sections */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <svg className="absolute -left-12 -bottom-12 w-64 h-64 text-sky-400" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
        </svg>
        <svg className="absolute -right-12 -top-12 w-64 h-64 text-sky-400" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {isRtl ? (
              <>
                تواصل مع{" "}
                <span className="italic bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>مكتب الدعم الفني</span>{" "}
                للمساعدة
              </>
            ) : (
              <>
                Reach our{" "}
                <span className="italic bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Help Desk</span>{" "}
                for support
              </>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
            {t.reachSub}
          </p>
        </div>

        {submitted ? (
          <div className="max-w-xl mx-auto bg-white border border-emerald-100 rounded-3xl p-8 text-center shadow-md space-y-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 max-w-sm mx-auto leading-relaxed">
              {t.contactSuccess}
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer mt-2"
            >
              {isRtl ? "إرسال طلب آخر" : "Submit another request"}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 max-w-2xl mx-auto ${
              isRtl ? "sm:flex-row-reverse" : ""
            }`}
          >
            {/* First Name Input with Person Icon */}
            <div className="relative w-full sm:w-[220px]">
              <span className={`absolute inset-y-0 flex items-center pointer-events-none text-slate-400 ${
                isRtl ? "right-0 pr-3.5" : "left-0 pl-3.5"
              }`}>
                <User className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t.placeholderName}
                required
                disabled={isSubmitting}
                className={`w-full py-3 text-xs bg-sky-50/70 border border-sky-100/80 hover:border-sky-300 focus:border-sky-500 focus:bg-white rounded-xl transition-all outline-none text-slate-700 font-medium placeholder-slate-400 disabled:opacity-60 ${
                  isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              />
            </div>

            {/* Email Input with Mail Icon */}
            <div className="relative w-full sm:w-[220px]">
              <span className={`absolute inset-y-0 flex items-center pointer-events-none text-slate-400 ${
                isRtl ? "right-0 pr-3.5" : "left-0 pl-3.5"
              }`}>
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.placeholderEmail}
                required
                disabled={isSubmitting}
                className={`w-full py-3 text-xs bg-sky-50/70 border border-sky-100/80 hover:border-sky-300 focus:border-sky-500 focus:bg-white rounded-xl transition-all outline-none text-slate-700 font-medium placeholder-slate-400 disabled:opacity-60 ${
                  isRtl ? "pr-10 pl-4 text-right" : "pl-10 pr-4 text-left"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer shadow-md shadow-slate-700/25 disabled:opacity-60 ${
                isRtl ? "flex-row-reverse" : "flex-row"
              }`}
              id="help-desk-submit-btn"
            >
              <span>{isSubmitting ? (isRtl ? "جاري الإرسال..." : "Sending...") : t.navContact}</span>
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin ml-2" />
              ) : (
                <span
                  className={`w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white ${
                    isRtl ? "mr-2 rotate-180" : "ml-2"
                  }`}
                >
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              )}
            </button>
          </form>
        )}

        {errorMsg && (
          <div className="mt-4 max-w-2xl mx-auto p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </section>
  );
}
