"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({ email: "", password: "", entrantName: "" });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("สมัครสมาชิกสำเร็จ! กรุณา Login");
      router.push("/login");
    } else {
      alert("สมัครไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111]">
      <form onSubmit={handleRegister} className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-black text-white mb-6 uppercase text-center">ROTAX <span className="text-[#E43138]">REGISTER</span></h2>
        <div className="space-y-4">
          <input type="text" placeholder="Team Name" className="w-full p-3 rounded bg-black border border-gray-700 text-white" 
            onChange={(e) => setFormData({...formData, entrantName: e.target.value})} required />
          <input type="email" placeholder="Email" className="w-full p-3 rounded bg-black border border-gray-700 text-white" 
            onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-3 rounded bg-black border border-gray-700 text-white" 
            onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          <button className="w-full bg-[#E43138] text-white p-3 rounded-lg font-bold hover:bg-red-700 transition">SIGN UP</button>
        </div>
      </form>
    </div>
  );
}