"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
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
  referenceId: string;
  feeType: string;
  semester?: string;
  level?: string;
  status: string;
  paymentDate?: string;
}

interface CustomError {
  message?: string;
  response?: {
    data?: {
      error?: string;
    };
  };
}

const PaymentCancelContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const referenceId = searchParams.get("reference");

  // Format price as currency
  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (!referenceId) {
        setError("Missing reference ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch payment details
        const response = await axiosInstance.get(
          `/api/payment/verify?reference=${referenceId}`
        );

        if (response.status === 200 && response.data.payment) {
          const paymentData = response.data.payment;
          setPayment(paymentData);

          // Update payment status to cancelled if it was pending
          if (paymentData.status === "pending") {
            try {
              await axiosInstance.post("/api/payment/update-status", {
                referenceId,
                status: "cancelled",
              });
            } catch (updateErr) {
              console.error("Status update error:", updateErr);
              // Non-critical error, so we don't stop the process
            }
          }
        } else {
          setError("Payment information could not be retrieved");
        }
      } catch (err) {
        const processedError = err as CustomError;
        console.error("Payment information error:", processedError);

        const errorMessage =
          processedError.response?.data?.error ||
          processedError.message ||
          "Could not retrieve payment details. Please contact support.";

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [referenceId]);

  const handleRetry = () => {
    // Navigate back to payment page or restart payment flow
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <p className="mt-4 text-gray-600">Processing...</p>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold mt-2">Payment Cancelled</h2>
          </div>
          <p className="text-gray-600 text-center">
            {error || "No payment information available."}
          </p>
          <div className="mt-6 flex justify-center">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="mr-2 border-red-600 text-red-600 hover:bg-red-50"
            >
              Try Again
            </Button>
            <Link href="/dashboard">
              <Button className="bg-red-600 text-white hover:bg-red-700">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-red-500 text-center mb-4">
          <XCircle className="h-10 w-10 mx-auto" />
          <h2 className="text-xl font-bold mt-2">Payment Cancelled</h2>
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
            <span className="font-semibold">
              {payment.semester || payment.level || "N/A"}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(payment.amount, payment.currency)}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">Status:</span>
            <span className="font-semibold text-red-600 capitalize">
              {payment.status}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handleRetry}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Try Again
          </Button>
          <Link href="/dashboard">
            <Button className="bg-red-600 text-white hover:bg-red-700">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>No charges have been made to your account.</p>
          <p className="mt-1">For any queries, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

// Wrapper component to handle Suspense
const PaymentCancelPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      }
    >
      <PaymentCancelContent />
    </Suspense>
  );
};

export default PaymentCancelPage;
