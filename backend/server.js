import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import submoduleRoutes from "./routes/submoduleRoutes.js";
import moduleRoutes from "./routes/moduleRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import metadataRoutes from "./routes/metadataRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV !== "test") {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/edtech";
  const options = {};
  
  // Force dbName to 'edtech' if not explicitly set in URI or if we want to be certain
  if (!mongoUri.includes("/edtech")) {
    options.dbName = "edtech";
  }

  mongoose
    .connect(mongoUri, options)
    .then(() => {
      const dbName = mongoose.connection.name;
      console.log(`MongoDB connected: ${dbName}`);
    })
    .catch((err) => console.error("MongoDB connection error:", err));
}

app.get("/", (_req, res) => res.json({ message: "EdTech API running" }));
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/submodules", submoduleRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/metadata", metadataRoutes);
app.use("/api/translation", translationRoutes);

// Global Error Handler for Production
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" 
      ? "An internal server error occurred." 
      : err.message
  });
});

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
