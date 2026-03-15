"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({ driverCount: 0, teamCount: 0, revenue: 0 });

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      fetch('/api/admin/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error(err));
    }
  }, [status]);

  if (status === "loading") return <div className="min-h-screen bg-[#111] flex justify-center items-center text-[#E43138] font-black tracking-widest"><i className="fas fa-spinner fa-spin mr-3"></i> LOADING...</div>;
  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") return <div className="min-h-screen bg-[#111] flex justify-center items-center text-white">Access Denied</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto mt-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-6">
          <div>
            <div className="text-[#E43138] font-black text-xs tracking-widest uppercase mb-1">Rotax Racing 2026</div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">ADMIN <span className="text-gray-600">CONTROL PANEL</span></h1>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-[#1a1a1a] px-4 py-2 rounded-lg border border-gray-800">
            <div className="w-10 h-10 rounded-full bg-[#cba052] flex items-center justify-center text-black font-bold mr-3"><i className="fas fa-user-shield"></i></div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Logged in as</p>
              <p className="font-bold text-white leading-tight">{session?.user?.name}</p>
            </div>
          </div>
        </div>

        {/* 📊 สถิติของจริง! */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 border-l-4 border-l-[#E43138] shadow-lg relative overflow-hidden">
            <i className="fas fa-helmet-safety absolute -right-4 -bottom-4 text-8xl text-gray-800/30"></i>
            <p className="text-gray-500 font-bold text-sm uppercase mb-1 relative z-10">Total Registered Drivers</p>
            <h3 className="text-5xl font-black text-white relative z-10">{stats.driverCount} <span className="text-sm text-gray-600 font-normal">Drivers</span></h3>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 border-l-4 border-l-[#cba052] shadow-lg relative overflow-hidden">
            <i className="fas fa-users absolute -right-4 -bottom-4 text-8xl text-gray-800/30"></i>
            <p className="text-gray-500 font-bold text-sm uppercase mb-1 relative z-10">Total Teams (VIP)</p>
            <h3 className="text-5xl font-black text-white relative z-10">{stats.teamCount} <span className="text-sm text-gray-600 font-normal">Teams</span></h3>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 border-l-4 border-l-green-500 shadow-lg relative overflow-hidden">
            <i className="fas fa-coins absolute -right-4 -bottom-4 text-8xl text-gray-800/30"></i>
            <p className="text-gray-500 font-bold text-sm uppercase mb-1 relative z-10">Estimated Revenue</p>
            <h3 className="text-4xl font-black text-white relative z-10">฿ {stats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* เมนูจัดการระบบ */}
        <h3 className="text-xl font-bold text-[#cba052] uppercase tracking-tight mb-4"><i className="fas fa-cogs mr-2"></i> System Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/registrations" className="bg-[#111] p-6 rounded-xl border border-gray-800 hover:border-[#E43138] hover:bg-[#1a1a1a] transition group block">
            <i className="fas fa-file-invoice text-3xl text-gray-600 group-hover:text-[#E43138] mb-4 transition"></i>
            <h4 className="font-bold text-white uppercase mb-1">Registrations</h4>
            <p className="text-xs text-gray-500">ตรวจสอบใบสมัคร, ตรวจสลิปโอนเงิน และอนุมัติสถานะนักแข่ง</p>
          </Link>
          <Link href="/admin/users" className="bg-[#111] p-6 rounded-xl border border-gray-800 hover:border-[#cba052] hover:bg-[#1a1a1a] transition group block">
            <i className="fas fa-users-cog text-3xl text-gray-600 group-hover:text-[#cba052] mb-4 transition"></i>
            <h4 className="font-bold text-white uppercase mb-1">Users & Teams</h4>
            <p className="text-xs text-gray-500">จัดการสิทธิ์ผู้ใช้งาน (เลื่อนยศเป็น VIP) และดูข้อมูลคลังนักแข่ง</p>
          </Link>
          <Link href="/admin/events" className="bg-[#111] p-6 rounded-xl border border-gray-800 hover:border-blue-500 hover:bg-[#1a1a1a] transition group block">
            <i className="fas fa-flag-checkered text-3xl text-gray-600 group-hover:text-blue-500 mb-4 transition"></i>
            <h4 className="font-bold text-white uppercase mb-1">Events & Pricing</h4>
            <p className="text-xs text-gray-500">เปิด/ปิดสนามแข่งขัน, ตั้งราคาค่าสมัคร, กำหนดรุ่น</p>
          </Link>
          <Link href="/admin/settings" className="bg-[#111] p-6 rounded-xl border border-gray-800 hover:border-purple-500 hover:bg-[#1a1a1a] transition group block">
            <i className="fas fa-globe-asia text-3xl text-gray-600 group-hover:text-purple-500 mb-4 transition"></i>
            <h4 className="font-bold text-white uppercase mb-1">Master Data</h4>
            <p className="text-xs text-gray-500">ตั้งค่ารายชื่อประเทศ, ธงชาติ, ไซส์เสื้อ และกฎเกณฑ์พื้นฐาน</p>
          </Link>
        </div>

      </div>
    </div>
  );
}