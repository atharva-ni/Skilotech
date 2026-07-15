import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { apiError, apiSuccess } from '@/lib/auth';
import { PaymentStatus, EnrollmentStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not set');
      return apiError('Webhook secret not configured', 500);
    }

    // Read the signature
    const headerPayload = await headers();
    const signature = headerPayload.get('x-razorpay-signature');

    if (!signature) {
      return apiError('Missing signature header', 400);
    }

    // Read raw body for signature verification
    const rawBody = await req.text();

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('Invalid Razorpay webhook signature');
      return apiError('Invalid signature', 400);
    }

    // Parse the payload
    const event = JSON.parse(rawBody);
    const eventType = event.event;
    console.log(`Razorpay Webhook received: ${eventType}`);

    if (eventType === 'payment.captured') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const paymentMethod = paymentEntity.method;


      // Find the corresponding payment in DB
      const dbPayment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: { user: true },
      });

      if (!dbPayment) {
        console.error(`Payment record not found for Razorpay Order: ${orderId}`);
        return apiError('Payment record not found', 404);
      }

      // If already processed, exit early (Idempotency)
      if (dbPayment.status === 'completed') {
        return apiSuccess({ success: true, message: 'Already processed' });
      }

      const courseId = dbPayment.courseId;
      if (!courseId) {
        return apiError('Course ID missing from payment record', 400);
      }

      // Sync and activate enrollment in database transaction
      await prisma.$transaction(async (tx) => {
        // a) Update payment status
        const updatedPayment = await tx.payment.update({
          where: { id: dbPayment.id },
          data: {
            razorpayPaymentId: paymentId,
            status: PaymentStatus.completed,
            paidAt: new Date(),
            method: paymentMethod || 'upi',
          },
        });

        // b) Activate Enrollment
        await tx.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: dbPayment.userId,
              courseId,
            },
          },
          update: {
            status: EnrollmentStatus.active,
            paymentId: updatedPayment.id,
            lastAccessed: new Date(),
          },
          create: {
            userId: dbPayment.userId,
            courseId,
            status: EnrollmentStatus.active,
            paymentId: updatedPayment.id,
          },
        });

        // c) Generate Invoice
        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        await tx.invoice.create({
          data: {
            paymentId: updatedPayment.id,
            userId: dbPayment.userId,
            invoiceNumber,
            amount: updatedPayment.amount,
            taxAmount: 0,
            totalAmount: updatedPayment.amount,
            currency: updatedPayment.currency,
            billingName: `${dbPayment.user.firstName ?? ''} ${dbPayment.user.lastName ?? ''}`.trim() || dbPayment.user.username || 'Student',
            billingEmail: dbPayment.user.email,
          },
        });

        // d) Increment course enrollment count
        await tx.course.update({
          where: { id: courseId },
          data: {
            studentsEnrolled: { increment: 1 },
          },
        });

        // e) Notify student
        await tx.notification.create({
          data: {
            userId: dbPayment.userId,
            type: 'enrollment',
            title: 'Enrollment Activated! 🚀',
            message: `Your payment was successfully processed. Welcome to the course!`,
            link: `/dashboard/courses/${courseId}`,
          },
        });
      });

      console.log(`Webhook successfully processed payment.captured for Order ${orderId}`);
      return apiSuccess({ success: true, processed: true });
    }

    if (eventType === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const errorCode = paymentEntity.error_code;
      const errorDesc = paymentEntity.error_description;

      await prisma.payment.update({
        where: { razorpayOrderId: orderId },
        data: {
          status: 'failed',
          errorCode: errorCode || 'UNKNOWN_ERROR',
          errorDescription: errorDesc || 'Payment failed during Razorpay processing',
        },
      });

      console.log(`Webhook logged payment.failed for Order ${orderId}`);
      return apiSuccess({ success: true, logged_failure: true });
    }

    return apiSuccess({ success: true, ignored: true });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return apiError(error?.message || 'Webhook processing failed', 500);
  }
}
