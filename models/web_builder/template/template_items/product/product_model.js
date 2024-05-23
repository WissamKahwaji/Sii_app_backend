import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  ecommerceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  title: String,
  description: String,
  productProps: [
    {
      price: double,
      discount: double,
      weight: double,
    },
  ],
});

export const productModel = mongoose.model("Product", productSchema);
