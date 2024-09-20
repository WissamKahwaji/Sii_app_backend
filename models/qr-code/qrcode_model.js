import mongoose from "mongoose";

const qrCodeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  webSite: String,
  whatsApp: String,
  faceBook: String,
  linkedIn: String,
  instagram: String,
  threads: String,
  snapChat: String,
  youtube: String,
  tiktok: String,
  xPlatform: String,
  painterest: String,
  otherLink: String,
  companyProfile: String,
  location: String,
  androidLink: String,
  iosLink: String,
});

export const qrCodeModel = mongoose.model("qrCode", qrCodeSchema);
