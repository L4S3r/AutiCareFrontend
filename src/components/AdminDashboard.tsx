"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Shield, UserCog, Activity, Database, TrendingUp, LogOut,
    ChevronRight, ChevronLeft, Users, CheckCircle, AlertTriangle,
    RefreshCw, Lock, Unlock
} from "lucide-react";
import { Language } from '../types';
import {
    getAdminStats,
    getAdminUsers,
    toggleUserStatus,
    getAdminAuditLogs
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
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

    // Loading & Refreshing States
    const [loadingStats, setLoadingStats] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingAudit, setLoadingAudit] = useState(false);
    const [actionSuccess, setActionSuccess] = useState<string>('');

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

    // Hydration triggers
    useEffect(() => {
        if (activeTab === 'overview') {
            fetchStats();
        } else if (activeTab === 'users') {
            fetchUsers(selectedRoleFilter);
        } else if (activeTab === 'audit') {
            fetchAuditLogs();
        }
    }, [activeTab, selectedRoleFilter]);

    // Handle block/activate nodes
    const handleToggleUserNode = async (userId: string, currentStatus: boolean) => {
        try {
            // Toggle active status (block = isActive: false)
            const res = await toggleUserStatus(userId, !currentStatus);
            if (res.success) {
                setActionSuccess(`User status modified successfully!`);
                setTimeout(() => setActionSuccess(''), 3000);
                fetchUsers(selectedRoleFilter);
            }
        } catch (err) {
            console.error("Failed to alter node security profile:", err);
        }
    };

    // Recharts Data Mapping
    const pieColors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'];
    
    // Map live DB role breakdown or fallback
    const roleData = stats?.roleBreakdown?.map((item: any, index: number) => ({
        name: item._id ? (item._id.charAt(0).toUpperCase() + item._id.slice(1) + 's') : 'Other',
        value: item.count,
        color: pieColors[index % pieColors.length]
    })) || [
        { name: "Doctors", value: 0, color: "#3b82f6" },
        { name: "Therapists", value: 0, color: "#8b5cf6" },
        { name: "Parents", value: 0, color: "#22c55e" },
        { name: "Admins", value: 0, color: "#f59e0b" },
    ];

    // Platform Growth Chart Data - Hydrated with real stats at end
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
                            onClick={() => activeTab === 'overview' ? fetchStats() : activeTab === 'users' ? fetchUsers(selectedRoleFilter) : fetchAuditLogs()}
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
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Identity Provisioning Layer</h3>
                                <div className="flex gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                                    {["all", "doctor", "therapist", "parent"].map((role) => (
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
                                <div className="text-center py-10 font-mono text-xs text-slate-400">Loading directory listings...</div>
                            ) : usersList.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs font-semibold">No nodes registered under selected category.</div>
                            ) : (
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
                                            {usersList.map((user) => (
                                                <tr key={user._id} className="border-b border-slate-50 text-slate-600 hover:bg-slate-50/30 transition-colors">
                                                    <td className="py-3 font-bold text-slate-800">{user.name}</td>
                                                    <td className="py-3">
                                                        <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase ${
                                                            user.role === 'doctor' ? 'bg-blue-50 text-blue-600' :
                                                            user.role === 'therapist' ? 'bg-purple-50 text-purple-600' :
                                                            user.role === 'parent' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {user.role}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 font-mono text-slate-400">{user.email}</td>
                                                    <td className="py-3 font-bold">
                                                        <span className={user.isActive ? 'text-emerald-500' : 'text-rose-500'}>
                                                            {user.isActive ? 'Active' : 'Suspended'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right">
                                                        <button 
                                                            onClick={() => handleToggleUserNode(user._id, user.isActive)} 
                                                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                                                                user.isActive 
                                                                    ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-500 hover:text-white' 
                                                                    : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                                                            }`}
                                                        >
                                                            {user.isActive ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                                                            {user.isActive ? 'Suspend' : 'Activate'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: HIPAA COMPLIANCE LOGS */}
                    {activeTab === 'audit' && (
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm overflow-hidden space-y-4">
                            <h3 className="text-xs font-mono font-black text-slate-400 uppercase tracking-widest">Immutable Audit Ledger Trail</h3>
                            {loadingAudit ? (
                                <div className="text-center py-10 font-mono text-xs text-slate-400">Accessing audit trails...</div>
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
        </div>
    );
}