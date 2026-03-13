"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', birthDate: '', nickname: '', 
    nationality: '', licenseNo: '', licenseImageUrl: '', shirtSize: '', 
    bloodType: '', mobileNo: '', guardianName: '', guardianId: '', 
    guardianNationality: '', guardianMobile: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("ขนาดไฟล์รูปเกิน 2MB ครับ");
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, licenseImageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('✅ บันทึกประวัตินักแข่งเข้า Garage สำเร็จ!');
        router.push('/vip'); // เซฟเสร็จพุ่งกลับไปหน้า Garage
        router.refresh();
      } else {
        alert(`❌ เกิดข้อผิดพลาด: ${result.error}`);
      }
    } catch (error) {
      alert('❌ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] font-sans pb-20 text-white">
      <div className="max-w-4xl mx-auto px-4 mt-12">
        
        <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
          <div>
            <Link href="/vip" className="text-[#E43138] hover:text-white text-sm font-bold transition mb-2 inline-block">
              <i className="fas fa-arrow-left mr-2"></i> BACK TO GARAGE
            </Link>
            <h2 className="text-3xl font-black uppercase tracking-tight">Create <span className="text-[#E43138]">Driver Profile</span></h2>
            <p className="text-gray-400 font-bold text-sm mt-1">เพิ่มประวัตินักแข่งใหม่เข้าสู่ทีมของคุณ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Driver Info */}
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-lg font-bold text-[#cba052] uppercase tracking-tight mb-4 border-b border-gray-800 pb-2">1. Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">First Name *</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Last Name *</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nickname</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth *</label>
                <input type="date" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Nationality (ex. THA)</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Mobile No.</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.mobileNo} onChange={(e) => setFormData({...formData, mobileNo: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Blood Type</label>
                <select className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.bloodType} onChange={(e) => setFormData({...formData, bloodType: e.target.value})}>
                  <option value="">Select...</option><option value="A Rh+">A Rh+</option><option value="A Rh-">A Rh-</option><option value="B Rh+">B Rh+</option><option value="B Rh-">B Rh-</option><option value="O Rh+">O Rh+</option><option value="O Rh-">O Rh-</option><option value="AB Rh+">AB Rh+</option><option value="AB Rh-">AB Rh-</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Shirt Size</label>
                <select className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.shirtSize} onChange={(e) => setFormData({...formData, shirtSize: e.target.value})}>
                  <option value="">Select...</option><option value="XS">XS</option><option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">License No.</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.licenseNo} onChange={(e) => setFormData({...formData, licenseNo: e.target.value})} />
              </div>
            </div>

            <div className="mt-5 p-4 bg-black/50 border border-gray-800 rounded-lg">
              <label className="text-xs font-bold text-[#cba052] uppercase mb-2 block"><i className="fas fa-id-badge mr-2"></i>Racing License Photo</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-[#E43138] file:text-white hover:file:bg-red-700 cursor-pointer" />
              {formData.licenseImageUrl && (
                <div className="mt-3">
                  <p className="text-xs text-green-500 mb-1"><i className="fas fa-check-circle"></i> อัปโหลดรูปภาพแล้ว</p>
                  <img src={formData.licenseImageUrl} alt="License" className="h-32 rounded border border-gray-700 object-cover shadow-lg" />
                </div>
              )}
            </div>
          </div>

          {/* 2. Guardian Info */}
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
            <h3 className="text-lg font-bold text-[#cba052] uppercase tracking-tight mb-1 border-b border-gray-800 pb-2">2. Legal Guardian</h3>
            <p className="text-xs text-[#E43138] mb-4 font-bold">* จำเป็นต้องกรอกหากนักแข่งอายุต่ำกว่า 18 ปี</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Guardian Name</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.guardianName} onChange={(e) => setFormData({...formData, guardianName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">NRIC / Passport / ID No.</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.guardianId} onChange={(e) => setFormData({...formData, guardianId: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Guardian Nationality</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.guardianNationality} onChange={(e) => setFormData({...formData, guardianNationality: e.target.value})} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Guardian Mobile No.</label>
                <input type="text" className="w-full p-3 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white" value={formData.guardianMobile} onChange={(e) => setFormData({...formData, guardianMobile: e.target.value})} />
              </div>
            </div>
          </div>

{/* แก้ไขส่วนปุ่ม Save ด้านล่างสุด */}
<div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 flex justify-end shadow-2xl mt-8 mb-20">
  <button 
    type="submit" 
    disabled={loading} 
    className="w-full md:w-auto px-10 py-4 font-black tracking-widest text-white bg-[#E43138] rounded-lg hover:bg-red-700 transition disabled:opacity-50 shadow-[0_0_20px_rgba(228,49,56,0.2)]"
  >
    {loading ? 'SAVING PROFILE...' : 'SAVE DRIVER PROFILE'} <i className="fas fa-save ml-2"></i>
  </button>
</div>

        </form>
      </div>
    </div>
  );
}