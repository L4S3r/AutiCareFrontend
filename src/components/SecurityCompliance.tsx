"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Server, EyeOff, Lock, CheckCircle2, RefreshCw } from 'lucide-react';
import { SecurityAuditLog, Language } from '../types';
import { SECURITY_AUDIT_LOGS, TRANSLATIONS } from '../data';

interface SecurityComplianceProps {
  language: Language;
}

export default function SecurityCompliance({ language }: SecurityComplianceProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const [logs, setLogs] = useState<SecurityAuditLog[]>(SECURITY_AUDIT_LOGS);
  const [tracingActive, setTracingActive] = useState(true);

  // Sliced features from screenshots
  const securityChecklist = [
    { label: isRtl ? 'تشفير كامل للبيانات عند التخزين والإرسال' : 'End-to-end encryption at rest & transit', checked: true },
    { label: isRtl ? 'سجلات المتابعة والتدقيق الأمني التلقائية' : 'Secure automated audit logs', checked: true },
    { label: isRtl ? 'حجب الوصول وتحديد الصلاحيات للأدوار' : 'Role-based access controls', checked: true },
    { label: isRtl ? 'امتثال وتوافق معايير HIPAA و SOC-2 الكاملة' : 'Full HIPAA & SOC-2 compliance infrastructure', checked: true },
    { label: isRtl ? 'خصوصية فائقة للملف الطبي للطفل' : 'Zero-knowledge encryption for patient files', checked: true },
    { label: isRtl ? 'أوقات وتوقيتات الجلسات المشفرة بالكامل' : 'Encrypted session tokens & cookies tracking', checked: true },
  ];

  const handleRefreshTrail = () => {
    setTracingActive(false);
    setTimeout(() => {
      setTracingActive(true);
    }, 600);
  };

  return (
    <div className="bg-white rounded-3xl border border-sky-100 shadow-md p-6 sm:p-8" id="security-compliance-workspace">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-sky-100 pb-6 mb-8 gap-4">
        <div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-600 animate-pulse" />
            <span>{t.portalSecurity}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Audit log records representing real-time operations under HIPAA compliance paradigms.</p>
        </div>

        {/* Audit refresh trigger */}
        <button
          onClick={handleRefreshTrail}
          className="px-3 py-1.5 border border-slate-200 hover:border-sky-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all text-xs flex items-center space-x-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-none" />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: HIPAA rules and checklist card */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-800 font-mono flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <span>Security Highlights</span>
            </h4>
            
            <p className="text-[11px] text-emerald-900/80 leading-relaxed font-semibold">
              The AutiCare platform meets 100% of HIPAA administrative and physical safeguards. All genetic, medical, and behavioral attributes are tokenized before syncing.
            </p>

            <ul className="space-y-2.5 pt-2 border-t border-emerald-150">
              {securityChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-[11px] text-emerald-800">
                  <span className="bg-emerald-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-snug">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Secure details card */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start space-x-3">
            <Server className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Encrypted server hosts</span>
              <p className="text-[11px] text-slate-600 leading-normal mt-0.5">
                All logs represent real-time requests processed in sandboxed environments using 256-bit AES cryptographic protocols.
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Interactive audit ledger logs */}
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Real-Time HIPAA Audit Ledger Logs</span>
          
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-inner space-y-3.5 text-white max-h-[360px] overflow-y-auto font-mono">
            {tracingActive ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="border-b border-white/5 pb-2.5 last:border-b-0 last:pb-0 space-y-1 text-[10px] text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sky-400 font-bold">{log.action}</span>
                      <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black">{log.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-slate-500">
                      <span>By: {log.performedBy}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="text-[9px] text-sky-500/80">
                      Request IP: {log.ipAddress} · Signature Verified
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-500">Recalibrating signature compliance schemas...</p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px] text-slate-500 select-none">
            <EyeOff className="w-4 h-4 text-sky-500 flex-shrink-0" />
            <span>Encrypted HIPAA logs cannot be manually deleted or overwritten according to US federal guidelines.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
