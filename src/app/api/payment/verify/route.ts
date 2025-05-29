import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import PaymentModel from "@/models/PaymentModel";

// Define a custom error interface
interface CustomError {
  message?: string;
  name?: string;
  code?: string;
}

// Connect to MongoDB if not already connected
const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "");
      console.log("MongoDB connected in verify endpoint");
    } catch (error: unknown) {
      const processedError = error as CustomError;
      console.error("MongoDB connection error in verify endpoint:", processedError.message);
    }
  }
};

export async function GET(req: NextRequest) {
  try {
    // Get reference ID from query params
    const { searchParams } = new URL(req.url);
    const referenceId = searchParams.get("reference");

    if (!referenceId) {
      return NextResponse.json(
        { error: "Reference ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and update the payment to 'completed'
    const updatedPayment = await PaymentModel.findOneAndUpdate(
      { referenceId },
      {
        status: "completed",
        paymentDate: new Date(),
      },
      { new: true }
    );

    if (!updatedPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const formattedPayment = {
      ...updatedPayment.toObject(),
      id: updatedPayment._id as string,
      _id: undefined,
    };

    return NextResponse.json({
      success: true,
      message: "Payment verified and status updated to completed",
      payment: formattedPayment,
    });
  } catch (error: unknown) {
    // Type-safe error handling
    const processedError = error as CustomError;
    
    console.error("Payment verification error:", processedError);
    
    return NextResponse.json(
      { 
        error: processedError.message || "Failed to verify payment",
        errorName: processedError.name,
        errorCode: processedError.code
      },
      { status: 500 }
    );
  }
}