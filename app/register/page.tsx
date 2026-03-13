"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: "", password: "", entrantName: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("✅ สมัครสมาชิกสำเร็จ! ระบบจะพาท่านไปหน้า Login");
      router.push("/login");
    } else {
      const data = await res.json();
      alert(`❌ ${data.error || "สมัครไม่สำเร็จ"}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] bg-[url('https://www.rotax-kart.com/images/rotax-bg.jpg')] bg-cover bg-center bg-blend-overlay">
      <form onSubmit={handleRegister} className="bg-black/80 backdrop-blur-md p-10 rounded-2xl border-t-4 border-[#E43138] w-full max-w-md shadow-[0_0_30px_rgba(228,49,56,0.15)]">
        <h2 className="text-3xl font-black text-white mb-2 uppercase text-center tracking-tight">Create <span className="text-[#E43138]">Account</span></h2>
        <p className="text-gray-400 text-center text-sm mb-8">สมัครสมาชิกเพื่อลงทะเบียนเข้าร่วมการแข่งขัน</p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Driver / Team Name</label>
            <input type="text" placeholder="ระบุชื่อนักแข่ง หรือ ชื่อทีม" className="w-full p-4 rounded bg-[#1a1a1a] border border-gray-800 text-white outline-none focus:border-[#E43138] transition" 
              onChange={(e) => setFormData({...formData, entrantName: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
            <input type="email" placeholder="example@email.com" className="w-full p-4 rounded bg-[#1a1a1a] border border-gray-800 text-white outline-none focus:border-[#E43138] transition" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
            <input type="password" placeholder="ตั้งรหัสผ่าน" className="w-full p-4 rounded bg-[#1a1a1a] border border-gray-800 text-white outline-none focus:border-[#E43138] transition" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button disabled={loading} className="w-full bg-[#E43138] text-white p-4 rounded-lg font-black tracking-widest hover:bg-red-700 transition mt-4 disabled:opacity-50">
            {loading ? "PROCESSING..." : "REGISTER NOW"}
          </button>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500 font-bold">
          มีบัญชีอยู่แล้ว? <Link href="/login" className="text-white hover:text-[#E43138] transition underline">เข้าสู่ระบบที่นี่</Link>
        </div>
      </form>
    </div>
  );
}