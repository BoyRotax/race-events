"use client";

import React, { useState, useEffect } from 'react';

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

export default function OfficeDashboard() {
  // 🚩 1. เปลี่ยน State มารองรับข้อมูลจริง และสร้างสถานะ Loading
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚩 2. ใช้ useEffect เพื่อดึงข้อมูลเมื่อเปิดหน้านี้
  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const response = await fetch('/api/registrations');
        const json = await response.json();
        
        if (json.data) {
          setRegistrations(json.data);
        }
      } catch (error) {
        console.error("Error fetching registrations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, []); // [] หมายถึงดึงข้อมูลแค่ครั้งเดียวตอนโหลดหน้าจอ

  // คำนวณสรุปยอดเงินทั้งหมด
  const totalRevenue = registrations.reduce((sum, reg) => sum + (ENTRY_FEES[reg.category] || 0) * reg.events.length, 0);
  const pendingAmount = registrations.filter(r => r.payment === 'PENDING').reduce((sum, reg) => sum + (ENTRY_FEES[reg.category] || 0) * reg.events.length, 0);

  return (
    <div className="bg-[#f4f6f8] min-h-screen font-sans pb-10">
      <nav className="bg-black text-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black uppercase tracking-widest">
              ROTAX <span className="text-[#E43138]">RACING</span>
            </h1>
            <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded text-sm font-bold border border-gray-600 hidden md:block">
              <i className="fas fa-building mr-2"></i>Race Office
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-300">
            <span><i className="fas fa-user-tie mr-2"></i>Staff: OFFICE 01</span>
            <button className="bg-[#E43138] text-white px-4 py-2 rounded hover:bg-red-700 transition shadow-md">Logout</button>
          </div>
        </div>
        <div className="h-2 bg-[#E43138] w-full"></div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Finance & Event Dashboard</h2>
            <p className="text-gray-500 text-sm">ข้อมูลอัปเดตตรงจาก Database (Real-time)</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold shadow-sm hover:bg-blue-700 transition">
            <i className="fas fa-file-invoice mr-2"></i> Issue Pending Invoices
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Entries</p>
            <h3 className="text-3xl font-black text-gray-800 mt-1">{isLoading ? '...' : registrations.length}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Expected Revenue</p>
            <h3 className="text-2xl font-black text-green-600 mt-1">{isLoading ? '...' : formatTHB(totalRevenue)}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Pending (Unpaid)</p>
            <h3 className="text-2xl font-black text-yellow-600 mt-1">{isLoading ? '...' : formatTHB(pendingAmount)}</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Paddock Booked</p>
            <h3 className="text-2xl font-black text-gray-800 mt-1">TBA</h3>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h3 className="font-bold text-gray-700"><i className="fas fa-users mr-2"></i> Live Driver Registration List</h3>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 text-center text-gray-500 font-bold">
                <i className="fas fa-spinner fa-spin mr-2"></i> กำลังโหลดข้อมูลจาก Database...
              </div>
            ) : registrations.length === 0 ? (
               <div className="p-10 text-center text-gray-500 font-bold">
                 ยังไม่มีผู้ลงทะเบียนในระบบ
               </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-xs uppercase tracking-wider text-gray-500 border-b-2 border-gray-200">
                    <th className="p-4">Reg ID</th>
                    <th className="p-4">Driver / Team</th>
                    <th className="p-4">Category & Events</th>
                    <th className="p-4 bg-gray-50">Fee Calculation</th>
                    <th className="p-4 text-center">Payment Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {registrations.map((reg, index) => {
                    const baseFee = ENTRY_FEES[reg.category] || 0;
                    const eventCount = reg.events.length;
                    const totalFee = baseFee * eventCount;

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-mono font-bold text-gray-400">#{reg.id}</td>
                        <td className="p-4">
                          <div className="font-bold text-gray-800 text-base">{reg.name}</div>
                          <div className="text-xs text-gray-500">{reg.team}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-[#E43138]">
                            {reg.category} 
                            {reg.crossEntry && <span className="text-xs ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded border border-yellow-300">+ {reg.crossEntry}</span>}
                          </div>
                          <div className="text-xs font-semibold text-gray-600 mt-1">{reg.events.join(' & ')}</div>
                        </td>
                        <td className="p-4 bg-gray-50">
                          <div className="text-xs text-gray-500 mb-1">{formatTHB(baseFee)} x {eventCount} Event(s)</div>
                          <div className="font-black text-gray-800 text-lg">{formatTHB(totalFee)}</div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded font-bold text-xs ${reg.payment === 'PAID' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                            {reg.payment}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {reg.payment === 'PENDING' && (
                            <button className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-black transition mr-2 shadow-sm">
                              <i className="fas fa-paper-plane mr-1"></i> Send Bill
                            </button>
                          )}
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