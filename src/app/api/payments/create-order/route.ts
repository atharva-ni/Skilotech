import { requireAuth, apiError, apiSuccess } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { razorpay, generateReceipt } from '@/lib/razorpay';
import { createOrderSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const dbUser = await requireAuth();
    
    const body = await req.json();
    const { courseId } = createOrderSchema.parse(body);

    // 1. Fetch course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return apiError('Course not found', 404);
    }

    if (course.status !== 'published') {
      return apiError('Course is not available for purchase', 400);
    }

    // 2. Check if student is already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: dbUser.id,
          courseId,
        },
      },
    });

    if (existingEnrollment && existingEnrollment.status === 'active') {
      return apiError('You are already enrolled in this course', 400);
    }

    // 3. Handle free courses (price is 0)
    if (course.price === 0 || course.isFree) {
      return apiSuccess({
        isFree: true,
        message: 'Course is free. Direct enrollment allowed.',
      });
    }

    // 4. Create Razorpay Order
    const receipt = generateReceipt();
    let razorpayOrder;
    let isDemoMode = false;

    // Check if keys are placeholders or not configured
    const isRazorpayConfigured = 
      process.env.RAZORPAY_KEY_ID && 
      process.env.RAZORPAY_KEY_ID !== 'rzp_test_REPLACE_ME' &&
      process.env.RAZORPAY_KEY_SECRET && 
      process.env.RAZORPAY_KEY_SECRET !== 'REPLACE_ME';

    if (isRazorpayConfigured) {
      try {
        razorpayOrder = await razorpay.orders.create({
          amount: course.price, // Already stored in paise (e.g. 299900 = ₹2999)
          currency: course.currency || 'INR',
          receipt,
          notes: {
            userId: dbUser.id,
            courseId: course.id,
            courseTitle: course.title,
          },
        });
      } catch (err: any) {
        console.warn('Razorpay authentication failed or API error, falling back to Demo Mode:', err.message);
        isDemoMode = true;
      }
    } else {
      console.log('Razorpay keys not configured. Enabling Demo Mode.');
      isDemoMode = true;
    }

    // Mock order if we are in Demo Mode
    if (isDemoMode || !razorpayOrder) {
      razorpayOrder = {
        id: `order_demo_${Math.random().toString(36).substring(2, 10)}`,
        amount: course.price,
        currency: course.currency || 'INR',
      };
    }

    // 5. Create Payment record in DB with status "created"
    const payment = await prisma.payment.create({
      data: {
        userId: dbUser.id,
        courseId: course.id,
        razorpayOrderId: razorpayOrder.id,
        amount: course.price,
        currency: course.currency,
        status: 'created',
        receipt,
        description: `Purchase of course: ${course.title} (Demo Mode: ${isDemoMode})`,
        metadata: {
          courseTitle: course.title,
          studentEmail: dbUser.email,
          isDemoMode: isDemoMode ? 'true' : 'false',
        },
      },
    });

    console.log(`Razorpay order created: ${razorpayOrder.id} for course ${course.title} (Demo: ${isDemoMode})`);

    return apiSuccess({
      isFree: false,
      isDemoMode,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      paymentId: payment.id,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return apiError(error?.message || 'Failed to create payment order', 400);
  }
}
