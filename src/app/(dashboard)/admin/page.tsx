"use client";
import AllUsersByAdmin from "@/components/templates/AllUsersByAdmin";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

const AdminDashboardPage = () => {
  const { logout, isLoggingOut } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Welcome to Admin Dashboard
              </h2>
              <div className="bg-gray-50 flex items-center p-4 rounded-md w-full justify-between">
                <h3 className="font-medium text-gray-700 mb-2">
                  Quick Actions
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <button
                    onClick={() => logout("/login")}
                    disabled={isLoggingOut}
                    className={`px-3 py-1 rounded-full text-white transition-colors duration-200 ${
                      isLoggingOut
                        ? "bg-red-400 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-600 cursor-pointer"
                    }`}
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center space-x-1">
                        <svg
                          className="animate-spin h-3 w-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Logging out...</span>
                      </span>
                    ) : (
                      "Logout"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-2">
            <AllUsersByAdmin />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
