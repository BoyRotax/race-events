import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { driverId, eventId } = await request.json();

    // 🚩 สั่งลบข้อมูลการแข่งของสนามนี้ (เพราะระบบหน้าเว็บดักการ Confirm ไว้แล้ว)
    const result = await prisma.registration.deleteMany({
      where: {
        driverId: driverId,
        eventId: eventId
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลการลงทะเบียน' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel Error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการยกเลิก' }, { status: 500 });
  }
}