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
    //interesting posts
    interestingPosts: [
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
    followingsNumber: {
      type: Number,
      default: 0,
    },
    //followers
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: [],
      },
    ],
    followersNumber: {
      type: Number,
      default: 0,
    },
    isBusiness: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ["personal", "creator", "business"],
      default: "personal",
    },
    showLikedPosts: {
      type: String,
      enum: ["onlyYou", "everyone"],
      default: "onlyYou",
    },
    showSavedPosts: {
      type: String,
      enum: ["onlyYou", "everyone"],
      default: "onlyYou",
    },
    showInterestedPosts: {
      type: String,
      enum: ["onlyYou", "everyone"],
      default: "onlyYou",
    },
    showFollowingsList: {
      type: String,
      enum: ["onlyYou", "everyone"],
      default: "onlyYou",
    },
    userCategory: String,
    userAccounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: [],
      },
    ],
    // userSearch: [
    //   {
    //     type: String,
    //     default: [],
    //   },
    // ],
    userSearch: {
      users: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "Users",
      },
      posts: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "post",
      },
    },
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
      androidLink: String,
      iosLink: String,
    },
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        rating: { type: Number, required: true, min: 1, max: 5 },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
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

userSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return sum / this.ratings.length;
};

export const userModel = mongoose.model("Users", userSchema);
