import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ดึงข้อมูล User ทั้งหมด
export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
  return NextResponse.json({ data: users });
}

// อัปเดต Role
export async function PUT(req: Request) {
  const { userId, role } = await req.json();
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: role }
  });
  return NextResponse.json({ success: true, user: updatedUser });
}