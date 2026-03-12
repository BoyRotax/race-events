"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ParticipantPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    nationality: 'Thailand',
    racingNumber: '',
    events: [] as string[],
    primaryClass: '',
    crossEntry: false
  });

  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  // 🚩 ฟังก์ชันคำนวณอายุและล็อครุ่น (ตามกฎ RMCAT 2026)
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
      
      // ถ้ารุ่นที่เคยเลือกไว้ ไม่อยู่ในลิสต์ที่ลงได้ ให้รีเซ็ตค่า
      if (!classes.includes(formData.primaryClass)) {
        setFormData(prev => ({ ...prev, primaryClass: '', crossEntry: false }));
      }
    } else {
      setAvailableClasses([]);
    }
  }, [formData.birthDate]);

  const handleEventChange = (eventId: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventId) 
        ? prev.events.filter(id => id !== eventId)
        : [...prev.events, eventId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryClass) {
        alert("กรุณาเลือกรุ่นการแข่งขัน (Class)");
        return;
    }
    if (formData.events.length === 0) {
        alert("กรุณาเลือกรายการแข่งขันอย่างน้อย 1 รายการ");
        return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('✅ ลงทะเบียนสำเร็จ! ข้อมูลถูกบันทึกลงฐานข้อมูลแล้ว');
      } else {
        alert('❌ เกิดข้อผิดพลาดในการลงทะเบียน');
      }
    } catch (error) {
      console.error(error);
      alert('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    }
  };

  return (
    <div className="bg-[#f4f6f8] min-h-screen font-sans pb-20">
      <nav className="bg-black text-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-widest">
            ROTAX <span className="text-[#E43138]">RACING</span>
          </h1>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300 italic">
              <i className="fas fa-crown mr-1"></i> VIP Account
            </span>
            <span>Team: PT Creative</span>
          </div>
        </div>
        <div className="h-2 bg-[#E43138] w-full"></div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold text-gray-800">Driver Registration</h2>
        <p className="text-gray-500 text-sm mb-6 uppercase">Asia Trophy & Thailand Championship</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Personal Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 text-rotax-red uppercase tracking-tight">1. Personal Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input type="text" placeholder="First Name" className="p-3 border rounded focus:border-red-500 outline-none" 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
              <input type="text" placeholder="Last Name" className="p-3 border rounded focus:border-red-500 outline-none" 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
              
              <div>
                <input type="date" className="w-full p-3 border rounded focus:border-red-500 outline-none bg-blue-50" 
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})} required />
                <p className="text-xs text-gray-500 mt-1">* กรอกวันเกิดเพื่อตรวจสอบรุ่นที่สามารถลงแข่งได้ในปี 2026</p>
              </div>
            </div>
          </div>

          {/* Step 2: Select Class & Cross-Entry */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 text-rotax-red uppercase tracking-tight">
              2. Select Class & Cross-Entry
            </h3>
            
            {formData.birthDate === '' ? (
              <div className="p-4 bg-gray-50 text-gray-500 rounded border border-gray-200 text-center font-bold">
                กรุณาระบุวันเกิดในขั้นตอนที่ 1 เพื่อเลือกรุ่นการแข่งขัน
              </div>
            ) : availableClasses.length === 0 ? (
              <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-center font-bold">
                อายุของคุณไม่ตรงกับเกณฑ์การแข่งขันในปี 2026
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {availableClasses.map((cls) => (
                  <label key={cls} className={`p-3 border-2 rounded-lg cursor-pointer text-center transition ${formData.primaryClass === cls ? 'border-red-500 bg-red-50 font-bold text-red-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="primaryClass" 
                      className="hidden" 
                      onChange={() => setFormData({...formData, primaryClass: cls, crossEntry: false})} 
                    />
                    {cls}
                  </label>
                ))}
              </div>
            )}

            {/* Cross-Entry Logic */}
            {formData.primaryClass === 'Micro MAX' && (
              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg flex items-center justify-between mt-4">
                <div><p className="font-bold text-yellow-800">Micro Rookie Eligibility</p></div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-red-500 rounded border-gray-300 mr-2" 
                    checked={formData.crossEntry} onChange={(e) => setFormData({...formData, crossEntry: e.target.checked})} />
                  <span className="font-bold text-gray-700">ลงควบ Micro Rookie</span>
                </label>
              </div>
            )}

            {formData.primaryClass === 'Mini MAX' && (
              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg flex items-center justify-between mt-4">
                <div><p className="font-bold text-yellow-800">Mini Rookie Eligibility</p></div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-red-500 rounded border-gray-300 mr-2" 
                    checked={formData.crossEntry} onChange={(e) => setFormData({...formData, crossEntry: e.target.checked})} />
                  <span className="font-bold text-gray-700">ลงควบ Mini Rookie</span>
                </label>
              </div>
            )}

            {formData.primaryClass === 'Senior MAX Masters' && (
              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg flex items-center justify-between mt-4">
                <div><p className="font-bold text-blue-800">Senior MAX Cross-Entry</p></div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="w-5 h-5 text-red-500 rounded border-gray-300 mr-2" 
                    checked={formData.crossEntry} onChange={(e) => setFormData({...formData, crossEntry: e.target.checked})} />
                  <span className="font-bold text-gray-700">ลงควบ Senior MAX</span>
                </label>
              </div>
            )}
          </div>

          {/* Step 3: Select Events & Number */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 text-rotax-red uppercase tracking-tight">3. Select Events & Number</h3>
            
            <div className="mb-6">
               <label className="block text-xs font-black text-gray-500 mb-1 uppercase italic tracking-widest">Racing Number</label>
               <input type="number" placeholder="No. (e.g. 315)" className="w-40 p-4 text-2xl font-black rounded border-2 border-[#E43138] outline-none shadow-inner" 
                 onChange={(e) => setFormData({...formData, racingNumber: e.target.value})} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${formData.events.includes('TH-R2') ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="checkbox" className="hidden" onChange={() => handleEventChange('TH-R2')} />
                <span className="font-bold block">RMC Thailand 2026 - R2</span>
                <span className="text-xs text-gray-500">Bira Circuit | April 2026</span>
              </label>

              <label className={`p-4 border-2 rounded-lg cursor-pointer transition ${formData.events.includes('ASIA-R2') ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input type="checkbox" className="hidden" onChange={() => handleEventChange('ASIA-R2')} />
                <span className="font-bold block">RMC Asia Trophy 2026 - R2</span>
                <span className="text-xs text-gray-500">Double Header Support</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button type="submit" className="px-10 py-4 font-black text-white bg-[#E43138] rounded-lg hover:bg-red-700 shadow-xl transition transform active:scale-95">
              CONFIRM & SAVE DATA <i className="fas fa-check-circle ml-2"></i>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}