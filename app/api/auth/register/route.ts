import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, racingNumber, events, primaryClass, crossEntry } = body;

    // 🚩 1. จัดการเรื่องรุ่นควบ
    let secondaryClass = null;
    if (crossEntry) {
      if (primaryClass === 'Micro MAX') secondaryClass = 'Micro Rookie';
      else if (primaryClass === 'Mini MAX') secondaryClass = 'Mini Rookie';
      else if (primaryClass === 'Senior MAX Masters') secondaryClass = 'Senior MAX';
    }

    // 🚩 2. มั่นใจว่ามี User และ Event ในระบบ (Auto-Provisioning)
    const vipUser = await prisma.user.upsert({
      where: { email: 'vip@ptcreative.com' },
      update: {},
      create: {
        email: 'vip@ptcreative.com',
        password: 'password123',
        entrantName: 'PT Creative',
        role: 'VIP'
      }
    });

    for (const eventId of events) {
      await prisma.event.upsert({
        where: { id: eventId },
        update: {},
        create: {
          id: eventId,
          name: eventId === 'TH-R2' ? 'RMC Thailand 2026 - R2' : 'RMC Asia Trophy 2026 - R2',
          series: eventId.includes('TH') ? 'Thailand' : 'Asia',
          raceWeekendId: 'Wk-02',
          startDate: new Date('2026-04-04'),
          endDate: new Date('2026-04-05'),
        }
      });
    }

    // 🚩 3. เตรียมข้อมูลการลงทะเบียน
    const registrationsData = [];
    for (const eventId of events) {
      registrationsData.push({ eventId, category: primaryClass, racingNumber: parseInt(racingNumber) });
      if (secondaryClass) {
        registrationsData.push({ eventId, category: secondaryClass, racingNumber: parseInt(racingNumber) });
      }
    }

    // 🚩 4. บันทึก Driver และ Registration พร้อมกัน
    const result = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        userId: vipUser.id,
        registrations: {
          create: registrationsData
        }
      }
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("CRITICAL DB ERROR:", error);
    // ส่ง Error Message ออกไปที่ Alert หน้าบ้านเพื่อให้รู้สาเหตุที่แท้จริง
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code 
    }, { status: 500 });
  }
}