import mongoose from "mongoose";
const repaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, required: true, default: Date.now },
  note: { type: String, trim: true, maxlength: 250, default: "" }
}, { _id: true });
const fundSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  direction: { type: String, enum: ["lent", "borrowed"], required: true },
  person: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0.01 },
  date: { type: Date, required: true },
  dueDate: { type: Date, default: null },
  purpose: { type: String, trim: true, maxlength: 120, default: "" },
  notes: { type: String, trim: true, maxlength: 500, default: "" },
  repayments: [repaymentSchema],
  status: { type: String, enum: ["pending", "settled"], default: "pending" }
}, { timestamps: true });
fundSchema.index({ user: 1, date: -1 });
fundSchema.virtual("repaidAmount").get(function () { return this.repayments.reduce((s, r) => s + r.amount, 0); });
fundSchema.virtual("balance").get(function () { return Math.max(0, this.amount - this.repaidAmount); });
fundSchema.set("toJSON", { virtuals: true });
fundSchema.set("toObject", { virtuals: true });
export default mongoose.model("Fund", fundSchema);
