import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { successRes, errorRes } from '@/lib/api-helpers';
import { studentRegisterSchema } from '@/lib/validators';
import { sendOTPEmail } from '@/lib/mailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = studentRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return errorRes('Validation failed', parsed.error.issues.map((e: any) => e.message), 400);
    }

    const { name, email, phone, password, uid } = parsed.data;

    // Block admin email
    if (email === process.env.ADMIN_EMAIL) {
      return errorRes('This email is reserved for the administrator.', [], 403);
    }

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorRes('An account with this email already exists.', [], 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (unverified)
    await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        password: hashedPassword,
        role: 'STUDENT',
        uid,
        isVerified: false,
        status: 'ACTIVE',
      },
    });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this email
    await prisma.otp.deleteMany({ where: { email } });

    // Save OTP
    await prisma.otp.create({ data: { email, code: otp } });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
    }

    return successRes(null, 'Registration successful. OTP sent to your email.', 201);
  } catch (err) {
    console.error('Student register error:', err);
    return errorRes('Internal server error', [], 500);
  }
}
