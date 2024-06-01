import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    bio: String,
    siiCard: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SiiCard",
    },
    //posts
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        default: [],
      },
    ],
    //liked posts
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        default: [],
      },
    ],
    //saved posts
    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
        default: [],
      },
    ],
    //followings
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: [],
      },
    ],
    //followers
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: [],
      },
    ],
    userCategory: String,
    userAbout: {
      aboutUs: String,
      ourMission: String,
      ourVision: String,
    },
    socialMedia: {
      webSite: String,
      whatsApp: String,
      faceBook: String,
      linkedIn: String,
      instagram: String,
      threads: String,
      snapChat: String,
      youtube: String,
      xPlatform: String,
      painterest: String,
      otherLink: String,
    },
  },
  { timestamps: true },
  {
    toJSON: {
      select: "-password",
    },
  }
);

export const userModel = mongoose.model("Users", userSchema);
