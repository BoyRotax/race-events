import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, racingNumber, events, primaryClass, crossEntry } = body;

    // 🚩 1. เช็คเงื่อนไขการลงควบรุ่น (Cross-Entry Logic)
    let secondaryClass = null;
    if (crossEntry) {
      if (primaryClass === 'Micro MAX') secondaryClass = 'Micro Rookie';
      else if (primaryClass === 'Mini MAX') secondaryClass = 'Mini Rookie';
      else if (primaryClass === 'Senior MAX Masters') secondaryClass = 'Senior MAX';
    }

    // 🚩 2. เตรียมข้อมูล Array สำหรับบันทึกลง Database
    const registrationsToCreate: any[] = [];
    
    // วนลูปตามจำนวนสนาม (Event) ที่ติ๊กเลือกมา
    events.forEach((eventId: string) => {
      
      // บันทึกรุ่นหลัก (Primary Class)
      registrationsToCreate.push({
        eventId: eventId,
        category: primaryClass,
        racingNumber: parseInt(racingNumber),
      });

      // ถ้ามีการเลือกลงควบ ให้บันทึกรุ่นควบเพิ่มเข้าไปใน Event เดียวกันด้วย
      if (secondaryClass) {
        registrationsToCreate.push({
          eventId: eventId,
          category: secondaryClass,
          racingNumber: parseInt(racingNumber),
        });
      }
    });

    // 🚩 3. สั่งบันทึกข้อมูลลง Database รวดเดียว (สร้าง Driver พร้อมโยง Registrations)
    const result = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        userId: "รหัส-User-ID-จากระบบ-Auth", // ตรงนี้เดี๋ยวเราเอาไว้เสียบกับระบบ Login
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