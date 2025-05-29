"use client";
import { useUser } from "@/Provider/UserProvider";
import { Copy, Share2, Trophy, Users, ExternalLink, CheckCircle } from "lucide-react";
import React, { useState } from "react";

const DashboardPage = () => {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);
  
  // Mock leaderboard data - replace with actual API call
  const leaderboardData = [
    { id: 1, name: "Alice Johnson", referrals: 45, earnings: 1250.50 },
    { id: 2, name: "Bob Smith", referrals: 38, earnings: 1050.00 },
    { id: 3, name: "Carol Davis", referrals: 32, earnings: 890.25 },
    { id: 4, name: "David Wilson", referrals: 28, earnings: 750.00 },
    { id: 5, name: "Eva Brown", referrals: 25, earnings: 687.50 },
    { id: 6, name: "Frank Miller", referrals: 22, earnings: 605.00 },
    { id: 7, name: "Grace Lee", referrals: 18, earnings: 495.00 },
    { id: 8, name: "Henry Chen", referrals: 15, earnings: 412.50 },
  ];

  const referralLink = `https://youearn.com/${user?.referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Youearn - Crypto Advert Earning Platform',
          text: 'Start earning crypto by viewing ads! Use my referral link to get started.',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Welcome Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Your Youearn Dashboard
            </h1>
            <p className="text-gray-600">
              Youearn is a crypto advert earning platform. Share your referral link and earn rewards!
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-[#09005b]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-semibold text-gray-900">$0.00</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Share2 className="h-8 w-8 text-[#fe0000dd]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Referral Code</p>
                  <p className="text-2xl font-semibold text-gray-900">{user?.referralCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Share2 className="h-5 w-5 mr-2 text-[#fe0000]" />
              Your Referral Link
            </h2>
            <p className="text-gray-600 mb-4">
              Share this link with friends and earn crypto when they join and start earning!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fe0000]"
                  />
                  <ExternalLink className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-4 py-3 bg-[#09005b] text-white rounded-lg hover:bg-[#09005bde] transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </button>
                
                <button
                  onClick={shareLink}
                  className="flex items-center px-4 py-3 bg-[#fe0000] text-white rounded-lg hover:bg-[#fe0000aa] transition-colors"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Referral Leaderboard
            </h2>
            <p className="text-gray-600 mb-6">
              See how you stack up against other top referrers on the platform.
            </p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrals
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboardData.map((user, index) => (
                    <tr key={user.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index < 3 && (
                            <Trophy className={`h-4 w-4 mr-2 ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 'text-orange-400'
                            }`} />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.referrals}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-[#fe0000]">
                          ${user.earnings.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Your current rank: <span className="font-medium text-gray-900">Not ranked yet</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Start referring friends to climb the leaderboard!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;