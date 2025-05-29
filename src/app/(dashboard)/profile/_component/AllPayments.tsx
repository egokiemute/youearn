"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define TypeScript interfaces
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

// interface PaginationData {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

interface PaymentSummary {
  completedTotal: number;
  pendingTotal: number;
  failedTotal: number;
  totalPaid: number;
}

interface ApiResponse {
  success: boolean;
  data: Payment[];
}

const AllPayments = () => {
  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [summary, setSummary] = useState<PaymentSummary>({
    completedTotal: 0,
    pendingTotal: 0,
    failedTotal: 0,
    totalPaid: 0,
  });

  // Fetch all payments data
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/history/");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch payment data");
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setPayments(data.data);
        
        // Calculate summary
        const completed = data.data.filter(p => p.status === "completed");
        const pending = data.data.filter(p => p.status === "pending");
        const failed = data.data.filter(p => p.status === "failed");
        
        setSummary({
          completedTotal: completed.length,
          pendingTotal: pending.length,
          failedTotal: failed.length,
          totalPaid: completed.reduce((sum, p) => sum + p.amount, 0)
        });
      } else {
        throw new Error("Failed to retrieve payment data");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate payments
  useEffect(() => {
    // Apply filters
    let result = [...payments];
    
    if (statusFilter && statusFilter !== "all") {
      result = result.filter(payment => payment.status === statusFilter);
    }
    
    // Calculate pagination
    const total = result.length;
    const totalPages = Math.ceil(total / pagination.limit);
    
    // Slice for current page
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = result.slice(startIndex, endIndex);
    
    // Update pagination state
    setPagination(prev => ({
      ...prev,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1
    }));
    
    setFilteredPayments(paginatedData);
  }, [payments, statusFilter, pagination.page, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchPayments();
  }, []);

  // Format currency
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            {status}
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-500"
          >
            {status}
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  // Status filter handler
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Payments</h2>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchPayments}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-t-4 border-green-500">
          <p className="text-sm text-gray-500">Completed Payments</p>
          <p className="text-2xl font-bold">{summary.completedTotal}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-b-4 border-yellow-500">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <p className="text-2xl font-bold">{summary.pendingTotal}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-t-4 border-red-500">
          <p className="text-sm text-gray-500">Failed Payments</p>
          <p className="text-2xl font-bold">{summary.failedTotal}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-b-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Amount (Completed)</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalPaid)}</p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={fetchPayments}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* No payments state */}
      {!loading && !error && filteredPayments.length === 0 && (
        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-8">
          <p className="text-gray-500 mb-4">No payment records found</p>
          {statusFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("")}
            >
              Clear Filter
            </Button>
          )}
        </div>
      )}

      {/* Payments table */}
      {!loading && !error && filteredPayments.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Fee Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.referenceId}
                  </TableCell>
                  <TableCell>{payment.studentName}</TableCell>
                  <TableCell>
                    {payment.feeType}
                    <span className="block text-xs text-gray-500">
                      {payment.level}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell className="capitalize">
                    {payment.paymentMethod}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination controls */}
      {!loading && payments.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredPayments.length} of {statusFilter && statusFilter !== "all" 
              ? payments.filter(() => statusFilter).length 
              : payments.length} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={handlePrevPage}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={handleNextPage}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPayments;