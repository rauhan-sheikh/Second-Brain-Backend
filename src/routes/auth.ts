import express, { Request, Response } from "express";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/user.model";
import { userMiddleware } from "../middleware";

const JWT_SECRET = process.env.JWT_SECRET!;

const router = express.Router();

const authSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be at most 30 characters long"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .max(128, "Password must be at most 128 characters long"),
});

router.post("/signup", async (req: Request, res: Response) => {
  console.log("Signup request received");
  try {
    const { username, password } = authSchema.parse(req.body);

    const existing = await UserModel.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ username, password: hashed });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ message: "Signup successful", token });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  console.log("Signin request received");
  try {
    const { username, password } = authSchema.parse(req.body);

    const user = await UserModel.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "Signin successful", token });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req: Request, res: Response) => {
  console.log("Reset password request received");
  try {
    const { username, password } = authSchema.parse(req.body);

    const user = await UserModel.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", userMiddleware, async (req: Request, res: Response) => {
  console.log("Get current user request received");
  try {
    const userId = (req as any).userId;
    const user = await UserModel.findById(userId).select("username");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ username: user.username });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
