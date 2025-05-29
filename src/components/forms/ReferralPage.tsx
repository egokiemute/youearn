'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState('');

  const referralCode = params.code as string;

  console.log(`Referral code from URL: ${referralCode}`);

  useEffect(() => {
    const validateAndRedirect = async () => {
      if (!referralCode) {
        router.push('/signup');
        return;
      }

      try {
        // Validate the referral code format first
        if (!/^[a-zA-Z0-9]{5}$/i.test(referralCode)) {
          setError('Invalid referral code format');
          setTimeout(() => router.push('/signup'), 3000);
          return;
        }

        // Optional: Validate if referral code exists in database
        const response = await fetch('/api/validate-referral', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ referralCode: referralCode.toUpperCase() }),
        });

        const data = await response.json();

        if (data.success) {
          // Redirect to signup with referral code
          router.push(`/signup?ref=${referralCode.toUpperCase()}`);
        } else {
          setError('Referral code not found');
          setTimeout(() => router.push('/signup'), 3000);
        }
      } catch (error) {
        console.error('Error validating referral code:', error);
        // If validation fails, still redirect to signup with the code
        router.push(`/signup?ref=${referralCode.toUpperCase()}`);
      } finally {
        setIsValidating(!isValidating);
      }
    };

    validateAndRedirect();
  }, [referralCode, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Referral Link</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to signup page...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-md text-center">
        <div className="mb-4">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Referral</h2>
          <p className="text-gray-600">Validating referral code: <span className="font-mono font-semibold">{referralCode}</span></p>
        </div>
      </div>
    </div>
  );
}