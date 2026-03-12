"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// 🚩 ส่วนที่ 1: Import signOut เข้ามา
import { signOut } from "next-auth/react";

const ENTRY_FEES: Record<string, number> = {
  'Micro MAX': 21000,
  'Mini MAX': 27500,
  'Junior MAX': 29000,
  'Senior MAX': 30000,
  'Senior MAX Masters': 30000,
  'MAX DD2': 30000,
};

const formatTHB = (amount: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
};

export default function VipTeamDashboard() {
  const [teamDrivers, setTeamDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch('/api/team');
        const json = await response.json();
        if (json.data) setTeamDrivers(json.data);
      } catch (error) {
        console.error("Error fetching team drivers:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const totalTeamFee = teamDrivers.reduce((sum, reg) => sum + (ENTRY_FEES[reg.category] || 0) * reg.events.length, 0);

  return (
    <div className="bg-[#111111] min-h-screen font-sans pb-10">
      
      {/* Top Navbar */}
      <nav className="bg-black text-white shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black uppercase tracking-widest text-white">
              ROTAX <span className="text-[#E43138]">RACING</span>
            </h1>
          </div>
          
          {/* 🚩 ส่วนที่ 2: เพิ่มปุ่ม Logout ใน Navbar ฝั่งขวา */}
          <div className="flex items-center gap-4 text-sm font-bold text-gray-300">
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-gray-800 text-white px-3 py-1.5 rounded text-xs hover:bg-red-700 transition border border-gray-600 shadow-sm"
            >
              <i className="fas fa-sign-out-alt mr-1"></i> LOGOUT
            </button>
            
            <div className="hidden md:flex flex-col items-end">
                <span className="bg-[#cba052] text-black px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-tighter mb-0.5">
                    VIP Entrant
                </span>
                <span className="text-[11px] text-gray-400">PT Creative Team</span>
            </div>

            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-gray-500 shadow-inner text-white font-black">
                PT
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#cba052] to-yellow-200 w-full opacity-50"></div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Team Dashboard</h2>
            <p className="text-gray-400 text-sm mt-1">จัดการนักแข่งและดูยอดค่าใช้จ่ายของทีมคุณ</p>
          </div>
          
          <Link href="/participant" className="bg-[#E43138] text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-red-700 transition transform hover:scale-105 active:scale-95">
            <i className="fas fa-plus-circle mr-2"></i> Register New Driver
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Drivers in Team</p>
            <h3 className="text-4xl font-black text-white mt-2">{isLoading ? '-' : teamDrivers.length}</h3>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-xl">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Events Booked</p>
            <h3 className="text-4xl font-black text-white mt-2">
              {isLoading ? '-' : teamDrivers.reduce((sum, d) => sum + d.events.length, 0)}
            </h3>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#cba052] shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10"><i className="fas fa-coins text-8xl text-[#cba052]"></i></div>
            <p className="text-sm font-bold text-[#cba052] uppercase tracking-wide">Total Team Entry Fee</p>
            <h3 className="text-3xl font-black text-white mt-2">{isLoading ? '-' : formatTHB(totalTeamFee)}</h3>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/20">
            <h3 className="font-bold text-white"><i className="fas fa-list-ul mr-2 text-[#cba052]"></i> Registered Drivers</h3>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 font-bold">
                <i className="fas fa-spinner fa-spin mr-2"></i> Loading Team Data...
              </div>
            ) : teamDrivers.length === 0 ? (
               <div className="p-10 text-center text-gray-500 font-bold">
                 ทีมของคุณยังไม่มีนักแข่ง <Link href="/participant" className="text-[#E43138] underline ml-1">ลงทะเบียนเลย</Link>
               </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111111] text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                    <th className="p-4">Driver Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Events</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm text-gray-300">
                  {teamDrivers.map((driver, index) => {
                    const fee = (ENTRY_FEES[driver.category] || 0) * driver.events.length;
                    
                    return (
                      <tr key={index} className="hover:bg-[#222222] transition group">
                        <td className="p-4 font-bold text-white text-base">
                          {driver.name} <span className="text-[10px] text-gray-600 font-mono ml-2 group-hover:text-gray-400">ID: {driver.id}</span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#E43138]">{driver.category}</div>
                          {driver.crossEntry && <div className="text-[10px] text-[#cba052] font-black mt-0.5 tracking-tighter">+ {driver.crossEntry.toUpperCase()}</div>}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {driver.events.map((ev: string) => (
                              <span key={ev} className="bg-gray-800/50 text-gray-400 text-[10px] px-1.5 py-0.5 rounded border border-gray-700 font-mono uppercase">{ev}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-mono font-bold text-gray-300">{formatTHB(fee)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-[4px] font-black text-[10px] tracking-tight ${driver.payment === 'PAID' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'}`}>
                            {driver.payment}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-gray-600 hover:text-[#cba052] transition px-2 py-1 hover:bg-white/5 rounded" title="Edit Data">
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}