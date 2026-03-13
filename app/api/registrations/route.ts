import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // ดึงข้อมูลนักแข่งทั้งหมด พร้อมข้อมูลทีม (User) และรายการที่ลงแข่ง (Registration)
    const drivers = await prisma.driver.findMany({
      include: {
        user: true, // ดึงข้อมูลทีมมาด้วย (เพราะเราเปลี่ยนมาใช้ name แล้ว)
        registrations: {
          include: {
            event: true // ดึงข้อมูลสนามมาด้วย
          }
        }
      },
      orderBy: { createdAt: 'desc' } // เรียงจากสมัครล่าสุด
    });

    return NextResponse.json({ data: drivers });
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}