"use client";
import React from 'react';
import { motion } from 'framer-motion';
import {
    Dna, LineChart, Users2, ShieldAlert, BrainCircuit, Activity,
    FileBadge, Sliders, Wifi, Clock, AlertTriangle, Utensils
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data';

interface FeaturesProps {
    language: Language;
    onOpenPortal: () => void;
}

export default function Features({ language, onOpenPortal }: FeaturesProps) {
    const t = TRANSLATIONS[language];
    const isRtl = language === 'ar';

    // Array mapping the core problematic variables alongside their color palettes
    const problems = [
        {
            title: t.probCard1Title || "Fragmented Care",
            desc: t.probCard1Desc || "Doctors, therapists, and parents work in silos with no unified system to share insights.",
            bg: 'bg-indigo-50/50',
            icon: Wifi,
            border: 'border-indigo-100',
            color: 'text-indigo-600'
        },
        {
            title: t.probCard2Title || "One-Size-Fits-All Nutrition",
            desc: t.probCard2Desc || "Generic nutrition advice ignores each child's unique genetic profile and specific metabolic needs.",
            bg: 'bg-emerald-50/50',
            icon: Utensils,
            border: 'border-emerald-100',
            color: 'text-emerald-600'
        },
        {
            title: t.probCard3Title || "Late Detection",
            desc: t.probCard3Desc || "Behavioral crises are discovered too late. No predictive tools exist to intervene early.",
            bg: 'bg-amber-50/50',
            icon: Clock,
            border: 'border-amber-100',
            color: 'text-amber-600'
        },
        {
            title: t.probCard4Title || "Disconnected Ecosystem",
            desc: t.probCard4Desc || "Parents manually track meals, sleep, and medications across disconnected apps with no AI guidance.",
            bg: 'bg-rose-50/50',
            icon: AlertTriangle,
            border: 'border-rose-100',
            color: 'text-rose-600'
        }
    ];

    const solutions = [
        { title: t.solCard1Title || "AI Genetic Nutrition", desc: t.solCard1Desc || "Metabolic analysis of key autism-linked markers.", icon: Dna, accent: 'bg-sky-500', textAccent: 'text-sky-600' },
        { title: t.solCard2Title || "Behavioral Analytics", desc: t.solCard2Desc || "Track sleep, sensory stress, meals, and mood trends.", icon: LineChart, accent: 'bg-blue-500', textAccent: 'text-blue-600' },
        { title: t.solCard3Title || "Care Coordination", desc: t.solCard3Desc || "Shared dashboards for parents, therapists, and doctors.", icon: Users2, accent: 'bg-indigo-500', textAccent: 'text-indigo-600' },
        { title: t.solCard4Title || "Predictive Alerts", desc: t.solCard4Desc || "Receive warning updates about potential behavior patterns.", icon: BrainCircuit, accent: 'bg-purple-500', textAccent: 'text-purple-600' },
        { title: t.solCard5Title, desc: t.solCard5Desc, icon: Activity, accent: 'bg-pink-500', textAccent: 'text-pink-600' },
        { title: t.solCard6Title, desc: t.solCard6Desc, icon: FileBadge, accent: 'bg-emerald-500', textAccent: 'text-emerald-600' }
    ];

    return (
        <div id="features-section" className="bg-slate-50/30 dark:bg-slate-950/20 py-20 select-none">

            {/* 1. THE PROBLEM BLOCK */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24">
                {/* The red bubble tag element has been removed entirely from here */}
                <h2 className="text-4xl font-black text-sky-500 tracking-tight">
                    The Problem
                </h2>
                <p className="mt-2 text-sm italic font-medium text-slate-500 dark:text-slate-400">
                    Autism Care is Broken
                </p>
                <p className="max-w-2xl mx-auto mt-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    Families with children on the autism spectrum face overwhelming fragmentation across providers, tools, and information.
                </p>

                {/* Problem Grid Cards */}
                <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {problems.map((prob, idx) => {
                        const IconComponent = prob.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${prob.bg} ${prob.border} ${prob.color}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1.5">
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

            {/* 2. THE SOLUTION BLOCK */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Our <span className="text-brand-600">Solution</span>
                </h2>
                <p className="mt-2 text-xs uppercase tracking-widest font-bold text-slate-400">
                    Integrated Digital Health Ecosystem
                </p>

                {/* Solutions Grid */}
                <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {solutions.map((sol, idx) => {
                        const IconComponent = sol.icon;
                        return (
                            <div
                                key={idx}
                                className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${sol.accent}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <h4 className="text-sm font-black text-slate-800 dark:text-white">
                                            {sol.title}
                                        </h4>
                                        <p className="text-xs text-slate-400 dark:text-slate-400 font-semibold leading-relaxed">
                                            {sol.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
    );
}