import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  name: String,
  img: String,
  price: String,
  duration: String,
  session: Number,
  review: Number,
  description: String,
  category: String,
  lessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lessons",
      default: [],
    },
  ],
});

export const courseModel = mongoose.model("Course", courseSchema);
