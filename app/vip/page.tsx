"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function VipDashboard() {
  const { data: session, status } = useSession();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTeamData();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const fetchTeamData = async () => {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const json = await res.json();
        setDrivers(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch team data", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-[#111111] flex justify-center items-center text-[#cba052] font-black text-2xl tracking-widest"><i className="fas fa-spinner fa-spin mr-3"></i> LOADING GARAGE...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col justify-center items-center text-white">
        <i className="fas fa-lock text-6xl text-[#E43138] mb-4"></i>
        <h2 className="text-2xl font-black uppercase mb-4">Access Denied</h2>
        <p className="text-gray-400 mb-6">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลทีม</p>
        <Link href="/login" className="bg-[#E43138] px-6 py-3 rounded font-bold hover:bg-red-700 transition">GO TO LOGIN</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-6xl mx-auto mt-4">
        
        {/* 🏁 Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-6">
          <div>
            <div className="text-[#cba052] font-black text-xs tracking-widest uppercase mb-1">Team Management Portal</div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              {session.user?.name} <span className="text-gray-600">GARAGE</span>
            </h1>
          </div>
          <Link href="/dashboard" className="mt-4 md:mt-0 bg-[#E43138] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-black tracking-widest transition shadow-[0_0_15px_rgba(228,49,56,0.3)] flex items-center">
            <i className="fas fa-plus-circle mr-2"></i> ADD NEW DRIVER
          </Link>
        </div>

        {/* 📊 Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 border-t-4 border-t-[#cba052]">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Drivers</p>
            <p className="text-3xl font-black">{drivers.length}</p>
          </div>
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 border-t-4 border-t-[#E43138]">
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Pending Payments</p>
            <p className="text-3xl font-black">{drivers.filter(d => d.payment === 'PENDING').length}</p>
          </div>
        </div>

        {/* 📋 Driver Table List */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-gray-800 bg-black flex justify-between items-center">
            <h3 className="font-bold text-[#cba052] uppercase tracking-wider"><i className="fas fa-users mr-2"></i> Registered Drivers</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#111111] text-xs uppercase tracking-wider text-gray-500 border-b border-gray-800">
                  <th className="p-4 font-black">Driver Name</th>
                  <th className="p-4 font-black">Class (Category)</th>
                  <th className="p-4 font-black">Registered Events</th>
                  <th className="p-4 font-black text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {drivers.length === 0 ? (
                  <tr><td colSpan={4} className="p-10 text-center text-gray-600 font-bold uppercase">No drivers found. Start registering!</td></tr>
                ) : drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-black transition group">
                    <td className="p-4">
                      <div className="font-bold text-white text-base">{driver.name}</div>
                      <div className="text-xs text-gray-600 font-mono">ID: {driver.id}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-800 text-gray-200 px-2 py-1 rounded text-xs font-bold border border-gray-600">{driver.category}</span>
                      {driver.crossEntry && (
                        <span className="ml-2 bg-yellow-900/30 text-[#cba052] px-2 py-1 rounded text-xs font-bold border border-[#cba052]/50">+ {driver.crossEntry}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {driver.events.map((ev: string) => (
                          <span key={ev} className="bg-[#E43138]/20 text-[#E43138] px-1.5 py-0.5 rounded text-[10px] font-black tracking-widest uppercase border border-[#E43138]/30">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase
                        ${driver.payment === 'PAID' ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'}`}>
                        {driver.payment}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}