"use client";
import React, { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/lib/Axios";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface ResetPasswordFormInputs {
  password: string;
  confirmPassword: string;
}

// Define the validation schema using Zod
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Separate component that uses useSearchParams
function ResetPasswordForm() {
  // State to manage loading and verification states
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userId, setUserId] = useState("");

  // Router instance for navigation
  const router = useRouter();

  const searchParams = useSearchParams();
  const resetPasswordToken = searchParams.get("token");

  const verifyResetPasswordToken = async () => {
    if (!resetPasswordToken) {
      setIsValidToken(false);
      setTokenError("Reset token is missing");
      setIsVerifying(false);
      toast.error("Reset token is missing");
      setTimeout(() => {
        router.push("/forgot-password");
      }, 2000);
      return;
    }

    const payload = {
      token: resetPasswordToken,
    };

    try {
      setIsVerifying(true);
      const response = await axiosInstance.post(
        "/api/auth/verify-forgot-password-token",
        payload
      );

      if (response.status === 200) {
        setUserId(response?.data?.userId);
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
        setTokenError("Invalid or expired reset token");
        toast.error("Invalid or expired reset token");
        setTimeout(() => {
          router.push("/forgot-password");
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      setIsValidToken(false);
      setTokenError("Invalid or expired reset token");
      toast.error("Invalid or expired reset token");
      setTimeout(() => {
        router.push("/forgot-password");
      }, 2000);
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify token on component mount
  useEffect(() => {
    verifyResetPasswordToken();
  }, [resetPasswordToken]);

  // Initialize the form using react-hook-form and Zod for validation
  const form = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    if (!resetPasswordToken) {
      toast.error("Reset token is missing");
      return;
    }

    const payload = {
      password: data.password,
      userId: userId,
    };

    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/api/auth/reset-password",
        payload
      );

      if (response.status === 200) {
        toast.success("Password reset successful!");
        form.reset();
        router.push("/login");
      } else {
        toast.error(
          response.data.error || "Failed to reset password. Please try again."
        );
      }
    } catch (error: unknown) {
      console.error("Error resetting password:", error);
      toast.error(
        "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while verifying token
  if (isVerifying) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-center">Verifying your reset token...</p>
      </div>
    );
  }

  // Show error state if token is invalid
  if (!isValidToken) {
    return (
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-red-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Invalid Reset Link</h2>
        <p className="text-center mb-4">
          {tokenError || "The password reset link is invalid or has expired."}
        </p>
        <Link href="/forgot-password">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold pb-4">Reset Password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Password" {...field} type="password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Confirm password"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 w-full text-white cursor-pointer flex items-center justify-center"
            type="submit"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}

// Main component with Suspense
const ResetPassword = () => {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
        <p className="text-center">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
};

export default ResetPassword;