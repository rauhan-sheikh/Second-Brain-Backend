import express, { Request, Response } from "express";
import { z, ZodError } from "zod";
import { ContentModel, ContentType } from "../models/content.model";
import { TagModel } from "../models/tag.model";
import { userMiddleware } from "../middleware";

const router = express.Router();

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().url("Invalid URL format"),
  tags: z.array(z.string()).optional(),
  type: z.enum([
    ContentType.ARTICLE,
    ContentType.TWEET,
    ContentType.VIDEO,
    ContentType.BOOK,
    ContentType.OTHER,
  ]),
});

router.post("/", userMiddleware, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      link,
      tags = [],
      type,
    } = contentSchema.parse(req.body);
    const userId = (req as any).userId;

    const uniqueTags = [
      ...new Set(tags.map((tag) => tag.trim().toLowerCase())),
    ];

    const existingTags = await TagModel.find({ name: { $in: uniqueTags } });
    const existingTagNames = existingTags.map((tag) => tag.name);

    const newTagNames = uniqueTags.filter(
      (tag) => !existingTagNames.includes(tag)
    );
    const newTags = newTagNames.length
      ? await TagModel.insertMany(newTagNames.map((name) => ({ name })))
      : [];

    const tagIds = [
      ...existingTags.map((tag) => tag._id),
      ...newTags.map((tag) => tag._id),
    ];

    const content = await ContentModel.create({
      title,
      description,
      link,
      tags: tagIds,
      type,
      userId,
    });

    res.status(201).json({ message: "Content added successfully", content });
  } catch (err) {
    console.error("error creating content:", err);
    if (err instanceof ZodError) {
      return res.status(400).json({ errors: err.issues });
    }
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", userMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const contents = await ContentModel.find({ userId: userId })
      .populate("userId", "username")
      .populate("tags", "name");
    res.status(200).json({ contents });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/", userMiddleware, async (req: Request, res: Response) => {
  try {
    const { contentId } = req.body;
    if (!contentId) {
      return res.status(400).json({ message: "Content ID is required" });
    }

    const userId = (req as any).userId;
    const content = await ContentModel.findOneAndDelete({
      _id: contentId,
      userId: userId,
    });

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
