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

  // 🚩 1. เพิ่ม State ฟิลด์ใหม่ทั้งหมดให้ตรงกับ Database
  const [formData, setFormData] = useState({
    driverId: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    nickname: '',
    nationality: '',
    licenseNo: '',
    shirtSize: '',
    bloodType: '',
    mobileNo: '',
    guardianName: '',
    guardianId: '',
    guardianNationality: '',
    guardianMobile: '',
    racingNumber: '',
    primaryClass: '',
    crossEntry: false
  });

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [teamDrivers, setTeamDrivers] = useState<any[]>([]);
  const [fetchingDrivers, setFetchingDrivers] = useState(true);
  
  // 🚩 2. State สำหรับปุ่ม Edit ปลดล็อกข้อมูล
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    const eventsParam = searchParams.get('events');
    if (eventsParam) setSelectedEvents(eventsParam.split(','));
  }, [searchParams]);

  useEffect(() => {
    const fetchTeamDrivers = async () => {
      try {
        const res = await fetch('/api/team');
        if (res.ok) {
          const json = await res.json();
          setTeamDrivers(json.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch drivers", err);
      } finally {
        setFetchingDrivers(false);
      }
    };
    fetchTeamDrivers();
  }, []);

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

  // 🚩 ฟังก์ชันโหลดข้อมูลคนเก่ามาใส่ฟอร์ม
  const handleSelectExistingDriver = (driver: any) => {
    const nameParts = driver.name.split(' ');
    const fName = nameParts[0];
    const lName = nameParts.slice(1).join(' ');

    setFormData({
      ...formData,
      driverId: driver.rawId,
      firstName: fName,
      lastName: lName,
      birthDate: driver.rawBirthDate ? new Date(driver.rawBirthDate).toISOString().split('T')[0] : '',
      nickname: driver.nickname || '',
      nationality: driver.nationality || '',
      licenseNo: driver.licenseNo || '',
      shirtSize: driver.shirtSize || '',
      bloodType: driver.bloodType || '',
      mobileNo: driver.mobileNo || '',
      guardianName: driver.guardianName || '',
      guardianId: driver.guardianId || '',
      guardianNationality: driver.guardianNationality || '',
      guardianMobile: driver.guardianMobile || '',
      racingNumber: '', 
      primaryClass: '', 
      crossEntry: false
    });
    setIsEditingProfile(false); // ล็อกข้อมูลไว้ทันที
  };

  // 🚩 ฟังก์ชันเคลียร์ฟอร์ม
  const handleNewDriver = () => {
    setFormData({
      driverId: '', firstName: '', lastName: '', birthDate: '', nickname: '', nationality: '', licenseNo: '', shirtSize: '', bloodType: '', mobileNo: '', guardianName: '', guardianId: '', guardianNationality: '', guardianMobile: '', racingNumber: '', primaryClass: '', crossEntry: false
    });
    setIsEditingProfile(false);
  };

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
        router.push('/vip');
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

  const baseFee = ENTRY_FEES[formData.primaryClass] || 0;
  const totalFee = baseFee * selectedEvents.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- โซนสนามที่เลือก --- */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#E43138] uppercase tracking-tight"><i className="fas fa-flag-checkered mr-2"></i>Selected Events</h3>
          <button type="button" onClick={() => router.push('/dashboard')} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded hover:bg-gray-700 transition">
            <i className="fas fa-edit mr-1"></i> Edit Events
          </button>
        </div>
        {selectedEvents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedEvents.map(ev => (
              <span key={ev} className="bg-gray-900 text-gray-300 text-xs px-3 py-1.5 rounded border border-gray-700 font-mono uppercase">{ev}</span>
            ))}
          </div>
        ) : (
          <p className="text-yellow-500 text-sm font-bold">⚠️ ยังไม่ได้เลือกสนามแข่งขัน</p>
        )}
      </div>

      {/* --- โซน My Garage --- */}
      <div className="bg-black p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#cba052]"></div>
        <h3 className="text-lg font-bold mb-4 text-[#cba052] uppercase tracking-tight"><i className="fas fa-users-cog mr-2"></i>My Garage (เลือกนักแข่ง)</h3>
        
        {fetchingDrivers ? (
          <div className="text-gray-500 text-sm"><i className="fas fa-spinner fa-spin mr-2"></i> Loading Garage...</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleNewDriver}
              className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition ${!formData.driverId ? 'border-[#E43138] bg-[#E43138]/20 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
              <i className="fas fa-plus mr-2"></i> NEW DRIVER
            </button>
            {teamDrivers.map((driver, idx) => (
              <button key={idx} type="button" onClick={() => handleSelectExistingDriver(driver)}
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition ${formData.driverId === driver.rawId ? 'border-[#cba052] bg-[#cba052]/20 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600 bg-[#111]'}`}>
                <i className="fas fa-user-astronaut mr-2"></i> {driver.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- โซนข้อมูลนักแข่ง (Driver Info) --- */}
      <div className={`p-6 rounded-xl border shadow-lg transition-all ${formData.driverId && !isEditingProfile ? 'bg-black border-gray-800 opacity-90' : 'bg-[#1a1a1a] border-gray-800'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#cba052] uppercase tracking-tight">1. Driver Information</h3>
            <p className="text-xs text-gray-500 mt-1">ข้อมูลส่วนตัวนักแข่ง (ตรงตามบัตรประชาชน/พาสปอร์ต)</p>
          </div>
          {formData.driverId && (
            <button type="button" onClick={() => setIsEditingProfile(!isEditingProfile)} 
              className={`mt-4 md:mt-0 text-xs px-4 py-2 rounded font-bold transition border ${isEditingProfile ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-[#cba052]/20 text-[#cba052] border-[#cba052]/50 hover:bg-[#cba052]/30'}`}>
              <i className={`fas ${isEditingProfile ? 'fa-lock' : 'fa-edit'} mr-1`}></i> 
              {isEditingProfile ? "SAVE & LOCK" : "EDIT PROFILE"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">First Name *</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Last Name *</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nickname</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth *</label>
            <input type="date" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} required disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nationality (ex. THA)</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Blood Type</label>
            <select className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})} disabled={!!formData.driverId && !isEditingProfile}>
              <option value="">Select...</option>
              <option value="A Rh+">A Rh+</option> <option value="A Rh-">A Rh-</option>
              <option value="B Rh+">B Rh+</option> <option value="B Rh-">B Rh-</option>
              <option value="O Rh+">O Rh+</option> <option value="O Rh-">O Rh-</option>
              <option value="AB Rh+">AB Rh+</option> <option value="AB Rh-">AB Rh-</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Shirt Size</label>
            <select className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.shirtSize} onChange={(e) => setFormData({...formData, shirtSize: e.target.value})} disabled={!!formData.driverId && !isEditingProfile}>
              <option value="">Select...</option>
              <option value="XS">XS</option> <option value="S">S</option> <option value="M">M</option>
              <option value="L">L</option> <option value="XL">XL</option> <option value="XXL">XXL</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Mobile No.</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.mobileNo} onChange={(e) => setFormData({...formData, mobileNo: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">License No.</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.licenseNo} onChange={(e) => setFormData({...formData, licenseNo: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>
        </div>
      </div>

      {/* --- โซนข้อมูลผู้ปกครอง (Guardian Info) --- */}
      <div className={`p-6 rounded-xl border shadow-lg transition-all ${formData.driverId && !isEditingProfile ? 'bg-black border-gray-800 opacity-90' : 'bg-[#1a1a1a] border-gray-800'}`}>
        <h3 className="text-lg font-bold text-[#cba052] uppercase tracking-tight mb-1">2. Legal Guardian</h3>
        <p className="text-xs text-[#E43138] mb-4 font-bold">* ข้อมูลผู้ปกครอง (จำเป็นต้องกรอกหากนักแข่งอายุต่ำกว่า 18 ปี)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Guardian Name</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">NRIC / Passport / ID No.</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.guardianId} onChange={(e) => setFormData({...formData, guardianId: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Guardian Nationality</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.guardianNationality} onChange={(e) => setFormData({...formData, guardianNationality: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Guardian Mobile No.</label>
            <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white disabled:opacity-50 disabled:bg-[#0a0a0a]" 
              value={formData.guardianMobile} onChange={(e) => setFormData({...formData, guardianMobile: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          </div>
        </div>
      </div>

      {/* --- โซนเลือกรุ่นแข่ง (Racing Details) --- */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-[#cba052] uppercase tracking-tight">3. Racing Details</h3>
        
        {!formData.birthDate ? (
          <div className="p-4 bg-black text-gray-500 rounded border border-gray-800 text-center font-bold">
            กรุณาระบุวันเกิดนักแข่งในส่วนที่ 1 เพื่อเลือกรุ่นการแข่งขัน
          </div>
        ) : availableClasses.length === 0 ? (
          <div className="p-4 bg-red-900/20 text-red-500 rounded border border-red-900/50 text-center font-bold">
            อายุของนักแข่งไม่ตรงกับเกณฑ์การแข่งขันในปี 2026
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
           <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Racing Number (หมายเลขรถ) *</label>
           <input type="number" placeholder="เช่น 315" className="w-full md:w-1/3 p-4 text-2xl font-black rounded bg-black border border-gray-800 outline-none focus:border-[#cba052] text-white placeholder-gray-800" 
             value={formData.racingNumber}
             onChange={(e) => setFormData({...formData, racingNumber: e.target.value})} required />
        </div>
      </div>

      {/* --- โซนชำระเงินและยืนยัน --- */}
      <div className="bg-black p-6 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center shadow-2xl sticky bottom-8 z-40">
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
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Driver <span className="text-[#E43138]">Registration</span></h2>
        <p className="text-gray-400 mb-8 font-bold">กรอกข้อมูลเพื่อลงทะเบียน RMC Asia Trophy 2026</p>
        
        <Suspense fallback={<div className="text-center p-10 text-gray-500 font-bold"><i className="fas fa-spinner fa-spin mr-2"></i> LOADING FORM...</div>}>
          <RegistrationForm />
        </Suspense>
      </div>
    </div>
  );
}