//Not fully implemented

"use client";
import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
    Shield, UserCog, Activity, Database, TrendingUp, LogOut,
    ChevronRight, ChevronLeft, Users, CheckCircle, AlertTriangle
} from "lucide-react";
import { Language } from '../types';

interface AdminDashboardProps {
    language: Language;
    adminUser: {
        name: string;
        email: string;
    };
    onLogout: () => void;
}

export default function AdminDashboard({ language, adminUser, onLogout }: AdminDashboardProps) {
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'audit'>('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

    // Hardcoded mockup data in sync with project manifest specs
    const [systemUsers, setSystemUsers] = useState([
        { id: 'USR-01', name: "Dr. Sarah Al-Mansouri", role: "Doctor", email: "sarah@auticare.ai", status: "Active" },
        { id: 'USR-02', name: "Ms. Leila Karim", role: "Therapist", email: "leila@auticare.ai", status: "Active" },
        { id: 'USR-03', name: "Ahmed Yasser", role: "Parent", email: "ahmedyaso55@gmail.com", status: "Active" }
    ]);

    const auditLogs = [
        { action: "POST /api/nutrition/generate", performedBy: "Dr. Sarah", timestamp: "2 mins ago", status: "SUCCESS", ip: "197.34.112.5" },
        { action: "PUT /api/nutrition/approve", performedBy: "Dr. James", timestamp: "15 mins ago", status: "SUCCESS", ip: "197.34.112.6" },
        { action: "POST /api/genetic/upload", performedBy: "Dr. Sarah", timestamp: "1 hour ago", status: "WARNING", ip: "197.34.112.5" }
    ];

    const handleToggleStatus = (id: string) => {
        setSystemUsers(prev => prev.map(user =>
            user.id === id ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' } : user
        ));
    };

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">

            {/* SIDEBAR */}
            <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col justify-between p-4 transition-all duration-300 fixed h-full z-50`}>
                <div className="space-y-8">
                    <div className="flex items-center justify-between gap-2">
                        {!sidebarCollapsed && (
                            <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-white font-black text-base">A</div>
                                <span className="text-sm font-black text-white tracking-tight">AutiCare <span className="text-amber-400">Admin</span></span>
                            </div>
                        )}
                        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 mx-auto cursor-pointer">
                            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                    </div>

                    <nav className="flex flex-col space-y-1.5">
                        <button onClick={() => setActiveTab('overview')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'overview' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                            <TrendingUp className="w-4 h-4 flex-shrink-0" />
                            {!sidebarCollapsed && <span>Overview</span>}
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'users' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                            <UserCog className="w-4 h-4 flex-shrink-0" />
                            {!sidebarCollapsed && <span>User Control</span>}
                        </button>
                        <button onClick={() => setActiveTab('audit')} className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold text-left flex items-center ${activeTab === 'audit' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:bg-slate-800'} ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                            <Shield className="w-4 h-4 flex-shrink-0" />
                            {!sidebarCollapsed && <span>HIPAA Audit Trails</span>}
                        </button>
                    </nav>
                </div>

                <button onClick={onLogout} className="w-full py-2 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-black flex items-center justify-center gap-2">
                    <LogOut className="w-3.5 h-3.5" />
                    {!sidebarCollapsed && <span>SHUTDOWN</span>}
                </button>
            </aside>

            {/* CORE HUB LAYOUT CONTAINER */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'pl-16' : 'pl-64'}`}>
                <div className="p-6 md:p-8 space-y-6 text-left">
                    <div className="border-b border-slate-200/80 pb-4">
                        <h2 className="text-xl font-black text-slate-800">Root Node Dashboard</h2>
                        <p className="text-xs text-slate-400 font-semibold">Active Session: {adminUser.email} • System Compliance Level Secured</p>
                    </div>

                    {/* TAB 1: OVERVIEW METRICS */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                <span className="text-[10px] uppercase font-black text-slate-400 block">Total Enrolled Nodes</span>
                                <p className="text-2xl font-black text-slate-800 mt-1">187 Users</p>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                <span className="text-[10px] uppercase font-black text-slate-400 block">Encrypted Database Objects</span>
                                <p className="text-2xl font-black text-slate-800 mt-1">341 Patients</p>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                <span className="text-[10px] uppercase font-black text-slate-400 block">Vercel Container Latency</span>
                                <p className="text-2xl font-black text-emerald-500 mt-1">99.9% Operational</p>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: USER MANAGEMENT */}
                    {activeTab === 'users' && (
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                            <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest mb-4">Identity Provisioning Layer</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px]">
                                            <th className="pb-3">Name</th>
                                            <th className="pb-3">Role</th>
                                            <th className="pb-3">Credential Entry</th>
                                            <th className="pb-3">Status</th>
                                            <th className="pb-3 text-right">Modifier Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {systemUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-slate-50 text-slate-600">
                                                <td className="py-3 font-bold text-slate-800">{user.name}</td>
                                                <td className="py-3"><span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-slate-100 text-slate-600">{user.role}</span></td>
                                                <td className="py-3 font-mono text-slate-400">{user.email}</td>
                                                <td className="py-3 font-bold"><span className={user.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}>{user.status}</span></td>
                                                <td className="py-3 text-right">
                                                    <button onClick={() => handleToggleStatus(user.id)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${user.status === 'Active' ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white' : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white'}`}>
                                                        {user.status === 'Active' ? 'Suspend Node' : 'Activate Node'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: HIPAA COMPLIANCE LOGS */}
                    {activeTab === 'audit' && (
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden">
                            <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest mb-4">Immutable Audit Ledger Trail</h3>
                            <div className="space-y-3">
                                {auditLogs.map((log, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 gap-2 font-mono text-xs">
                                        <div>
                                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black mr-2 ${log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{log.status}</span>
                                            <span className="font-bold text-slate-800">{log.action}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-400 text-right">
                                            <span>By {log.performedBy} • {log.timestamp} • IP: {log.ip}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}