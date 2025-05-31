import { connectDB } from "@/config/connectDB";
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

    // Fetch users with explicit field selection to ensure bankDetails is included
    const users = await UserModel.find()
      .select('+bankDetails') // Explicitly include bankDetails if it's set to select: false in schema
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Use lean() for better performance if you don't need mongoose document methods

    console.log("Fetched users count:", users.length);
    console.log("Sample user with bankDetails:", users[0]?.bankDetails || "No bankDetails found");

    return NextResponse.json({ 
      success: true, 
      data: users,
      count: users.length 
    }, { status: 200 });
    
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
        errorCode: processedError.code,
      },
      { status: 500 }
    );
  }
}