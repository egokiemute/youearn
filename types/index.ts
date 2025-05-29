export interface SignupData {
  email: string;
  password: string;
  telegramUsername: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserData {
  id: string;
  email: string;
  telegramUsername: string;
  referralCode: string;
  telegramJoined: boolean;
  createdAt?: Date;
  wasReferred?: boolean; // Indicates if the user was referred by someone
  referredBy?: string | null; // The referral code of the user who referred this user
  role?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  telegramJoinedCount: number;
  referralDetails: Array<{
    email: string;
    telegramUsername: string;
    createdAt: Date;
    referralCode: string;
    telegramJoined: boolean;
  }>;
  referralLink: string;
}

export interface AdminUserData {
  _id: string;
  email: string;
  telegramUsername: string;
  referralCode: string;
  telegramJoined: boolean;
  createdAt: Date;
  referralCount: number;
  telegramJoinedReferrals: number;
  role: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: UserData; // Replace 'any' with your actual user type if available
    referralStats?: ReferralStats;
    telegramJoined?: boolean;
    username?: string;
    users?: AdminUserData[];
     summary?: {
      totalUsers: number;
      totalReferrals: number;
      totalTelegramJoined: number;
      averageReferralsPerUser: number | string;
    };
    nextStep?: 'telegram-join' | 'profile-complete';
  };
  error?: string;
}