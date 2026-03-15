import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

// 📥 GET: ดึงข้อมูลนักแข่งมาใส่ฟอร์ม
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // 🚩 กฎใหม่! ต้อง await context.params ก่อนเอา id ไปใช้
    
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const driver = await prisma.driver.findFirst({
      where: { 
        id: id, 
        userId: token.id as string // ต้องเป็นหัวหน้าทีมตัวเองเท่านั้นถึงจะดึงได้
      }
    });

    if (!driver) return NextResponse.json({ error: 'ไม่พบข้อมูลนักแข่ง' }, { status: 404 });
    return NextResponse.json({ driver });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// 📤 PUT: เซฟข้อมูลใหม่ทับของเดิม
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // 🚩 กฎใหม่! ต้อง await ก่อน
    
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { firstName, lastName, birthDate, nickname, nationality, licenseNo, licenseImageUrl, shirtSize, bloodType, mobileNo, guardianName, guardianId, guardianNationality, guardianMobile } = body;

    const result = await prisma.driver.updateMany({
      where: { id: id, userId: token.id as string },
      data: {
        firstName, lastName, birthDate: new Date(birthDate), nickname, nationality, licenseNo, licenseImageUrl, shirtSize, bloodType, mobileNo, guardianName, guardianId, guardianNationality, guardianMobile
      }
    });

    if (result.count === 0) return NextResponse.json({ error: 'อัปเดตล้มเหลว หรือไม่มีสิทธิ์แก้ไข' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Driver Error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 });
  }
}