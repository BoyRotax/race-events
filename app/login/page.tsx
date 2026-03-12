"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.ok) router.push("/vip");
    else alert("Login Failed!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111111]">
      <form onSubmit={handleLogin} className="bg-[#1a1a1a] p-8 rounded-2xl border border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-black text-white mb-6 uppercase text-center">VIP <span className="text-[#cba052]">LOGIN</span></h2>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-3 rounded bg-black border border-gray-700 text-white" 
            onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full p-3 rounded bg-black border border-gray-700 text-white" 
            onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-[#cba052] text-black p-3 rounded-lg font-black hover:bg-yellow-600 transition">SIGN IN</button>
        </div>
      </form>
    </div>
  );
}