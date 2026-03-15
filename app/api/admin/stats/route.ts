import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // 1. นับจำนวนนักแข่งทั้งหมดในระบบ
    const driverCount = await prisma.driver.count();

    // 2. นับจำนวนทีม (นับเฉพาะคนที่ไม่ใช่ ADMIN)
    const teamCount = await prisma.user.count({
      where: { role: { in: ['VIP', 'USER'] } }
    });

    // 3. คำนวณรายได้คร่าวๆ (สมมติเฉลี่ยสนามละ 30,000 บาท เอาเฉพาะคนที่สถานะ PAID)
    // หมายเหตุ: ในอนาคตเราจะดึงราคาจริงมาคำนวณ ตอนนี้ใช้ค่าประมาณการไปก่อนครับ
    const paidRegistrations = await prisma.registration.count({
      where: { paymentStatus: 'PAID' }
    });
    const revenue = paidRegistrations * 30000;

    return NextResponse.json({ driverCount, teamCount, revenue });
  } catch (error) {
    return NextResponse.json({ driverCount: 0, teamCount: 0, revenue: 0 });
  }
}