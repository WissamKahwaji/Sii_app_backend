import mongoose from "mongoose";

const infoHelpSchema = new mongoose.Schema({
  title: String,
  titleAr: String,

  description: String,
  descriptionAr: String,
});

export const infoHelpModel = mongoose.model("help", infoHelpSchema);
