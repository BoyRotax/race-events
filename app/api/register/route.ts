import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt'; // 🚩 นำเข้าระบบถอดรหัส Token

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 🔒 1. ด่านตรวจคนเข้าเมือง: เช็คว่า Login อยู่จริงๆ ใช่ไหม?
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized: กรุณาเข้าสู่ระบบก่อนทำรายการ' 
      }, { status: 401 });
    }

    const actualUserId = token.id as string; // 🚩 ได้ ID จริงของนายมาแล้ว!

    const body = await request.json();
    const { firstName, lastName, birthDate, racingNumber, events, primaryClass, crossEntry } = body;

    // 🧮 2. คำนวณรุ่นควบ (Cross-Entry)
    let secondaryClass = null;
    if (crossEntry) {
      if (primaryClass === 'Micro MAX') secondaryClass = 'Micro Rookie';
      else if (primaryClass === 'Mini MAX') secondaryClass = 'Mini Rookie';
      else if (primaryClass === 'Senior MAX Masters') secondaryClass = 'Senior MAX';
    }

    // 🏁 3. อัปเดตข้อมูล Event (สร้างสนามไว้รอ ป้องกัน Database Error)
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

    // 📦 4. เตรียมข้อมูลลงทะเบียนของแต่ละสนาม
    const registrationsData = [];
    for (const eventId of events) {
      registrationsData.push({ 
        eventId: eventId, 
        category: primaryClass, 
        crossEntry: secondaryClass, 
        racingNumber: parseInt(racingNumber) 
      });
    }

    // 💾 5. บันทึกข้อมูลนักแข่ง (Driver) และผูกกับ "ทีมที่กำลัง Login"
    const result = await prisma.driver.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        userId: actualUserId, // <--- 🚩 หัวใจสำคัญอยู่ตรงนี้! ผูก ID จริงแล้ว!
        registrations: {
          create: registrationsData
        }
      },
      include: {
        registrations: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'ลงทะเบียนสำเร็จ!',
      driverId: result.id 
    });

  } catch (error: any) {
    console.error("REGISTRATION ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}