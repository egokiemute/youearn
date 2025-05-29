"use client";
import { formatAmountForDisplay } from "@/config/stripe-helpers";
import React, { useState, useMemo } from "react";

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  referenceId: string;
  status: "completed" | "pending" | "failed";
  paymentMethod: string;
  level: string;
  feeType: string;
}

interface PaymentHistoryProps {
  payments?: Payment[] | { data?: Payment[] }; // Make it more flexible
  onExportCSV?: () => void;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  onExportCSV,
}) => {
  // Normalize payments to always be an array
  const normalizedPayments = useMemo(() => {
    if (!payments) return [];
    
    // If payments is an object with a data property, extract the data
    if (payments && 'data' in payments && Array.isArray(payments.data)) {
      return payments.data;
    }
    
    // If payments is already an array, return it
    if (Array.isArray(payments)) {
      return payments;
    }
    
    // Fallback to empty array
    return [];
  }, [payments]);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: "ascending" | "descending";
  }>({
    key: "paymentDate",
    direction: "descending",
  });

  const requestSort = (key: keyof Payment) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedPayments = useMemo(() => {
    let filteredPayments = [...normalizedPayments];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredPayments = filteredPayments.filter(
        (payment) =>
          payment.studentName.toLowerCase().includes(searchLower) ||
          payment.studentId.toLowerCase().includes(searchLower) ||
          payment.referenceId.toLowerCase().includes(searchLower)
      );
    }

    return filteredPayments.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "ascending"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "ascending" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
  }, [normalizedPayments, searchTerm, sortConfig]);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-lg font-medium text-gray-900">Payment History</h2>
        <div className="mt-2 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              className="form-input block w-full sm:w-64 pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by name, ID or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Export CSV
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => requestSort("studentName")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Student Name
                {sortConfig.key === "studentName" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => requestSort("studentId")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Student ID
                {sortConfig.key === "studentId" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => requestSort("amount")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Amount
                {sortConfig.key === "amount" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => requestSort("feeType")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Fee Type
                {sortConfig.key === "feeType" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => requestSort("paymentDate")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Payment Date
                {sortConfig.key === "paymentDate" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => requestSort("referenceId")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Reference ID
                {sortConfig.key === "referenceId" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th
                onClick={() => requestSort("status")}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
              >
                Status
                {sortConfig.key === "status" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPayments.length > 0 ? (
              sortedPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.studentId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatAmountForDisplay(payment.amount, payment.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.feeType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.paymentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.referenceId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentHistory;