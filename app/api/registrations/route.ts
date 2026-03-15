import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { name: true, email: true } }, 
        registrations: true // 🚩 แก้บรรทัดนี้! เปลี่ยนให้เป็นแค่ true พอครับ (ไม่ต้อง include event)
      },
      orderBy: { createdAt: 'desc' } 
    });

    return NextResponse.json({ data: drivers });
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}