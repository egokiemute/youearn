import connectDB from "@/config/connectDB";
import UserModel from "@/models/User";
import { NextResponse } from "next/server";

// Define a custom error interface
interface CustomError {
  message: string;
  code?: string;
  name?: string;
}

export async function GET() {
  try {
    await connectDB(); // Ensure database connection

    const users = await UserModel.find().sort({ createdAt: -1 }); // Sort by newest first

    // const data = payments;
    // console.log("Payments ", data)
    return NextResponse.json(
      { success: true, data: users },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Type-safe error handling
    const processedError = error as CustomError;
    
    console.error("Error fetching all users:", processedError);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch all users",
        error: processedError.message || "An unknown error occurred",
        errorName: processedError.name,
        errorCode: processedError.code
      },
      { status: 500 }
    );
  }
}