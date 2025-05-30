import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';

// Define the structure of your JWT payload
interface TokenPayload {
  userId?: string;
  id?: string;
  role?: string;
  email?: string;
  name?: string;
  username?: string;
  iat?: number;
  exp?: number;
}

// Helper function to verify JWT token
async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET as string);
    const { payload } = await jwtVerify(token, secret);
    return payload as TokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Get token from cookies or Authorization header
  const tokenFromCookie = request.cookies.get('token')?.value;
  const authHeader = request.headers.get('authorization');
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  const token = tokenFromCookie || tokenFromHeader;
  
  // Verify token and get user data
  let user: TokenPayload | null = null;
  if (token) {
    user = await verifyToken(token);
  }

  // API routes that should not be redirected
  if (pathname.startsWith('/api/')) {
    // For API routes, just add user info to headers if authenticated
    if (user) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.userId || user.id || '');
      requestHeaders.set('x-user-role', user.role || '');
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    return NextResponse.next();
  }

  // If user is authenticated and trying to access login/signup pages,
  // redirect them to the appropriate dashboard based on role
  if (user && (pathname === '/login' || pathname === '/signup')) {
    const redirectPath = user.role === 'admin' ? '/admin' : '/profile';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Protected routes - require authentication
  const protectedRoutes = ['/profile', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute && !user) {
    // Redirect to login page for unauthenticated users
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - require admin role
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // Add user info to request headers for server components
  if (user) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId || user.id || '');
    requestHeaders.set('x-user-role', user.role || '');
    requestHeaders.set('x-user-email', user.email || '');
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: [
    // Protected routes
    '/profile/:path*',
    '/admin/:path*',
    // Auth routes
    '/login',
    '/signup',
    // API routes (optional, if you want to add user context)
    '/api/:path*',
  ]
};