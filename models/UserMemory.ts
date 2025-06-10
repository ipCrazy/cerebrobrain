import mongoose, { Schema, model, models } from "mongoose";

const UserMemorySchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

// Proverava da li model već postoji (sprečava grešku pri hot-reloadu)
const UserMemory = models.UserMemory || model("UserMemory", UserMemorySchema);

export default UserMemory;