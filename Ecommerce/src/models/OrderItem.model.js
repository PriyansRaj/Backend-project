import mongoose, { Schema } from 'mongoose';

const orderItemSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    subtotal: {
      type: Number,
      min: [0, 'Subtotal cannot be negative'],
    },
  },
  { timestamps: true }
);

orderItemSchema.pre('save', function (next) {
  this.subtotal = this.price * this.quantity;
  next();
});

orderItemSchema.index({ order: 1, product: 1 });

export const OrderItem = mongoose.model('OrderItem', orderItemSchema);
