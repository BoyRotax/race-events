import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized: กรุณาเข้าสู่ระบบ' }, { status: 401 });

    const actualUserId = token.id as string;
    const body = await request.json();

    const { 
      driverId, firstName, lastName, birthDate, nickname, nationality, 
      licenseNo, licenseImageUrl, shirtSize, bloodType, mobileNo,
      guardianName, guardianId, guardianNationality, guardianMobile,
      primaryClass, racingNumber, events 
    } = body;

    let finalDriverId = driverId;

    // 1. ถ้ายังไม่มี driverId (กรอกข้อมูลคนใหม่จากหน้า Participant) ให้สร้างประวัติก่อน
    if (!finalDriverId) {
      const newDriver = await prisma.driver.create({
        data: {
          userId: actualUserId,
          firstName, lastName, birthDate: new Date(birthDate),
          nickname, nationality, licenseNo, licenseImageUrl, shirtSize, bloodType, mobileNo,
          guardianName, guardianId, guardianNationality, guardianMobile
        }
      });
      finalDriverId = newDriver.id;
    }
    // 🚩 อัปเดตไซส์เสื้อใหม่ล่าสุดของนักแข่งคนนี้ลง Database เสมอ
await prisma.driver.update({
      where: { id: finalDriverId },
      data: { shirtSize: shirtSize }
    });
    // 2. ลบ prisma.event ทิ้งไปเลย! แล้วมาเซฟลงตาราง Registration (ใบสมัคร) โดยตรง
    for (const eventId of events) {
      await prisma.registration.create({
        data: {
          driverId: finalDriverId,
          eventId: eventId,
          category: primaryClass,
          racingNumber: racingNumber.toString(),
          paymentStatus: 'PENDING'
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Register API Error:", error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน' }, { status: 500 });
  }
}