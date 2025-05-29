"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import axiosInstance from "@/lib/Axios";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Interface for payment information
interface PaymentInfo {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  referenceId: string;
  status: string;
  paymentMethod: string;
  level: string;
  feeType: string;
}

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const referenceId = searchParams.get("reference");
  const sessionId = searchParams.get("session_id");

  // Format price as currency
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const verifyPayment = async () => {
      if (!referenceId) {
        setError("Missing reference ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch payment details
        const response = await axiosInstance.get(`/api/payment/verify?reference=${referenceId}`);
        
        if (response.status === 200 && response.data.payment) {
          setPayment(response.data.payment);
        } else {
          setError("Payment verification failed");
        }
      } catch (err) {
        console.error("Payment verification error:", err);
        setError("Could not verify payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [referenceId, sessionId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">Verifying your payment...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold mt-2">Payment Verification Failed</h2>
          </div>
          <p className="text-gray-600 text-center">{error || "Something went wrong. Please contact support."}</p>
          <div className="mt-6 flex justify-center">
            <Link href="/">
              <Button variant="outline" className="mr-2">Return Home</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-green-600 text-white hover:bg-green-700">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-green-600 text-center mb-4">
          <CheckCircle2 className="h-10 w-10 mx-auto" />
          <h2 className="text-xl font-bold mt-2">Payment Successful!</h2>
        </div>
        
        <div className="border-t border-b border-gray-200 py-4 my-4 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Reference ID:</span>
            <span className="font-semibold">{payment.referenceId}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Student Name:</span>
            <span className="font-semibold">{payment.studentName}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Student ID:</span>
            <span className="font-semibold">{payment.studentId}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Fee Type:</span>
            <span className="font-semibold">{payment.feeType}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Semester:</span>
            <span className="font-semibold">{payment.level}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(payment.amount, payment.currency)}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Payment Date:</span>
            <span className="font-semibold">{formatDate(payment.paymentDate)}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-semibold capitalize">{payment.paymentMethod}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold text-green-600 capitalize">{payment.status}</span>
          </div>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Link href="/dashboard">
            <Button variant={'elevated'} className="bg-green-600 text-white hover:bg-green-700 border-0">
              Go to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>A receipt has been sent to your email address.</p>
          <p className="mt-1">For any queries, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

// Wrapper component to handle Suspense
const PaymentSuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;