"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/vip"); // Login แล้วไปหน้า Dashboard ทีม
    } else {
      alert("Email หรือ Password ไม่ถูกต้อง");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111] font-sans">
      <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest text-center">
          VIP <span className="text-[#cba052]">ACCESS</span>
        </h2>
        <div className="space-y-4">
          <input type="email" placeholder="Email Address" className="w-full p-3 rounded bg-black border border-gray-700 text-white outline-none focus:border-[#cba052]" 
            onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-3 rounded bg-black border border-gray-700 text-white outline-none focus:border-[#cba052]" 
            onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-[#cba052] text-black p-3 rounded-lg font-black hover:bg-yellow-600 transition">
            SIGN IN
          </button>
        </div>
        <p className="text-gray-500 text-sm mt-4 text-center">
          New Team? <a href="/register" className="text-white underline">Register Account</a>
        </p>
      </form>
    </div>
  );
}