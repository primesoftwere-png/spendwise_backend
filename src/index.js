import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";
import fundRoutes from "./routes/funds.js";
import dashboardRoutes from "./routes/dashboard.js";
dotenv.config();

const app = express();
app.use(helmet());
// make it open cors
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "SpendWise API" }));
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/funds", fundRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`SpendWise API listening on ${port}`)))
  .catch((err) => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
