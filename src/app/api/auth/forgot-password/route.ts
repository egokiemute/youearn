import UserModel from "@/models/User";
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import maskEmail from "@/config";
import { sendEmail } from "@/config/resendemail";
import { ForgotPasswordEmail } from "@/components/templates/ForgotPasswordEmail";
import connectDB from "@/config/connectDB";
import React from "react";

export async function POST(req: NextRequest) {
    const host = req.headers.get('host') // gets the domain
    const protocol = host?.includes('localhost') ? 'http' : 'https'

    const DOMAIN = `${protocol}://${host}`
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    await connectDB();
    
    const userExist = await UserModel.findOne({ email });

    if (!userExist) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 400 }
      );
    }

    const payload = {
      id: userExist?._id?.toString(),
    };

    const token = jwt.sign(payload, process.env.FORGOT_PASSWORD_SECRET_KEY!, {
      expiresIn: 60 * 60 //expires in 1hr
    });

    const URL = `${DOMAIN}/reset-password?token=${token}`;

    // Create email component with React.createElement instead of JSX
    const emailComponent = React.createElement(ForgotPasswordEmail, {
      firstname: userExist?.firstname || "",
      url: URL
    });

    // Send email with React component
    await sendEmail(
        userExist.email,
        "Reset Your Password",
        emailComponent
      );

    const maskedEmail = maskEmail(userExist?.email);
    return NextResponse.json({
        message: `Check your ${maskedEmail} for a reset password link.`
    }, { status: 200 })
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