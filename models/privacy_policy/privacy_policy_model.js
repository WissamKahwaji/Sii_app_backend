import mongoose from "mongoose";

const privacyPolicySchema = new mongoose.Schema({
  titleEn: String,
  titleAr: String,
});

export const privacyPolicyModel = mongoose.model(
  "PrivacyPolicy",
  privacyPolicySchema
);
