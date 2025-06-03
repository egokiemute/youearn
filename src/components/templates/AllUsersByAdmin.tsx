"use client";
import React, { useState, useEffect } from "react";

interface User {
  _id: string;
  email: string;
  telegramUsername?: string;
  referralCode?: string;
  referredBy?: string | null;
  telegramJoined: boolean;
  wasReferred: boolean;
  role: string;
  createdAt: string;
  referralCount: number;
  telegramJoinedReferrals: number;
  bankDetails?: {
    accountName?: string;
    bankName?: string;
    accountNumber?: string;
  };
}

interface Summary {
  totalUsers: number;
  totalReferrals: number;
  totalTelegramJoined: number;
  averageReferralsPerUser: string;
}

const AllUsersByAdmin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/users", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Access denied - admin privileges required");
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          // Filter out admin users
          const nonAdminUsers = data.data.users.filter(
            (user: User) => user.role !== "admin"
          );
          setUsers(nonAdminUsers);
          setSummary(data.data.summary);

          // Debug logging
          // console.log("=== DEBUG INFO ===");
          // console.log("Total users fetched:", nonAdminUsers.length);
          
          // const usersWithBankDetails = nonAdminUsers.filter((user: User) => 
          //   user.bankDetails && (user.bankDetails.accountName || user.bankDetails.bankName || user.bankDetails.accountNumber)
          // );
          // console.log("Users with bank details:", usersWithBankDetails.length);
          
          // if (usersWithBankDetails.length > 0) {
          //   console.log("Sample user with bank details:", usersWithBankDetails[0]);
          // }
          
          // Log first 3 users to see structure
            // console.log("First 3 users structure:", nonAdminUsers.slice(0, 3).map((user: User) => ({
            // email: user.email,
            // bankDetails: user.bankDetails,
            // hasBankDetails: !!user.bankDetails
            // })));
          
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (err) {
        // console.log(err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportBankDetails = () => {
    // Sort users by referral count in descending order and get top 3
    const topThreeUsers = users
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 3)
      .filter(user => 
        user.bankDetails && (user.bankDetails.accountName || user.bankDetails.bankName || user.bankDetails.accountNumber)
      );
    
    if (topThreeUsers.length === 0) {
      alert("No bank details found for the top 3 users in the leaderboard.");
      return;
    }

    const csvContent = [
      ['Rank', 'Email', 'Telegram Username', 'Account Name', 'Bank Name', 'Account Number', 'Referral Code', 'Referral Count', 'Created Date'],
      ...topThreeUsers.map((user, index) => [
        (index + 1).toString(), // Rank (1, 2, 3)
        user.email || '',
        user.telegramUsername || '',
        user.bankDetails?.accountName || '',
        user.bankDetails?.bankName || '',
        user.bankDetails?.accountNumber || '',
        user.referralCode || '',
        user.referralCount.toString(),
        formatDate(user.createdAt)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `top3_users_bank_details_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const topThreeUsersWithBankDetails = users
    .sort((a, b) => b.referralCount - a.referralCount)
    .slice(0, 3)
    .filter(user => 
      user.bankDetails && (user.bankDetails.accountName || user.bankDetails.bankName || user.bankDetails.accountNumber)
    );

  // console.log(users, "All users");

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Users</h2>
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading users...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Users</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
            <div className="flex items-center space-x-4">
              {/* {summary && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    Total: {users.length} users
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    Top 3 with Bank Details: {topThreeUsersWithBankDetails.length}
                  </span>
                </div>
              )} */}
              <div className="flex space-x-2">
                {topThreeUsersWithBankDetails.length > 0 && (
                  <button
                    onClick={exportBankDetails}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Export Top 3 Bank Details
                  </button>
                )}
                <button
                  onClick={() => setShowDebugInfo(!showDebugInfo)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {showDebugInfo ? 'Hide' : 'Show'} Debug Info
                </button>
              </div>
            </div>
          </div>

          {/* Debug Information Panel */}
          {/* {showDebugInfo && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Debug Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Total Users:</strong> {users.length}
                </div>
                <div>
                  <strong>Top 3 Users with Bank Details:</strong> {topThreeUsersWithBankDetails.length}
                </div>
                <div>
                  <strong>Percentage of Top 3 with Bank Details:</strong> {topThreeUsersWithBankDetails.length > 0 ? ((topThreeUsersWithBankDetails.length / 3) * 100).toFixed(1) : 0}%
                </div>
              </div>
              {users.length > 0 && (
                <div className="mt-4">
                  <strong>Sample User Structure:</strong>
                  <pre className="bg-white p-3 rounded border mt-2 text-xs overflow-auto">
                    {JSON.stringify({
                      email: users[0].email,
                      bankDetails: users[0].bankDetails || "No bankDetails field",
                      hasAnyBankInfo: !!(users[0].bankDetails && (users[0].bankDetails.accountName || users[0].bankDetails.bankName || users[0].bankDetails.accountNumber))
                    }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )} */}

          {users.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No users found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are currently no non-admin users in the system.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              {summary && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {users.length}
                    </div>
                    <div className="text-sm text-blue-600">Non-Admin Users</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {summary.totalTelegramJoined}
                    </div>
                    <div className="text-sm text-green-600">
                      Telegram Joined
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {summary.totalReferrals}
                    </div>
                    <div className="text-sm text-purple-600">
                      Total Referrals
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {summary.averageReferralsPerUser}
                    </div>
                    <div className="text-sm text-orange-600">
                      Avg Referrals/User
                    </div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">
                      {topThreeUsersWithBankDetails.length}
                    </div>
                    <div className="text-sm text-indigo-600">
                      Top 3 with Bank Details
                    </div>
                  </div>
                </div>
              )}

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telegram
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referral Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Referrals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bank Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.email?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.email || "No email"}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.telegramUsername
                              ? `@${user.telegramUsername}`
                              : "Not set"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.telegramJoined ? (
                              <span className="text-green-600">✓ Joined</span>
                            ) : (
                              <span className="text-red-600">✗ Not joined</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.referralCode || "None"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {user.referralCount}
                            </span>
                            {user.telegramJoinedReferrals > 0 && (
                              <span className="text-xs text-green-600">
                                ({user.telegramJoinedReferrals} joined)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            {user.bankDetails && (user.bankDetails.accountName || user.bankDetails.bankName || user.bankDetails.accountNumber) ? (
                              <div className="space-y-1">
                                {user.bankDetails.accountName && (
                                  <div className="truncate">
                                    <span className="font-medium">
                                      Name:
                                    </span>{" "}
                                    {user.bankDetails.accountName}
                                  </div>
                                )}
                                {user.bankDetails.bankName && (
                                  <div className="truncate">
                                    <span className="font-medium">
                                      Bank:
                                    </span>{" "}
                                    {user.bankDetails.bankName}
                                  </div>
                                )}
                                {user.bankDetails.accountNumber && (
                                  <div className="truncate">
                                    <span className="font-medium">
                                      Account:
                                    </span>{" "}
                                    {user.bankDetails.accountNumber}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 italic">
                                Not provided
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {user.wasReferred && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Referred User
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {user.role || "user"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllUsersByAdmin;