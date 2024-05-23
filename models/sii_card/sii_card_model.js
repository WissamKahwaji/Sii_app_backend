import mongoose from "mongoose";

const siiCardSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
});

export const siiCardModel = mongoose.model("SiiCard", siiCardSchema);
