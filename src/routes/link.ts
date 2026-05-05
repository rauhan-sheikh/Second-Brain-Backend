import express, { Request, Response } from "express";
import { ContentModel } from "../models/content.model";
import { LinkModel } from "../models/link.model";
import { userMiddleware, AuthRequest } from "../middleware";
import { z, ZodError } from "zod";
import crypto from "crypto";
import { UserModel } from "../models/user.model";

const router = express.Router();

const shareSchema = z.object({
  share: z.boolean(),
});

router.get("/", userMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const link = await LinkModel.findOne({ userId });

    if (link) {
      res.status(200).json({
        share: true,
        message: "Shareable link available",
        shareLink: `${link.hash}`,
      });
    } else {
      res.status(200).json({ share: false, message: "No shareable link" });
    }
  } catch (error) {
    console.error("Error fetching shareable link:", error);
    res.status(500).json({ message: "Server error" });
  }
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
          shareLink: `${link.hash}`,
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
  },
);

router.get("/:shareLink", async (req: Request, res: Response) => {
  try {
    const { shareLink } = req.params;

    const linkData = await LinkModel.findOne({ hash: shareLink }).populate(
      "userId",
      "username",
    );
    if (!linkData) {
      return res.status(404).json({ message: "Link not found" });
    }

    const contents = await ContentModel.find({
      userId: linkData.userId,
    }).populate("tags", "name");
    res
      .status(200)
      .json({ username: (linkData.userId as any).username, contents });
  } catch (error) {
    console.error("Error fetching shared content:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
