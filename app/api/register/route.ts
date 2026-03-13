import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, racingNumber, events, primaryClass, crossEntry } = body;

    // คำนวณรุ่นควบ
    let secondaryClass = null;
    if (crossEntry) {
      if (primaryClass === 'Micro MAX') secondaryClass = 'Micro Rookie';
      else if (primaryClass === 'Mini MAX') secondaryClass = 'Mini Rookie';
      else if (primaryClass === 'Senior MAX Masters') secondaryClass = 'Senior MAX';
    }

    // 🚩 1. แก้ไข entrantName เป็น name ตาม Database ใหม่
    const vipUser = await prisma.user.upsert({
      where: { email: 'vip@ptcreative.com' },
      update: {},
      create: {
        email: 'vip@ptcreative.com',
        password: 'dummy-password-123',
        name: 'PT Creative', // <--- เปลี่ยนมาใช้ 'name' แล้วครับ!
        role: 'VIP'
      }
    });

    // 🚩 2. อัปเดตข้อมูล Event ให้มี location และ isDoubleHeader ตาม Database ใหม่
    for (const eventId of events) {
      await prisma.event.upsert({
        where: { id: eventId },
        update: {},
        create: {
          id: eventId,
          name: `Round ${eventId}`,
          location: eventId.includes('R3') || eventId.includes('R4') || eventId.includes('R5') ? 'Lyl Kart' : 'Bira Kart',
          startDate: new Date('2026-01-01'), // วันที่จำลองไปก่อน
          endDate: new Date('2026-01-02'),
          isDoubleHeader: eventId.includes('DOUBLE')
        }
      });
    }

    // 🚩 3. โครงสร้าง Registration แบบใหม่ (ยุบรวม crossEntry ไว้ในบรรทัดเดียว)
    const registrationsData = [];
    for (const eventId of events) {
      registrationsData.push({ 
        eventId: eventId, 
        category: primaryClass, 
        crossEntry: secondaryClass, // บันทึกรุ่นควบลงไปในฟิลด์นี้เลย
        racingNumber: parseInt(racingNumber) 
      });
    }

    // บันทึก Driver และ Registration
    const result = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        userId: vipUser.id,
        registrations: {
          create: registrationsData
        }
      },
      include: {
        registrations: true
      }
    });

    return NextResponse.json({ success: true, driverId: result.id });

  } catch (error: any) {
    console.error("REGISTRATION ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}