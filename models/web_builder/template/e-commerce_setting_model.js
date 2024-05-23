import mongoose from "mongoose";

const ecommerceSettingSchema = new mongoose.Schema({
  ecommerceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  storeName: String,
  country: String,
  currency: String,
});

export const ecommerceSettingModel = mongoose.model(
  "EcommerceSetting",
  ecommerceSettingSchema
);
