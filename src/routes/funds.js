import { Router } from "express";
import Fund from "../models/Fund.js";
import auth from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
const router = Router();
router.use(auth);
router.get("/", asyncHandler(async (req, res) => {
  const filter = { user: req.userId };
  if (req.query.direction) filter.direction = req.query.direction;
  if (req.query.status) filter.status = req.query.status;
  const funds = await Fund.find(filter).sort({ date: -1 });
  res.json({ funds });
}));
router.post("/", asyncHandler(async (req, res) => {
  const { direction, person, amount, date } = req.body;
  if (!["lent", "borrowed"].includes(direction) || !person?.trim() || !Number.isFinite(Number(amount)) || Number(amount) <= 0 || !date) return res.status(400).json({ message: "Direction, person, valid amount and date are required." });
  const fund = await Fund.create({ ...req.body, user: req.userId, amount: Number(amount) });
  res.status(201).json({ fund });
}));
router.post("/:id/repayments", asyncHandler(async (req, res) => {
  const fund = await Fund.findOne({ _id: req.params.id, user: req.userId });
  if (!fund) return res.status(404).json({ message: "Fund record not found" });
  const amount = Number(req.body.amount);
  const remaining = fund.amount - fund.repayments.reduce((s, r) => s + r.amount, 0);
  if (!Number.isFinite(amount) || amount <= 0 || amount > remaining + 0.001) return res.status(400).json({ message: `Enter a repayment up to ₹${remaining.toFixed(2)}.` });
  fund.repayments.push({ amount, date: req.body.date || new Date(), note: req.body.note || "" });
  const paid = fund.repayments.reduce((s, r) => s + r.amount, 0);
  fund.status = paid >= fund.amount - 0.001 ? "settled" : "pending";
  await fund.save();
  res.json({ fund });
}));
router.route("/:id")
  .put(asyncHandler(async (req, res) => {
    const fund = await Fund.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true, runValidators: true });
    if (!fund) return res.status(404).json({ message: "Fund record not found" });
    res.json({ fund });
  }))
  .delete(asyncHandler(async (req, res) => {
    const fund = await Fund.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!fund) return res.status(404).json({ message: "Fund record not found" });
    res.json({ message: "Fund record deleted" });
  }));
export default router;
