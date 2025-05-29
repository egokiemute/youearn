"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import axiosInstance from '@/lib/Axios';
import { AxiosError } from 'axios'; // Import axios error type

// Define the User type based on your model
export interface User {
  _id: string;
  firstname: string;
  lastname?: string;
  email: string;
  role: string;
  studentId?: string;
  picture?: string;
  createdAt: string;
  updatedAt: string;
}

// Type for API error response
interface ApiErrorResponse {
  success: false;
  message: string;
  [key: string]: string | number | boolean | undefined;
}

// Define the context type
interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  error: null,
  refreshUserData: async () => {},
});

// Create a hook to use the user context
export const useUser = () => useContext(UserContext);

// Create the provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch user data from API
  const fetchUserData = async () => {
    if (!session?.user?.email) return; // Changed to check for email instead of ID

    try {
      setLoading(true);
      setError(null);
      
      console.log('Session email present, fetching user data...');
      
      // Using axios instead of fetch
      const response = await axiosInstance.get('/api/user/profile');
      
      // With axios, the data is directly available in response.data
      const data = response.data;
      
      if (data.success && data.user) {
        console.log('User data successfully fetched', data.user);
        // Save to state
        setUser(data.user);
        
        // Save to localStorage (exclude sensitive data if needed)
        localStorage.setItem('userData', JSON.stringify(data.user));
      } else {
        throw new Error('User data not found in response');
      }
    } catch (err: unknown) {
      // Properly type the error as AxiosError
      const error = err as AxiosError<ApiErrorResponse>;
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        setError(errorMessage);
        console.error('Server error response:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response received from server. Check your network connection.');
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(error.message || 'An unknown error occurred');
        console.error('Error setting up request:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh user data
  const refreshUserData = async () => {
    await fetchUserData();
  };

  // Try to load user data from localStorage on initial load
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
          setUser(JSON.parse(storedData));
        }
      } catch (err) {
        console.error('Error loading user data from localStorage:', err);
        // Clear potentially corrupted data
        localStorage.removeItem('userData');
      }
    };

    loadFromLocalStorage();
  }, []);

  // Fetch user data when session changes
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session?.user?.email) { // Changed to check for email instead of ID
      console.log('Session loaded with email:', session.user.email);
      fetchUserData();
    } else {
      console.log('No session email found, clearing user data');
      // Clear data if no session exists
      setUser(null);
      localStorage.removeItem('userData');
      setLoading(false);
    }
  }, [session, status]);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;