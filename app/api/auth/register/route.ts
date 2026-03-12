import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, password, entrantName } = await req.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email นี้มีในระบบแล้ว" }, { status: 400 });
    }

    // เข้ารหัสรหัสผ่าน 10 ชั้นก่อนเซฟ
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        entrantName,
        role: "VIP",
      },
    });

    return NextResponse.json({ message: "Account Created!", userId: user.id });
  } catch (error) {
    return NextResponse.json({ error: "Register Failed" }, { status: 500 });
  }
}