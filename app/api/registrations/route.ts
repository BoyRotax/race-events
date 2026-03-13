import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        user: true, 
        registrations: {
          include: {
            event: true 
          }
        }
      }
      // 🚩 เอา orderBy: createdAt ออกไปแล้วครับ เพื่อให้ Build ผ่าน
    });

    return NextResponse.json({ data: drivers });
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}