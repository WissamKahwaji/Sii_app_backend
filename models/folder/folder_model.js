import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    images: [String],
    coverImg: String,
    caption: String,
    link: String,
    whatsAppNumber: String,
    mobileNumber: String,
  },
  { timestamps: true }
);

export const folderModel = mongoose.model("folder", folderSchema);
