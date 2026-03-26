import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { successRes, errorRes } from '@/lib/api-helpers';
import { facultyRegisterSchema } from '@/lib/validators';
import { sendFacultyPendingNotification } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = facultyRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return errorRes('Validation failed', parsed.error.issues.map((e: any) => e.message), 400);
    }

    const { name, email, phone, password } = parsed.data;

    if (email === process.env.ADMIN_EMAIL) {
      return errorRes('This email is reserved for the administrator.', [], 403);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorRes('An account with this email already exists.', [], 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: 'FACULTY',
        isVerified: true,
        status: 'PENDING',
      },
    });

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        await sendFacultyPendingNotification(adminEmail, { name, email });
      } catch (emailErr) {
        console.error('Admin notification email failed:', emailErr);
      }
    }

    return successRes(null, 'Faculty registration submitted. Pending admin approval.', 201);
  } catch (err) {
    console.error('Faculty register error:', err);
    return errorRes('Internal server error', [], 500);
  }
}
