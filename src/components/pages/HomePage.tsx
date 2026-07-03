"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Dna, Users, ChartLine, Shield, ArrowRight,
  Activity, Baby, Sparkles, TrendingUp,
  AlertTriangle, Utensils, Clock, Wifi,
  BarChart3, Bell, Gamepad2, Lock,
  CheckCircle
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 overflow-hidden bg-white">
      {/* Decorative dashed arc top-right */}
      <div className="absolute top-10 right-0 w-[350px] h-[350px] pointer-events-none z-0">
        <svg width="350" height="350" viewBox="0 0 350 350" fill="none">
          <circle cx="350" cy="0" r="200" stroke="#C7DDF0" strokeWidth="2" strokeDasharray="12 8" />
          <circle cx="350" cy="0" r="280" stroke="#E2EEF8" strokeWidth="1.5" strokeDasharray="10 6" />
        </svg>
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="animate-fade-in-up">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-[var(--color-text-primary)] leading-[1.15] mb-5">
                Personalized Autism{" "}
                <br />
                Care & Connection Platform
              </h1>
              <p className="text-base text-[var(--color-text-secondary)] mb-8 max-w-lg leading-relaxed">
                AutiCare brings together doctors, therapists, and families on one platform.
                Personalized nutrition plans, daily behavior tracking, and care coordination
                designed for your child's unique needs.
              </p>

            <Link href="/contact" className="btn btn-amber mb-8">
              Book Demo <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-[var(--color-text-muted)]">
                Download our application
              </span>
              <Image
                src="/images/app-stores.png"
                alt="Google Play & App Store"
                width={120}
                height={36}
                className="h-9 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Right — Hero Image + Quote */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <Image
                src="/images/hero-child.png"
                alt="Child with therapy robot"
                width={500}
                height={360}
                className="rounded-2xl object-cover"
                priority
              />
              {/* Quote bubble */}
              <div className="absolute top-[45%] -left-8 lg:-left-16 max-w-[250px] quote-bubble z-20 flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-amber)] flex items-center justify-center text-white font-serif text-lg leading-none font-bold select-none">
                  “
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-[var(--color-text-primary)] font-medium leading-relaxed">
                    Experience personalized medical care from the comfort of your home.
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">
                    Sarah M. — Parent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════ THE PROBLEM SECTION ═══════════════════════════════════════════════════ */
