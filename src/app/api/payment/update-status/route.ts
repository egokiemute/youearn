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
      console.log("MongoDB connected in update status endpoint");
    } catch (error: unknown) {
      const processedError = error as CustomError;
      console.error("MongoDB connection error in update status endpoint:", processedError.message);
    }
  }
};

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { referenceId, status } = await req.json();

    // Validate input
    if (!referenceId || !status) {
      return NextResponse.json(
        { error: "Reference ID and status are required" },
        { status: 400 }
      );
    }

    // Validate status value
    if (!['completed', 'pending', 'failed'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and update payment
    const updatedPayment = await PaymentModel.findOneAndUpdate(
      { referenceId },
      { 
        status,
        ...(status === 'completed' ? { paymentDate: new Date() } : {})
      },
      { new: true }
    );

    if (!updatedPayment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status}`,
      payment: {
        ...updatedPayment.toObject(),
        id: updatedPayment._id as string,
        _id: undefined
      }
    });
  } catch (error: unknown) {
    // Type-safe error handling
    const processedError = error as CustomError;
    
    console.error("Payment status update error:", processedError);
    
    return NextResponse.json(
      { 
        error: processedError.message || "Failed to update payment status",
        errorName: processedError.name,
        errorCode: processedError.code
      },
      { status: 500 }
    );
  }
}