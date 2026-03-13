"use client";

import { useState, useEffect } from "react";
import { signIn, getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚩 ดักไว้ก่อนเลย: ถ้า User ล็อกอินค้างไว้อยู่แล้ว ให้เตะส่งไปหน้า VIP (Garage) ทันที
  useEffect(() => {
    if (status === "authenticated") {
      window.location.href = "/vip";
    }
  }, [status]);

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
      // 2. ล็อกอินผ่านแล้ว! เช็คยศ
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

  // ระหว่างที่กำลังโหลดเช็คสถานะการล็อกอิน ให้ขึ้น Loading ไว้
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center text-[#cba052] font-black tracking-widest text-xl">
        <i className="fas fa-circle-notch fa-spin mr-3"></i> LOADING PORTAL...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-[#111] p-8 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
        {/* เส้นตกแต่งด้านบน */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#cba052]"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-widest uppercase mb-1">
            Portal <span className="text-[#cba052]">Login</span>
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
              className="w-full p-4 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-black border border-gray-800 rounded outline-none focus:border-[#cba052] text-white transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#cba052] text-black font-black uppercase tracking-widest rounded hover:bg-[#b08d44] transition disabled:opacity-50 shadow-[0_0_15px_rgba(203,160,82,0.3)]"
          >
            {loading ? "AUTHENTICATING..." : "LOGIN TO PORTAL"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 font-bold">
            ยังไม่มีบัญชี? <Link href="/register" className="text-white hover:text-[#cba052] transition underline">สร้างบัญชีใหม่</Link>
          </p>
        </div>
      </div>
    </div>
  );
}