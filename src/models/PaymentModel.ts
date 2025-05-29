// PaymentModel.ts
import mongoose, { Document, Schema } from 'mongoose';

// Payment interface for TypeScript type checking
export interface IPayment {
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  referenceId: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  level: string;
  feeType: string;
}

// Interface for the Payment document
export interface IPaymentDocument extends IPayment, Document {}

// Payment schema definition
const PaymentSchema = new Schema<IPaymentDocument>(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD',
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now,
    },
    referenceId: {
      type: String,
      required: [true, 'Reference ID is required'],
      unique: true,
    },
    status: {
      type: String,
      enum: {
        values: ['completed', 'pending', 'failed'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
    },
    level: {
      type: String,
      required: [true, 'Level information is required'],
      index: true,
    },
    feeType: {
      type: String,
      required: [true, 'Fee type is required'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient querying
PaymentSchema.index({ studentId: 1, semester: 1 });
PaymentSchema.index({ paymentDate: -1 });

// Virtual for formatted amount with currency
PaymentSchema.virtual('formattedAmount').get(function(this: IPaymentDocument) {
  return `${this.currency} ${this.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
});

// Instance method to get payment status with color
PaymentSchema.methods.getStatusWithColor = function(): { status: string; color: string } {
  switch(this.status) {
    case 'completed':
      return { status: 'Completed', color: 'green' };
    case 'pending':
      return { status: 'Pending', color: 'orange' };
    case 'failed':
      return { status: 'Failed', color: 'red' };
    default:
      return { status: this.status, color: 'gray' };
  }
};

// Instance method to create a payment receipt description
PaymentSchema.methods.getReceiptDescription = function(): string {
  return `Payment of ${this.formattedAmount} for ${this.feeType} - ${this.semester} semester`;
};

// Static method to find payments by student and semester
PaymentSchema.statics.findByStudentAndSemester = function(studentId: string, semester: string) {
  return this.find({ studentId, semester });
};

// Static method to get total paid amount by student
PaymentSchema.statics.getTotalPaidByStudent = async function(studentId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { studentId, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Add pre-save hook for validation
PaymentSchema.pre('save', function(next) {
  if (this.isNew && !this.paymentDate) {
    this.paymentDate = new Date();
  }
  next();
});

// Create the Payment model
const PaymentModel = mongoose.models.Payment || mongoose.model<IPaymentDocument>("Payment", PaymentSchema);

export default PaymentModel;