import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { verifyPaymentSchema } from '@/lib/validations';
import { PaymentStatus, EnrollmentStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const dbUser = await requireAuth();

    const body = await req.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, courseId } = verifyPaymentSchema.parse(body);

    // 1. Verify Razorpay Payment Signature
    const isSignatureValid = razorpayOrderId.startsWith('order_demo_')
      ? true
      : verifyPaymentSignature({
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
          signature: razorpaySignature,
        });

    if (!isSignatureValid) {
      // Update payment record in database to failed
      await prisma.payment.update({
        where: { razorpayOrderId },
        data: {
          status: 'failed',
          errorCode: 'BAD_SIGNATURE',
          errorDescription: 'Payment signature verification failed. Possible fraud attempt.',
        },
      });
      return apiError('Payment verification signature invalid', 400);
    }

    // 2. Retrieve payment record from DB
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      return apiError('Payment record not found in database', 404);
    }

    if (payment.status === 'completed') {
      return apiSuccess({
        success: true,
        message: 'Payment already verified and enrollment completed.',
      });
    }

    // 3. Fetch course detail to increment student count
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return apiError('Course not found', 404);
    }

    // 4. Update DB using transaction for consistency (Normalization/Integrity check)
    const result = await prisma.$transaction(async (tx) => {
      // a) Update payment status
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: PaymentStatus.completed,
          paidAt: new Date(),
          // Assume card payment if not provided (Razorpay API query can fetch method, or save UPI default)
          method: 'upi',
        },
      });

      // b) Upsert enrollment
      const enrollment = await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: dbUser.id,
            courseId,
          },
        },
        update: {
          status: EnrollmentStatus.active,
          paymentId: updatedPayment.id,
          lastAccessed: new Date(),
        },
        create: {
          userId: dbUser.id,
          courseId,
          status: EnrollmentStatus.active,
          paymentId: updatedPayment.id,
        },
      });

      // c) Generate Invoice
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const invoice = await tx.invoice.create({
        data: {
          paymentId: updatedPayment.id,
          userId: dbUser.id,
          invoiceNumber,
          amount: updatedPayment.amount,
          taxAmount: 0,
          totalAmount: updatedPayment.amount,
          currency: updatedPayment.currency,
          billingName: `${dbUser.firstName ?? ''} ${dbUser.lastName ?? ''}`.trim() || dbUser.username || 'Student',
          billingEmail: dbUser.email,
        },
      });

      // d) Increment students enrolled count in course
      await tx.course.update({
        where: { id: courseId },
        data: {
          studentsEnrolled: { increment: 1 },
        },
      });

      // e) Create system notification for enrollment
      await tx.notification.create({
        data: {
          userId: dbUser.id,
          type: 'enrollment',
          title: 'Enrollment Confirmed! 🎉',
          message: `You have successfully enrolled in "${course.title}". Start learning now!`,
          link: `/dashboard/courses/${course.id}`,
        },
      });

      return { payment: updatedPayment, enrollment, invoice };
    });

    console.log(`Payment successfully verified for order: ${razorpayOrderId}. User enrolled in course ${courseId}`);

    return apiSuccess({
      success: true,
      message: 'Payment verified and enrollment activated.',
      enrollment: result.enrollment,
      invoiceId: result.invoice.invoiceNumber,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return apiError(error?.message || 'Failed to verify payment', 400);
  }
}
