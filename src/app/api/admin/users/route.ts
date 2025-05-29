import { NextRequest, NextResponse } from "next/server";
// import connectDB from '@/lib/db';
// import UserModel from '@/models/UserModel';
import { getUserFromRequest } from "@/lib/auth";
import { connectDB } from "@/config/connectDB";
import { ApiResponse } from "../../../../../types";
import UserModel from "@/models/User";
// import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user || user.role !== "admin") {
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
    const totalReferrals = users.reduce(
      (sum: number, user: typeof users[number]) => sum + (user.referralCode ? 1 : 0),
      0
    );
    const totalTelegramJoined = users.filter(
      (user: typeof users[number]) => user.telegramJoined
    ).length;

    return NextResponse.json<ApiResponse>({
      message: "Admin users fetched successfully",
      success: true,
      data: {
      users: users.map((user) => ({
        ...user,
        _id: user._id?.toString() ?? "",
        referralCode: user.referralCode ?? "",
        referralCount: user.referrals ? user.referrals.length : 0,
        telegramJoinedReferrals: user.referrals
        ? user.referrals.filter((ref: { telegramJoined: boolean }) => ref.telegramJoined).length
        : 0,
      })),
      summary: {
        totalUsers,
        totalReferrals,
        totalTelegramJoined,
        averageReferralsPerUser:
        totalUsers > 0 ? (totalReferrals / totalUsers).toFixed(2) : 0,
      },
      },
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Server error",
        error: `Failed to all users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
