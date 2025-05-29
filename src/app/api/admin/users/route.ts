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
      (sum: number, user: any) => sum + user.referralCount,
      0
    );
    const totalTelegramJoined = users.filter(
      (user: any) => user.telegramJoined
    ).length;

    return NextResponse.json<ApiResponse>({
      message: "Admin users fetched successfully",
      success: true,
      data: {
        users: users.map((user: any) => ({
          ...user,
          referralCount: user.referralCount ?? 0,
          telegramJoinedReferrals: user.telegramJoinedReferrals ?? 0,
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
  } catch (error: any) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
