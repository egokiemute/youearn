"use client";
import React, { useState, useEffect } from "react";
import { Trophy, Loader2 } from "lucide-react";

interface LeaderboardUser {
  _id: string;
  name?: string;
  email?: string;
  referrals?: number[];
  totalEarnings?: number;
  referralCode?: string;
}

interface LeaderBoardProps {
  currentUserId?: string;
  limit?: number;
  showRank?: boolean;
  className?: string;
}

const LeaderBoard: React.FC<LeaderBoardProps> = ({
  currentUserId,
  limit = 10,
  showRank = true,
  className = "",
}) => {
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
            .slice(0, limit); // Top users based on limit

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
  }, [limit]);

  // Find current user's rank
  const getCurrentUserRank = () => {
    if (!currentUserId || !leaderboardData.length) return null;

    const userIndex = leaderboardData.findIndex((u) => u._id === currentUserId);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  const currentUserRank = getCurrentUserRank();

  return (
    <div className={`bg-white shadow rounded-lg p-6 ${className}`}>
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
                    leaderUser._id === currentUserId
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
                        {leaderUser.name || leaderUser.email || "Anonymous"}
                        {leaderUser._id === currentUserId && (
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

      {showRank && (
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
      )}
    </div>
  );
};

export default LeaderBoard;