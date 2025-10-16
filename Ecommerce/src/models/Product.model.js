import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    lowercase: true,
    trim: true,
    minlength: [2, "Product name must be at least 2 characters"],
    maxlength: [100, "Product name cannot exceed 100 characters"],
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description too long"],
    default: "No description available",
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  discount: {
    type: Number,
    min: [0, "Discount cannot be negative"],
    max: [90, "Discount cannot exceed 90%"],
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
    min: [0, "Stock cannot be negative"],
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: [true, "Category reference is required"],
  },
  brand: {
    type: String,
    trim: true,
    lowercase: true,
    default: "unbranded",
  },
  images: [
    {
      url: {
        type: String,
        required: [true, "Image URL is required"],
        validate: {
          validator: (v) => /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v),
          message: "Invalid image URL format",
        },
      },
      public_id: String,
    },
  ],
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

productSchema.virtual("finalPrice").get(function () {
  return this.price - (this.price * this.discount) / 100;
});

export const Product = mongoose.model("Product", productSchema);
