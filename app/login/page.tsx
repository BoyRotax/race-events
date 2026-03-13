"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. ส่งข้อมูลไปเช็คกับ NextAuth
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      // 2. ล็อกอินผ่านแล้ว! ดึง Session ล่าสุดมาเช็คยศ
      const session = await getSession();
      const role = (session?.user as any)?.role;

      // 3. ระบบวาร์ป (Hard Redirect บังคับโหลดหน้าใหม่ ป้องกันหน้าค้าง)
      if (role === "ADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/vip"; // วาร์ปไปหน้าจัดการนักแข่ง (Garage)
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* เส้นตกแต่งด้านบน */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#E43138]"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">
            Portal <span className="text-[#E43138]">Login</span>
          </h1>
          <p className="text-sm text-gray-500 font-bold">ลงชื่อเข้าใช้ระบบ Rotax Racing 2026</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-900/50 rounded text-red-500 text-sm font-bold text-center">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              className="w-full p-4 bg-black border border-gray-800 rounded outline-none focus:border-[#E43138] text-white transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-black border border-gray-800 rounded outline-none focus:border-[#E43138] text-white transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#E43138] text-white font-black uppercase tracking-widest rounded hover:bg-red-700 transition disabled:opacity-50 shadow-[0_0_15px_rgba(228,49,56,0.2)]"
          >
            {loading ? "AUTHENTICATING..." : "LOGIN TO PORTAL"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 font-bold">
            ยังไม่มีบัญชี? <Link href="/register" className="text-white hover:text-[#E43138] transition underline">สร้างบัญชีใหม่</Link>
          </p>
        </div>
      </div>
    </div>
  );
}