"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboardComponent from "@/components/AdminDashboard";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("auticare_user");
    if (!stored) {
      router.push("/app/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("auticare_user");
    router.push("/app/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AdminDashboardComponent
      language="en"
      adminUser={user}
      onLogout={handleLogout}
    />
  );
}
