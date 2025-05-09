import { string } from "joi";
import mongoose, { Schema, Document } from "mongoose";
import { type } from "os";

export interface Iuser extends Document {
  googleId: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    googleId: { type: String, default: "" },
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model<Iuser>("User", UserSchema);
