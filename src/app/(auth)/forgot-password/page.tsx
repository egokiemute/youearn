"use client";
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react"; // Changed from Loader to Loader2
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Define the schema first, then use it for the interface
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

// Derive the type from the schema
type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormInputs) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: values.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Show success message
      toast.success(data.message || "Password reset email sent successfully");

      // Reset form
      form.reset();

      // Optionally redirect to login page after delay
      setTimeout(() => {
        router.push("/login");
      }, 3000); // Redirect after 3 seconds
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl text-center font-bold pb-4">Forgot password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email, e.g joy@edupay.org"
                    {...field}
                    type="email" // Added type="email" for better mobile keyboards
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 w-full text-white"
            type="submit"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>

          <div className="mt-2 text-center">
            <p>
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-yellow-500 hover:text-yellow-600 font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;
