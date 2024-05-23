import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  websiteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Website",
    required: true,
  },
  templateType: {
    type: String,
    required,
  },
  //home
  //aboutus
  aboutUsPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "about",
    required: true,
  },
  //contact
  contactPage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contactUs",
    required: true,
  },
  //header
  headerSec: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "header",
    required: true,
  },
  //footer

  //products
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  ],

  //e-c-settings
  ecommerceSetting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EcommerceSetting",
    required: true,
  },

  //store-settings
  storeSetting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "StoreSetting",
    required: true,
  },
});

export const templateModel = mongoose.model("Template", templateSchema);
