import mongoose, { Schema } from 'mongoose';

const orderSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User id is required'],
    },
    status: {
      type: String,
      enum: ['placed', 'cancelled', 'delievered', 'onway'],
      default: 'placed',
      required: true,
      lowercase: true,
    },
    total_amount: {
      type: Number,
      default: 0,
      min: [0, 'Total amount cannot be zero'],
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
