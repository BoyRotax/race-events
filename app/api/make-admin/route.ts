import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // อัปเดตอีเมลของนายให้กลายเป็น ADMIN ทันที!
    const result = await prisma.user.updateMany({
      where: { 
        email: 'info@rotax-asia.com' 
      },
      data: { 
        role: 'ADMIN' 
      }
    });

    if (result.count === 0) {
      return NextResponse.json({ success: false, message: '❌ หาอีเมล info@rotax-asia.com ไม่เจอ! (นายสมัครบัญชีด้วยอีเมลนี้หรือยังครับ?)' });
    }

    return NextResponse.json({ success: true, message: '👑 อัปเกรด info@rotax-asia.com เป็น ADMIN สูงสุดเรียบร้อยแล้วบอส!' });

  } catch (error: any) {
    console.error("Make Admin Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}