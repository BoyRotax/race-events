import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 🔒 1. เช็คว่าใครกำลัง Login อยู่
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔍 2. ดึงข้อมูลนักแข่ง เฉพาะของ "ทีม(User) นี้" เท่านั้น!
    const drivers = await prisma.driver.findMany({
      where: { userId: token.id as string },
      include: { 
        registrations: {
          include: { event: true }
        } 
      },
      orderBy: { id: 'desc' } // เรียงจากล่าสุด
    });

    // 📦 3. จัดระเบียบข้อมูลส่งให้หน้าบ้านโชว์สวยๆ
    const formattedData = drivers.map(driver => {
      const primaryClass = driver.registrations[0]?.category || 'Unknown';
      const crossEntry = driver.registrations[0]?.crossEntry || null;
      const events = [...new Set(driver.registrations.map(r => r.eventId))];
      const paymentStatus = driver.registrations[0]?.paymentStatus || 'PENDING';

      return {
        id: driver.id.substring(0, 5).toUpperCase(), // ตัด ID ให้สั้นๆ เท่ๆ
        name: `${driver.firstName} ${driver.lastName}`,
        category: primaryClass,
        crossEntry: crossEntry,
        events: events,
        payment: paymentStatus,
      };
    });

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("Fetch Team Data Error:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลทีมได้' }, { status: 500 });
  }
}