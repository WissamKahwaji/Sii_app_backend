import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const adminModel = mongoose.model("Admin", adminSchema);
