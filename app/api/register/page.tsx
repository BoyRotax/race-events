"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [entrantName, setEntrantName] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, entrantName }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      router.push("/login");
    } else {
      alert("เกิดข้อผิดพลาดในการสมัคร");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] font-sans">
      <form onSubmit={handleRegister} className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest text-center">
          ROTAX <span className="text-[#E43138]">ACCOUNT</span>
        </h2>
        <div className="space-y-4">
          <input type="text" placeholder="Team / Entrant Name" className="w-full p-3 rounded bg-black border border-gray-700 text-white outline-none focus:border-[#E43138]" 
            onChange={(e) => setEntrantName(e.target.value)} required />
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded bg-black border border-gray-700 text-white outline-none focus:border-[#E43138]" 
            onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-3 rounded bg-black border border-gray-700 text-white outline-none focus:border-[#E43138]" 
            onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-[#E43138] text-white p-3 rounded-lg font-bold hover:bg-red-700 transition">
            CREATE ACCOUNT
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-4 text-center">
          Already have an account? <a href="/login" className="text-white underline">Login here</a>
        </p>
      </form>
    </div>
  );
}