import mongoose, { Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  _id?: mongoose.Types.ObjectId;
  email: string;
  password: string;
  telegramUsername: string;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referrals: mongoose.Types.ObjectId[];
  telegramJoined: boolean;
  role: string;
  bankDetails?: {
    accountName: string;
    bankName: string;
    accountNumber: string;
  };
  refreshToken: string;
  isVerified?: boolean;
  wasReferred?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserWithReferrals extends Omit<IUser, "referrals"> {
  referrals: IUser[];
}

// Define static methods interface
interface IUserStatics extends Model<IUser> {
  generateReferralCode(): Promise<string>;
  getReferralStats: (statsData: {
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
  }) => Promise<{
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
  }>;
  createWithReferral(userData: {
    email: string;
    password: string;
    telegramUsername: string;
    referralCode?: string; // This is the referrer's code
  }): Promise<IUser>;
  findByReferralCode(code: string): Promise<IUser | null>;
  getAllUsersWithStats(): Promise<IUserWithReferrals[]>;
  isValidReferralCode(code: string): boolean;
}

const userSchema = new mongoose.Schema<IUser, IUserStatics>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    telegramUsername: {
      type: String,
      required: true,
      trim: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referrals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
    },
    telegramJoined: { type: Boolean, default: false },
    wasReferred: { type: Boolean, default: false },
    role: { type: String, default: "user", enum: ["admin", "user"] },
    refreshToken: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ referralCode: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ email: 1 });

// Password hashing
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Static methods
userSchema.statics.generateReferralCode = async function (): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  let isUnique = false;

  while (!isUnique) {
    code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const existingUser = await this.findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code;
};

userSchema.statics.createWithReferral = async function (
  this: IUserStatics,
  userData: {
    email: string;
    password: string;
    telegramUsername: string;
    referralCode?: string; // This is the referrer's code, not the new user's code
  }
) {
  const { email, password, telegramUsername, referralCode } = userData;

  // Generate a new referral code for the new user
  const newUserReferralCode = await this.generateReferralCode();

  let referrer = null;
  if (referralCode) {
    referrer = await this.findOne({ referralCode: referralCode.toUpperCase() });
  }

  const newUser = new this({
    email,
    password,
    telegramUsername,
    referralCode: newUserReferralCode, // New user gets their own referral code
    referredBy: referrer?._id || null,
    wasReferred: !!referrer, // Set wasReferred based on whether referrer exists
  });

  await newUser.save();

  // Update the referrer's referrals array
  if (referrer) {
    await this.findByIdAndUpdate(
      referrer._id,
      { $push: { referrals: newUser._id } },
      { new: true }
    );
  }

  return newUser;
};

userSchema.statics.findByReferralCode = async function (code: string) {
  return await this.findOne({ referralCode: code.toUpperCase() });
};

userSchema.statics.getAllUsersWithStats = async function () {
  return await this.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "referredBy",
        as: "referredUsers",
      },
    },
    {
      $addFields: {
        referralCount: { $size: "$referredUsers" },
        telegramJoinedReferrals: {
          $size: {
            $filter: {
              input: "$referredUsers",
              cond: { $eq: ["$$this.telegramJoined", true] },
            },
          },
        },
      },
    },
    {
      $project: {
        email: 1,
        telegramUsername: 1,
        referralCode: 1,
        telegramJoined: 1,
        createdAt: 1,
        referralCount: 1,
        telegramJoinedReferrals: 1,
        role: 1,
        wasReferred: 1,
        referredBy: 1,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);
};

userSchema.statics.isValidReferralCode = function (code: string): boolean {
  return /^[a-zA-Z0-9]{5}$/.test(code);
};

// Instance methods
userSchema.methods.getWithReferrals =
  async function (): Promise<IUserWithReferrals> {
    await this.populate({
      path: "referrals",
      select: "email telegramUsername createdAt referralCode",
    });

    return {
      _id: this._id,
      email: this.email,
      password: this.password,
      telegramUsername: this.telegramUsername,
      referralCode: this.referralCode,
      referredBy: this.referredBy,
      referrals: this.referrals as IUser[],
      telegramJoined: this.telegramJoined,
      role: this.role,
      refreshToken: this.refreshToken,
      isVerified: this.isVerified,
      wasReferred: this.wasReferred,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  };

userSchema.methods.getReferralStats = async function () {
  const totalReferrals = this.referrals.length;
  const User = this.constructor as mongoose.Model<IUser>;

  const referralDetails = await User.find(
    { _id: { $in: this.referrals } },
    "email telegramUsername createdAt referralCode telegramJoined"
  ).sort({ createdAt: -1 });

  const telegramJoinedCount = referralDetails.filter(
    (r) => r.telegramJoined
  ).length;

  return {
    totalReferrals,
    telegramJoinedCount,
    referralDetails,
    referralLink: `https://youearn.vercel.app/${this.referralCode}`,
  };
};

userSchema.methods.updateTelegramJoined = async function () {
  this.telegramJoined = true;
  return await this.save();
};

// Final model
const UserModel =
  (mongoose.models.User as IUserStatics) ||
  mongoose.model<IUser, IUserStatics>("User", userSchema);

export default UserModel;
