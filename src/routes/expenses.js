import { Router } from "express";
import Expense from "../models/Expense.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
const router = Router();
router.use(auth);
router.get("/", asyncHandler(async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.from || req.query.to) filter.date = {};
  if (req.query.from) filter.date.$gte = new Date(req.query.from);
  if (req.query.to) filter.date.$lte = new Date(req.query.to);
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };
  const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 }).limit(500);
  res.json({ expenses });
}));
router.post("/", asyncHandler(async (req, res) => {
  const { title, amount, category, paymentMethod, date, notes } = req.body;
  if (!title?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !date || !category) return res.status(400).json({ message: "Title, valid amount, category and date are required." });
  const expense = await Expense.create({ user: req.userId, title, amount: Number(amount), category, paymentMethod, date, notes });
  res.status(201).json({ expense });
}));
router.route("/:id")
  .put(asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ expense });
  }))
  .delete(asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  }));
export default router;
