import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { driverId, eventId } = await request.json();

    // ลบการลงทะเบียน (เฉพาะที่ยังเป็น PENDING หรือรอจ่ายเงิน)
    const result = await prisma.registration.deleteMany({
      where: {
        driverId: driverId,
        eventId: eventId,
        paymentStatus: 'PENDING' // 🚩 ป้องกันไม่ให้กดยกเลิกสนามที่ "จ่ายเงินแล้ว (PAID)"
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ error: 'ไม่สามารถยกเลิกได้ (อาจชำระเงินไปแล้ว)' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel Error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการยกเลิก' }, { status: 500 });
  }
}