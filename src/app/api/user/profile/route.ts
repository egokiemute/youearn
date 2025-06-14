import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '../../../../../types';
import UserModel from '@/models/User';
import { connectDB } from '@/config/connectDB';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
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

    // Calculate referral stats manually since getReferralStats is a static method
    const referrals = await UserModel.find({ referredBy: userDoc.referralCode });
    const totalReferrals = referrals.length;
    const telegramJoinedCount = referrals.filter(r => r.telegramJoined).length;
    const referralDetails = referrals.map(r => ({
      email: r.email,
      telegramUsername: r.telegramUsername,
      createdAt: r.createdAt,
      referralCode: r.referralCode,
      telegramJoined: r.telegramJoined
    }));
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${userDoc.referralCode}`;
    const referralStats = {
      totalReferrals,
      telegramJoinedCount,
      referralDetails,
      referralLink
    };

    return NextResponse.json<ApiResponse>({
      message: 'User profile fetched successfully',
      success: true,
      data: {
      user: {
        id: userDoc._id.toString(),
        email: userDoc.email,
        telegramUsername: userDoc.telegramUsername,
        referralCode: userDoc.referralCode,
        telegramJoined: userDoc.telegramJoined,
        createdAt: userDoc.createdAt,
        role: userDoc.role,
        accountName: userDoc.bankDetails?.accountName,
        accountNumber: userDoc.bankDetails?.accountNumber,
        bankName: userDoc.bankDetails?.bankName,
        wasReferred: !!userDoc.referredBy,
        referredBy: userDoc.referredBy ? userDoc.referredBy.toString() : null
      },
      referralStats
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error',
      error: `Failed to user profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}