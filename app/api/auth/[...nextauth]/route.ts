import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🟡 1. มีคนพยายาม Login ด้วยอีเมล:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("🔴 2. อีเมลหรือรหัสผ่านว่างเปล่า");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log("🟡 3. ค้นหาใน DB เจอไหม?:", user ? "เจอ!" : "ไม่เจอ!");

          if (!user || !user.password) {
            console.log("🔴 4. ไม่มี User นี้ในระบบ หรือ User ไม่มีรหัสผ่าน");
            return null;
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          console.log("🟡 5. รหัสผ่านตรงไหม?:", isPasswordCorrect);

          if (!isPasswordCorrect) {
            console.log("🔴 6. รหัสผ่านผิด!");
            return null;
          }

          console.log("🟢 7. Login สำเร็จ! กำลังส่งข้อมูลเข้าระบบ");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role, 
          };
        } catch (error) {
          console.error("💥 ERROR ร้ายแรงตอน LOGIN:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
});

export { handler as GET, handler as POST };