import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import mongoose from "mongoose";
import PaymentModel from "@/models/PaymentModel";

// Define custom error interfaces for type-safe error handling
interface WebhookError {
  message: string;
  code?: string;
  type?: string;
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

// Connect to MongoDB if not already connected
const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || "");
      console.log("MongoDB connected in webhook handler");
    } catch (error: unknown) {
      const processedError = error as WebhookError;
      console.error("MongoDB connection error in webhook:", processedError.message);
    }
  }
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const resolvedHeaders = await headers();
  const signature = resolvedHeaders.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: unknown) {
    const processedError = err as WebhookError;
    console.error(`Webhook signature verification failed: ${processedError.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  try {
    // Connect to database
    await connectDB();

    // Handle successful payments
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const referenceId = session.client_reference_id;

      if (referenceId) {
        // Update payment status in the database
        const updatedPayment = await PaymentModel.findOneAndUpdate(
          { referenceId },
          { 
            status: "completed",
            paymentDate: new Date(),
          },
          { new: true }
        );

        if (!updatedPayment) {
          console.error(`Payment with reference ${referenceId} not found`);
          return NextResponse.json(
            { error: "Payment not found" },
            { status: 404 }
          );
        }

        console.log(`Payment ${referenceId} marked as completed`);
      }
    }

    // Handle failed payments
    if (event.type === "checkout.session.expired" || 
        event.type === "payment_intent.payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const referenceId = session.client_reference_id;

      if (referenceId) {
        // Update payment status to failed
        await PaymentModel.findOneAndUpdate(
          { referenceId },
          { status: "failed" },
          { new: true }
        );

        console.log(`Payment ${referenceId} marked as failed`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    // Type-safe error handling
    const processedError = error as WebhookError;
    
    console.error("Error processing webhook:", processedError.message);
    
    return NextResponse.json(
      { 
        error: "Error processing webhook",
        details: processedError.message,
        type: processedError.type
      },
      { status: 500 }
    );
  }
}

// This is important for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};