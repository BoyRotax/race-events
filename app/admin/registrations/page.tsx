"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminRegistrationsPage() {
  const { data: session, status } = useSession();
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // State สำหรับโชว์รูปขยาย (Modal)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") fetchRegistrations();
  }, [status]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations");
      if (res.ok) {
        const json = await res.json();
        setRegistrations(json.data || []);
      }
    } finally { setLoading(false); }
  };

  // 🚩 ฟังก์ชันจัดการการกดอนุมัติ/ปฏิเสธ
  const handleApproval = async (driverId: string, action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !confirm('แน่ใจหรือไม่ว่าต้องการปฏิเสธสลิปใบนี้? ระบบจะให้ทีมงานอัปโหลดใหม่')) return;
    
    setProcessingId(driverId);
    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId, action })
      });
      
      if (res.ok) {
        alert(action === 'APPROVE' ? '✅ อนุมัติสำเร็จ!' : '❌ ปฏิเสธสลิปแล้ว');
        fetchRegistrations(); // โหลดข้อมูลใหม่
      } else {
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } finally {
      setProcessingId(null);
    }
  };

  if (status === "loading" || loading) return <div className="min-h-screen bg-[#111] flex justify-center items-center text-[#E43138] font-black tracking-widest"><i className="fas fa-spinner fa-spin mr-3"></i> LOADING DATA...</div>;
  if (status === "unauthenticated" || (session?.user as any)?.role !== "ADMIN") return <div className="min-h-screen bg-[#111] flex justify-center items-center text-white text-2xl font-black uppercase">Access Denied</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 font-sans pb-20">
      
      {/* 🖼️ Modal ดูรูป */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex justify-center items-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button className="absolute -top-10 right-0 text-white font-black text-xl hover:text-[#E43138]"><i className="fas fa-times mr-2"></i> ปิดหน้าต่าง</button>
            <img src={selectedImage} alt="Preview" className="max-h-[85vh] w-auto object-contain rounded-lg border-2 border-[#cba052] shadow-[0_0_30px_rgba(203,160,82,0.3)]" />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-4">
          <div>
            <Link href="/admin" className="text-gray-500 hover:text-white text-sm font-bold transition mb-2 inline-block"><i className="fas fa-arrow-left mr-2"></i> BACK TO CONTROL PANEL</Link>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#E43138]">Registrations <span className="text-gray-600 font-bold text-xl">({registrations.length})</span></h1>
          </div>
          <button onClick={fetchRegistrations} className="mt-4 md:mt-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-bold transition">
            <i className="fas fa-sync-alt mr-2"></i> REFRESH
          </button>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-x-auto shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="p-4 font-bold">Team</th>
                <th className="p-4 font-bold">Driver Name</th>
                <th className="p-4 font-bold">Class & No.</th>
                <th className="p-4 font-bold text-center">Docs</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {registrations.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-600 font-bold uppercase">ยังไม่มีผู้สมัครลงแข่งขัน</td></tr>
              ) : (
                registrations.map((reg, idx) => (
                  <tr key={reg.id} className={`border-b border-gray-800/50 hover:bg-[#1a1a1a] transition ${idx % 2 === 0 ? 'bg-transparent' : 'bg-black/20'}`}>
                    <td className="p-4 font-bold text-[#cba052]">{reg.teamName}</td>
                    <td className="p-4"><p className="font-bold text-white uppercase">{reg.driverName}</p></td>
                    <td className="p-4"><p className="font-black text-white">{reg.category}</p><p className="text-xs text-[#E43138] font-bold">No. {reg.racingNumber}</p></td>
                    
                    {/* 📄 ช่องดูเอกสาร */}
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => reg.licenseImageUrl ? setSelectedImage(reg.licenseImageUrl) : alert('ไม่มีรูป')} className={`w-8 h-8 rounded flex items-center justify-center transition ${reg.licenseImageUrl ? 'bg-[#cba052] text-black hover:bg-yellow-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`} title="ดูใบขับแข่ง"><i className="fas fa-id-badge"></i></button>
                        <button onClick={() => reg.slipImageUrl ? setSelectedImage(reg.slipImageUrl) : alert('นักแข่งยังไม่อัปโหลดสลิป')} className={`w-8 h-8 rounded flex items-center justify-center transition ${reg.slipImageUrl ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`} title="ดูสลิปโอนเงิน"><i className="fas fa-receipt"></i></button>
                      </div>
                    </td>

                    {/* 🚦 ป้ายสถานะ */}
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider 
                        ${reg.paymentStatus === 'PAID' ? 'bg-green-900/50 text-green-400 border border-green-700' : 
                          reg.paymentStatus === 'WAITING_APPROVAL' ? 'bg-blue-900/50 text-blue-400 border border-blue-700 animate-pulse' : 
                          'bg-yellow-900/50 text-yellow-500 border border-yellow-700'}`}>
                        {reg.paymentStatus.replace('_', ' ')}
                      </span>
                    </td>

                    {/* 🛠️ ช่องกดอนุมัติ (โชว์เฉพาะตอนสถานะเป็น WAITING_APPROVAL) */}
                    <td className="p-4 text-right">
                      {reg.paymentStatus === 'WAITING_APPROVAL' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleApproval(reg.id, 'APPROVE')} disabled={processingId === reg.id} className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded transition disabled:opacity-50"><i className="fas fa-check mr-1"></i> APPROVE</button>
                          <button onClick={() => handleApproval(reg.id, 'REJECT')} disabled={processingId === reg.id} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded transition disabled:opacity-50"><i className="fas fa-times mr-1"></i> REJECT</button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-600 font-bold uppercase"><i className="fas fa-lock mr-1"></i> Locked</span>
                      )}
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