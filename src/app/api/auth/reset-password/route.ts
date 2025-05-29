import connectDB from "@/config/connectDB";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();
    if (!userId && !password) {
      return NextResponse.json({ error: "User id and password required" });
    }

    await connectDB();

    const hashPassword = await bcrypt.hash(password, 10);

    const updateUser = await UserModel.findByIdAndUpdate(userId, {
      password: hashPassword,
    });

    // updateUser.save();
    // console.log(updateUser)

    return NextResponse.json(
      {
        message: "Password updated successfully",
        user: updateUser,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while trying to reset your password.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
