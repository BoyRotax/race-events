import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

// 📥 GET: ดึงรายชื่อผู้ใช้ทั้งหมด พร้อมนับจำนวนนักแข่งในคลัง
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { drivers: true } } // 🚩 นับจำนวนนักแข่งในคลังของแต่ละคน
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

// 📤 PUT: อัปเดตยศ (Role) ของผู้ใช้งาน
export async function PUT(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token as any).role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const { userId, role } = await request.json();

    // ห้ามแอดมินปลดตัวเองออกจากการเป็นแอดมินเด็ดขาด!
    if (userId === token.id && role !== 'ADMIN') {
      return NextResponse.json({ error: 'You cannot demote yourself!' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: role }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Role Error:", error);
    return NextResponse.json({ error: 'Update Failed' }, { status: 500 });
  }
}