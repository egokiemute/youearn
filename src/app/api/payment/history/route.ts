import connectDB from "@/config/connectDB";
import PaymentModel from "@/models/PaymentModel";
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

    const payments = await PaymentModel.find().sort({ paymentDate: -1 }); // Sort by newest first

    // const data = payments;
    // console.log("Payments ", data)
    return NextResponse.json(
      { success: true, data: payments },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Type-safe error handling
    const processedError = error as CustomError;
    
    console.error("Error fetching payments:", processedError);
    
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payments",
        error: processedError.message || "An unknown error occurred",
        errorName: processedError.name,
        errorCode: processedError.code
      },
      { status: 500 }
    );
  }
}