// app/api/payment/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid";
import PaymentModel from "@/models/PaymentModel";
import connectDB from "@/config/connectDB";

// Define custom error interfaces for type-safe error handling
interface StripeCustomError {
  message: string;
  code?: string;
  type?: string;
  param?: string;
  raw?: unknown;
}

interface GenericCustomError {
  message: string;
  code?: string;
  type?: string;
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

// Connect to MongoDB
export async function POST(req: NextRequest) {
  let referenceId: string | undefined;

  try {
    // Connect to database first
    await connectDB();
    
    // Parse request body
    const {
      studentId,
      studentName,
      amount,
      currency,
      feeType,
      level,
      paymentMethod,
    } = await req.json();

    // Validate required fields
    if (!studentId || !studentName || !amount || !feeType || !level) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      );
    }

    // Generate a unique reference ID
    referenceId = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create a new payment record with 'pending' status
    const newPayment = new PaymentModel({
      studentId,
      studentName,
      amount,
      currency: currency || "USD", // Default to USD if not specified
      paymentDate: new Date(),
      referenceId,
      status: "pending",
      paymentMethod: paymentMethod || "stripe",
      level,
      feeType,
    });

    // Save the payment to MongoDB
    await newPayment.save();

    // Get base URL from environment variable or request origin
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.headers.get('origin') || 'http://localhost:3000';

    // Make sure currency is a string and has a value
    const currencyCode = (currency || "USD").toUpperCase();
    
    // Convert amount to smallest currency unit (cents for USD)
    // All amounts in Stripe are in the smallest currency unit
    const unitAmount = Math.round(amount * 100);

    // Log the request parameters for debugging
    console.log("Creating Stripe session with params:", {
      currency: currencyCode.toLowerCase(),
      amount: unitAmount,
      baseUrl,
      referenceId
    });

    try {
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currencyCode.toLowerCase(),
              product_data: {
                name: `${feeType} - ${level}`,
                description: `Payment for ${studentName} (${studentId})`,
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${baseUrl}/dashboard/payment/success?reference=${referenceId}`,
        cancel_url: `${baseUrl}/dashboard/payment/cancel?reference=${referenceId}`,
        client_reference_id: referenceId,
        metadata: {
          studentId,
          paymentId: newPayment._id.toString(),
          referenceId,
        },
      });
      
      return NextResponse.json({ sessionId: session.id, referenceId });
    } catch (stripeError: unknown) {
      // Type-safe Stripe error handling
      const processedError = stripeError as StripeCustomError;
      console.error("Stripe session creation error:", processedError);
      
      // Update payment status to failed
      await PaymentModel.findOneAndUpdate(
        { referenceId },
        { 
          status: "failed", 
          errorDetails: processedError.message 
        }
      );
      
      return NextResponse.json(
        {
          error: processedError.message,
          code: processedError.code || 'stripe_error',
          type: processedError.type || 'unknown'
        },
        { status: 400 }
      );
    }

  } catch (error: unknown) {
    // Type-safe generic error handling
    const processedError = error as GenericCustomError & { raw?: unknown };
    console.error("Payment creation error:", processedError);
    
    // Add more context to the error for easier debugging
    let errorMessage = processedError.message || "Failed to create payment";
    let statusCode = 500;
    
    // Handle specific Stripe errors
    if (processedError.type === 'StripeInvalidRequestError') {
      statusCode = 400;
      const stripeError = processedError as StripeCustomError;
      if (stripeError.param) {
        errorMessage = `Invalid Stripe parameter: ${stripeError.param} - ${errorMessage}`;
      }
    }
    
    // Try to update payment status if a payment record was created
    try {
      if (typeof referenceId !== 'undefined') {
        await PaymentModel.findOneAndUpdate(
          { referenceId },
          { 
            status: "failed", 
            errorDetails: errorMessage 
          }
        );
      }
    } catch (dbError) {
      console.error("Failed to update payment status:", dbError);
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        code: processedError.code || 'unknown',
        type: processedError.type || 'unknown',
        details: processedError.raw
      },
      { status: statusCode }
    );
  }
}