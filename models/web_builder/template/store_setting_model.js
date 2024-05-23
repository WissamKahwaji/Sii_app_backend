import mongoose from "mongoose";

const storeSettingSchema = new mongoose.Schema({
  ecommerceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  shipping: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "shipping",
    required: true,
  },
  taxes: String,
  payments: String,
});

export const storeSettingModel = mongoose.model(
  "StoreSetting",
  storeSettingSchema
);
