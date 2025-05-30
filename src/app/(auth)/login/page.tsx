"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@/Provider/UserProvider";

const LoginPage = () => {
  const router = useRouter();
  const { login } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important: Include cookies in the request
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(result.message || "Invalid email or password");
        return;
      }

      // Login successful
      toast.success("Login successful");

      // Store user data and token using your UserProvider
      if (login && result.data) {
        login(result.data.user, result.data.token);
      }

      // Check for redirect parameter from URL
      const urlParams = new URLSearchParams(window.location.search);
      const redirectPath = urlParams.get("redirect");
      console.log(redirectPath);

      if (result.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/profile");
      }

      if (redirectPath) {
        // Redirect to the original intended path
        router.push(redirectPath);

        if (result.data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      } else {
        // Default redirect based on user role
        if (result.data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold pb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Input
            name="email"
            type="email"
            placeholder="Email, e.g 10****@upsmail.edu.gh"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? "border-red-500" : ""}
            disabled={isLoading}
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
            onChange={handleInputChange}
            className={errors.password ? "border-red-500" : ""}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        <div className="w-fit ml-auto text-sm cursor-pointer hover:text-green-800 -mt-2">
          <Link href={"/forgot-password"}>Forgot password?</Link>
        </div>

        <Button
          disabled={isLoading}
          className="bg-[#fe0000] hover:bg-[#fe0000aa] w-full text-white"
          type="submit"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Login"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
