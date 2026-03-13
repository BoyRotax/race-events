"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// 🚩 เรทราคาค่าสมัครอ้างอิง
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

function RegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    racingNumber: '',
    primaryClass: '',
    crossEntry: false
  });

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. ดึงข้อมูลสนามที่เลือกมาจากหน้า Dashboard
  useEffect(() => {
    const eventsParam = searchParams.get('events');
    if (eventsParam) {
      setSelectedEvents(eventsParam.split(','));
    }
  }, [searchParams]);

  // 2. คำนวณอายุและล็อครุ่น (ตามกฎ RMCAT 2026)
  useEffect(() => {
    if (formData.birthDate) {
      const birthYear = new Date(formData.birthDate).getFullYear();
      const ageIn2026 = 2026 - birthYear;
      
      const classes = [];
      if (ageIn2026 >= 8 && ageIn2026 <= 11) classes.push('Micro MAX');
      if (ageIn2026 >= 10 && ageIn2026 <= 13) classes.push('Mini MAX');
      if (ageIn2026 >= 12 && ageIn2026 <= 14) classes.push('Junior MAX');
      if (ageIn2026 >= 14) classes.push('Senior MAX');
      if (ageIn2026 >= 15) classes.push('MAX DD2');
      if (ageIn2026 >= 32) classes.push('Senior MAX Masters');

      setAvailableClasses(classes);
      
      if (!classes.includes(formData.primaryClass)) {
        setFormData(prev => ({ ...prev, primaryClass: '', crossEntry: false }));
      }
    } else {
      setAvailableClasses([]);
    }
  }, [formData.birthDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryClass) return alert("กรุณาเลือกรุ่นการแข่งขัน (Class)");
    if (selectedEvents.length === 0) return alert("ไม่พบรายการแข่งขัน กรุณากลับไปเลือกสนามใหม่");

    setLoading(true);
    try {
      const payload = { ...formData, events: selectedEvents };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ ลงทะเบียนสำเร็จ! ข้อมูลถูกบันทึกลงระบบแล้ว');
        router.push('/vip'); // กลับไปหน้า Dashboard ดูผลงาน
        router.refresh();
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      console.error(error);
      alert('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  // คำนวณยอดเงินรวม (โชว์ให้ User ดู)
  const baseFee = ENTRY_FEES[formData.primaryClass] || 0;
  const totalFee = baseFee * selectedEvents.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* โชว์รายการสนามที่ดึงมา */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#E43138] uppercase tracking-tight"><i className="fas fa-flag-checkered mr-2"></i>Selected Events</h3>
          <button type="button" onClick={() => router.push('/dashboard')} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition">
            <i className="fas fa-edit mr-1"></i> แก้ไขสนาม
          </button>
        </div>
        {selectedEvents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedEvents.map(ev => (
              <span key={ev} className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded border border-gray-700 font-mono uppercase">
                {ev}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-yellow-500 text-sm font-bold">⚠️ ยังไม่ได้เลือกสนามแข่งขัน</p>
        )}
      </div>

      {/* ข้อมูลส่วนตัว */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-[#cba052] uppercase tracking-tight">1. Personal Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" placeholder="First Name" className="p-4 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" 
            onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
          <input type="text" placeholder="Last Name" className="p-4 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" 
            onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Date of Birth</label>
            <input type="date" className="w-full p-4 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" 
              onChange={(e) => setFormData({...formData, birthDate: e.target.value})} required />
            <p className="text-xs text-gray-500 mt-2">* กรอกวันเกิดเพื่อตรวจสอบรุ่นที่สามารถลงแข่งได้ในปี 2026 อัตโนมัติ</p>
          </div>
        </div>
      </div>

      {/* เลือกรุ่น */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-[#cba052] uppercase tracking-tight">2. Select Class & Number</h3>
        
        {formData.birthDate === '' ? (
          <div className="p-4 bg-black text-gray-500 rounded border border-gray-800 text-center font-bold">
            กรุณาระบุวันเกิดในขั้นตอนที่ 1 เพื่อเลือกรุ่นการแข่งขัน
          </div>
        ) : availableClasses.length === 0 ? (
          <div className="p-4 bg-red-900/20 text-red-500 rounded border border-red-900/50 text-center font-bold">
            อายุของคุณไม่ตรงกับเกณฑ์การแข่งขันในปี 2026
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {availableClasses.map((cls) => (
              <label key={cls} className={`p-4 border-2 rounded-lg cursor-pointer text-center transition ${formData.primaryClass === cls ? 'border-[#E43138] bg-[#E43138]/10 text-white font-black' : 'border-gray-800 bg-black text-gray-400 hover:border-gray-600'}`}>
                <input type="radio" name="primaryClass" className="hidden" 
                  onChange={() => setFormData({...formData, primaryClass: cls, crossEntry: false})} />
                {cls}
              </label>
            ))}
          </div>
        )}

        {/* Cross Entry Logic */}
        {(formData.primaryClass === 'Micro MAX' || formData.primaryClass === 'Mini MAX' || formData.primaryClass === 'Senior MAX Masters') && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex items-center justify-between mb-6">
            <div>
              <p className="font-bold text-[#cba052]">Cross-Entry Eligibility</p>
              <p className="text-xs text-gray-400">ลงแข่งควบ 2 รุ่นในสุดสัปดาห์เดียวกัน</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#E43138] rounded mr-2" 
                checked={formData.crossEntry} onChange={(e) => setFormData({...formData, crossEntry: e.target.checked})} />
              <span className="font-bold text-white">ลงควบ {formData.primaryClass.includes('Micro') ? 'Micro Rookie' : formData.primaryClass.includes('Mini') ? 'Mini Rookie' : 'Senior MAX'}</span>
            </label>
          </div>
        )}

        <div className="mt-4">
           <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Racing Number (หมายเลขรถ)</label>
           <input type="number" placeholder="เช่น 315" className="w-full md:w-1/2 p-4 text-2xl font-black rounded bg-black border border-gray-800 outline-none focus:border-[#cba052] text-white placeholder-gray-700" 
             onChange={(e) => setFormData({...formData, racingNumber: e.target.value})} required />
        </div>
      </div>

      {/* สรุปบิลและปุ่ม Submit */}
      <div className="bg-black p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center shadow-2xl sticky bottom-8">
        <div className="mb-4 md:mb-0 text-center md:text-left">
          <p className="text-gray-500 font-bold text-sm uppercase">Total Entry Fee</p>
          <div className="text-3xl font-black text-white">
            {totalFee > 0 ? formatTHB(totalFee) : '฿ 0'}
          </div>
          {totalFee > 0 && <p className="text-xs text-[#E43138] mt-1">{formatTHB(baseFee)} x {selectedEvents.length} Event(s)</p>}
        </div>
        
        <button type="submit" disabled={loading || totalFee === 0} 
          className="w-full md:w-auto px-10 py-4 font-black tracking-widest text-white bg-[#E43138] rounded-lg hover:bg-red-700 transition disabled:opacity-50 shadow-[0_0_20px_rgba(228,49,56,0.3)]">
          {loading ? 'SAVING DATA...' : 'CONFIRM REGISTRATION'} <i className="fas fa-check-circle ml-2"></i>
        </button>
      </div>

    </form>
  );
}

export default function ParticipantPage() {
  return (
    <div className="bg-[#111111] min-h-screen font-sans pb-20 text-white">
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Driver <span className="text-[#E43138]">Registration</span></h2>
        <p className="text-gray-400 mb-8 font-bold">กรอกข้อมูลนักแข่งเพื่อเข้าร่วมการแข่งขันที่ท่านเลือก</p>
        
        {/* ครอบด้วย Suspense ป้องกัน Error การดึง URL Parameters */}
        <Suspense fallback={<div className="text-center p-10 text-gray-500 font-bold"><i className="fas fa-spinner fa-spin mr-2"></i> LOADING FORM...</div>}>
          <RegistrationForm />
        </Suspense>

      </div>
    </div>
  );
}