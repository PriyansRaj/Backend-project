import mongoose, { Schema } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      lowercase: true,
      trim: true,
      unique: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name must not exceed 50 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: 'No description provided',
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      url: {
        type: String,
        validate: {
          validator: (v) => !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v),
          message: 'Invalid image URL format',
        },
      },
      public_id: String,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