function ProblemSection() {
  // Array defining the problem elements alongside their beautiful image color mappings
  const problems = [
    {
      icon: Wifi,
      title: "Fragmented Care",
      desc: "Doctors, therapists, and parents work in silos with no unified system to share insights.",
      bg: "bg-indigo-50/50",
      border: "border-indigo-100",
      color: "text-indigo-600"
    },
    {
      icon: Utensils,
      title: "One-Size-Fits-All Nutrition",
      desc: "Generic nutrition advice ignores each child's unique genetic profile and specific metabolic needs.",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      color: "text-emerald-600"
    },
    {
      icon: Clock,
      title: "Late Detection",
      desc: "Behavioral crises are discovered too late. No predictive tools exist to intervene early.",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      color: "text-amber-600"
    },
    {
      icon: AlertTriangle,
      title: "Disconnected Ecosystem",
      desc: "Parents manually track meals, sleep, and medications across disconnected apps with no unified guidance.",
      bg: "bg-rose-50/50",
      border: "border-rose-100",
      color: "text-rose-600"
    },
  ];

  return (
    <section id="problem-section" className="relative py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Main Section Header Layout (The red bubble wrapper is completely deleted from here) */}
        <h2 className="text-4xl font-black text-sky-500 tracking-tight">
          The Problem
        </h2>
        <p className="mt-2 text-sm italic font-medium text-slate-500 dark:text-slate-400">
          Autism Care is Broken
        </p>

        <p className="max-w-2xl mx-auto mt-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
          Families with children on the autism spectrum face overwhelming fragmentation across providers, tools, and information.
        </p>

        {/* Responsive Grid Container holding the 4 color-coded cards intact */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((prob, idx) => {
            const IconComponent = prob.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon Badge Box using its specified coloring context */}
                  <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${prob.bg} ${prob.border} ${prob.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Card Content Metadata */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-slate-800 dark:text-white">
                      {prob.title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold leading-relaxed">
                      {prob.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   OUR SOLUTION SECTION
   ═══════════════════════════════════════════════════ */
function SolutionSection() {
  const topFeatures = [
    {
      icon: Dna,
      title: "Personalized Nutrition & Diet Plan",
      desc: "Analyzes genetic markers like MTHFR, VDR, and HLA-DQ2 to create supplement and dietary plans tailored to your child.",
      color: "bg-white",
    },
    {
      icon: BarChart3,
      title: "Behavioral Pattern Tracking",
      desc: "Track mood, sleep, meltdowns, and therapy attendance with clear trend charts and insights.",
      color: "bg-white",
    },
  ];

  const bottomFeatures = [
    {
      icon: Users,
      title: "Shared Workspace for Your Care Team",
      desc: "Doctor, therapist, parent, and child dashboards with real-time notes and alerts.",
      bg: "bg-[#EBF5FB]",
    },
    {
      icon: Bell,
      title: "Early Warning Alerts",
      desc: "Get notified about behavioral changes early, with practical tips to help prevent meltdowns.",
      bg: "bg-[#EBF5FB]",
    },
    {
      icon: Gamepad2,
      title: "Child Development",
      desc: "5 interactive cognitive games tracking memory, attention, and emotional recognition.",
      bg: "bg-[#EBF5FB]",
    },
    {
      icon: Lock,
      title: "HIPAA Security",
      desc: "End-to-end encryption, audit logs, role-based access control, and secure file storage.",
      bg: "bg-[#EBF5FB]",
    },
  ];

  return (
    <section className="section relative overflow-hidden">
      {/* Decorative arc */}
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] pointer-events-none z-0">
        <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle cx="0" cy="300" r="200" stroke="#C7DDF0" strokeWidth="2" strokeDasharray="12 8" />
        </svg>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--color-text-primary)] mb-2">
            Our <span className="text-[var(--color-brand-primary)]">Solution</span>
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] italic mb-1">
            Everything you need in one place
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-2xl mx-auto">
            From genetic analysis to daily behavior tracking — all in one secure, compliant platform.
          </p>
        </div>

        {/* Top 2 features */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {topFeatures.map((f, i) => (
            <div
              key={i}
              className="card-blue p-6 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="icon-box icon-box-blue mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)] mb-1.5">
                {f.title}
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom 4 features */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {bottomFeatures.map((f, i) => (
            <div
              key={i}
              className={`p-5 rounded-xl border border-[var(--color-border-light)] ${f.bg} animate-fade-in-up`}
              style={{ animationDelay: `${(i + 2) * 0.1}s` }}
            >
              <div className="icon-box icon-box-blue mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[var(--color-text-primary)] text-sm mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   STATS SECTION
   ═══════════════════════════════════════════════════ */
function StatsSection() {
  const stats = [
    { value: "500+", label: "Children\nSupported" },
    { value: "10", label: "Genetic\nMarkers" },
    { value: "4", label: "Care\nRoles" },
    { value: "98%", label: "Physician\nApproval Rate" },
  ];

  return (
    <section className="py-14 bg-[var(--color-sky-lighter)]">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl lg:text-4xl font-extrabold text-[var(--color-brand-primary)] mb-1">
                {s.value}
              </p>
              <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-line font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   WORKFLOW SECTION
   ═══════════════════════════════════════════════════ */
function WorkflowSection() {
  const steps = [
    "Doctor uploads genetic PDF report",
    "OCR extracts genetic marker data",
    "Rule engine maps markers → interventions",
    "Doctor reviews and edits suggestions",
    "Doctor approves the final plan",
    "Parent receives approved nutrition plan",
  ];

  return (
    <section className="section relative overflow-hidden">
      {/* Decorative arc top right */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] pointer-events-none">
        <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle cx="300" cy="0" r="180" stroke="#C7DDF0" strokeWidth="2" strokeDasharray="12 8" />
        </svg>
      </div>

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--color-text-primary)] mb-2">
            <span className="text-[var(--color-brand-primary)]">Work</span>flow
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xl mx-auto">
            Navigating your healthcare journey with AutiCare is seamless. Just follow these steps mentioned
            below to proceed with your selected services. You can also see our FAQ section for more guidance.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Steps */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-9 h-9 rounded-full bg-[var(--color-brand-dark)] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-[var(--color-text-primary)] font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Right — Doctor Image */}
          <div className="flex justify-center relative">
            <Image
              src="/images/doctor-team.png"
              alt="Certified team of specialists"
              width={420}
              height={320}
              className="rounded-2xl object-cover shadow-lg"
            />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-[var(--color-brand-primary)] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Certified team of specialists
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   ROLES SECTION
   ═══════════════════════════════════════════════════ */
function RolesSection() {
  const roles = [
    {
      title: "Doctor",
      desc: "Uploads genetic report & approves plan.",
      color: "text-[var(--color-brand-primary)]",
    },
    {
      title: "Parent",
      desc: "Tracks daily logs, meals & medications.",
      color: "text-[var(--color-teal)]",
    },
    {
      title: "Therapist",
      desc: "Logs behavioral sessions & progress.",
      color: "text-[var(--color-brand-primary)]",
    },
    {
      title: "Child",
      desc: "Plays cognitive games for development tracking.",
      color: "text-[var(--color-teal)]",
    },
  ];

  return (
    <section className="section bg-[var(--color-sky-lighter)] relative overflow-hidden">
      {/* Decorative arc */}
      <div className="absolute top-0 left-0 w-[250px] h-[250px] pointer-events-none">
        <svg width="250" height="250" viewBox="0 0 250 250" fill="none">
          <circle cx="0" cy="0" r="160" stroke="#C7DDF0" strokeWidth="2" strokeDasharray="12 8" />
        </svg>
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Doctor image */}
          <div className="flex justify-center">
            <Image
              src="/images/doctor.png"
              alt="Doctor using AutiCare"
              width={340}
              height={400}
              className="rounded-2xl object-cover"
            />
          </div>

          {/* Right — Roles grid */}
          <div>
            <div className="grid grid-cols-2 gap-5 mb-6">
              {roles.map((role, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <h3 className={`text-lg font-bold ${role.color} mb-1`}>
                    {role.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                    {role.desc}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/features" className="btn btn-primary text-sm">
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   TESTIMONIALS SECTION
   ═══════════════════════════════════════════════════ */
function TestimonialsSection() {
  const testimonials = [
    {
      name: "— Pediatric Neurologist",
      quote:
        "AutiCare transformed how I manage my ASD patients. The personalized nutrition planning alone saved me hours of research per patient.",
      avatar: "/images/avatar-1.png",
    },
    {
      name: "— Parent",
      quote:
        "For the first time, I feel like our whole care team is on the same page. The parent dashboard makes daily tracking so easy and meaningful.",
      avatar: "/images/avatar-2.png",
    },
    {
      name: "— ABA Therapist",
      quote:
        "The behavioral tracking helps me see patterns I would have missed. My session plans are so much more targeted now.",
      avatar: "/images/avatar-3.png",
    },
    {
      name: "— Medical Director",
      quote:
        "We deployed AutiCare across our 3 clinics. The coordination improvement is remarkable. Highly recommended for any autism specialty center.",
      avatar: "/images/avatar-4.png",
    },
  ];

  return (
    <section className="section relative overflow-hidden">
      {/* Decorative dots */}
      <div className="dot-grid absolute bottom-8 right-8" />

      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">
            <span className="text-[var(--color-brand-primary)]">Testimonials</span>
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto">
            Discover the difference we make through the voices of those we've served:
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="card-blue p-5 flex gap-4 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Image
                src={t.avatar}
                alt="Testimonial"
                width={52}
                height={52}
                className="w-13 h-13 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] italic leading-relaxed mb-2">
                  "{t.quote}"
                </p>
                <p className="text-xs text-[var(--color-text-muted)] font-semibold">
                  {t.name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   HELP DESK / CTA SECTION
   ═══════════════════════════════════════════════════ */
function HelpDeskSection() {
  return (
    <section className="section bg-[var(--color-sky-lighter)] relative overflow-hidden">
      <div className="container relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[var(--color-text-primary)] mb-3">
            Reach our{" "}
            <span className="text-[var(--color-brand-primary)] italic">Help Desk</span>{" "}
            for support
          </h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-lg mx-auto">
            Questions? Need assistance? Our dedicated support team is here to help you every step of the way.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Enter Your First Name"
            className="input max-w-[220px] text-sm bg-[var(--color-sky-light)] border-[var(--color-border-light)]"
          />
          <input
            type="email"
            placeholder="Enter Your Email Address"
            className="input max-w-[220px] text-sm bg-[var(--color-sky-light)] border-[var(--color-border-light)]"
          />
          <button className="btn btn-amber text-sm whitespace-nowrap">
            Contact us <CheckCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE EXPORT
   ═══════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <StatsSection />
      <WorkflowSection />
      <RolesSection />
      <TestimonialsSection />
      <HelpDeskSection />
    </>
  );
}
