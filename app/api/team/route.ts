import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // 🚩 ชั่วคราว: ดึงข้อมูลของทีม PT Creative ก่อน (เดี๋ยวตอนทำ Session ค่อยมาผูก ID จริง)
    const vipUser = await prisma.user.findUnique({
      where: { email: 'vip@ptcreative.com' }
    });

    if (!vipUser) {
       return NextResponse.json({ data: [] });
    }

    const drivers = await prisma.driver.findMany({
      where: { userId: vipUser.id },
      include: { 
        registrations: {
          include: { event: true }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    // จัดระเบียบข้อมูลส่งให้หน้าบ้าน
    const formattedData = drivers.map(driver => {
      const primaryClass = driver.registrations[0]?.category || 'Unknown';
      const crossEntry = driver.registrations[0]?.crossEntry || null;
      const events = [...new Set(driver.registrations.map(r => r.eventId))];
      const paymentStatus = driver.registrations[0]?.paymentStatus || 'PENDING';

      return {
        id: driver.id.substring(0, 5).toUpperCase(),
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