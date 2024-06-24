import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    postType: {
      type: String,
      enum: ["video", "doc", "image"],
      default: "image",
    },
    images: [String],
    postVideo: String,
    coverVideoImage: String,
    coverPdfImage: String,
    postDocs: String,
    caption: String,
    link: String,
    whatsAppNumber: String,
    mobileNumber: String,
    discountPercentage: Number,
    discountFunctionType: {
      type: String,
      enum: ["get_offer", "send_message"],
    },
    tags: [String],
    //likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],

    //comments
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: [],
      },
    ],

    saves: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export const PostModel = mongoose.model("post", postSchema);
