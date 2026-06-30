"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Shield, UserCog, Activity, Database, TrendingUp, LogOut,
    ChevronRight, ChevronLeft, Users, CheckCircle, AlertTriangle,
    RefreshCw, Lock, Unlock, Key, MoreVertical, ExternalLink, UserCheck
} from "lucide-react";
import { Language } from '../types';
import {
    getAdminStats,
    getAdminUsers,
    toggleUserStatus,
    getAdminAuditLogs,
    changeUserPassword,
    bypassVerification,
    getUnverifiedPractitioners
} from '../api';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

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

    // States for live API hydration
    const [stats, setStats] = useState<any>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [auditList, setAuditList] = useState<any[]>([]);
    const [unverifiedList, setUnverifiedList] = useState<any[]>([]);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

    // Loading & Refreshing States
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [loadingUnverified, setLoadingUnverified] = useState(false);
    const [actionSuccess, setActionSuccess] = useState<string>('');
    const [actionError, setActionError] = useState<string>('');

    // Inline Password Change Modal State
    const [pwdModalUserId, setPwdModalUserId] = useState<string | null>(null);
    const [pwdModalUserName, setPwdModalUserName] = useState<string>('');
    const [newPassword, setNewPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Dropdown Action State
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    // Expandable credentials preview state
    const [expandedPractitionerId, setExpandedPractitionerId] = useState<string | null>(null);

    // Fetch dashboard stats
    const fetchStats = async () => {
        try {
            setLoadingStats(true);
            const res = await getAdminStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error("Error loading admin stats:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    // Fetch user listing
    const fetchUsers = async (roleFilter?: string) => {
        try {
            setLoadingUsers(true);
            const res = await getAdminUsers(roleFilter);
            if (res.success) {
                setUsersList(res.data || []);
            }
        } catch (err) {
            console.error("Error loading users:", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Fetch Audit trails
    const fetchAuditLogs = async () => {
        try {
            setLoadingAudit(true);
            const res = await getAdminAuditLogs();
            if (res.success) {
                setAuditList(res.data || []);
            }
        } catch (err) {
            console.error("Error loading audit logs:", err);
        } finally {
            setLoadingAudit(false);
        }
    };

    // Fetch Unverified Practitioners Queue
    const fetchUnverifiedPractitioners = async () => {
        try {
            setLoadingUnverified(true);
            const res = await getUnverifiedPractitioners();
            if (res.success) {
                setUnverifiedList(res.data || []);
            }
        } catch (err) {
            console.error("Error loading unverified practitioners:", err);
        } finally {
            setLoadingUnverified(false);
        }
    };

    // Hydration triggers
    useEffect(() => {
        if (activeTab === 'overview') {
            fetchStats();
        } else if (activeTab === 'users') {
            fetchUsers(selectedRoleFilter);
            fetchUnverifiedPractitioners();
        } else if (activeTab === 'audit') {
            fetchAuditLogs();
        }
    }, [activeTab, selectedRoleFilter]);

    // Handle block/activate nodes
    const handleToggleUserNode = async (userId: string, currentStatus: boolean) => {
        try {
            const res = await toggleUserStatus(userId, !currentStatus);
            if (res.success) {
                showSuccessMessage(currentStatus ? 'User suspended successfully' : 'User activated successfully');
                fetchUsers(selectedRoleFilter);
            }
        } catch (err) {
            console.error("Failed to alter node security profile:", err);
            showErrorMessage("Failed to update user status");
        } finally {
            setActiveDropdownId(null);
        }
    };

    // Handle Password Change Override
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pwdModalUserId) return;
        if (newPassword.length < 6) {
            showErrorMessage("Password must be at least 6 characters");
            return;
        }

        try {
            setUpdatingPassword(true);
            const res = await changeUserPassword(pwdModalUserId, newPassword);
            if (res.success) {
                showSuccessMessage(`Password updated successfully for ${pwdModalUserName}`);
                setPwdModalUserId(null);
                setNewPassword('');
            }
        } catch (err) {
            console.error("Password update error:", err);
            showErrorMessage("Failed to update user password");
        } finally {
            setUpdatingPassword(false);
        }
    };

    // Handle verification bypass manual trigger
    const handleBypassVerification = async (userId: string) => {
        try {
            const res = await bypassVerification(userId);
            if (res.success) {
                showSuccessMessage("Verification bypassed successfully! Onboarding blocks cleared.");
                fetchUsers(selectedRoleFilter);
                fetchUnverifiedPractitioners();
            }
        } catch (err) {
            console.error("Verification bypass error:", err);
            showErrorMessage("Failed to bypass verification");
        } finally {
            setActiveDropdownId(null);
        }
    };

    const showSuccessMessage = (msg: string) => {
        setActionSuccess(msg);
        setTimeout(() => setActionSuccess(''), 4000);
    };

    const showErrorMessage = (msg: string) => {
        setActionError(msg);
        setTimeout(() => setActionError(''), 4000);
    };

    // Recharts Data Mapping
    const pieColors = ['#3b82f6', '#8b5cf6', '#22c55e', '#ec4899', '#f59e0b'];
    
    const roleData = stats?.roleBreakdown?.map((item: any, index: number) => ({
        name: item._id ? (item._id.charAt(0).toUpperCase() + item._id.slice(1) + 's') : 'Other',
        value: item.count,
        color: pieColors[index % pieColors.length]
    })) || [
        { name: "Doctors", value: 0, color: "#3b82f6" },
        { name: "Therapists", value: 0, color: "#8b5cf6" },
        { name: "Parents", value: 0, color: "#22c55e" },
        { name: "Children", value: 0, color: "#ec4899" },
        { name: "Admins", value: 0, color: "#f59e0b" },
    ];

    const monthlyData = [
        { month: "Jan", users: 120, patients: 280, plans: 65 },
        { month: "Feb", users: 135, patients: 295, plans: 72 },
        { month: "Mar", users: 148, patients: 310, plans: 80 },
        { month: "Apr", users: 155, patients: 320, plans: 85 },
        { month: "May", users: 170, patients: 335, plans: 92 },
        { month: "Jun", users: stats?.users || 187, patients: stats?.patients || 341, plans: stats?.approvedPlans || 98 },
    ];

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
                    <div className="border-b border-slate-200/80 pb-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-black text-slate-800">Root Node Dashboard</h2>
                            <p className="text-xs text-slate-400 font-semibold">Active Session: {adminUser.email} • System Compliance Level Secured</p>
                        </div>
                        <button 
                            onClick={() => activeTab === 'overview' ? fetchStats() : activeTab === 'users' ? (fetchUsers(selectedRoleFilter), fetchUnverifiedPractitioners()) : fetchAuditLogs()}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {actionSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl flex items-center space-x-2 animate-fade-in">
                            <CheckCircle className="w-4 h-4" /><span>{actionSuccess}</span>
                        </div>
                    )}

                    {actionError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center space-x-2 animate-fade-in">
                            <AlertTriangle className="w-4 h-4" /><span>{actionError}</span>
                        </div>
                    )}

                    {/* TAB 1: OVERVIEW METRICS */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {loadingStats && !stats ? (
                                <div className="text-center py-10 font-mono text-xs text-slate-400">Syncing live server statistics...</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                            <span className="text-[10px] uppercase font-black text-slate-400 block">Total Enrolled Nodes</span>
                                            <p className="text-2xl font-black text-slate-800 mt-1">{stats?.users ?? 0} Users</p>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                            <span className="text-[10px] uppercase font-black text-slate-400 block">Encrypted Database Objects</span>
                                            <p className="text-2xl font-black text-slate-800 mt-1">{stats?.patients ?? 0} Patients</p>
                                        </div>
                                        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                            <span className="text-[10px] uppercase font-black text-slate-400 block">Behavior Logs / Reports</span>
                                            <p className="text-2xl font-black text-emerald-500 mt-1">
                                                {stats?.behaviorLogs ?? 0} Logs / {stats?.reports ?? 0} Mapped
                                            </p>
                                        </div>
                                    </div>

                                    {/* Charts Section */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                                            <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Users by Role</h3>
                                            <div className="h-[200px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value">
                                                            {roleData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                {roleData.map((d: any) => (
                                                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                                        <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                                                        {d.name}: {d.value ?? 0}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm lg:col-span-2">
                                            <h3 className="font-bold text-slate-800 mb-4 text-xs uppercase tracking-wider">Platform growth metrics</h3>
                                            <div className="h-[230px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={monthlyData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                        <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                        <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                                        <Tooltip />
                                                        <Bar dataKey="users" fill="#3b82f6" name="Users" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="patients" fill="#22c55e" name="Patients" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="plans" fill="#8b5cf6" name="Plans" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* TAB 2: USER MANAGEMENT */}
                    {activeTab === 'users' && (
                        <div className="space-y-6">
                            {/* Qualification Approval Queue */}
                            {unverifiedList.length > 0 && (
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200 rounded-3xl p-6 shadow-sm">
                                    <div className="flex items-center space-x-2.5 mb-4">
                                        <Shield className="w-5 h-5 text-amber-600 animate-pulse" />
                                        <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest">Clinical Qualification Approval Queue</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {unverifiedList.map((prac) => (
                                            <div key={prac._id} className="bg-white border border-amber-200/60 rounded-2xl p-5 shadow-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">{prac.name}</h4>
                                                        <p className="text-xs text-slate-400">{prac.email}</p>
                                                        <span className="inline-block mt-2 px-2 py-0.5 rounded-full font-black text-[9px] uppercase bg-amber-100 text-amber-700">
                                                            {prac.role} (Unverified)
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => setExpandedPractitionerId(expandedPractitionerId === prac._id ? null : prac._id)}
                                                        className="text-xs font-bold text-sky-600 hover:text-sky-700 underline cursor-pointer"
                                                    >
                                                        {expandedPractitionerId === prac._id ? 'Close Audit' : 'Audit Credentials'}
                                                    </button>
                                                </div>

                                                {expandedPractitionerId === prac._id && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="space-y-4 pt-2 border-t border-slate-100"
                                                    >
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase block">National ID - Front</span>
                                                                {prac.nationalIdFront ? (
                                                                    <a href={prac.nationalIdFront} target="_blank" rel="noopener noreferrer" className="relative group block overflow-hidden rounded-xl border border-slate-200 mt-1 h-28 bg-slate-100">
                                                                        <img src={prac.nationalIdFront} alt="ID Front" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all duration-300">
                                                                            <ExternalLink className="w-4 h-4 mr-1" /> View Full
                                                                        </div>
                                                                    </a>
                                                                ) : (
                                                                    <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">No Image Uploaded</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase block">National ID - Back</span>
                                                                {prac.nationalIdBack ? (
                                                                    <a href={prac.nationalIdBack} target="_blank" rel="noopener noreferrer" className="relative group block overflow-hidden rounded-xl border border-slate-200 mt-1 h-28 bg-slate-100">
                                                                        <img src={prac.nationalIdBack} alt="ID Back" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all duration-300">
                                                                            <ExternalLink className="w-4 h-4 mr-1" /> View Full
                                                                        </div>
                                                                    </a>
                                                                ) : (
                                                                    <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">No Image Uploaded</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Accredited Diplomas & Certificates</span>
                                                            {prac.certificates && prac.certificates.length > 0 ? (
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {prac.certificates.map((cert: string, idx: number) => (
                                                                        <a key={idx} href={cert} target="_blank" rel="noopener noreferrer" className="relative group h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                                                                            {cert.endsWith('.pdf') ? (
                                                                                <span className="text-[10px] font-bold text-slate-600">Cert #{idx+1} (PDF)</span>
                                                                            ) : (
                                                                                <img src={cert} alt={`Cert ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                                                                            )}
                                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-bold transition-all duration-300">
                                                                                <ExternalLink className="w-3.5 h-3.5 mr-1" /> View
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <p className="text-xs text-slate-400 italic">No certificates provided.</p>
                                                            )}
                                                        </div>

                                                        <div className="flex justify-end pt-2">
                                                            <button
                                                                onClick={() => handleBypassVerification(prac._id)}
                                                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
                                                            >
                                                                <UserCheck className="w-4 h-4" />
                                                                <span>Approve Credentials & Grant Access</span>
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Main User Controls Table */}
                            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-visible space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Identity Provisioning Layer</h3>
                                    <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                        {["all", "parent", "doctor", "therapist", "child"].map((role) => (
                                            <button 
                                                key={role} 
                                                onClick={() => setSelectedRoleFilter(role)}
                                                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${selectedRoleFilter === role ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'}`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {loadingUsers ? (
                                    <div className="space-y-3 p-2">
                                        <div className="h-7 w-full animate-shimmer rounded-xl" />
                                        <div className="h-7 w-full animate-shimmer rounded-xl" />
                                        <div className="h-7 w-full animate-shimmer rounded-xl" />
                                    </div>
                                ) : usersList.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 text-xs font-semibold">No nodes registered under selected category.</div>
                                ) : (
                                    <div className="overflow-x-auto pb-24">
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100 font-black text-slate-400 uppercase text-[10px]">
                                                    <th className="pb-3">User</th>
                                                    <th className="pb-3">Role</th>
                                                    <th className="pb-3">Credential Entry</th>
                                                    <th className="pb-3">Status</th>
                                                    <th className="pb-3 text-right">Modifier Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {usersList.map((user, idx) => (
                                                    <tr key={user._id} className="border-b border-slate-50 text-slate-600 hover:bg-slate-50/30 transition-colors relative">
                                                        <td className="py-6">
                                                            <div className="flex items-center space-x-2.5">
                                                                {user.avatar ? (
                                                                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-slate-200" alt={user.name} />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                                                                        {user.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                                <span className="font-bold text-slate-800">{user.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6">
                                                            <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                                                                user.role === 'doctor' ? 'bg-blue-50 text-blue-600' :
                                                                user.role === 'therapist' ? 'bg-purple-50 text-purple-600' :
                                                                user.role === 'parent' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                                            }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="py-6 font-mono text-slate-400">
                                                            {user.role === 'child' ? (user.username || 'No username') : (user.email || 'No email')}
                                                        </td>
                                                        <td className="py-6 font-bold">
                                                            {(() => {
                                                                if (!user.isActive) {
                                                                    return <span className="text-rose-500">Suspended</span>;
                                                                }
                                                                if (user.role === 'parent') {
                                                                    if (!user.isVerified) {
                                                                        return <span className="text-amber-500">Awaiting verification</span>;
                                                                    }
                                                                    return <span className="text-emerald-500">Active</span>;
                                                                }
                                                                if (user.role === 'child') {
                                                                    return <span className="text-emerald-500">Active</span>;
                                                                }
                                                                if (user.role === 'doctor' || user.role === 'therapist') {
                                                                    if (user.isVerified) {
                                                                        return <span className="text-emerald-500">Active</span>;
                                                                    }
                                                                    const hasSubmittedFiles = !!(user.nationalIdFront || user.nationalIdBack || (user.certificates && user.certificates.length > 0));
                                                                    if (hasSubmittedFiles) {
                                                                        return <span className="text-indigo-500">Awaiting for validation</span>;
                                                                    }
                                                                    return <span className="text-amber-500">Awaiting for verification</span>;
                                                                }
                                                                return <span className="text-emerald-500">Active</span>;
                                                            })()}
                                                        </td>
                                                        <td className="py-6 text-right relative">
                                                            <div className="inline-block text-left">
                                                                <button
                                                                    onClick={() => setActiveDropdownId(activeDropdownId === user._id ? null : user._id)}
                                                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>
                                                                
                                                                {activeDropdownId === user._id && (
                                                                    <div className="absolute right-0 top-10 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-[9999] py-1 font-sans text-xs">
                                                                        <button 
                                                                            onClick={() => handleToggleUserNode(user._id, user.isActive)} 
                                                                            className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-slate-700 cursor-pointer"
                                                                        >
                                                                            {user.isActive ? <Lock className="w-3.5 h-3.5 text-rose-500" /> : <Unlock className="w-3.5 h-3.5 text-emerald-500" />}
                                                                            <span>{user.isActive ? 'Suspend User' : 'Activate User'}</span>
                                                                        </button>
                                                                        
                                                                        <button 
                                                                            onClick={() => {
                                                                                setPwdModalUserId(user._id);
                                                                                setPwdModalUserName(user.name);
                                                                                setActiveDropdownId(null);
                                                                            }} 
                                                                            className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-slate-700 cursor-pointer"
                                                                        >
                                                                            <Key className="w-3.5 h-3.5 text-sky-500" />
                                                                            <span>Change Password</span>
                                                                        </button>

                                                                        {user.role !== 'child' && !user.isVerified && (
                                                                            <button 
                                                                                onClick={() => handleBypassVerification(user._id)} 
                                                                                className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center space-x-2 text-slate-700 cursor-pointer font-bold text-amber-600"
                                                                            >
                                                                                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                                                                                <span>Bypass Verification</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: HIPAA COMPLIANCE LOGS */}
                    {activeTab === 'audit' && (
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
                            <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Immutable Audit Ledger Trail</h3>
                            {loadingAudit ? (
                                <div className="space-y-3 p-2">
                                    <div className="h-10 w-full animate-shimmer rounded-xl" />
                                    <div className="h-10 w-full animate-shimmer rounded-xl" />
                                    <div className="h-10 w-full animate-shimmer rounded-xl" />
                                </div>
                            ) : auditList.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs font-semibold">No transactions recorded in ledger.</div>
                            ) : (
                                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                                    {auditList.map((log) => (
                                        <div key={log._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 gap-2 font-mono text-[11px]">
                                            <div>
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black mr-2 ${
                                                    log.action.startsWith('GET') ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                                }`}>
                                                    {log.action.split(' ')[0]}
                                                </span>
                                                <span className="font-bold text-slate-800">{log.action}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-400 text-right">
                                                <span>By {log.userId?.name || 'Unknown'} ({log.userId?.role || 'user'}) • {new Date(log.createdAt).toLocaleTimeString()} • IP: {log.ipAddress || 'Internal'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Change Password Inline Modal */}
            <AnimatePresence>
                {pwdModalUserId && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-sm w-full space-y-4 text-left"
                        >
                            <div className="flex items-center space-x-2">
                                <Key className="w-5 h-5 text-sky-500" />
                                <h3 className="font-black text-slate-850 text-sm">Override User Password</h3>
                            </div>
                            <p className="text-xs text-slate-500">
                                This will directly hash and write the new credentials for user: <strong className="text-slate-800">{pwdModalUserName}</strong>.
                            </p>
                            
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">New Password</label>
                                    <input 
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                                        placeholder="Min 6 characters"
                                        required
                                    />
                                </div>

                                <div className="flex space-x-2 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setPwdModalUserId(null)}
                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={updatingPassword}
                                        className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer text-center flex items-center justify-center"
                                    >
                                        {updatingPassword ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}