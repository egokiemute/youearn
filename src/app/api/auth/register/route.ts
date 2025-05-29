import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations";
import { generateToken } from "@/lib/auth";
import { connectDB } from "@/config/connectDB";
import { ApiResponse, SignupData } from "../../../../../types";
import UserModel from "@/models/User";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: SignupData = await request.json();

    // Validate request body
    const validatedData = signupSchema.parse(body);
    const { email, password, telegramUsername } = validatedData;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User already exists with this email",
        },
        { status: 400 }
      );
    }

    // Handle referral code logic
    const referralCode = body.referralCode?.trim() || null;
    let referrerFound = null;

    if (referralCode && referralCode.trim() !== "") {
      // Validate referral code format if provided
      if (!UserModel.isValidReferralCode(referralCode)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: "Invalid referral code format",
          },
          { status: 400 }
        );
      }

      // Check if referral code exists
      referrerFound = await UserModel.findByReferralCode(referralCode);
      if (!referrerFound) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: "Referral code not found",
          },
          { status: 400 }
        );
      }
    }

    // Create user with referral logic - pass the referrer's code, not a new one
    const newUser = await UserModel.createWithReferral({
      email,
      password,
      telegramUsername,
      referralCode: referralCode ?? undefined, // This is the referrer's code (optional, can be undefined)
    });

    // Generate JWT token
    const token = generateToken({
      userId: newUser._id!.toString(),
      email: newUser.email,
      role: newUser.role,
    });

    // Prepare success message
    const successMessage = referrerFound
      ? "Account created successfully! You were referred by an existing user. Please join the Telegram channel."
      : "Account created successfully! You can now refer others using your referral code. Please join the Telegram channel.";

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: successMessage,
        data: {
          user: {
            id: newUser._id?.toString() || "",
            email: newUser.email,
            telegramUsername: newUser.telegramUsername,
            referralCode: newUser.referralCode, // This is the new user's own referral code
            telegramJoined: newUser.telegramJoined,
            role: newUser.role,
            createdAt: newUser?.createdAt,
            wasReferred: !!referrerFound, // Indicates if user was referred by someone
            referredBy: referrerFound ? referrerFound.referralCode : null,
          },
          token,
          nextStep: "telegram-join",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Validation errors",
          error: error.errors[0]?.message || "Invalid input data",
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Server error during signup",
        error: `Failed to register user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}
