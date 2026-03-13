"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const RACE_EVENTS = [
  { id: 'TH-R1', name: 'RMC Thailand 2026 - Round 1', date: '7-8 Mar', type: 'TH' },
  { id: 'ASIA-R1', name: 'RMC Asia Trophy 2026 - Round 1', date: '3-5 Apr', type: 'ASIA' },
  { id: 'TH-R2', name: 'RMC Thailand 2026 - Round 2 (Double Header)', date: '1-3 May', type: 'DOUBLE' },
  { id: 'ASIA-R2', name: 'RMC Asia Trophy 2026 - Round 2 (Double Header)', date: '1-3 May', type: 'DOUBLE' },
  { id: 'TH-R3', name: 'RMC Thailand 2026 - Round 3', date: '6-7 Jun', type: 'TH' },
  { id: 'ASIA-R3', name: 'RMC Asia Trophy 2026 - Round 3', date: '3-5 Jul', type: 'ASIA' },
  { id: 'ASIA-R4', name: 'RMC Asia Trophy 2026 - Round 4', date: '15-16 Aug', type: 'ASIA' },
  { id: 'ASIA-R5', name: 'RMC Asia Trophy 2026 - Round 5', date: '26-27 Sep', type: 'ASIA' },
];

export default function UserDashboard() {
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const router = useRouter();

  const toggleEvent = (id: string) => {
    setSelectedEvents(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const proceedToRegister = () => {
    if (selectedEvents.length === 0) return alert("กรุณาเลือกอย่างน้อย 1 สนาม");
    // 🚩 ส่งรหัสสนามผ่าน URL ไปหน้ากรอกฟอร์ม
    const query = selectedEvents.join(',');
    router.push(`/participant?events=${query}`);
  };

  return (
    <div className="min-h-screen bg-[#111111] p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Select <span className="text-[#E43138]">Events</span></h2>
        <p className="text-gray-400 mb-8 font-bold">เลือกรายการแข่งขันที่ต้องการลงทะเบียน (เลือกได้หลายสนาม)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {RACE_EVENTS.map(event => (
            <div 
              key={event.id}
              onClick={() => toggleEvent(event.id)}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex justify-between items-center
                ${selectedEvents.includes(event.id) 
                  ? 'border-[#E43138] bg-red-900/20 shadow-[0_0_15px_rgba(228,49,56,0.2)]' 
                  : 'border-gray-800 bg-[#1a1a1a] hover:border-gray-600'}`}
            >
              <div>
                <div className={`text-[10px] font-black uppercase mb-1 px-2 py-0.5 inline-block rounded
                  ${event.type === 'TH' ? 'bg-blue-900 text-blue-300' : event.type === 'ASIA' ? 'bg-red-900 text-red-300' : 'bg-[#cba052] text-black'}`}>
                  {event.type}
                </div>
                <h3 className="text-white font-bold">{event.name}</h3>
                <p className="text-gray-500 text-sm"><i className="far fa-calendar-alt mr-1"></i> {event.date}</p>
              </div>
              
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${selectedEvents.includes(event.id) ? 'border-[#E43138] bg-[#E43138]' : 'border-gray-600'}`}>
                {selectedEvents.includes(event.id) && <i className="fas fa-check text-white text-xs"></i>}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 flex justify-between items-center sticky bottom-8 shadow-2xl">
          <div>
            <p className="text-gray-400 font-bold text-sm uppercase">Selected Events</p>
            <p className="text-3xl font-black text-white">{selectedEvents.length} <span className="text-lg text-gray-500">Rounds</span></p>
          </div>
          <button 
            onClick={proceedToRegister}
            className={`px-8 py-4 rounded-lg font-black tracking-widest transition shadow-lg
              ${selectedEvents.length > 0 ? 'bg-[#E43138] text-white hover:bg-red-700' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            PROCEED TO DRIVER INFO <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}