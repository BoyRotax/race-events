"use client"; // 🚩 บังคับให้ไฟล์นี้ทำงานฝั่ง Client เพื่อให้ใช้ Session ได้

import { SessionProvider } from "next-auth/react"; // 🚩 ตัวการที่หายไป! ต้อง Import เข้ามา
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Rotax Racing 2026</title>
      </head>
      <body className="bg-[#111111] text-white">
        {/* 🚩 ห่อหุ้มระบบด้วย SessionProvider เพื่อให้ทุกหน้าจำการ Login ได้ */}
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}