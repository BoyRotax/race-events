import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, racingNumber, events, primaryClass, crossEntry } = body;

    let secondaryClass = null;
    if (crossEntry) {
      if (primaryClass === 'Micro MAX') secondaryClass = 'Micro Rookie';
      else if (primaryClass === 'Mini MAX') secondaryClass = 'Mini Rookie';
      else if (primaryClass === 'Senior MAX Masters') secondaryClass = 'Senior MAX';
    }

    const registrationsToCreate: any[] = [];
    events.forEach((eventId: string) => {
      registrationsToCreate.push({ eventId: eventId, category: primaryClass, racingNumber: parseInt(racingNumber) });
      if (secondaryClass) {
        registrationsToCreate.push({ eventId: eventId, category: secondaryClass, racingNumber: parseInt(racingNumber) });
      }
    });

    // 🚩 1. เช็คว่ามี User ทีม VIP อยู่ในระบบหรือยัง ถ้ายังให้สร้างใหม่เลย
    let vipUser = await prisma.user.findFirst({
      where: { email: 'vip@ptcreative.com' }
    });

    if (!vipUser) {
      vipUser = await prisma.user.create({
        data: {
          email: 'vip@ptcreative.com',
          password: 'password123', // รหัสผ่านจำลอง
          entrantName: 'PT Creative',
          role: 'VIP'
        }
      });
    }

    // 🚩 2. บันทึกข้อมูลนักแข่ง โดยผูกกับ vipUser.id ของจริง!
    const result = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        userId: vipUser.id, // ใช้ ID ของจริงจาก Database
        registrations: {
          create: registrationsToCreate
        }
      }
    });

    return NextResponse.json({ message: 'ลงทะเบียนสำเร็จ!', data: result });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}