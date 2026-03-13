"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    
    if (res?.ok) {
        // 🚩 เดี๋ยวเราจะทำระบบแยกหน้าตาม Role ทีหลัง ตอนนี้ให้เด้งไปหน้าแรกก่อน
        router.push("/"); 
        router.refresh();
    } else {
        alert("❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] bg-[url('https://www.rotax-kart.com/images/rotax-bg.jpg')] bg-cover bg-center bg-blend-overlay">
      <form onSubmit={handleLogin} className="bg-black/80 backdrop-blur-md p-10 rounded-2xl border-t-4 border-[#cba052] w-full max-w-md shadow-[0_0_30px_rgba(203,160,82,0.15)]">
        <h2 className="text-3xl font-black text-white mb-2 uppercase text-center tracking-tight">Portal <span className="text-[#cba052]">Login</span></h2>
        <p className="text-gray-400 text-center text-sm mb-8">ลงชื่อเข้าใช้ระบบ Rotax Racing 2026</p>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
            <input type="email" placeholder="example@email.com" className="w-full p-4 rounded bg-[#1a1a1a] border border-gray-800 text-white outline-none focus:border-[#cba052] transition" 
              onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Password</label>
            <input type="password" placeholder="••••••••" className="w-full p-4 rounded bg-[#1a1a1a] border border-gray-800 text-white outline-none focus:border-[#cba052] transition" 
              onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="w-full bg-[#cba052] text-black p-4 rounded-lg font-black tracking-widest hover:bg-yellow-600 transition mt-4 disabled:opacity-50">
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500 font-bold">
          ยังไม่มีบัญชี? <Link href="/register" className="text-white hover:text-[#cba052] transition underline">สร้างบัญชีใหม่</Link>
        </div>
      </form>
    </div>
  );
}