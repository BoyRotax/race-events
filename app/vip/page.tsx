"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { getFlagByCode } from '@/lib/countries';

export default function VipDashboard() {
  const { data: session, status } = useSession();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") fetchTeamData();
    else if (status === "unauthenticated") setLoading(false);
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

  return (
    <div className="min-h-screen bg-[#111111] text-white p-4 md:p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto mt-4">
        
        {/* 🏁 Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-800 pb-6">
          <div>
            <div className="text-[#cba052] font-black text-xs tracking-widest uppercase mb-1">Team Management Portal</div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              {session?.user?.name} <span className="text-gray-600">GARAGE</span>
            </h1>
          </div>
          <Link href="/add-driver" className="mt-4 md:mt-0 bg-[#E43138] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-black tracking-widest transition shadow-[0_0_15px_rgba(228,49,56,0.3)] flex items-center">
            <i className="fas fa-plus-circle mr-2"></i> REGISTER NEW DRIVER
          </Link>
        </div>
{/* 🚨 แจ้งเตือนยอดค้างชำระ */}
        {drivers.some(d => d.payment === 'PENDING' && d.events.length > 0) && (
          <div className="mb-8 bg-red-900/20 border border-[#E43138] rounded-xl p-6 flex flex-col md:flex-row justify-between items-center shadow-[0_0_20px_rgba(228,49,56,0.1)]">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-black text-[#E43138] uppercase"><i className="fas fa-exclamation-triangle mr-2"></i> Pending Payment</h3>
              <p className="text-gray-400 text-sm font-bold">คุณมีรายการลงแข่งที่ยังไม่ได้ชำระเงิน กรุณาชำระเงินเพื่อยืนยันสิทธิ์</p>
            </div>
            <Link href="/checkout" className="w-full md:w-auto px-8 py-3 bg-[#E43138] text-white font-black tracking-widest uppercase rounded hover:bg-red-700 transition text-center shadow-lg">
              VIEW INVOICE & PAY
            </Link>
          </div>
        )}
        {/* 📋 โซนการ์ดนักแข่ง (Driver Cards) */}
        {drivers.length === 0 ? (
          <div className="bg-[#1a1a1a] p-10 rounded-xl border border-gray-800 text-center">
            <i className="fas fa-car-crash text-4xl text-gray-600 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-400 uppercase">Garage is empty</h3>
            <p className="text-gray-600">ยังไม่มีนักแข่งในทีม กดปุ่มเพิ่มนักแข่งเพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver) => (
              <div key={driver.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden shadow-2xl relative group hover:border-[#cba052] transition-colors">
                
                {/* แถบสีด้านบนบอกสถานะการจ่ายเงิน */}
                <div className={`h-2 w-full ${driver.payment === 'PAID' ? 'bg-green-500' : 'bg-[#E43138]'}`}></div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      {/* รูปใบขับแข่ง / อวตาร */}
                      {driver.licenseImageUrl ? (
                        <img src={driver.licenseImageUrl} alt="License" className="w-16 h-16 rounded-full object-cover border-2 border-[#E43138]" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-black border-2 border-gray-700 flex items-center justify-center text-gray-600 text-2xl">
                          <i className="fas fa-user-astronaut"></i>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-black text-xl text-white uppercase leading-tight">{driver.name}</h4>
                        <p className="text-[#cba052] text-sm font-bold uppercase">
  {driver.nickname ? `"${driver.nickname}"` : 'NO NICKNAME'} 
  <span className="text-gray-600 mx-1">|</span> 
  <span className="text-xl mr-1">{getFlagByCode(driver.nationality)}</span> {driver.nationality || 'N/A'}
</p>
                      </div>
                    </div>
                    
                    {/* เบอร์รถตัวใหญ่เบิ้ม! */}
                    <div className="bg-black border border-gray-800 text-white w-12 h-12 rounded-lg flex items-center justify-center font-black text-2xl shadow-inner">
                      {driver.racingNumber}
                    </div>
                  </div>

                  {/* รุ่นการแข่งขัน */}
                  <div className="mb-4 bg-black p-3 rounded border border-gray-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Class</p>
                      <p className="font-black text-white">{driver.category}</p>
                    </div>
                    {driver.crossEntry && (
                      <div className="text-right">
                        <p className="text-xs text-yellow-600 font-bold uppercase mb-1">Cross Entry</p>
                        <p className="font-black text-[#cba052]">{driver.crossEntry}</p>
                      </div>
                    )}
                  </div>

                  {/* ข้อมูลอื่นๆ */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-black/50 p-2 rounded border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Shirt Size</p>
                      <p className="font-bold text-gray-300">{driver.shirtSize || '-'}</p>
                    </div>
                    <div className="bg-black/50 p-2 rounded border border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Blood Type</p>
                      <p className="font-bold text-gray-300">{driver.bloodType || '-'}</p>
                    </div>
                  </div>

                  {/* รายการสนาม */}
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Registered Events</p>
                    <div className="flex flex-wrap gap-1">
                      {driver.events.map((ev: string) => (
                        <span key={ev} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-[10px] font-mono uppercase border border-gray-700">{ev}</span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}