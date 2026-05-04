import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRouter from "./routes/auth";
import contentRouter from "./routes/content";
import linkRouter from "./routes/link";
import { connectDB } from "./db";

const app = express();
const PORT = process.env.PORT || 3000;

const start = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not defined in environment variables");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    process.exit(1);
  }

  app.use(helmet());
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/content", contentRouter);
  app.use("/api/v1/brain", linkRouter);

  connectDB()
    .then(() => {
      console.log("Connected to the database");
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Database connection error:", err);
    });
};

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
