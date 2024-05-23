import mongoose from "mongoose";

const shippingSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreSetting",
    required: true,
  },
  shippingDetails: [
    {
      country: String,
      price: double,
    },
  ],
});

export const shippingModel = mongoose.model("shipping", shippingSchema);
