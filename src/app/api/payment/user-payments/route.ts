// app/api/payment/user-payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import PaymentModel from "@/models/PaymentModel";
import connectDB from "@/config/connectDB";
import UserModel from "@/models/User";

// Define custom error interface for type-safe error handling
interface CustomError {
  message: string;
  name?: string;
  code?: string;
  type?: string;
}

export async function GET(req: NextRequest) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = searchParams.get("sortBy") || "paymentDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    
    // Validate required parameters - need either userId or studentId
    if (!userId && !studentId) {
      return NextResponse.json(
        { error: "Either userId or studentId is required" },
        { status: 400 }
      );
    }

    // Build query
    const query: Partial<{
      studentId: string;
      status: "pending" | "completed" | "failed";
    }> = {};
    
    // If studentId is provided, use it directly
    if (studentId) {
      query.studentId = studentId;
    } 
    // If userId is provided, first find the user to get their studentId
    else if (userId) {
      // Validate userId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { error: "Invalid userId format" },
          { status: 400 }
        );
      }
      
      const user = await UserModel.findById(userId);
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      query.studentId = user.studentId;
    }
    
    // Add status filter if provided
    if (status && ["pending", "completed", "failed"].includes(status)) {
      query.status = status as "pending" | "completed" | "failed";
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Determine sort direction
    const sortDirection = sortOrder.toLowerCase() === "asc" ? 1 : -1;
    
    // Execute queries in parallel for better performance
    const [payments, totalCount] = await Promise.all([
      PaymentModel.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentModel.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    
    // Format payments by removing _id and adding id
    const formattedPayments = payments.map(payment => ({
      ...payment,
      id: payment._id as string,
      _id: undefined
    }));
    
    // Calculate totals for different statuses
    const [completedTotal, pendingTotal, failedTotal] = await Promise.all([
      PaymentModel.aggregate([
        { $match: { ...query, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      PaymentModel.aggregate([
        { $match: { ...query, status: "pending" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      PaymentModel.aggregate([
        { $match: { ...query, status: "failed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);
    
    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      summary: {
        completedTotal: completedTotal[0]?.total || 0,
        pendingTotal: pendingTotal[0]?.total || 0,
        failedTotal: failedTotal[0]?.total || 0,
        totalPaid: completedTotal[0]?.total || 0
      }
    });
    
  } catch (error: unknown) {
    // Type-safe error handling
    const processedError = error as CustomError;
    console.error("Error fetching user payments:", processedError);
    
    return NextResponse.json(
      { 
        error: processedError.message || "Failed to fetch payments",
        errorName: processedError.name || "UnknownError",
        errorCode: processedError.code || "unknown_error",
        errorType: processedError.type || "server_error"
      },
      { status: 500 }
    );
  }
}