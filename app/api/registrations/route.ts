import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 🚩 1. สั่ง Prisma ไปดึงข้อมูล Driver พร้อม Registration จากตาราง
    const drivers = await prisma.driver.findMany({
      include: {
        registrations: true, // ดึงว่าลงแข่งรุ่นไหน สนามไหนบ้าง
        user: true,          // ดึงข้อมูล User/Team (ถ้ามี)
      },
      orderBy: {
        createdAt: 'desc'    // เรียงจากคนสมัครล่าสุดขึ้นก่อน
      }
    });

    // 🚩 2. จัดระเบียบข้อมูลให้เข้ากับตารางหน้า Office
    const formattedData = drivers.map(driver => {
      // ดึงรายชื่อสนามและรุ่นที่ลง (ตัดตัวซ้ำออก)
      const categories = [...new Set(driver.registrations.map(r => r.category))];
      const events = [...new Set(driver.registrations.map(r => r.eventId))];

      // แยก Primary Class (รุ่นหลัก) และ Cross Entry (รุ่นควบ)
      // สมมติว่ารุ่นแรกที่โผล่มาคือรุ่นหลัก
      const primaryClass = categories[0] || 'Unknown';
      const crossEntry = categories.length > 1 ? categories[1] : null;

      // ดึงสถานะการจ่ายเงินจากรายการแรก
      const paymentStatus = driver.registrations[0]?.status || 'PENDING';

      return {
        id: driver.id.substring(0, 5).toUpperCase(), // ย่อ ID ให้สั้นลงเพื่อความสวยงาม
        name: `${driver.firstName} ${driver.lastName}`,
        team: driver.user?.entrantName || 'Independent',
        category: primaryClass,
        crossEntry: crossEntry,
        events: events,
        payment: paymentStatus,
        paddock: 'TBA' // Paddock รอกำหนดทีหลัง
      };
    });

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("Fetch Data Error:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลได้' }, { status: 500 });
  }
}