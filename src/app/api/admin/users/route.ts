import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { connectDB } from "@/config/connectDB";
import { ApiResponse } from "../../../../../types";
import UserModel from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await getUserFromRequest(request);
    if (!user || user?.role !== "admin") {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const users = await UserModel.getAllUsersWithStats();

    const totalUsers = users.length;
    
    // Fix: Count actual referrals, not users with referral codes
    const totalReferrals = users.reduce(
      (sum: number, user: typeof users[number]) => sum + (user.referrals ? user.referrals.length : 0),
      0
    );
    
    const totalTelegramJoined = users.filter(
      (user: typeof users[number]) => user.telegramJoined
    ).length;

    // Calculate users with referral codes (different from total referrals)
    const usersWithReferralCodes = users.filter(
      (user: typeof users[number]) => user.referralCode
    ).length;

    return NextResponse.json<ApiResponse>({
      message: "Admin users fetched successfully",
      success: true,
      data: {
        users: users.map((user: typeof users[number]) => ({
          _id: user._id?.toString() ?? "",
          email: user.email ?? "",
          telegramUsername: user.telegramUsername ?? "",
          referralCode: user.referralCode ?? "",
          referredBy: user.referredBy ?? null,
          telegramJoined: user.telegramJoined ?? false,
          wasReferred: user.wasReferred ?? false,
          role: user.role ?? "user",
          createdAt: user.createdAt ?? new Date().toISOString(),
          bankDetails: user.bankDetails ?? {},
          // Fix: Consistent referral counting
          referralCount: user.referrals ? user.referrals.length : 0,
          telegramJoinedReferrals: user.referrals
            ? user.referrals.filter((ref: { telegramJoined: boolean }) => ref.telegramJoined).length
            : 0,
        })),
        summary: {
          totalUsers,
          totalReferrals, // This is now the actual total referrals made
          totalTelegramJoined,
          usersWithReferralCodes, // Add this if you need it
          averageReferralsPerUser:
            totalUsers > 0 ? (totalReferrals / totalUsers).toFixed(2) : "0.00",
        },
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Server error",
        error: `Failed to fetch all users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}