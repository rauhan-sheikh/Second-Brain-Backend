import { Schema, model, Document } from "mongoose";

export interface ITag extends Document {
  name: string;
}

const tagSchema = new Schema<ITag>({
  name: { type: String, required: true, unique: true, trim: true },
});

export const TagModel = model<ITag>("Tag", tagSchema);
