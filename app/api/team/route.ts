import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 🚩 จำลองว่าระบบรู้ว่าตอนนี้ใคร Login อยู่ (ใช้ ID เดียวกับตอนเรากด Submit ในหน้าฟอร์ม)
    const myTeamId = "รหัส-User-ID-จากระบบ-Auth";

    // ดึงเฉพาะนักแข่งที่ userId ตรงกับทีมของเราเท่านั้น!
    const drivers = await prisma.driver.findMany({
      where: {
        userId: myTeamId
      },
      include: {
        registrations: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedData = drivers.map(driver => {
      const categories = [...new Set(driver.registrations.map(r => r.category))];
      const events = [...new Set(driver.registrations.map(r => r.eventId))];
      
      const primaryClass = categories[0] || 'Unknown';
      const crossEntry = categories.length > 1 ? categories[1] : null;
      const paymentStatus = driver.registrations[0]?.status || 'PENDING';

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