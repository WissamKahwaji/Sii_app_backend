import mongoose from "mongoose";

const headerSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  home: Boolean,
  aboutUs: Boolean,
  contactUs: Boolean,
  products: Boolean,
  orders: Boolean,
});

export const headerModel = mongoose.model("header", headerSchema);
