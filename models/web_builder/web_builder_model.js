import mongoose from "mongoose";

const websiteSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  brandName: {
    type: String,
    required,
  },
  websiteType: {
    type: String,
    enum: ["basic", "ecommerce"],
    required,
  },
  description: {
    type: String,
    required,
  },
  logo: {
    type: String,
    required,
  },

  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },

  websiteStyle: {
    fontType: String,
    colorSchema: {
      primaryColor: String,
      secondColor: String,
      backgroundColor: String,
      fontColor: String,
    },
  },

  //website Settings Schema
  websiteSettings: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WebsiteSetting",
    required: true,
  },
});

export const websiteModel = mongoose.model("Website", websiteSchema);
