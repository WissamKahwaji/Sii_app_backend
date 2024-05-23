import mongoose from "mongoose";

const websiteSettingSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Website",
    required: true,
  },
  favIcon: String,
  languages: [String],
});

export const websiteSettingModel = mongoose.model(
  "WebsiteSetting",
  websiteSettingSchema
);
