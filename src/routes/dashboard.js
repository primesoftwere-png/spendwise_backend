import { Router } from "express";
import Expense from "../models/Expense.js";
import Fund from "../models/Fund.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
const router = Router();
router.use(auth);
router.get("/summary", asyncHandler(async (req, res) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const [expenseAgg, recentExpenses, funds] = await Promise.all([
    Expense.aggregate([{ $match: { user: (await import("mongoose")).default.Types.ObjectId.createFromHexString(req.userId), date: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    Expense.find({ user: req.userId }).sort({ date: -1 }).limit(5),
    Fund.find({ user: req.userId })
  ]);
  const open = funds.filter(f => f.status !== "settled");
  const balance = f => Math.max(0, f.amount - f.repayments.reduce((s, r) => s + r.amount, 0));
  res.json({
    monthExpense: expenseAgg[0]?.total || 0,
    monthCount: expenseAgg[0]?.count || 0,
    lentOutstanding: open.filter(f => f.direction === "lent").reduce((s, f) => s + balance(f), 0),
    borrowedOutstanding: open.filter(f => f.direction === "borrowed").reduce((s, f) => s + balance(f), 0),
    recentExpenses
  });
}));
export default router;
