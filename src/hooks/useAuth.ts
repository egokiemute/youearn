"use client";

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/lib/services';

interface UseAuthReturn {
  isLoggingOut: boolean;
  logout: (redirectUrl?: string) => Promise<boolean>;
  logoutWithConfirm: (redirectUrl?: string) => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const logout = useCallback(async (redirectUrl: string = '/login'): Promise<boolean> => {
    setIsLoggingOut(true);

    try {
      const success = await authService.logout({
        redirectUrl: undefined, // We'll handle redirection manually
        showAlert: true,
        onError: (error) => {
          console.error('Logout error:', error);
        }
      });

      if (success) {
        router.push(redirectUrl);
        return true;
      }

      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [router]);

  const logoutWithConfirm = useCallback(async (redirectUrl: string = '/login'): Promise<boolean> => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    
    if (confirmed) {
      return await logout(redirectUrl);
    }
    
    return false;
  }, [logout]);



  return {
    isLoggingOut,
    logout,
    logoutWithConfirm
  };
};