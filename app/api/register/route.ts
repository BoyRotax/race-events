import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, birthDate, racingNumber, events, primaryClass, crossEntry } = body;

    // 🚩 1. จัดการตรรกะรุ่นควบ (Cross-Entry) ตามกฎ RMCAT 2026
    let secondaryClass = null;
    if (crossEntry) {
      if (primaryClass === 'Micro MAX') secondaryClass = 'Micro Rookie';
      else if (primaryClass === 'Mini MAX') secondaryClass = 'Mini Rookie';
      else if (primaryClass === 'Senior MAX Masters') secondaryClass = 'Senior MAX';
    }

    // 🚩 2. ตรวจสอบ/สร้าง User ทีม VIP (ป้องกัน Error ถ้า DB ว่าง)
    // ในอนาคตเมื่อระบบ Login เสร็จสมบูรณ์ เราจะเปลี่ยนตรงนี้ให้ดึงจาก Session จริง
    const vipUser = await prisma.user.upsert({
      where: { email: 'vip@ptcreative.com' },
      update: {},
      create: {
        email: 'vip@ptcreative.com',
        password: 'dummy-password-123', // จะถูกเปลี่ยนเมื่อใช้ระบบ Login จริง
        entrantName: 'PT Creative',
        role: 'VIP'
      }
    });

    // 🚩 3. ตรวจสอบ/สร้างสนามแข่ง (Events) อัตโนมัติ
    // ป้องกันปัญหา Foreign Key Error ถ้าในตาราง Event ยังไม่มีข้อมูลสนาม
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

    // 🚩 4. เตรียมโครงสร้างข้อมูลการลงทะเบียน (Registrations)
    // ถ้านักแข่งลง 2 สนาม และมีรุ่นควบ ระบบจะสร้าง Record ให้ทั้งหมด 4 รายการอัตโนมัติ
    const registrationsData = [];
    for (const eventId of events) {
      // เพิ่มรุ่นหลัก
      registrationsData.push({ 
        eventId: eventId, 
        category: primaryClass, 
        racingNumber: parseInt(racingNumber) 
      });
      
      // เพิ่มรุ่นควบ (ถ้ามี)
      if (secondaryClass) {
        registrationsData.push({ 
          eventId: eventId, 
          category: secondaryClass, 
          racingNumber: parseInt(racingNumber) 
        });
      }
    }

    // 🚩 5. บันทึกข้อมูลนักแข่ง (Driver) พร้อมรายการลงทะเบียนทั้งหมดในคำสั่งเดียว
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

    return NextResponse.json({ 
      success: true, 
      message: 'ลงทะเบียนสำเร็จ!', 
      driverId: result.id 
    });

  } catch (error: any) {
    console.error("CRITICAL REGISTRATION ERROR:", error);
    
    // ส่งข้อความ Error ที่ละเอียดกลับไป เพื่อให้หน้าฟอร์มแสดงผลได้ถูกต้อง
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง' 
    }, { status: 500 });
  }
}