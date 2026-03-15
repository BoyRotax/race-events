"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// 🗓️ ฐานข้อมูลสนามแข่ง (บอสแก้วันที่จริงได้เลยครับ)
// ระบบจะเช็คจากวันที่เหล่านี้ ว่าผ่านไปหรือยัง (ปี 2026)
const EVENTS_DATA = [
  { id: 'TH-R1', name: 'RMC Thailand - Round 1', date: '2026-02-15', location: 'Bira Kart' },
  { id: 'TH-R2', name: 'RMC Thailand - Round 2', date: '2026-04-12', location: 'Bira Kart' },
  { id: 'TH-R3', name: 'RMC Thailand - Round 3', date: '2026-06-14', location: 'Bira Kart' },
  { id: 'ASIA-R1', name: 'Rotax Asia Trophy - Round 1', date: '2026-05-10', location: 'Sepang, MY' },
  { id: 'ASIA-R2', name: 'Rotax Asia Trophy - Round 2', date: '2026-07-12', location: 'Sepang, MY' },
  { id: 'ASIA-R3', name: 'Rotax Asia Trophy - Round 3', date: '2026-08-16', location: 'Sepang, MY' },
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
          // หาข้อมูลนักแข่งคนที่ตรงกับ ID ที่ส่งมา
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

  const toggleEvent = (eventId: string) => {
    setSelectedEvents(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const handleProceed = () => {
    if (selectedEvents.length === 0) return alert('กรุณาเลือกสนามแข่งขันอย่างน้อย 1 สนามครับ');
    
    // 🚩 ส่งทั้ง สนามที่เลือก + ID นักแข่ง ไปให้หน้า participant
    let url = `/participant?events=${selectedEvents.join(',')}`;
    if (driverId) url += `&driverId=${driverId}`;
    
    router.push(url);
  };

  if (loading) return <div className="min-h-screen bg-[#111] flex justify-center items-center text-[#E43138] font-black tracking-widest">LOADING EVENTS...</div>;

  const today = new Date();

  return (
    <div className="max-w-4xl mx-auto px-4 mt-8 md:mt-12">
      
      {driverId ? (
        <div className="mb-6 flex justify-between items-center">
          <Link href="/vip" className="text-gray-500 hover:text-white text-sm font-bold transition">
            <i className="fas fa-arrow-left mr-2"></i> BACK TO GARAGE
          </Link>
          <div className="bg-[#1a1a1a] px-4 py-2 rounded-lg border border-[#cba052]/30 flex items-center">
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

      <div className="mb-8">
        <h2 className="text-4xl font-black uppercase tracking-tight">Select <span className="text-[#E43138]">Events</span></h2>
        <p className="text-gray-400 font-bold mt-2">เลือกรายการแข่งขันที่ต้องการลงสมัคร</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EVENTS_DATA.map(event => {
          const eventDate = new Date(event.date);
          const isPastEvent = eventDate < today; // 🚩 เช็คว่าเลยวันปัจจุบันหรือยัง?
          const isAlreadyRegistered = registeredEvents.includes(event.id); // 🚩 เช็คว่าเคยลงไปแล้วหรือยัง?
          
          // ล็อกปุ่มถ้าเข้าเงื่อนไข
          const isDisabled = isPastEvent || isAlreadyRegistered;
          const isSelected = selectedEvents.includes(event.id);

          return (
            <div 
              key={event.id}
              onClick={() => !isDisabled && toggleEvent(event.id)}
              className={`p-6 rounded-xl border-2 transition-all relative overflow-hidden ${
                isDisabled 
                  ? 'bg-black border-gray-900 opacity-50 cursor-not-allowed grayscale' 
                  : isSelected 
                    ? 'bg-[#E43138]/10 border-[#E43138] cursor-pointer shadow-[0_0_20px_rgba(228,49,56,0.2)]' 
                    : 'bg-[#1a1a1a] border-gray-800 cursor-pointer hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-black uppercase ${isDisabled ? 'text-gray-600' : 'text-white'}`}>{event.name}</h3>
                  <p className="text-sm font-bold text-gray-500 mt-1"><i className="fas fa-map-marker-alt mr-1"></i> {event.location}</p>
                </div>
                {/* Checkbox (ซ่อนถ้าโดนล็อก) */}
                {!isDisabled && (
                  <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition ${isSelected ? 'bg-[#E43138] border-[#E43138] text-white' : 'border-gray-600'}`}>
                    {isSelected && <i className="fas fa-check text-xs"></i>}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end border-t border-gray-800/50 pt-4 mt-2">
                <div className="text-sm font-bold text-[#cba052]">
                  <i className="far fa-calendar-alt mr-2"></i> 
                  {eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                
                {/* 🚩 โชว์ป้ายกำกับว่าทำไมถึงกดไม่ได้ */}
                {isAlreadyRegistered ? (
                  <span className="text-xs font-black bg-green-900/50 text-green-500 px-3 py-1 rounded border border-green-800"><i className="fas fa-check-circle mr-1"></i> REGISTERED</span>
                ) : isPastEvent ? (
                  <span className="text-xs font-black bg-gray-900 text-gray-600 px-3 py-1 rounded border border-gray-800"><i className="fas fa-history mr-1"></i> PAST EVENT</span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* ปุ่มไปต่อ! */}
      <div className="mt-10 bg-black p-6 rounded-xl border border-gray-800 flex justify-end shadow-2xl sticky bottom-8 z-40">
        <button 
          onClick={handleProceed}
          disabled={selectedEvents.length === 0}
          className="w-full md:w-auto px-10 py-4 font-black tracking-widest text-white bg-[#E43138] rounded-lg hover:bg-red-700 transition disabled:opacity-50 shadow-[0_0_20px_rgba(228,49,56,0.3)]"
        >
          PROCEED TO REGISTRATION <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>

    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="bg-[#111111] min-h-screen pb-20 text-white">
      <Suspense fallback={<div className="min-h-screen flex justify-center items-center font-black tracking-widest text-[#E43138]">LOADING...</div>}>
        <EventSelector />
      </Suspense>
    </div>
  );
}