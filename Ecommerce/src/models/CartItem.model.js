import mongoose, { Schema } from 'mongoose';

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.pre('save', async function (next) {
  if (!this.isModified('items')) return next();
  const Product = mongoose.model('Product');
  let total = 0;
  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) total += product.price * item.quantity;
  }
  this.totalAmount = total;
  next();
});

export const CartItem = mongoose.model('CartItem', cartSchema);
