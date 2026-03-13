"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-[#111111] border-b-2 border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-black uppercase tracking-widest text-white hover:text-[#E43138] transition">
          ROTAX <span className="text-[#E43138]">RACING</span>
        </Link>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <span className="text-gray-500 text-sm font-bold">LOADING...</span>
          ) : session?.user ? (
            <>
              {/* 🚩 ปุ่มใหม่! สำหรับกดไปหน้าเลือกสนาม (Dashboard) */}
              <Link href="/dashboard" className="bg-[#E43138] text-white px-4 py-1.5 rounded text-xs font-black tracking-widest hover:bg-red-700 transition shadow-[0_0_10px_rgba(228,49,56,0.3)]">
                <i className="fas fa-flag-checkered mr-1"></i> SELECT EVENT
              </Link>

              {/* เส้นคั่น */}
              <div className="hidden md:block w-px h-8 bg-gray-700 mx-2"></div>

              {/* แถบโชว์ชื่อและยศ */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div className="text-white font-bold text-sm">{session.user.name}</div>
                  <div className="text-[10px] font-black tracking-widest uppercase">
                    {(session.user as any).role === "ADMIN" && <span className="text-purple-500">ADMINISTRATOR</span>}
                    {(session.user as any).role === "VIP" && <span className="text-[#cba052]">VIP TEAM</span>}
                    {(session.user as any).role === "STAFF" && <span className="text-blue-500">OFFICIAL STAFF</span>}
                    {(session.user as any).role === "USER" && <span className="text-gray-400">INDEPENDENT DRIVER</span>}
                  </div>
                </div>
                
                {/* ปุ่มเข้าหน้า Admin (โชว์เฉพาะคนที่เป็น ADMIN) */}
                {(session.user as any).role === "ADMIN" && (
                  <Link href="/admin" className="bg-purple-900/50 text-purple-300 px-3 py-1.5 rounded border border-purple-700 text-xs font-bold hover:bg-purple-800 transition">
                    <i className="fas fa-cog mr-1"></i> ADMIN
                  </Link>
                )}
                
                <button onClick={() => signOut({ callbackUrl: '/' })} className="bg-gray-800 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-[#E43138] transition border border-gray-600">
                  LOGOUT
                </button>
              </div>
            </>
          ) : (
            <Link href="/login" className="bg-[#E43138] text-white px-4 py-2 rounded font-bold hover:bg-red-700 transition text-sm">
              SIGN IN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}