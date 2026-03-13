import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 1. ตรวจบัตรแอดมิน
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { driverId, action } = await request.json(); // action จะเป็น 'APPROVE' หรือ 'REJECT'
    const newStatus = action === 'APPROVE' ? 'PAID' : 'PENDING'; // ถ้า Reject ให้เด้งกลับไปเป็น PENDING ให้เขาจ่ายใหม่

    // 2. ประทับตราลง Database
    await prisma.registration.updateMany({
      where: { 
        driverId: driverId,
        paymentStatus: 'WAITING_APPROVAL' 
      },
      data: { 
        paymentStatus: newStatus,
        ...(action === 'REJECT' ? { slipImageUrl: null } : {}) // ถ้าปฏิเสธ ให้ลบรูปสลิปทิ้งให้เขาอัปใหม่
      }
    });

    return NextResponse.json({ success: true, newStatus });

  } catch (error) {
    console.error("Approval Error:", error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอนุมัติ' }, { status: 500 });
  }
}