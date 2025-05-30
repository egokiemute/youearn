import { NextResponse } from "next/server";
import { ApiResponse } from "../../../../../types";

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json<ApiResponse>({
      success: true,
      message: "Logout successful",
    });

    // Clear the token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/',
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Server error during logout",
        error: `Failed to logout: ${error instanceof Error ? error.message : 'Unknown error'}`,
      },
      { status: 500 }
    );
  }
}