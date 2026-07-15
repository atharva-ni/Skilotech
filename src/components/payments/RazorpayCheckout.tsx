'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import Button from '@/components/ui/Button';

interface RazorpayCheckoutProps {
  courseId: string;
  courseTitle: string;
  coursePrice: number;
  courseDescription: string;
  onSuccess?: (invoiceId: string) => void;
  onCancel?: () => void;
}

// Declare Razorpay globally for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({
  courseId,
  courseTitle,
  coursePrice,
  onSuccess,
  onCancel,
}: RazorpayCheckoutProps) {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast.error('You must be signed in to purchase a course');
      return;
    }

    try {
      setLoading(true);

      // 1. Load script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay SDK. Check your internet connection.');
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to initialize checkout');
      }

      // 3. Check if course is free (direct enrollment)
      if (orderData.isFree) {
        toast.success('Successfully enrolled in free course!');
        await refreshProfile();
        if (onSuccess) onSuccess('FREE');
        setLoading(false);
        return;
      }

      // 4. Handle Demo Mode (Simulated Payment)
      if (orderData.isDemoMode) {
        const confirmSimulatedPayment = window.confirm(
          `Demo Mode Active:\n\nWould you like to simulate a successful payment of ₹${(coursePrice).toLocaleString('en-IN')} for "${courseTitle}"?\n\nThis will trigger the full backend order processing, enroll you in the course, and issue an invoice without charging real money.`
        );

        if (!confirmSimulatedPayment) {
          toast.info('Simulated payment cancelled');
          setLoading(false);
          if (onCancel) onCancel();
          return;
        }

        try {
          toast.loading('Simulating payment and verifying invoice...');
          const demoPaymentId = `pay_demo_${Math.random().toString(36).substring(2, 10)}`;
          const demoSignature = `sig_demo_${Math.random().toString(36).substring(2, 10)}`;

          const verifyResponse = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: orderData.razorpayOrder.id,
              razorpayPaymentId: demoPaymentId,
              razorpaySignature: demoSignature,
              courseId,
            }),
          });

          const verifyData = await verifyResponse.json();
          toast.dismiss();

          if (verifyResponse.ok) {
            toast.success('Simulated payment verified! Course unlocked 🎉');
            await refreshProfile();
            if (onSuccess) onSuccess(verifyData.invoiceId);
          } else {
            throw new Error(verifyData.error || 'Simulated payment verification failed');
          }
        } catch (verifyError: any) {
          console.error('Simulated verification error:', verifyError);
          toast.error(verifyError.message || 'Verification failed.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // 5. Configure Razorpay options (For real keys)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: orderData.razorpayOrder.amount,
        currency: orderData.razorpayOrder.currency,
        name: 'SkillBridge',
        description: courseTitle,
        order_id: orderData.razorpayOrder.id,
        image: 'https://skillbridge.com/logo.png', // Placeholder logo
        prefill: {
          name: user.name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        notes: {
          courseId,
          userId: user.id,
        },
        theme: {
          color: '#6366f1', // Skilotech purple theme color
        },
        handler: async function (response: any) {
          // Razorpay returns: razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            setLoading(true);
            toast.loading('Verifying payment signature...');

            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                courseId,
              }),
            });

            const verifyData = await verifyResponse.json();
            
            toast.dismiss();

            if (verifyResponse.ok) {
              toast.success('Payment verified! Course unlocked 🎉');
              await refreshProfile();
              if (onSuccess) onSuccess(verifyData.invoiceId);
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (verifyError: any) {
            console.error('Verification error:', verifyError);
            toast.error(verifyError.message || 'Signature verification failed. Contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Checkout cancelled');
            setLoading(false);
            if (onCancel) onCancel();
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error('Razorpay Checkout error:', error);
      toast.error(error.message || 'Payment setup failed. Try again.');
      setLoading(false);
    }
  };

  return (
    <Button
      style={{ width: '100%' }}
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? 'Opening Secure Gateway...' : `Buy Course - ₹${(coursePrice).toLocaleString('en-IN')} →`}
    </Button>
  );
}
