import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized: กรุณาเข้าสู่ระบบ' }, { status: 401 });
    }

    const actualUserId = token.id as string;
    const body = await request.json();
    
    // 🚩 รับข้อมูลใหม่เข้ามาให้ครบ
    const { 
      driverId, firstName, lastName, birthDate, racingNumber, events, primaryClass, crossEntry,
      nickname, nationality, licenseNo, shirtSize, bloodType, mobileNo,
      guardianName, guardianId, guardianNationality, guardianMobile 
    } = body;

    let secondaryClass = null;
    if (crossEntry) {
      if (primaryClass === 'Micro MAX') secondaryClass = 'Micro Rookie';
      else if (primaryClass === 'Mini MAX') secondaryClass = 'Mini Rookie';
      else if (primaryClass === 'Senior MAX Masters') secondaryClass = 'Senior MAX';
    }

    for (const eventId of events) {
      await prisma.event.upsert({
        where: { id: eventId },
        update: {},
        create: {
          id: eventId,
          name: `Round ${eventId}`,
          location: eventId.includes('R3') || eventId.includes('R4') || eventId.includes('R5') ? 'Lyl Kart' : 'Bira Kart',
          startDate: new Date('2026-01-01'), 
          endDate: new Date('2026-01-02'),
          isDoubleHeader: eventId.includes('DOUBLE')
        }
      });
    }

    const registrationsData = events.map((eventId: string) => ({
      eventId: eventId,
      category: primaryClass,
      crossEntry: secondaryClass,
      racingNumber: parseInt(racingNumber)
    }));

    // 🚩 ก้อนข้อมูลส่วนตัวนักแข่งที่จะบันทึก (ยุบรวมไว้จะได้โค้ดไม่ยาว)
    const driverData = {
      firstName, lastName, birthDate: new Date(birthDate),
      nickname, nationality, licenseNo, shirtSize, bloodType, mobileNo,
      guardianName, guardianId, guardianNationality, guardianMobile
    };

    let result;
    if (driverId) {
      // 🔄 อัปเดตข้อมูลคนเก่า
      result = await prisma.driver.update({
        where: { id: driverId, userId: actualUserId },
        data: {
          ...driverData,
          registrations: { create: registrationsData }
        }
      });
    } else {
      // 🆕 สร้างคนใหม่
      result = await prisma.driver.create({
        data: {
          ...driverData,
          userId: actualUserId,
          registrations: { create: registrationsData }
        }
      });
    }

    return NextResponse.json({ success: true, driverId: result.id });

  } catch (error: any) {
    console.error("REGISTRATION ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}