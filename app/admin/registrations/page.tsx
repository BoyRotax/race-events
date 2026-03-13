"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminRegistrationsPage() {
  const { data: session, status } = useSession();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับโชว์รูปขยาย (Modal)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      fetchRegistrations();
    }
  }, [status]);

  const fetchRegistrations = async () => {
    try {
      const res = await fetch("/api/admin/registrations");
      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch registrations", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-[#111111] flex justify-center items-center text-[#E43138] font-black tracking-widest"><i className="fas fa-spinner fa-spin mr-3"></i> LOADING DATA...</div>;
  }

  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") {
    return <div className="min-h-screen bg-[#111111] flex justify-center items-center text-white text-2xl font-black uppercase">Access Denied</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans pb-20">
      
      {/* 🖼️ Modal สำหรับขยายรูปดูชัดๆ */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full">
            <button className="absolute -top-10 right-0 text-white font-black text-xl hover:text-[#E43138]"><i className="fas fa-times"></i> ปิด</button>
            <img src={selectedImage} alt="Preview" className="w-full h-auto rounded-lg border-2 border-[#cba052] shadow-[0_0_30px_rgba(203,160,82,0.3)]" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-4">
        
        {/* 🏁 Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-4">
          <div>
            <Link href="/admin" className="text-gray-500 hover:text-white text-sm font-bold transition mb-2 inline-block">
              <i className="fas fa-arrow-left mr-2"></i> BACK TO CONTROL PANEL
            </Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#E43138]">
              Registrations <span className="text-gray-600 font-bold text-xl">({registrations.length})</span>
            </h1>
          </div>
          <button onClick={fetchRegistrations} className="mt-4 md:mt-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-bold transition">
            <i className="fas fa-sync-alt mr-2"></i> REFRESH
          </button>
        </div>

        {/* 📋 Data Table */}
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-bold">Team</th>
                <th className="p-4 font-bold">Driver Name</th>
                <th className="p-4 font-bold">Class & No.</th>
                <th className="p-4 font-bold">Events</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-center">Documents</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-600 font-bold uppercase">ยังไม่มีผู้สมัครลงแข่งขัน</td>
                </tr>
              ) : (
                registrations.map((reg, idx) => (
                  <tr key={reg.id} className={`border-b border-gray-800/50 hover:bg-[#1a1a1a] transition ${idx % 2 === 0 ? 'bg-transparent' : 'bg-black/20'}`}>
                    <td className="p-4 font-bold text-[#cba052]">{reg.teamName}</td>
                    <td className="p-4">
                      <p className="font-bold text-white uppercase">{reg.driverName}</p>
                      {reg.nickname && <p className="text-xs text-gray-500">"{reg.nickname}"</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-black text-white">{reg.category}</p>
                      <p className="text-xs text-gray-500 font-mono">No. <span className="text-[#E43138] font-bold text-sm">{reg.racingNumber}</span></p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {reg.events.map((ev: string) => (
                          <span key={ev} className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-[10px] font-mono uppercase border border-gray-700">{ev}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-black rounded-full uppercase ${reg.paymentStatus === 'PAID' ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-yellow-900/50 text-yellow-500 border border-yellow-700'}`}>
                        {reg.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {/* ปุ่มดูใบขับแข่ง */}
                        <button 
                          onClick={() => reg.licenseImageUrl ? setSelectedImage(reg.licenseImageUrl) : alert('นักแข่งยังไม่อัปโหลดรูปใบขับแข่ง')}
                          className={`w-8 h-8 rounded flex items-center justify-center transition ${reg.licenseImageUrl ? 'bg-[#cba052] text-black hover:bg-yellow-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}
                          title="ดูใบอนุญาตแข่งรถ"
                        >
                          <i className="fas fa-id-badge"></i>
                        </button>
                        
                        {/* ปุ่มดูสลิปโอนเงิน (เตรียมไว้สำหรับอนาคต) */}
                        <button 
                          onClick={() => alert('รอระบบอัปโหลดสลิปในเฟสถัดไปครับบอส!')}
                          className="w-8 h-8 rounded bg-gray-800 text-gray-600 hover:text-white transition flex items-center justify-center"
                          title="ดูสลิปโอนเงิน"
                        >
                          <i className="fas fa-receipt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}