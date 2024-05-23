import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});

export const Comment = mongoose.model("Comment", commentSchema);
