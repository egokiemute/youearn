import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import authOptions from "@/lib/authOptions";

interface SessionUser {
  role?: string;
  [key: string]: unknown;
}

interface Session {
  user?: SessionUser;
  expires?: string;
}

export async function GET() {
  try {
    // Using authOptions directly without req/res
    const session = await getServerSession(authOptions) as Session | null;

    // Check if session exists and has a user property
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if role exists on the user object
    const role = session.user.role;
    if (!role) {
      return NextResponse.json(
        { success: false, message: 'User role not defined' },
        { status: 403 }
      );
    }

    // Determine redirect path based on role
    const redirectPath = role === 'admin' ? '/admin/dashboard' : '/dashboard';

    return NextResponse.json({
      success: true,
      role: role,
      redirectPath: redirectPath
    });
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}