import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slipImageUrl } = await request.json();

    // 1. หา ID ของนักแข่งทุกคนที่อยู่ในทีมนี้
    const drivers = await prisma.driver.findMany({
      where: { userId: token.id as string },
      select: { id: true }
    });
    const driverIds = drivers.map(d => d.id);

    // 2. อัปเดตข้อมูลการแข่งที่ยังค้างจ่าย (PENDING) ให้แนบสลิปและเปลี่ยนสถานะ
    await prisma.registration.updateMany({
      where: {
        driverId: { in: driverIds },
        paymentStatus: 'PENDING'
      },
      data: {
        paymentStatus: 'WAITING_APPROVAL', // เปลี่ยนเป็นรอตรวจสอบ
        slipImageUrl: slipImageUrl
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}