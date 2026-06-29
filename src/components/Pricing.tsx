"use client";
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Sparkles, HelpCircle } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';
import { useState } from 'react';

interface PricingProps {
  language: Language;
  onSelectPlan?: (planName: string) => void;
}

export default function Pricing({ language, onSelectPlan }: PricingProps) {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  
  // Toggles for Yearly vs Monthly
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  // Toggle for Doctor vs Parent plans
  const [tierCategory, setTierCategory] = useState<'clinical' | 'family'>('clinical');

  // FAQs list
  const faqs = [
    { q: t.faqQ1, a: t.faqA1 },
    { q: t.faqQ2, a: t.faqA2 },
    { q: t.faqQ3, a: t.faqA3 },
    { q: t.faqQ4, a: t.faqA4 }
  ];

  const clinicalPlans = [
    {
      name: t.clinicTitle,
      price: billingCycle === 'yearly' ? '1,999' : '2,499',
      desc: t.clinicDesc,
      popular: false,
      features: [
        'Up to 50 active patients',
        '3 doctor accounts',
        '5 therapist accounts',
        'Unlimited parent accounts',
        'AI Genetic Nutrition Engine',
        'Behavioral analytics',
        'Child cognitive games',
        'Email support',
        'HIPAA compliance',
        'Mobile responsive'
      ]
    },
    {
      name: t.hospTitle,
      price: billingCycle === 'yearly' ? '4,999' : '5,999',
      desc: t.hospDesc,
      popular: true,
      features: [
        'Up to 300 active patients',
        'Unlimited doctor accounts',
        'Unlimited therapist accounts',
        'Unlimited parent accounts',
        'Everything in Clinic Plan',
        'Advanced AI behavioral prediction',
        'OCR genetic report parsing',
        'Priority support (24/7)',
        'Custom branding',
        'API access',
        'Analytics dashboard',
        'Audit logs & compliance reports'
      ]
    },
    {
      name: t.entTitle,
      price: 'Custom',
      desc: t.entDesc,
      popular: false,
      features: [
        'Unlimited patients & roles',
        'SSO / SAML integration',
        'Custom AI model training',
        'On-premise deployment option',
        'Dedicated success manager',
        'SLA guarantee (99.9% uptime)',
        'White-label mobile application',
        'Multi-language support (AR/EN/JP)',
        'Audit log for all actions',
        'Advanced visual telemetry exports'
      ]
    }
  ];

  const familyPlans = [
    {
      name: t.parentTitle,
      price: billingCycle === 'yearly' ? '399' : '499',
      desc: t.parentDesc,
      popular: false,
      features: [
        '1 Parent account + 1 Child profile',
        'Linked caregiver ecosystem',
        'Child progress logs',
        'AI-guided daily routines',
        'Smart nutrition/meal tracker',
        'Memory & attention cognitive games',
        'Weekly behavioral PDF reports',
        'Direct doctor communication portal',
        'Secure cloud-based encryption'
      ]
    },
    {
      name: t.familyTitle,
      price: billingCycle === 'yearly' ? '59' : '69',
      desc: t.familyDesc,
      popular: true,
      features: [
        'Up to 2 Parent accounts + Multiple Children profiles',
        'Unified dashboard for full family monitoring',
        'Everything in Parent-Child Plan',
        'AI-personalized care for each child',
        'Smart tracking for behavior, sleep, meals, and medication',
        'Interactive therapeutic games library',
        'Al-adaptive games based on each child\'s needs',
        'More gamified progress with rewards and achievements',
        'Centralized monitoring for all children',
        'Real-time progress reports and insights',
        'Direct communication with therapists & doctors',
        'Option to assign different therapists per child',
        'Predictive alerts for behavioral changes',
        'Al recommendations for early intervention',
        'Secure cloud-based system',
        'Multi-language support (AR/EN)',
        'Private and safe data environment',
        'Simple, intuitive interface for families'
      ]
    }
  ];

  const activePlans = tierCategory === 'clinical' ? clinicalPlans : familyPlans;

  return (
    <div id="pricing-section" className="bg-gradient-to-b from-white via-sky-50/30 to-white py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <span className="text-black font-extrabold text-sm uppercase bg-white border border-slate-200 px-3.5 py-1.5 rounded-full tracking-wider">
            {t.navPricing}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r leading-tight" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t.pricingTitle}
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            {t.pricingSub}
          </p>
        </div>

        {/* Categories toggles grid */}
        <div className="flex flex-col items-center justify-center space-y-6 mb-12">
          
          {/* Main clinical vs parent switcher */}
          <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setTierCategory('clinical')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                tierCategory === 'clinical' 
                  ? 'bg-sky-500 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              id="pricing-toggle-clinical"
            >
              {t.secPractice}
            </button>
            <button
              onClick={() => setTierCategory('family')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                tierCategory === 'family' 
                  ? 'bg-sky-500 text-white shadow' 
                  : 'text-slate-600 hover:text-slate-800'
              }`}
              id="pricing-toggle-family"
            >
              {t.secFamilies}
            </button>
          </div>

          {/* Monthly vs Yearly Switcher */}
          <div className="flex items-center space-x-3 text-xs font-semibold text-slate-600">
            <span className={billingCycle === 'monthly' ? 'text-slate-900 font-bold' : ''}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-11 h-6 bg-sky-200 rounded-full cursor-pointer relative transition-all"
              id="billing-cycle-toggle"
            >
              <div 
                className={`absolute top-1 w-4 h-4 rounded-full bg-sky-600 transition-all ${
                  isRtl 
                    ? (billingCycle === 'yearly' ? 'right-6' : 'right-1') 
                    : (billingCycle === 'yearly' ? 'left-6' : 'left-1')
                }`} 
              />
            </button>
            <span className={billingCycle === 'yearly' ? 'text-sky-600 font-bold flex items-center' : ''}>
              Yearly <span className="ml-1.5 bg-sky-100 text-sky-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Save 20%</span>
            </span>
          </div>

        </div>

        {/* Plans list */}
        <div className={`grid grid-cols-1 md:grid-cols-${activePlans.length > 2 ? '3' : '2'} gap-8 items-stretch pt-4 max-w-5xl mx-auto`}>
          {activePlans.map((plan, idx) => {
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className={`bg-white rounded-3xl p-8 border hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between ${
                  plan.popular 
                    ? 'border-sky-300 shadow-md scale-100 md:scale-105 z-10' 
                    : 'border-slate-100 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className={`absolute -top-3 left-1/2 transform -translate-x-1/2 bg-sky-500 text-white text-[10px] uppercase tracking-widest font-black px-4 py-1 rounded-full flex items-center space-x-1 shadow-sm`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t.mostPopular}</span>
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{plan.desc}</p>
                  </div>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {isRtl ? `ج.م ${plan.price}` : `${plan.price} EGP`}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">/ Mo</span>
                    )}
                  </div>

                  {/* Feature lists with checkmarks */}
                  <ul className="space-y-3 pt-4 border-t border-slate-100">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start space-x-2.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                </div>

                <div className="pt-8">
                  <button
                    onClick={() => {
                      if (onSelectPlan) {
                        onSelectPlan(plan.name);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-xl font-bold transition-all text-xs uppercase tracking-wider cursor-pointer ${
                      plan.popular 
                        ? 'bg-sky-500 hover:bg-sky-600 text-white shadow shadow-sky-400/25' 
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                    id={`pricing-get-started-${idx}`}
                  >
                    {t.getStarted}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="mt-24 max-w-3xl mx-auto bg-slate-50 rounded-3xl p-8 border border-slate-100" id="faqs">
          <div className="text-center space-y-2 mb-10">
            <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r" style={{ backgroundImage: "linear-gradient(98.64deg, #88D8FF 27.59%, #6E96BE 59.73%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t.faqHeader}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Everything you need to know</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-start space-x-2.5">
                  <HelpCircle className="w-4 h-4 text-sky-500 flex-shrink-0 mt-1" />
                  <h4 className="text-sm font-bold text-slate-800 leading-snug">{faq.q}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
