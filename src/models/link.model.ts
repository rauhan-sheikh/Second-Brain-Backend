import { Document, model, Schema, Types } from "mongoose";

export interface ILink extends Document {
  hash: string;
  userId: Types.ObjectId;
}

const linkSchema = new Schema<ILink>({
  hash: { type: String, required: true, unique: true },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
});

export const LinkModel = model<ILink>("Link", linkSchema);
