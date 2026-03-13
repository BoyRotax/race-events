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
    
    const { 
      driverId, firstName, lastName, birthDate, nickname, nationality, 
      licenseNo, licenseImageUrl, shirtSize, bloodType, mobileNo,
      guardianName, guardianId, guardianNationality, guardianMobile 
    } = body;

    const driverData = {
      firstName, lastName, birthDate: new Date(birthDate),
      nickname, nationality, licenseNo, licenseImageUrl, shirtSize, bloodType, mobileNo,
      guardianName, guardianId, guardianNationality, guardianMobile
    };

    let result;
    if (driverId) {
      // อัปเดตข้อมูลคนเก่า
      result = await prisma.driver.update({
        where: { id: driverId, userId: actualUserId },
        data: driverData
      });
    } else {
      // สร้างประวัตินักแข่งใหม่เข้า Garage (ยังไม่ลงสนาม)
      result = await prisma.driver.create({
        data: {
          ...driverData,
          userId: actualUserId,
        }
      });
    }

    return NextResponse.json({ success: true, driverId: result.id });

  } catch (error: any) {
    console.error("SAVE DRIVER ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}