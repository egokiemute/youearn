"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
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
interface User {
  id: string;
   firstname: string;
   lastname: string;
   email: string;
   studentId: string;
   role: string; // "admin" | "user"
   createdAt: Date;
 }
 

// interface PaginationData {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

interface ApiResponse {
  success: boolean;
  data: User[];
}

const AllUsers = () => {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch all users data
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch all users data");
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setUsers(data.data);
        
      } else {
        throw new Error("Failed to retrieve all users data");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error fetching all users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and paginate users
  useEffect(() => {
    // Apply filters
    const result = [...users];

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
    
    setFilteredUsers(paginatedData);
  }, [users, statusFilter, pagination.page, pagination.limit]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Format date
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Students</h2>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
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
              onClick={fetchUsers}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* No payments state */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-8">
          <p className="text-gray-500 mb-4">No users records found</p>
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

      {/* Users table */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Firstname</TableHead>
                <TableHead>Lastname</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {user.studentId}
                  </TableCell>
                  <TableCell>{user.firstname}</TableCell>
                  <TableCell>{user.lastname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination controls */}
      {!loading && users.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredUsers.length} of {statusFilter && statusFilter !== "all" 
              ? users.filter(() => statusFilter).length 
              : users.length} records
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

export default AllUsers;