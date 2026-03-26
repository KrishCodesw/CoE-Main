import prisma from '@/lib/prisma';
import { sendBookingReminderEmail } from '@/lib/mailer';

/**
 * Booking reminder cron logic.
 * Finds confirmed bookings starting within the next 30 minutes
 * where reminderSent is false, sends reminder emails, and marks them sent.
 * 
 * In Next.js, this can be triggered via a Vercel Cron Job or external scheduler
 * calling GET /api/cron/reminder
 */
export async function GET() {
  try {
    const now = new Date();
    const thirtyMinsLater = new Date(now.getTime() + 30 * 60 * 1000);

    // Find confirmed bookings starting soon
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        reminderSent: false,
        date: { gte: now, lte: thirtyMinsLater },
      },
      include: { student: true },
    });

    let sent = 0;
    for (const booking of bookings) {
      try {
        await sendBookingReminderEmail(booking.student.email, {
          id: booking.id,
          date: booking.date.toISOString().split('T')[0],
          timeSlot: booking.timeSlot,
          lab: booking.lab,
          facilities: booking.facilities as string[],
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderSent: true },
        });

        sent++;
      } catch (emailErr) {
        console.error(`Reminder email failed for booking ${booking.id}:`, emailErr);
      }
    }

    // Also clean up expired OTPs (older than 10 minutes)
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    await prisma.otp.deleteMany({ where: { createdAt: { lt: tenMinutesAgo } } });

    return Response.json({
      success: true,
      message: `Cron executed. ${sent} reminder(s) sent. Expired OTPs cleaned.`,
    });
  } catch (err) {
    console.error('Cron error:', err);
    return Response.json({ success: false, message: 'Cron failed.' }, { status: 500 });
  }
}
