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
    qrCodeUrl: { type: String },
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
    isBusiness: {
      type: Boolean,
      default: false,
    },
    userCategory: String,
    userAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: [],
      },
    ],
    userAbout: {
      aboutUs: String,
      ourMission: String,
      ourVision: String,
    },
    location: String,
    socialMedia: {
      webSite: String,
      whatsApp: String,
      faceBook: String,
      linkedIn: String,
      instagram: String,
      threads: String,
      snapChat: String,
      youtube: String,
      tiktok: String,
      xPlatform: String,
      painterest: String,
      otherLink: String,
      companyProfile: String,
    },
    resetToken: String,
    resetTokenExpiration: Date,
  },
  { timestamps: true },
  {
    toJSON: {
      select: "-password",
    },
  }
);

export const userModel = mongoose.model("Users", userSchema);
