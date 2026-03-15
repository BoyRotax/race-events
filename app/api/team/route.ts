import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ data: [] }, { status: 401 });

    const actualUserId = token.id as string;

    const drivers = await prisma.driver.findMany({
      where: { userId: actualUserId },
      include: { 
        registrations: true // 🚩 ลบ { include: { event: true } } ออก เหลือแค่นี้พอ!
      },
      orderBy: { id: 'desc' }
    });

    const formattedData = drivers.map(driver => {
      const primaryClass = driver.registrations[0]?.category || 'Unknown';
      const crossEntry = (driver.registrations[0] as any)?.crossEntry || null;
      const events = [...new Set(driver.registrations.map(r => r.eventId))];
      const paymentStatus = driver.registrations[0]?.paymentStatus || 'PENDING';
      const racingNumber = driver.registrations[0]?.racingNumber || '-';

      return {
        id: driver.id.substring(0, 5).toUpperCase(),
        rawId: driver.id,
        rawBirthDate: driver.birthDate,
        name: `${driver.firstName} ${driver.lastName}`,
        nickname: driver.nickname,
        nationality: driver.nationality,
        licenseNo: driver.licenseNo,
        licenseImageUrl: driver.licenseImageUrl,
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
        racingNumber: racingNumber,
      };
    });

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("Team API Error:", error);
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}