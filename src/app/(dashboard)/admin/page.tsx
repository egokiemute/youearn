
import React from "react";
import AllPayments from "../dashboard/_component/AllPayments";

const AdminDashboardPage = () => {
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
                <div className="flex items-center gap-5">
                    View all Users
                </div>
              </div>
            </div>
          </div>
          <div className="px-2">
            <AllPayments />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
