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
    otherCaptions: [String],
    link: String,
    whatsAppNumber: String,
    mobileNumber: String,
    discountPercentage: Number,
    startDiscountDate: String,
    endDiscountDate: String,
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
    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    agreedToPolicy: Boolean,
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
        },
        rating: Number,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / this.ratings.length;
};

export const PostModel = mongoose.model("post", postSchema);
