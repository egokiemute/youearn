// /api/user/[userId]/referrals/route.js
import { connectDB } from "@/config/connectDB";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

// Define a custom error interface
interface CustomError {
  message: string;
  code?: string;
  name?: string;
}

// If referrals is an array of IDs, we need to fetch the actual user data
interface ReferralUser {
  _id: string;
  name?: string;
  email: string;
  createdAt: Date;
  totalEarnings?: number;
}

export async function GET({ params }: { params: { userId: string } }) {
  try {
    await connectDB(); // Ensure database connection

    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Find the user and populate their referrals
    const user = await UserModel.findById(userId).populate({
      path: "referrals",
      select: "name email createdAt totalEarnings", // Select only needed fields
      options: { sort: { createdAt: -1 } }, // Sort by newest first
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    let referralUsers: ReferralUser[] = [];

    if (user.referrals && user.referrals.length > 0) {
      // Check if referrals are populated or just IDs
      if (typeof user.referrals[0] === "string") {
        // If they're just IDs, fetch the actual user data
        const foundReferrals = await UserModel.find(
          { _id: { $in: user.referrals } },
          "name email createdAt totalEarnings"
        )
          .sort({ createdAt: -1 })
          .lean<ReferralUser[]>();

        referralUsers = foundReferrals.map((ref) => ({
          _id: ref._id.toString(),
          name: ref.name,
          email: ref.email,
          createdAt: ref.createdAt,
          totalEarnings: ref.totalEarnings,
        }));
      } else {
        // If already populated
        referralUsers = (user.referrals as unknown[]).map((ref) => {
          const referral = ref as ReferralUser;
          return {
            _id: typeof referral._id === "object" && "toString" in referral._id ? (referral._id as string).toString() : referral._id,
            name: referral.name || "N/A",
            email: referral.email || "",
            createdAt: referral.createdAt || new Date(),
            totalEarnings: referral.totalEarnings || 0,
          };
        });
      }
    }

    const response = {
      success: true,
      data: {
        userId: user._id,
        userEmail: user.email,
        // userName: user.name || "n/a",
        totalReferrals: referralUsers.length,
        referrals: referralUsers.map((referral) => ({
          id: referral._id,
          name: referral.name || "N/A",
          email: referral.email,
          joinedDate: referral.createdAt,
          totalEarnings: referral.totalEarnings || 0,
        })),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    // Type-safe error handling
    const processedError = error as CustomError;

    console.error("Error fetching user referrals:", processedError);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user referrals",
        error: processedError.message || "An unknown error occurred",
        errorName: processedError.name,
        errorCode: processedError.code,
      },
      { status: 500 }
    );
  }
}
