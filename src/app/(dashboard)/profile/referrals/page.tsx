"use client";
import React, { useEffect, useState } from 'react';
import PaymentHistory from '../_component/PaymentHistory';
import axiosInstance from '@/lib/Axios';

// Define the payment interface
interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  referenceId: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  level: string;
  feeType: string;
}

// Sample payment data
const samplePayments: Payment[] = [
  {
    id: '1',
    studentId: 'STU001',
    studentName: 'John Doe',
    amount: 5000,
    currency: 'usd',
    paymentDate: '2025-03-15T10:30:00Z',
    referenceId: 'TRX12345678',
    status: 'completed',
    paymentMethod: 'Credit Card',
    level: 'Spring 2025',
    feeType: 'Tuition Fee',
  },
  // ... other sample payments
];

const PaymentHistoryPage: React.FC = () => {
  // State to control whether to use sample data or fetch from API
  const [useSampleData, setUseSampleData] = useState<boolean>(false); // Set to false to use API by default
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set initial data based on data source preference
    if (useSampleData) {
      setPayments(samplePayments);
      setLoading(false);
    } else {
      fetchPaymentHistory();
    }
  }, [useSampleData]);

  // Function to fetch payment history from API
  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get<Payment[]>('/api/payment/history');
      
      if (response.data) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching payment data');
      console.error('Error fetching payment history:', err);
      setPayments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // const handleViewReceipt = (paymentId: string) => {
  //   console.log(`View receipt for payment: ${paymentId}`);
  //   window.open(`/receipts/${paymentId}`, '_blank');
  // };

  const handleExportCSV = () => {
    console.log('Exporting payment history to CSV');
    
    const headers = [
      'Student Name',
      'Student ID',
      'Amount',
      'Fee Type',
      'Level',
      'Payment Date',
      'Reference ID',
      'Status',
      'Payment Method',
    ];
    
    const csvRows = [
      headers.join(','),
      ...payments.map(payment => [
        `"${payment.studentName}"`,
        payment.studentId,
        payment.amount,
        `"${payment.feeType}"`,
        `"${payment.level}"`,
        `"${new Date(payment.paymentDate).toLocaleString()}"`,
        payment.referenceId,
        payment.status,
        `"${payment.paymentMethod}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `payment_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle between sample data and API data
  const toggleDataSource = () => {
    setUseSampleData(!useSampleData);
  };

  return (
    <div className="max-w-7xl w-full mr-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Fee Payments</h1>
        
        {/* Toggle button for development purposes */}
        <button 
          onClick={toggleDataSource}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
        >
          {useSampleData ? "Switch to API Data" : "Switch to Sample Data"}
        </button>
      </div>
      
      {/* Source indicator */}
      <div className="mb-4 text-sm text-gray-500">
        Currently using: <span className="font-medium">{useSampleData ? "Sample Data" : "API Data"}</span>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            onClick={fetchPaymentHistory} 
            className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1 px-3 rounded"
          >
            Retry
          </button>
        </div>
      ) : (
        <PaymentHistory
          payments={payments}
          onExportCSV={handleExportCSV}
        />
      )}
    </div>
  );
};

export default PaymentHistoryPage;