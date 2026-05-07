import { Schema, model, Document, Types } from "mongoose";

export enum ContentType {
  ARTICLE = "article",
  TWEET = "tweet",
  VIDEO = "video",
  BOOK = "book",
  OTHER = "other",
}

export interface IContent extends Document {
  title: string;
  description?: string;
  link: string;
  tags: Types.ObjectId[];
  type: ContentType;
  userId: Types.ObjectId;
}

const contentSchema = new Schema<IContent>({
  title: { type: String, required: true },
  link: { type: String },
  description: { type: String },
  tags: [{ type: Types.ObjectId, ref: "Tag" }],
  type: { type: String, enum: Object.values(ContentType), required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const ContentModel = model<IContent>("Content", contentSchema);
