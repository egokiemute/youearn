"use client";
import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Check,
  ExternalLink,
  Users,
  Bell,
  Gift,
} from "lucide-react";
import { useRouter } from "next/navigation";

const JoinTelegram = () => {
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userExists, setUserExists] = useState(false);
  const router = useRouter();

  // Check if user exists in localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    // const token = localStorage.getItem("token");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.userId || user.id) {
          setUserExists(true);
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
        setError("Invalid user data. Please log in again.");
      }
    } else {
      setError("Please log in to continue");
    }
  }, []);

  const handleJoinTelegram = () => {
    // Open Telegram channel in new tab
    window.open("https://t.me/youearn_offers", "_blank");
  };
  const handleprofile = () => {
    // Open Profile page
    router.push("/profile");
  };

  const handleConfirmJoin = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Get user from localStorage
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (!userData) {
        setError("Please log in to continue");
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      if (!user.userId && !user.id) {
        setError("Invalid user data. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/telegram-joined", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include user ID in headers
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        setError("Session expired. Please log in again.");
        // Clear expired auth data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return;
      }

      if (data.success) {
        setIsJoined(true);
        setSuccess("Great! Your Telegram join status has been updated.");
        router.push("/profile");
      } else {
        setError(data.message || "Failed to update join status");
      }
    } catch (err) {
      console.log(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isJoined) {
    return (
      <div className="bg-gradient-to-br flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to the Community! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            You&apos;ve successfully joined our Telegram channel. Get ready for
            exclusive updates, tips, and community discussions!
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">
              ✅ Telegram join status confirmed
            </p>
          </div>
          <button
            onClick={handleprofile}
            disabled={!userExists}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mt-4"
          >
            {/* <MessageCircle className="w-5 h-5" /> */}
            <span>Visit your profile</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join Our Telegram Channel
          </h1>
          <p className="text-gray-600">
            Stay connected with our community and never miss important updates!
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-gray-700">
              Instant notifications & updates
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-gray-700">
              Connect with community members
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-gray-700">Exclusive content & offers</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 text-sm">{success}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleJoinTelegram}
            disabled={!userExists}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Join Telegram Channel</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              After joining, click below to confirm:
            </p>
            <button
              onClick={handleConfirmJoin}
              disabled={isLoading || !userExists}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>I&apos;ve Joined the Channel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            By joining, you agree to receive notifications from our Telegram
            channel. You can leave anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinTelegram;
