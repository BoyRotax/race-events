"use client";

// 🚩 บังคับ Dynamic ป้องกัน Error บน Vercel
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// 🗓️ ฐานข้อมูลสนามแข่ง (ผมเพิ่ม realDate เข้าไปให้ระบบคำนวณวันหมดอายุได้ครับ)
const RACE_EVENTS = [
  { id: 'TH-R1', name: 'RMC Thailand 2026 - Round 1', date: '7-8 Mar', realDate: '2026-03-08', type: 'TH' },
  { id: 'ASIA-R1', name: 'RMC Asia Trophy 2026 - Round 1', date: '3-5 Apr', realDate: '2026-04-05', type: 'ASIA' },
  { id: 'TH-R2', name: 'RMC Thailand 2026 - Round 2 (Double Header)', date: '1-3 May', realDate: '2026-05-03', type: 'DOUBLE' },
  { id: 'ASIA-R2', name: 'RMC Asia Trophy 2026 - Round 2 (Double Header)', date: '1-3 May', realDate: '2026-05-03', type: 'DOUBLE' },
  { id: 'TH-R3', name: 'RMC Thailand 2026 - Round 3', date: '6-7 Jun', realDate: '2026-06-07', type: 'TH' },
  { id: 'ASIA-R3', name: 'RMC Asia Trophy 2026 - Round 3', date: '3-5 Jul', realDate: '2026-07-05', type: 'ASIA' },
  { id: 'ASIA-R4', name: 'RMC Asia Trophy 2026 - Round 4', date: '15-16 Aug', realDate: '2026-08-16', type: 'ASIA' },
  { id: 'ASIA-R5', name: 'RMC Asia Trophy 2026 - Round 5', date: '26-27 Sep', realDate: '2026-09-27', type: 'ASIA' },
];

function EventSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = searchParams.get('driverId'); // 🚩 รับ ID มาจากหน้า VIP

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [driverName, setDriverName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // 🚩 ดึงข้อมูลนักแข่งว่า "เคยลงสนามไหนไปแล้วบ้าง?"
  useEffect(() => {
    const fetchDriverInfo = async () => {
      if (!driverId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/team');
        if (res.ok) {
          const json = await res.json();
          const driver = json.data?.find((d: any) => d.rawId === driverId);
          if (driver) {
            setDriverName(driver.name);
            setRegisteredEvents(driver.events || []); // เก็บประวัติสนามที่เคยลงแล้ว
          }
        }
      } catch (error) {
        console.error("Error fetching driver data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDriverInfo();
  }, [driverId]);

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const proceedToRegister = () => {
    if (selectedEvents.length === 0) return alert("กรุณาเลือกอย่างน้อย 1 สนาม");
    
    // 🚩 ส่งทั้ง สนามที่เลือก + ID นักแข่ง ไปหน้า Participant
    let url = `/participant?events=${selectedEvents.join(',')}`;
    if (driverId) url += `&driverId=${driverId}`;
    
    router.push(url);
  };

  if (loading) return <div className="min-h-screen bg-[#111] flex justify-center items-center text-[#E43138] font-black tracking-widest">LOADING EVENTS...</div>;

  const today = new Date();

  return (
    <div className="min-h-screen bg-[#111111] p-4 md:p-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* 🔙 ป้ายบอกทาง และ โชว์ชื่อนักแข่ง */}
        {driverId ? (
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4">
            <Link href="/vip" className="text-gray-500 hover:text-white text-sm font-bold transition mb-4 md:mb-0 inline-flex items-center">
              <i className="fas fa-arrow-left mr-2"></i> BACK TO GARAGE
            </Link>
            <div className="bg-[#1a1a1a] px-4 py-2 rounded-lg border border-[#cba052]/30 flex items-center shadow-lg">
              <i className="fas fa-user-astronaut text-[#cba052] mr-3 text-xl"></i>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Registering for</p>
                <p className="font-black text-white">{driverName}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <Link href="/vip" className="text-gray-500 hover:text-white text-sm font-bold transition">
              <i className="fas fa-arrow-left mr-2"></i> GO TO GARAGE
            </Link>
          </div>
        )}

        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Select <span className="text-[#E43138]">Events</span></h2>
        <p className="text-gray-400 mb-8 font-bold">เลือกรายการแข่งขันที่ต้องการลงทะเบียน (เลือกได้หลายสนาม)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {RACE_EVENTS.map(event => {
            const eventDate = new Date(event.realDate);
            const isPastEvent = eventDate < today; // 🚩 เช็คว่าเลยวันปัจจุบันหรือยัง?
            const isAlreadyRegistered = registeredEvents.includes(event.id); // 🚩 เช็คว่าเคยลงไปแล้วหรือยัง?
            const isDisabled = isPastEvent || isAlreadyRegistered;
            const isSelected = selectedEvents.includes(event.id);

            return (
              <div 
                key={event.id}
                onClick={() => !isDisabled && toggleEvent(event.id)}
                className={`p-5 rounded-xl border-2 transition-all duration-200 flex justify-between items-center relative overflow-hidden
                  ${isDisabled 
                    ? 'bg-black border-gray-900 opacity-60 cursor-not-allowed grayscale' 
                    : isSelected 
                      ? 'border-[#E43138] bg-red-900/20 shadow-[0_0_15px_rgba(228,49,56,0.2)] cursor-pointer' 
                      : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-600 cursor-pointer'}`}
              >
                <div>
                  <div className={`text-[10px] font-black uppercase mb-1 px-2 py-0.5 inline-block rounded
                    ${isDisabled ? 'bg-gray-800 text-gray-500' : event.type === 'TH' ? 'bg-blue-900 text-blue-300' : event.type === 'ASIA' ? 'bg-red-900 text-red-300' : 'bg-[#cba052] text-black'}`}>
                    {event.type}
                  </div>
                  <h3 className={`font-bold ${isDisabled ? 'text-gray-500' : 'text-white'}`}>{event.name}</h3>
                  <p className="text-gray-500 text-sm"><i className="far fa-calendar-alt mr-1"></i> {event.date}</p>
                </div>
                
                {/* 🚩 โซนด้านขวา: โชว์ป้ายกำกับ หรือ Checkbox */}
                <div className="flex flex-col items-end gap-2">
                  {isAlreadyRegistered ? (
                    <span className="text-[10px] font-black bg-green-900/50 text-green-500 px-2 py-1 rounded border border-green-800 whitespace-nowrap"><i className="fas fa-check-circle mr-1"></i> REGISTERED</span>
                  ) : isPastEvent ? (
                    <span className="text-[10px] font-black bg-gray-900 text-gray-500 px-2 py-1 rounded border border-gray-800 whitespace-nowrap"><i className="fas fa-history mr-1"></i> PAST EVENT</span>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition
                      ${isSelected ? 'border-[#E43138] bg-[#E43138]' : 'border-gray-600'}`}>
                      {isSelected && <i className="fas fa-check text-white text-xs"></i>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 🚩 แถบสรุปด้านล่าง */}
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center sticky bottom-8 shadow-2xl z-50">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-gray-400 font-bold text-sm uppercase">Selected Events</p>
            <p className="text-3xl font-black text-white">{selectedEvents.length} <span className="text-lg text-gray-500">Rounds</span></p>
          </div>
          <button 
            onClick={proceedToRegister}
            className={`w-full md:w-auto px-8 py-4 rounded-lg font-black tracking-widest transition shadow-lg
              ${selectedEvents.length > 0 ? 'bg-[#E43138] text-white hover:bg-red-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            PROCEED TO DRIVER INFO <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>

      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111] flex justify-center items-center font-black tracking-widest text-[#E43138]">LOADING...</div>}>
      <EventSelector />
    </Suspense>
  );
}