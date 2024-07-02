import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema({
  images: [String],
});

export const sliderModel = mongoose.model("slider", sliderSchema);
