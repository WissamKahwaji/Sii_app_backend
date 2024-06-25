import mongoose from "mongoose";

const cardPrivacyPolicySchema = new mongoose.Schema({
  titleEn: String,
  titleAr: String,
});

export const cardPrivacyPolicyModel = mongoose.model(
  "CardPrivacyPolicy",
  cardPrivacyPolicySchema
);
