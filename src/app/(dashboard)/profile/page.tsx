"use client";
import { useUser } from "@/Provider/UserProvider";
import {
  Copy,
  Share2,
  Trophy,
  Users,
  ExternalLink,
  CheckCircle,
  Loader2,
  EarthIcon,
} from "lucide-react";
import React, { useState, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface User {
  referrals?: number[];
  totalEarnings?: number;
  referralCode?: string;
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LeaderboardUser {
  _id: string;
  name?: string;
  email?: string;
  referrals?: number[];
  totalEarnings?: number;
  referralCode?: string;
}

const DashboardPage = () => {
  const { user } = useUser() as { user: User };
  const [copied, setCopied] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/user");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch users");
        }

        if (result.success && result.data) {
          // Sort users by referrals count and earnings for leaderboard
          const sortedUsers: LeaderboardUser[] = (
            result.data as LeaderboardUser[]
          )
            .filter(
              (user: LeaderboardUser) =>
                user.referrals && user.referrals.length > 0
            ) // Only users with referrals
            .sort((a: LeaderboardUser, b: LeaderboardUser) => {
              // First sort by referral count, then by earnings
              const aReferrals = a.referrals?.length || 0;
              const bReferrals = b.referrals?.length || 0;
              const aEarnings = a.totalEarnings || 0;
              const bEarnings = b.totalEarnings || 0;

              if (bReferrals !== aReferrals) {
                return bReferrals - aReferrals;
              }
              return bEarnings - aEarnings;
            })
            .slice(0, 10); // Top 10 users

          setLeaderboardData(sortedUsers);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Find current user's rank
  const getCurrentUserRank = () => {
    if (!user || !leaderboardData.length) return null;

    const userIndex = leaderboardData.findIndex((u) => u._id === user?.id);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  const referralLink = `https://youearn.vercel.app/${user?.referralCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Youearn - Crypto Advert Earning Platform",
          text: "Earn rewards when you referral someone! Use my referral link to get started.",
          url: referralLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  const currentUserRank = getCurrentUserRank();

  // Join telegram
  const handleJoinTelegram = () => {
    // Open Telegram channel in new tab
    window.open("https://t.me/youearn_offers", "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Welcome Header */}
            <div className="bg-white shadow rounded-lg p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to your Youearn Dashboard
              </h1>
              <p className="text-gray-600">
                We are a reliable and collectively shared revenue advertising
                platform that pays you for every click.
              </p>
            </div>
            {/* Join Telegram */}
            <button onClick={handleJoinTelegram} className="bg-white shadow rounded-lg p-6 cursor-pointer">
              <div className="flex justify-between items-start">
                
                <div className="text-start ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Join our telegram channel
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    Youearn Community
                  </p>
                </div>
                <div className="bg-[#fe0000dd] text-[#fff] mt-auto flex gap-1 items-center font-sans font-medium rounded-2xl px-4 py-2 flex-shrink-0">
                  <EarthIcon className="h-4 w-4 text-[#fff]" />
                  Join now
                </div>
              </div>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-[#09005b]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Referrals
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {user?.referrals?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Earnings
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${(user?.totalEarnings || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Share2 className="h-8 w-8 text-[#fe0000dd]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Referral Code
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {user?.referralCode}
                  </p>
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
              Earn rewards when you share this link with friends, start earning!
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

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#09005b] mr-2" />
                <span className="text-gray-600">Loading leaderboard...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">Failed to load leaderboard</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No referrers yet!</p>
                <p className="text-sm text-gray-500">
                  Be the first to start referring friends.
                </p>
              </div>
            ) : (
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
                    {leaderboardData.map((leaderUser, index) => (
                      <tr
                        key={leaderUser._id}
                        className={`${index < 3 ? "bg-yellow-50" : ""} ${
                          leaderUser._id === user?._id
                            ? "ring-2 ring-[#fe0000] ring-opacity-50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {index < 3 && (
                              <Trophy
                                className={`h-4 w-4 mr-2 ${
                                  index === 0
                                    ? "text-yellow-500"
                                    : index === 1
                                      ? "text-gray-400"
                                      : "text-orange-400"
                                }`}
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {leaderUser.name ||
                                leaderUser.email ||
                                "Anonymous"}
                              {leaderUser._id === user?._id && (
                                <span className="ml-2 text-xs bg-[#fe0000] text-white px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {leaderUser.referrals?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-[#fe0000]">
                            ${(leaderUser.totalEarnings || 0).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Your current rank:{" "}
                <span className="font-medium text-gray-900">
                  {currentUserRank ? `#${currentUserRank}` : "Not ranked yet"}
                </span>
              </p>
              {!currentUserRank && (
                <p className="text-xs text-gray-400 mt-1">
                  Start referring friends to climb the leaderboard!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
