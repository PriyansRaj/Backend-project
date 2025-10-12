import mongoose, { Schema } from "mongoose";

const borrowRecordSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  book: {
    type: Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },
  borrowedAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
  },
  returnedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Borrowed", "Returned", "Overdue"],
    default: "Borrowed",
  },
}, { timestamps: true });

export const BorrowRecord = mongoose.model("BorrowRecord", borrowRecordSchema);
