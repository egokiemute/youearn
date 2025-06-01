"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiResponse, SignupData } from "../../../../types";

interface FormErrors {
  email?: string;
  password?: string;
  telegramUsername?: string;
  referralCode?: string;
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get referral code from URL parameters (e.g., /signup?ref=ABC12)
  const urlReferralCode = searchParams.get("ref") || "";

  const [formData, setFormData] = useState<SignupData>({
    email: "",
    password: "",
    telegramUsername: "",
    referralCode: urlReferralCode,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update referral code when URL parameters change
  useEffect(() => {
    if (urlReferralCode && urlReferralCode !== formData.referralCode) {
      setFormData((prev) => ({
        ...prev,
        referralCode: urlReferralCode,
      }));
    }
  }, [urlReferralCode, formData.referralCode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.telegramUsername.trim()) {
      newErrors.telegramUsername = "Telegram username is required";
    }

    // Validate referral code format if provided
    if (formData.referralCode && formData.referralCode.trim() !== "") {
      if (!/^[a-zA-Z0-9]{5}$/i.test(formData.referralCode.trim())) {
        newErrors.referralCode =
          "Referral code must be 5 characters (letters and numbers only)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Store token in localStorage
        if (data.data?.token) {
          localStorage.setItem("token", data.data.token);
          localStorage.setItem("user", JSON.stringify(data.data.user));
        }

        toast.success("Account created successfully!");
        // Redirect to telegram join page
        router.push("/telegram-join");
      } else {
        setError(data.message || "Signup failed");
        toast.error(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = "Network error. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold pb-4">Create account</h1>

      {/* Show referral info if code is pre-filled */}
      {formData.referralCode && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          <p className="text-sm">
            🎉 You&apos;re signing up with referral code:{" "}
            <span className="font-semibold">{formData.referralCode}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div>
          <Input
            name="telegramUsername"
            placeholder="Telegram Username"
            value={formData.telegramUsername}
            onChange={handleChange}
            className={errors.telegramUsername ? "border-red-500" : ""}
          />
          <span className="mt-1 text-xs text-[#09005b]">Just 'youearn' not '@youearn'.</span>
          {errors.telegramUsername && (
            <p className="text-red-500 text-sm mt-1">
              {errors.telegramUsername}
            </p>
          )}
        </div>

        <div>
          <Input
            name="referralCode"
            placeholder="Referral Code (Optional)"
            value={formData.referralCode}
            onChange={handleChange}
            className={errors.referralCode ? "border-red-500" : ""}
          />
          {errors.referralCode && (
            <p className="text-red-500 text-sm mt-1">{errors.referralCode}</p>
          )}
        </div>

        <Button
          disabled={loading}
          className="bg-[#fe0000] hover:bg-[#fe0000aa] w-full cursor-pointer flex items-center justify-center"
          type="submit"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="max-w-md mx-auto flex items-center justify-center mt-4">
        <p>
          Already have an account?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-600">
            Login here.
          </Link>
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupForm />
    </Suspense>
  );
}
