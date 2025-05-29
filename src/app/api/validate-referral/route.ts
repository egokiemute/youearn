import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/config/connectDB';
import UserModel from '@/models/User';
import { ApiResponse } from '../../../../types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { referralCode } = await request.json();

    if (!referralCode) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Referral code is required'
      }, { status: 400 });
    }

    // Validate referral code format
    if (!UserModel.isValidReferralCode(referralCode)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid referral code format'
      }, { status: 400 });
    }

    // Check if referral code exists
    const referrer = await UserModel.findByReferralCode(referralCode);
    
    if (!referrer) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Referral code not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Valid referral code',
      data: {
        user: {
          id: referrer._id?.toString() || '',
          email: referrer.email,
          telegramUsername: referrer.telegramUsername,
          referralCode: referrer.referralCode,
          telegramJoined: referrer.telegramJoined,
          createdAt: referrer.createdAt,
          role: referrer.role
        }
      }
    });

  } catch (error: any) {
    console.error('Validate referral error:', error);
    
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error during referral validation',
      error: error.message
    }, { status: 500 });
  }
}