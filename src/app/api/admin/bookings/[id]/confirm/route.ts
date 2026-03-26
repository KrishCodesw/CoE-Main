import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { successRes, errorRes, authenticate, authorize } from '@/lib/api-helpers';
import { sendBookingConfirmationEmail } from '@/lib/mailer';

// PATCH /api/admin/bookings/[id]/confirm
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = authenticate(req);
    if (!user) return errorRes('Unauthorized', [], 401);
    if (!authorize(user, 'ADMIN')) return errorRes('Forbidden', [], 403);

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { student: true },
    });
    if (!booking) return errorRes('Booking not found.', [], 404);
    if (booking.status !== 'PENDING') return errorRes('Only pending bookings can be confirmed.', [], 400);

    await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: 'CONFIRMED' },
    });

    try {
      await sendBookingConfirmationEmail(booking.student.email, {
        id: booking.id,
        studentName: booking.student.name,
        date: booking.date.toISOString().split('T')[0],
        timeSlot: booking.timeSlot,
        lab: booking.lab,
        facilities: booking.facilities as string[],
      });
    } catch (emailErr) {
      console.error('Booking confirmation email failed:', emailErr);
    }

    return successRes(null, 'Booking confirmed.');
  } catch (err) {
    console.error('Booking confirm error:', err);
    return errorRes('Internal server error', [], 500);
  }
}
