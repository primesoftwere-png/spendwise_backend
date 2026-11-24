import mongoose from "mongoose";
const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, enum: ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Education", "Other"] },
  paymentMethod: { type: String, enum: ["Cash", "UPI", "Card", "Bank Transfer", "Other"], default: "UPI" },
  date: { type: Date, required: true, index: true },
  notes: { type: String, trim: true, maxlength: 500, default: "" }
}, { timestamps: true });
expenseSchema.index({ user: 1, date: -1 });
export default mongoose.model("Expense", expenseSchema);
