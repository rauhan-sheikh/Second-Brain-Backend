import express, { Request, Response } from "express";
import { ContentModel } from "../models/content.model";
import { LinkModel } from "../models/link.model";
import { userMiddleware, AuthRequest } from "../middleware";
import { z, ZodError } from "zod";
import crypto from "crypto";

const router = express.Router();

const shareSchema = z.object({
  share: z.boolean(),
});

router.post(
  "/share",
  userMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const { share } = shareSchema.parse(req.body);

      const userId = req.userId!;

      if (share) {
        let link = await LinkModel.findOne({ userId });

        if (!link) {
          const hash = crypto.randomBytes(6).toString("hex");
          link = await LinkModel.create({ userId, hash });
        }

        res.status(200).json({
          message: "Shareable link available",
          shareLink: `/api/v1/brain/${link.hash}`,
        });
      } else {
        await LinkModel.findOneAndDelete({ userId });
        res.status(200).json({ message: "Shareable link removed" });
      }
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ errors: err.issues });
      }

      console.error("Error processing share request:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/:shareLink", async (req: Request, res: Response) => {
  try {
    const { shareLink } = req.params;

    const link = await LinkModel.findOne({ hash: shareLink });
    if (!link) {
      return res.status(404).json({ message: "Link not found" });
    }

    const contents = await ContentModel.find({ userId: link.userId })
      .populate("userId", "username")
      .populate("tags", "name");
    res.status(200).json({ contents });
  } catch (error) {
    console.error("Error fetching shared content:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
