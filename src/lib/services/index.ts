// lib/services/authService.ts

interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface LogoutOptions {
  redirectUrl?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showAlert?: boolean;
}

class AuthService {
  /**
   * Logout user by calling the logout API and clearing authentication
   */
  async logout(options: LogoutOptions = {}): Promise<boolean> {
    const {
      redirectUrl,
      onSuccess,
      onError,
      showAlert = true
    } = options;

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ApiResponse = await response.json();

      if (data.success) {
        // Call success callback if provided
        if (onSuccess) {
          onSuccess();
        }

        // Handle redirection
        if (redirectUrl) {
          if (typeof window !== 'undefined') {
            window.location.href = redirectUrl;
          }
        }

        return true;
      } else {
        const errorMessage = data.message || 'Logout failed';
        
        if (onError) {
          onError(errorMessage);
        } else if (showAlert) {
          alert(errorMessage);
        }
        
        console.error('Logout failed:', data.message);
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during logout';
      
      if (onError) {
        onError(errorMessage);
      } else if (showAlert) {
        alert('An error occurred during logout. Please try again.');
      }
      
      console.error('Logout error:', error);
      return false;
    }
  }


}

// Create and export a singleton instance
const authService = new AuthService();

// Export both the class and the instance
export { AuthService };
export default authService;