"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const ENTRY_FEES: Record<string, number> = {
  'Micro MAX': 21000,
  'Mini MAX': 27500,
  'Junior MAX': 29000,
  'Senior MAX': 30000,
  'Senior MAX Masters': 30000,
  'MAX DD2': 30000,
  'MAX DD2 Masters': 30000, // 🚩 เพิ่มรุ่นนี้แล้ว!
};

const formatTHB = (amount: number) => {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 0 }).format(amount);
};

function RegistrationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    driverId: '', firstName: '', lastName: '', birthDate: '', nickname: '', 
    nationality: '', licenseNo: '', licenseImageUrl: '', shirtSize: '', bloodType: '', 
    mobileNo: '', guardianName: '', guardianId: '', guardianNationality: '', 
    guardianMobile: '', racingNumber: '', primaryClass: '', crossEntry: false
  });

  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [teamDrivers, setTeamDrivers] = useState<any[]>([]);
  const [fetchingDrivers, setFetchingDrivers] = useState(true);
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
        console.error("Failed to fetch drivers");
      } finally {
        setFetchingDrivers(false);
      }
    };
    fetchTeamDrivers();
  }, []);

  // 🚩 อัปเดตการคำนวณอายุ เพิ่ม DD2 Masters
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
      if (ageIn2026 >= 32) {
        classes.push('Senior MAX Masters');
        classes.push('MAX DD2 Masters'); // 🚩 เพิ่มตรงนี้!
      }

      setAvailableClasses(classes);
      if (!classes.includes(formData.primaryClass)) {
        setFormData(prev => ({ ...prev, primaryClass: '', crossEntry: false }));
      }
    } else {
      setAvailableClasses([]);
    }
  }, [formData.birthDate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("ขนาดไฟล์รูปเกิน 2MB ครับ");
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, licenseImageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSelectExistingDriver = (driver: any) => {
    const nameParts = driver.name.split(' ');
    setFormData({
      ...formData, driverId: driver.rawId, firstName: nameParts[0], lastName: nameParts.slice(1).join(' '),
      birthDate: driver.rawBirthDate ? new Date(driver.rawBirthDate).toISOString().split('T')[0] : '',
      nickname: driver.nickname || '', nationality: driver.nationality || '', licenseNo: driver.licenseNo || '',
      licenseImageUrl: driver.licenseImageUrl || '', shirtSize: driver.shirtSize || '',
      bloodType: driver.bloodType || '', mobileNo: driver.mobileNo || '',
      guardianName: driver.guardianName || '', guardianId: driver.guardianId || '',
      guardianNationality: driver.guardianNationality || '', guardianMobile: driver.guardianMobile || '',
      racingNumber: '', primaryClass: '', crossEntry: false
    });
    setIsEditingProfile(false); 
  };

  const handleNewDriver = () => {
    setFormData({
      driverId: '', firstName: '', lastName: '', birthDate: '', nickname: '', nationality: '', licenseNo: '', licenseImageUrl: '', shirtSize: '', bloodType: '', mobileNo: '', guardianName: '', guardianId: '', guardianNationality: '', guardianMobile: '', racingNumber: '', primaryClass: '', crossEntry: false
    });
    setIsEditingProfile(false);
  };

  // 🚩 ฟังก์ชันตรวจสอบความถูกต้องของเบอร์รถตามกฎ RMC
  const validateRacingNumber = () => {
    const n = parseInt(formData.racingNumber);
    const cls = formData.primaryClass;
    if (cls === 'Micro MAX' && (n < 1 || n > 99)) return "Micro MAX ต้องใช้เบอร์ 1 - 99";
    if (cls === 'Mini MAX' && (n < 100 || n > 199)) return "Mini MAX ต้องใช้เบอร์ 100 - 199";
    if (cls === 'Junior MAX' && (n < 200 || n > 299)) return "Junior MAX ต้องใช้เบอร์ 200 - 299";
    if (cls === 'Senior MAX' && (n < 300 || n > 399)) return "Senior MAX ต้องใช้เบอร์ 300 - 399";
    if (cls === 'Senior MAX Masters' && (n < 900 || n > 999)) return "Senior MAX Masters ต้องใช้เบอร์ 900 - 999";
    if (cls === 'MAX DD2' && (n < 400 || n > 499)) return "MAX DD2 ต้องใช้เบอร์ 400 - 499";
    if (cls === 'MAX DD2 Masters' && (n < 500 || n > 599)) return "MAX DD2 Masters ต้องใช้เบอร์ 500 - 599";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryClass) return alert("กรุณาเลือกรุ่นการแข่งขัน (Class)");
    if (selectedEvents.length === 0) return alert("ไม่พบรายการแข่งขัน กรุณากลับไปเลือกสนามใหม่");

    // 🚩 เช็คเบอร์รถก่อนบันทึก!
    const numberError = validateRacingNumber();
    if (numberError) return alert(`❌ ผิดกฎหมายเลขรถ:\n${numberError}`);

    setLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, events: selectedEvents }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('✅ ลงทะเบียนสำเร็จ! ข้อมูลถูกบันทึกลงระบบแล้ว');
        router.push('/vip');
      } else alert(`❌ เกิดข้อผิดพลาด: ${result.error}`);
    } catch (error) {
      alert('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  const baseFee = ENTRY_FEES[formData.primaryClass] || 0;
  const totalFee = baseFee * selectedEvents.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* --- โซน My Garage --- */}
      <div className="bg-black p-6 rounded-xl border border-gray-800 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#cba052]"></div>
        <h3 className="text-lg font-bold mb-4 text-[#cba052] uppercase tracking-tight"><i className="fas fa-users-cog mr-2"></i>My Garage (เลือกนักแข่ง)</h3>
        {fetchingDrivers ? (
          <div className="text-gray-500 text-sm"><i className="fas fa-spinner fa-spin mr-2"></i> Loading Garage...</div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleNewDriver} className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition ${!formData.driverId ? 'border-[#E43138] bg-[#E43138]/20 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}>
              <i className="fas fa-plus mr-2"></i> NEW DRIVER
            </button>
            {teamDrivers.map((driver, idx) => (
              <button key={idx} type="button" onClick={() => handleSelectExistingDriver(driver)} className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition ${formData.driverId === driver.rawId ? 'border-[#cba052] bg-[#cba052]/20 text-white' : 'border-gray-800 text-gray-400 hover:border-gray-600 bg-[#111]'}`}>
                <i className="fas fa-user-astronaut mr-2"></i> {driver.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- โซนข้อมูลนักแข่ง --- */}
      <div className={`p-6 rounded-xl border shadow-lg transition-all ${formData.driverId && !isEditingProfile ? 'bg-black border-gray-800 opacity-90' : 'bg-[#1a1a1a] border-gray-800'}`}>
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
          <div><h3 className="text-lg font-bold text-[#cba052] uppercase tracking-tight">1. Driver Profile</h3></div>
          {formData.driverId && (
            <button type="button" onClick={() => setIsEditingProfile(!isEditingProfile)} className={`text-xs px-4 py-2 rounded font-bold transition border ${isEditingProfile ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-[#cba052]/20 text-[#cba052] border-[#cba052]/50 hover:bg-[#cba052]/30'}`}>
              <i className={`fas ${isEditingProfile ? 'fa-lock' : 'fa-edit'} mr-1`}></i> {isEditingProfile ? "SAVE & LOCK" : "EDIT PROFILE"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <input type="text" placeholder="First Name *" className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required disabled={!!formData.driverId && !isEditingProfile} />
          <input type="text" placeholder="Last Name *" className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required disabled={!!formData.driverId && !isEditingProfile} />
          <input type="text" placeholder="Nickname" className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          <input type="date" className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} required disabled={!!formData.driverId && !isEditingProfile} />
          <input type="text" placeholder="Nationality (ex. THA)" className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          
          <select className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})} disabled={!!formData.driverId && !isEditingProfile}>
            <option value="">Blood Type</option><option value="A Rh+">A Rh+</option><option value="B Rh+">B Rh+</option><option value="O Rh+">O Rh+</option><option value="AB Rh+">AB Rh+</option>
          </select>
          <select className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.shirtSize} onChange={(e) => setFormData({...formData, shirtSize: e.target.value})} disabled={!!formData.driverId && !isEditingProfile}>
            <option value="">Shirt Size</option><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
          </select>
          <input type="text" placeholder="Mobile No." className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.mobileNo} onChange={(e) => setFormData({...formData, mobileNo: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
          <input type="text" placeholder="License No." className="p-3 bg-black border border-gray-800 rounded focus:border-[#cba052] text-white disabled:opacity-50" value={formData.licenseNo} onChange={(e) => setFormData({...formData, licenseNo: e.target.value})} disabled={!!formData.driverId && !isEditingProfile} />
        </div>
      </div>

      {/* --- โซนเลือกรุ่นแข่ง (ย้ายมาใกล้ข้อมูลส่วนตัว) --- */}
      <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
        <h3 className="text-lg font-bold mb-4 text-[#cba052] uppercase tracking-tight">2. Category & Racing Number</h3>
        {!formData.birthDate ? (
          <div className="p-4 bg-black text-gray-500 rounded border border-gray-800 text-center font-bold">กรุณาระบุวันเกิดนักแข่งก่อนครับ</div>
        ) : availableClasses.length === 0 ? (
          <div className="p-4 bg-red-900/20 text-red-500 rounded text-center font-bold">อายุไม่ตรงเกณฑ์การแข่งขัน</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {availableClasses.map((cls) => (
              <label key={cls} className={`p-4 border-2 rounded-lg cursor-pointer text-center transition ${formData.primaryClass === cls ? 'border-[#E43138] bg-[#E43138]/10 text-white font-black' : 'border-gray-800 bg-black text-gray-400 hover:border-gray-600'}`}>
                <input type="radio" name="primaryClass" className="hidden" onChange={() => setFormData({...formData, primaryClass: cls, crossEntry: false})} />
                {cls}
              </label>
            ))}
          </div>
        )}

        {(formData.primaryClass === 'Micro MAX' || formData.primaryClass === 'Mini MAX' || formData.primaryClass === 'Senior MAX Masters') && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg flex items-center mb-6">
            <input type="checkbox" className="w-5 h-5 accent-[#E43138] rounded mr-3" checked={formData.crossEntry} onChange={(e) => setFormData({...formData, crossEntry: e.target.checked})} />
            <span className="font-bold text-white">Cross Entry ลงแข่งควบ ({formData.primaryClass.includes('Micro') ? 'Micro Rookie' : formData.primaryClass.includes('Mini') ? 'Mini Rookie' : 'Senior MAX'})</span>
          </div>
        )}

        {/* 🚩 ช่องกรอกเบอร์รถ จะโชว์คำใบ้(Hint) ตามรุ่นที่เลือก */}
        {formData.primaryClass && (
          <div className="mt-4 p-4 border border-[#E43138]/30 bg-[#E43138]/10 rounded-lg inline-block w-full md:w-auto">
             <label className="block text-xs font-bold text-[#E43138] mb-1 uppercase">Assigned Racing Number *</label>
             <div className="flex items-center gap-3">
               <input type="number" placeholder="เช่น 315" className="w-32 p-3 text-2xl font-black rounded bg-black border border-[#E43138]/50 outline-none focus:border-[#E43138] text-white text-center" value={formData.racingNumber} onChange={(e) => setFormData({...formData, racingNumber: e.target.value})} required />
               <div className="text-xs text-gray-400 font-bold">
                 (ช่วงเบอร์รถที่อนุญาตสำหรับ {formData.primaryClass}: <br/>
                 <span className="text-white text-sm">
                   {formData.primaryClass === 'Micro MAX' && '1 - 99'}
                   {formData.primaryClass === 'Mini MAX' && '100 - 199'}
                   {formData.primaryClass === 'Junior MAX' && '200 - 299'}
                   {formData.primaryClass === 'Senior MAX' && '300 - 399'}
                   {formData.primaryClass === 'Senior MAX Masters' && '900 - 999'}
                   {formData.primaryClass === 'MAX DD2' && '400 - 499'}
                   {formData.primaryClass === 'MAX DD2 Masters' && '500 - 599'}
                 </span>)
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="bg-black p-6 rounded-xl border border-gray-800 flex justify-between items-center shadow-2xl sticky bottom-8 z-40">
        <div>
          <p className="text-gray-500 font-bold text-sm uppercase">Total Entry Fee</p>
          <div className="text-3xl font-black text-white">{totalFee > 0 ? formatTHB(totalFee) : '฿ 0'}</div>
        </div>
        <button type="submit" disabled={loading || totalFee === 0} className="px-8 py-4 font-black text-white bg-[#E43138] rounded-lg hover:bg-red-700 disabled:opacity-50">
          {loading ? 'SAVING...' : 'CONFIRM REGISTRATION'}
        </button>
      </div>
    </form>
  );
}

export default function ParticipantPage() {
  return (
    <div className="bg-[#111111] min-h-screen pb-20 text-white">
      <div className="max-w-4xl mx-auto px-4 mt-12">
        <h2 className="text-3xl font-black uppercase mb-8">Driver <span className="text-[#E43138]">Registration</span></h2>
        <Suspense fallback={<div>LOADING...</div>}><RegistrationForm /></Suspense>
      </div>
    </div>
  );
}