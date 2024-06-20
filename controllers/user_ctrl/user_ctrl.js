import { userModel } from "../../models/user/user_model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import dotenv from "dotenv";
import { PostModel } from "../../models/posts/post_model.js";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { siiCardModel } from "../../models/sii_card/sii_card_model.js";

dotenv.config();

export const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(404).json({
      success: false,
      message: "Invalid email or password",
    });
  }
  try {
    let existingUser;
    if (/\S+@\S+\.\S+/.test(email)) {
      // If identifier is an email
      existingUser = await userModel.findOne({ email: email });
    } else if (/^\+?\d+$/.test(email)) {
      console.log("mobile");
      // If identifier is a mobile number, remove any non-digit characters

      existingUser = await userModel.findOne({
        mobileNumber: email.toString(),
      });
    } else {
      // If identifier is a username
      existingUser = await userModel.findOne({ userName: email });
    }
    if (!existingUser)
      return res.status(401).json({ message: "User doesn't exist." });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect)
      return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      result: existingUser,
      message: "LogIn Successfuled",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const switchAccount = async (req, res) => {
  const id = req.userId;
  const { email } = req.body;
  if (!email) {
    return res.status(404).json({
      success: false,
      message: "Invalid email",
    });
  }
  try {
    const mainUser = await userModel.findById(id);
    if (!mainUser)
      return res.status(401).json({ message: "User doesn't exist." });
    const existingUser = await userModel.findOne({ email });
    if (!existingUser)
      return res.status(401).json({ message: "User doesn't exist." });
    if (mainUser.userName === existingUser.userName) {
      return res.status(401).json({ message: "You can't add same account" });
    }
    if (
      !mainUser.userAccounts.includes(existingUser._id) &&
      !existingUser.userAccounts.includes(mainUser._id)
    ) {
      existingUser.userAccounts.push(mainUser._id);

      mainUser.userAccounts.push(existingUser._id);
    }

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    await existingUser.save();
    await mainUser.save();
    res.status(200).json({
      result: existingUser,
      message: "LogIn Successfuled",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signUp = async (req, res) => {
  try {
    const { userName, fullName, email, password } = req.body;
    // const profileImage = req.files["profileImage"]
    //   ? req.files["profileImage"][0]
    //   : null;
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json(error);
    }
    // const profileUrlImage = profileImage
    //   ? "http://localhost:5001/" + profileImage.path.replace(/\\/g, "/")
    //   : null;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(422)
        .json({ message: "User already exists, please login!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(req.body);

    const qrCodeUrl = await QRCode.toDataURL(
      `https://www.siiapp.net/${userName}/qrcode-info`
    );

    const newUser = await userModel.create({
      userName: userName,
      fullName: fullName,
      email: email,
      password: hashedPassword,
      qrCodeUrl: qrCodeUrl,
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    console.log("success");

    return res.status(201).json({
      result: newUser,
      message: "User created",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const id = req.userId;
    const user = await userModel.findById(id).select("-password");
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getUserByUserName = async (req, res) => {
  try {
    const { userName } = req.params;

    const user = await userModel
      .findOne({ userName: userName })
      .select("-password");

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserByUserCategory = async (req, res) => {
  try {
    const { userCategory } = req.params;
    const users = await userModel.find({ userCategory: userCategory });
    return res.status(200).json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserFollowings = async (req, res) => {
  try {
    const id = req.userId;
    const userFollowings = await userModel
      .findById(id)
      .select(["userName", "fullName", "followings"])
      .populate("followings");
    const followings = userFollowings.followings;
    return res.status(200).json(followings);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const id = req.userId;
    const userFollowers = await userModel
      .findById(id)
      .select(["userName", "fullName", "followers"])
      .populate("followers");
    const followers = userFollowers.followers;
    return res.status(200).json(followers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const getUserAccounts = async (req, res) => {
  try {
    const id = req.userId;
    const userAccounts = await userModel
      .findById(id)
      .select(["userName", "fullName", "userAccounts"])
      .populate("userAccounts");
    const accounts = userAccounts.userAccounts;
    return res.status(200).json(accounts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const signupWithAddAccount = async (req, res) => {
  try {
    const { userName, fullName, email, password } = req.body;
    const id = req.userId;

    const existingUser = await userModel.findById(id);
    if (!existingUser)
      return res.status(401).json({ message: "User doesn't exist." });

    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json(error);
    }

    const existingNewUser = await userModel.findOne({ email });
    if (existingNewUser) {
      return res
        .status(422)
        .json({ message: "User already exists, please login!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(req.body);

    const newUser = await userModel.create({
      userName: userName,
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    existingUser.userAccounts.push(newUser._id);
    console.log(existingUser.userAccounts);
    newUser.userAccounts.push(existingUser._id);
    await existingUser.save();
    await newUser.save();
    console.log("success");
    return res.status(201).json({
      result: newUser,
      message: "User created",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const addUserAccount = async (req, res) => {
  try {
    const id = req.userId;
    const { email, userName, password } = req.body;
    const existingUser = await userModel.findById(id);
    if (!existingUser)
      return res.status(401).json({ message: "User doesn't exist." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const getUserLikedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel
      .findById(userId)
      .select("likedPosts")
      .populate({
        path: "likedPosts",
        populate: {
          path: "owner",
          select: "fullName profileImage",
        },
      });
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }

    const likedPosts = user.likedPosts;
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const getUserSavedPosts = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel
      .findById(userId)
      .select("savedPosts")
      .populate({
        path: "savedPosts",
        populate: {
          path: "owner",
          select: "fullName profileImage",
        },
      });
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }

    const savedPosts = user.savedPosts;
    return res.status(200).json(savedPosts);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const editUserProfile = async (req, res) => {
  try {
    console.log("Edit User Profile");
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }

    const {
      fullName,
      bio,
      mobileNumber,
      socialMedia,
      userCategory,
      location,
      userAbout,
      isBusiness,
    } = req.body;
    console.log(isBusiness);
    const imgPath =
      req.files && req.files["profileImage"]
        ? req.files["profileImage"][0].path
        : null;
    const imgUrl = imgPath
      ? `${process.env.BASE_URL}/${imgPath.replace(/\\/g, "/")}`
      : null;

    if (fullName) user.fullName = fullName;
    if (bio) user.bio = bio;
    if (imgUrl) user.profileImage = imgUrl;
    if (mobileNumber) user.mobileNumber = mobileNumber;
    if (location) user.location = location;

    if (socialMedia) {
      user.socialMedia = {
        ...user.socialMedia,
        ...socialMedia,
      };
    }
    if (userCategory) user.userCategory = userCategory;
    if (userAbout) user.userAbout = userAbout;
    if (isBusiness) user.isBusiness = isBusiness;

    if (req.files && req.files["doc"]) {
      const doc = req.files["doc"][0];
      const urlDoc = `${process.env.BASE_URL}/${doc.path.replace(/\\/g, "/")}`;
      user.socialMedia.companyProfile = urlDoc;
    }
    const updatedUser = await user.save();
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};

export const toggleFollowUser = async (req, res) => {
  const { id: targetUserId } = req.params;
  const userId = req.userId;

  if (targetUserId === userId) {
    return res
      .status(400)
      .json({ error: "You cannot follow/unfollow yourself." });
  }

  try {
    // Find the authenticated user and the target user
    const user = await userModel.findById(userId);
    const targetUser = await userModel.findById(targetUserId);

    if (!user || !targetUser) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if the user is already following the target user
    const isFollowing = user.followings.includes(targetUserId);

    if (isFollowing) {
      // Unfollow logic
      user.followings = user.followings.filter(
        id => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== userId
      );
      await user.save();
      await targetUser.save();
      res.status(200).json({ message: "Unfollowed successfully." });
    } else {
      // Follow logic
      user.followings.push(targetUserId);
      targetUser.followers.push(userId);
      await user.save();
      await targetUser.save();
      res.status(200).json({ message: "Followed successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const search = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    // Search for users
    const users = await userModel
      .find({
        $or: [
          { userName: new RegExp(query, "i") },
          { fullName: new RegExp(query, "i") },
          { email: new RegExp(query, "i") },
        ],
      })
      .exec();

    // Search for posts
    const posts = await PostModel.find({
      $or: [
        { caption: new RegExp(query, "i") },
        { tags: new RegExp(query, "i") },
      ],
      postType: "image",
    })
      .populate({
        path: "owner",
        select: ["_id", "userName", "fullName"],
      })
      .exec();

    return res.json({ users, posts, query });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    console.log(email);
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json("User not found");
    }
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      auth: {
        user: "sii.app.developer@gmail.com",
        pass: "xyuf bypy grqf mlot",
      },
      secure: true,
    });
    const resetLink = `https://www.siiapp.net/reset-password/${resetToken}`;

    const mailOptions = {
      from: "sii.app.developer@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Email sent: " + info.response);
        console.log("Reset email sent successfully");
        return res.status(200).json("Reset email sent successfully");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  try {
    console.log("11111");
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findOne({
      _id: decodedToken.userId,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.status(201).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const generateUserQrCode = async (req, res) => {
  try {
    const { userName } = req.body;
    const existingUser = await userModel.findOne({ userName });
    if (!existingUser) {
      return res.status(422).json({ message: "User Not Found" });
    }
    const qrCodeUrl = await QRCode.toDataURL(
      `https://www.siiapp.net/${userName}/qrcode-info`
    );
    existingUser.qrCodeUrl = qrCodeUrl;
    await existingUser.save();
    return res.status(200).json("success generate Qr code");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await PostModel.deleteMany({ owner: userId });

    if (user.siiCard) {
      await siiCardModel.findByIdAndDelete(user.siiCard);
    }

    await userModel.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
