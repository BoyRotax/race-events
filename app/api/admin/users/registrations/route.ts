import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. ตรวจบัตร! ต้องเป็น ADMIN เท่านั้นถึงจะดึงข้อมูลนี้ได้
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access Denied: ไม่มีสิทธิ์เข้าถึง' }, { status: 403 });
    }

    // 2. ดึงข้อมูลนักแข่งทุกคน พร้อมข้อมูลการลงทะเบียนและชื่อทีม(User)
    const drivers = await prisma.driver.findMany({
      include: {
        user: { select: { name: true, email: true } }, // ดึงชื่อทีมที่สังกัดมาด้วย
        registrations: { include: { event: true } }    // ดึงข้อมูลสนามที่ลงแข่ง
      },
      orderBy: { createdAt: 'desc' } // เรียงจากสมัครล่าสุดขึ้นก่อน
    });

// 3. กรองเอาเฉพาะคนที่ "ลงสนามแล้ว"
    const activeRegistrations = drivers.filter(d => d.registrations.length > 0).map(driver => {
      return {
        id: driver.id,
        teamName: driver.user?.name || 'Unknown Team',
        driverName: `${driver.firstName} ${driver.lastName}`,
        nickname: driver.nickname,
        category: driver.registrations[0]?.category || '-',
        racingNumber: driver.registrations[0]?.racingNumber || '-',
        events: driver.registrations.map(r => r.eventId),
        paymentStatus: driver.registrations[0]?.paymentStatus || 'PENDING',
        licenseImageUrl: driver.licenseImageUrl,
        slipImageUrl: driver.registrations[0]?.slipImageUrl // 🚩 ปลดล็อกบรรทัดนี้แล้ว!
      };
    });

    return NextResponse.json({ data: activeRegistrations });

  } catch (error) {
    console.error("Fetch Admin Registrations Error:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}