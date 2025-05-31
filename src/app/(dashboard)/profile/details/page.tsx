"use client";

import { useUser } from "@/Provider/UserProvider";
import React, { useState } from "react";

// Handle form submission
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: { bankDetails: BankDetails } | null;
}

// Handle form input changes
interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
}

interface HandleInputChangeEvent extends React.ChangeEvent<HTMLInputElement> {}

const Details = () => {
  const { user } = useUser();

  // State for bank account form
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    bankName: "",
    accountNumber: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (e: HandleInputChangeEvent) => {
    const { name, value } = e.target;
    setBankDetails((prev: BankDetails) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Load existing bank details on component mount
  React.useEffect(() => {
    const loadBankDetails = async () => {
      try {
        const response = await fetch("/api/user/bank-details");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.bankDetails) {
            setBankDetails({
              accountName: data.data.bankDetails.accountName || "",
              bankName: data.data.bankDetails.bankName || "",
              accountNumber: data.data.bankDetails.accountNumber || "",
            });
          }
        }
      } catch (error) {
        console.error("Error loading bank details:", error);
      }
    };

    if (user) {
      loadBankDetails();
    }
  }, [user]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response: Response = await fetch("/api/user/bank-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bankDetails),
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        setMessage("Bank details saved successfully!");
        console.log(data)
      } else {
        setMessage(
          data.message || "Failed to save bank details. Please try again."
        );
      }
    } catch (error: unknown) {
      setMessage("An error occurred. Please try again.");
      console.error("Error saving bank details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log(bankDetails)

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Details</h1>
        <p className="text-gray-600">
          Manage your profile and account information
        </p>
      </div>

      {/* User Information Section */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Profile Information
        </h2>

        <div className="flex items-center space-x-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-blue-900 text-white text-2xl font-semibold">
                {user?.telegramUsername?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram Username
              </label>
              <div className="text-gray-900 bg-white px-3 py-2 border border-gray-300 rounded-md">
                {user?.telegramUsername || "Not provided"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="text-gray-900 bg-white px-3 py-2 border border-gray-300 rounded-md">
                {user?.email || "Not provided"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Account Details Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Bank Account Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="accountName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              value={bankDetails.accountName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account holder name"
            />
          </div>

          <div>
            <label
              htmlFor="bankName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={bankDetails.bankName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <label
              htmlFor="accountNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter account number"
            />
          </div>

          {/* Success/Error Message */}
          {message && (
            <div
              className={`p-3 rounded-md ${
                message.includes("successfully")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-900 text-white font-medium rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Bank Details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Details;
