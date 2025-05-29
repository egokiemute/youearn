import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import connectDB from '@/config/connectDB';
import { ApiResponse } from '../../../../../types';
import UserModel from '@/models/User';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }
    
    const userDoc = await UserModel.findById(user.userId);
    if (!userDoc) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    userDoc.telegramJoined = true;
    await userDoc.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Telegram join status updated successfully',
      data: { telegramJoined: true }
    });

  } catch (error: any) {
    console.error('Telegram join update error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error',
      error: error.message
    }, { status: 500 });
  }
}