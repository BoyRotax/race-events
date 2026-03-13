import Link from 'next/link';
import React from 'react';

// 🚩 ข้อมูลตารางการแข่งขันทั้ง 7 สนาม
const RACE_EVENTS = [
  { id: 'TH-R1', name: 'RMC Thailand 2026 - Round 1', date: '7-8 Mar 2026', location: 'Bira Kart', type: 'TH' },
  { id: 'ASIA-R1', name: 'RMC Asia Trophy 2026 - Round 1', date: '3-5 Apr 2026', location: 'Bira Kart', type: 'ASIA' },
  { 
    id: 'DOUBLE-R2', 
    name: 'RMC Thailand R.2 & RMC Asia Trophy R.2', 
    date: '1-3 May 2026', 
    location: 'Bira Kart', 
    type: 'DOUBLE',
    note: '* Double Header: สามารถเลือกลง TH, ASIA หรือลงทั้งสองรายการได้'
  },
  { id: 'TH-R3', name: 'RMC Thailand 2026 - Round 3', date: '6-7 Jun 2026', location: 'Bira Kart', type: 'TH' },
  { id: 'ASIA-R3', name: 'RMC Asia Trophy 2026 - Round 3', date: '3-5 Jul 2026', location: 'Lyl Kart', type: 'ASIA' },
  { id: 'ASIA-R4', name: 'RMC Asia Trophy 2026 - Round 4', date: '15-16 Aug 2026', location: 'Lyl Kart', type: 'ASIA' },
  { id: 'ASIA-R5', name: 'RMC Asia Trophy 2026 - Round 5', date: '26-27 Sep 2026', location: 'Lyl Kart', type: 'ASIA' },
];

export default function WelcomePage() {
  return (
    <div className="bg-[#111111] min-h-screen font-sans text-white selection:bg-[#E43138] selection:text-white pb-20">
      
      {/* 🏁 Hero Section */}
      <div className="relative overflow-hidden bg-black border-b-4 border-[#E43138]">
        <div className="absolute inset-0 bg-[url('https://www.rotax-kart.com/images/rotax-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <h3 className="text-[#cba052] font-black tracking-widest uppercase mb-2">Welcome to the Ultimate Racing Experience</h3>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">
            ROTAX <span className="text-[#E43138]">RACING</span> 2026
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg mb-10">
            ระบบลงทะเบียนการแข่งขัน RMC Thailand และ RMC Asia Trophy 2026 <br/>
            กรุณาเข้าสู่ระบบเพื่อจัดการทีมและสมัครเข้าร่วมการแข่งขัน
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/login" className="bg-[#E43138] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-black tracking-wider transition transform hover:-translate-y-1 shadow-[0_0_20px_rgba(228,49,56,0.4)]">
              LOGIN TO PORTAL <i className="fas fa-arrow-right ml-2"></i>
            </Link>
            <Link href="/register" className="bg-transparent border-2 border-gray-600 hover:border-white text-white px-8 py-4 rounded-lg font-bold transition">
              Create New Account
            </Link>
          </div>
        </div>
      </div>

      {/* 📅 Race Calendar Section */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tight">2026 <span className="text-[#E43138]">Race Calendar</span></h2>
          <div className="w-24 h-1 bg-[#cba052] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="space-y-4">
          {RACE_EVENTS.map((event, index) => (
            <div 
              key={event.id} 
              className={`relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-xl border transition hover:bg-[#1a1a1a] group
                ${event.type === 'DOUBLE' 
                  ? 'bg-[#1a1a1a] border-[#cba052] shadow-[0_0_15px_rgba(203,160,82,0.1)]' 
                  : 'bg-black border-gray-800 hover:border-gray-600'}`}
            >
              {/* Event Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest
                    ${event.type === 'TH' ? 'bg-blue-900 text-blue-300' : 
                      event.type === 'ASIA' ? 'bg-red-900 text-red-300' : 
                      'bg-gradient-to-r from-[#cba052] to-yellow-600 text-black shadow-lg'}`}>
                    {event.type === 'DOUBLE' ? 'DOUBLE HEADER' : event.type}
                  </span>
                  <span className="text-gray-500 text-sm font-mono text-xs">ROUND {index + 1}</span>
                </div>
                <h3 className={`text-xl font-bold ${event.type === 'DOUBLE' ? 'text-[#cba052]' : 'text-white'}`}>
                  {event.name}
                </h3>
                {event.note && <p className="text-[#E43138] text-xs font-bold mt-2 italic">{event.note}</p>}
              </div>

              {/* Date & Location */}
              <div className="mt-4 md:mt-0 md:text-right flex flex-row md:flex-col gap-4 md:gap-1">
                <div className="flex items-center text-gray-300">
                  <i className="far fa-calendar-alt w-5 text-[#E43138]"></i>
                  <span className="font-mono font-bold">{event.date}</span>
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <i className="fas fa-map-marker-alt w-5 text-[#cba052]"></i>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}