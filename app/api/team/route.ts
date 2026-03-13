import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // 1. เช็คว่าใครกำลัง Login อยู่
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. ดึงข้อมูลนักแข่ง เฉพาะของทีมนี้
    const drivers = await prisma.driver.findMany({
      where: { userId: token.id as string },
      include: { 
        registrations: {
          include: { event: true }
        } 
      },
      orderBy: { id: 'desc' }
    });

    // 3. จัดระเบียบข้อมูล
    const formattedData = drivers.map(driver => {
      const primaryClass = driver.registrations[0]?.category || 'Unknown';
      const crossEntry = driver.registrations[0]?.crossEntry || null;
      const events = [...new Set(driver.registrations.map(r => r.eventId))];
      const paymentStatus = driver.registrations[0]?.paymentStatus || 'PENDING';

      return {
        id: driver.id.substring(0, 5).toUpperCase(),
        rawId: driver.id,
        rawBirthDate: driver.birthDate,
        name: `${driver.firstName} ${driver.lastName}`,
        nickname: driver.nickname,
        nationality: driver.nationality,
        licenseNo: driver.licenseNo,
        licenseImageUrl: driver.licenseImageUrl, // รูปใบขับแข่ง
        shirtSize: driver.shirtSize,
        bloodType: driver.bloodType,
        mobileNo: driver.mobileNo,
        guardianName: driver.guardianName,
        guardianId: driver.guardianId,
        guardianNationality: driver.guardianNationality,
        guardianMobile: driver.guardianMobile,
        category: primaryClass,
        crossEntry: crossEntry,
        events: events,
        payment: paymentStatus,
      };
    }); // <--- จุดที่วงเล็บมักจะหายไปคือตรงนี้ครับ!

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("Fetch Team Data Error:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลทีมได้' }, { status: 500 });
  }
}