"use client";
import { useUser } from "@/Provider/UserProvider";
import React, { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, Mail, User, Loader2, AlertCircle } from "lucide-react";

interface LocalUser {
  referrals?: number[];
  totalEarnings?: number;
  referralCode?: string;
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  telegramUsername?: string;
}

interface ReferralUser {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  totalEarnings: number;
}

interface ReferralData {
  userId: string;
  userEmail: string;
  userName: string;
  totalReferrals: number;
  referrals: ReferralUser[];
}

const ReferralsPage = () => {
  const { user } = useUser() as { user: LocalUser };
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!user?._id && !user?.id) {
        setError("User ID not available");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const userId = user._id || user.id;
        const response = await fetch(`/api/user/${userId}/referrals`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch referrals');
        }

        if (result.success) {
          setReferralData(result.data);
        } else {
          throw new Error(result.message || 'Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError(err instanceof Error ? err.message : 'Failed to load referrals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#09005b] mx-auto mb-4" />
          <p className="text-gray-600">Loading your referrals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Referrals</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#09005b] text-white rounded-lg hover:bg-[#09005bde] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Referrals
                </h1>
                <p className="text-gray-600">
                  {user?.telegramUsername} - Track all the people you've referred to Youearn
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[#09005b]">
                  {referralData?.totalReferrals || 0}
                </div>
                <div className="text-sm text-gray-500">Total Referrals</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-[#09005b]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Referrals</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {referralData?.referrals?.filter(r => r.totalEarnings > 0).length || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Referral Earnings</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${referralData?.referrals?.reduce((sum, r) => sum + r.totalEarnings, 0).toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">This Month</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {referralData?.referrals?.filter(r => {
                      const joinDate = new Date(r.joinedDate);
                      const now = new Date();
                      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Referrals List */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#09005b]" />
              All Your Referrals ({referralData?.totalReferrals || 0})
            </h2>

            {!referralData?.referrals || referralData.referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
                <p className="text-gray-600 mb-4">
                  Start sharing your referral link to earn rewards when people join!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Earnings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referralData.referrals.map((referral, index) => (
                      <tr key={referral.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-[#09005b] flex items-center justify-center">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {referral.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {referral.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(referral.joinedDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          ${referral.totalEarnings.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            referral.totalEarnings > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {referral.totalEarnings > 0 ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralsPage;