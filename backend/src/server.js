import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from 'path';

import authRoutes from "./routes/authRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/rental_system";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

app.get("/", (req, res) => {
  res.json({ message: "Rental Agreement API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documents", documentRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

