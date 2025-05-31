import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { ApiResponse } from '../../../../../types';
import UserModel from '@/models/User';
import { connectDB } from '@/config/connectDB';

// GET - Retrieve user's bank details
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

    return NextResponse.json<ApiResponse>({
      message: 'Bank details fetched successfully',
      success: true,
      data: {
        bankDetails: {
          accountName: userDoc.bankDetails?.accountName || '',
          bankName: userDoc.bankDetails?.bankName || '',
          accountNumber: userDoc.bankDetails?.accountNumber || ''
        }
      }
    });

  } catch (error) {
    console.error('Bank details fetch error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error',
      error: `Failed to fetch bank details: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}

// POST - Add/Update user's bank details
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    console.log('Authenticated user ID:', user.userId); // Debug log

    // Parse request body
    const body = await request.json();
    const { accountName, bankName, accountNumber } = body;

    console.log('Request body:', body); // Debug log

    // Validate required fields
    if (!accountName || !bankName || !accountNumber) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'All bank details fields are required',
        error: 'Missing fields: ' + [
          !accountName && 'accountName',
          !bankName && 'bankName', 
          !accountNumber && 'accountNumber'
        ].filter(Boolean).join(', ')
      }, { status: 400 });
    }

    // Validate account number (basic validation)
    if (accountNumber.toString().length < 10) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Account number must be at least 10 digits'
      }, { status: 400 });
    }

    // Find user document
    const userDoc = await UserModel.findById(user.userId);
    if (!userDoc) {
      console.error('User document not found for ID:', user.userId);
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    console.log('Found user document:', userDoc._id); // Debug log

    // Update bank details using findByIdAndUpdate for better reliability
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.userId,
      {
        $set: {
          bankDetails: {
            accountName: accountName.toString().trim(),
            bankName: bankName.toString().trim(),
            accountNumber: accountNumber.toString().trim()
          }
        }
      },
      { 
        new: true, // Return updated document
        runValidators: true, // Run schema validators
        upsert: false // Don't create if not exists
      }
    );

    if (!updatedUser) {
      console.error('Failed to update user document');
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Failed to update user'
      }, { status: 500 });
    }

    console.log('User updated successfully:', updatedUser._id); // Debug log

    return NextResponse.json<ApiResponse>({
      message: 'Bank details saved successfully',
      success: true,
      data: {
        bankDetails: {
          accountName: updatedUser.bankDetails?.accountName || '',
          bankName: updatedUser.bankDetails?.bankName || '',
          accountNumber: updatedUser.bankDetails?.accountNumber || '',
        }
      }
    });

  } catch (error) {
    console.error('Bank details save error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error',
      error: `Failed to save bank details: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}

// PUT - Update existing bank details
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Parse request body
    const { accountName, bankName, accountNumber } = await request.json();

    // Validate required fields
    if (!accountName || !bankName || !accountNumber) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'All bank details fields are required'
      }, { status: 400 });
    }

    // Check if user exists and has bank details
    const userDoc = await UserModel.findById(user.userId);
    if (!userDoc) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    if (!userDoc.bankDetails) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'No existing bank details found. Use POST to create new bank details.'
      }, { status: 404 });
    }

    // Update using findByIdAndUpdate
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.userId,
      {
        $set: {
          bankDetails: {
            accountName: accountName.toString().trim(),
            bankName: bankName.toString().trim(),
            accountNumber: accountNumber.toString().trim()
          }
        }
      },
      { 
        new: true,
        runValidators: true
      }
    );

    return NextResponse.json<ApiResponse>({
      message: 'Bank details updated successfully',
      success: true,
      data: {
        bankDetails: {
          accountName: updatedUser?.bankDetails?.accountName || '',
          bankName: updatedUser?.bankDetails?.bankName || '',
          accountNumber: updatedUser?.bankDetails?.accountNumber || '',
        }
      }
    });

  } catch (error) {
    console.error('Bank details update error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error',
      error: `Failed to update bank details: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}

// DELETE - Remove bank details
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Authentication required'
      }, { status: 401 });
    }

    // Use findByIdAndUpdate to unset bank details
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.userId,
      {
        $unset: { bankDetails: 1 }
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      message: 'Bank details removed successfully',
      success: true,
      data: {}
    });

  } catch (error) {
    console.error('Bank details delete error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Server error',
      error: `Failed to delete bank details: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }, { status: 500 });
  }
}