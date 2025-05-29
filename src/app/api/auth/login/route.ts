import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validations';
import { generateToken } from '@/lib/auth';
import connectDB from '@/config/connectDB';
import { ApiResponse, LoginData } from '../../../../../types';
import UserModel from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body: LoginData = await request.json();
    
    // Validate request body
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid credentials'
      }, { status: 400 });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid credentials'
      }, { status: 400 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          telegramUsername: user.telegramUsername,
          referralCode: user.referralCode,
          telegramJoined: user.telegramJoined,
          role: user.role
        },
        token
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Validation errors',
        error: error.errors[0]?.message || 'Invalid input data'
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error during login',
      error: error.message
    }, { status: 500 });
  }
}