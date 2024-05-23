import mongoose from "mongoose";

const contactContentSchema = new mongoose.Schema({
  titleOne: String,
  titleTwo: String,
  phoneNumber: String,
  mobileOne: String,
  mobileTwo: String,
  location: String,
  email: String,
  emailOne: String,
  poBox: String,
  whatsApp: String,
  faceBook: String,
  linkedIn: String,
  instagram: String,
  threads: String,
  snapChat: String,
  googleMap: String,
});

const contactSchema = new mongoose.Schema({
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Template",
    required: true,
  },
  title: String,
  img: String,
  content: { contactContentSchema },
});

export const contactModel = mongoose.model("contactUs", contactSchema);
