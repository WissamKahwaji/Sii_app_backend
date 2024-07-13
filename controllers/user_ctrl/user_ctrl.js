import { userModel } from "../../models/user/user_model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import dotenv, { populate } from "dotenv";
import { PostModel } from "../../models/posts/post_model.js";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import { siiCardModel } from "../../models/sii_card/sii_card_model.js";
import mongoose from "mongoose";

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
      const normalizedEmail = email.toLowerCase();
      existingUser = await userModel.findOne({
        email: { $regex: new RegExp("^" + normalizedEmail + "$", "i") },
      });
    } else if (/^\+?\d+$/.test(email)) {
      console.log("mobile");
      // If identifier is a mobile number, remove any non-digit characters

      existingUser = await userModel.findOne({
        mobileNumber: email.toString(),
      });
    } else {
      // If identifier is a username
      const normalizedUsername = email.toLowerCase();
      existingUser = await userModel.findOne({
        userName: { $regex: new RegExp("^" + normalizedUsername + "$", "i") },
      });
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
    let existingUser;
    if (/\S+@\S+\.\S+/.test(email)) {
      // If identifier is an email
      const normalizedEmail = email.toLowerCase();
      existingUser = await userModel.findOne({
        email: { $regex: new RegExp("^" + normalizedEmail + "$", "i") },
      });
    } else if (/^\+?\d+$/.test(email)) {
      console.log("mobile");
      // If identifier is a mobile number, remove any non-digit characters

      existingUser = await userModel.findOne({
        mobileNumber: email.toString(),
      });
    } else {
      // If identifier is a username
      const normalizedUsername = email.toLowerCase();
      existingUser = await userModel.findOne({
        userName: { $regex: new RegExp("^" + normalizedUsername + "$", "i") },
      });
    }
    if (!existingUser)
      return res.status(401).json({ message: "User doesn't exist." });
    // const existingUser = await userModel.findOne({ email });
    // if (!existingUser)
    //   return res.status(401).json({ message: "User doesn't exist." });
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
    const {
      userName,
      fullName,
      email,
      password,
      mobileNumber,
      accountType,
      userCategory,
    } = req.body;

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
    let existingUser;
    const normalizedEmail = email.toLowerCase();
    existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(422)
        .json({ message: "User already exists, please login!" });
    }
    const normalizedUserName = userName.toLowerCase();
    existingUser = await userModel.findOne({ userName: normalizedUserName });
    if (existingUser) {
      return res
        .status(422)
        .json({ message: "User already exists, please login!" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(req.body);
    const options = {
      width: 500,
      margin: 2,
    };
    const qrCodeUrl = await QRCode.toDataURL(
      `https://www.siiplatform.com/${userName}/qrcode-info`,
      options
    );

    const newUser = await userModel.create({
      userName: normalizedUserName,
      fullName: fullName,
      email: normalizedEmail,
      password: hashedPassword,
      qrCodeUrl: qrCodeUrl,
      accountType: accountType,
    });
    if (mobileNumber) newUser.mobileNumber = mobileNumber;
    if (userCategory) newUser.userCategory = userCategory;
    if (accountType === "business") {
      newUser.isBusiness = true;
    }
    await newUser.save();
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    console.log("success");
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      secure: true,
      secureConnection: false,
      tls: {
        ciphers: "SSLv3",
      },
      requireTLS: true,
      port: 465,
      debug: true,
      connectionTimeout: 10000,
      auth: {
        user: process.env.NEW_ACCOUNT_MAIL,
        pass: process.env.NEW_ACCOUNT_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"SII" <Newaccounts@siimail.net>',
      to: email,
      replyTo: "no-reply@siimail.net",
      subject: `Welcome to the SII Platform!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #FECE59;">Welcome to SII, ${fullName}!</h2>
          <p>Dear ${fullName},</p>
          <p>Thank you for choosing SII. We are excited to have you on board and look forward to providing you with the best experience possible.</p>
          <p>Here are some resources to help you get started:</p>
          <ul>
            <li><a href="https://www.siiplatform.com/${userName}" style="color: #007bff;">Your Account</a></li>
            <li><a href="https://www.siiplatform.com/${userName}/qrcode-info" style="color: #007bff;">Your QR Code Info</a></li>
            <li><a href="https://www.siiplatform.com/help/mail" style="color: #007bff;">Help Center</a></li>
          </ul>
          <p>If you have any questions or need assistance, please do not hesitate to reach out to our support team at <a href="mailto:support@siiplatform.com" style="color: #007bff;">support@siiplatform.com</a>.</p>
          <p>Best regards,</p>
          <p style="color: #FECE59;"><strong>The SII Team</strong></p>
          <hr>
          <p style="font-size: 0.8em; color: #777;">This is an automated message, please do not reply to this email.</p>
        </div>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
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
    const { userId } = req.params;
    const userFollowings = await userModel
      .findById(userId)
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
    const { userId } = req.params;
    const userFollowers = await userModel
      .findById(userId)
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
    const {
      userName,
      fullName,
      email,
      password,
      mobileNumber,
      accountType,
      userCategory,
    } = req.body;
    const id = req.userId;

    const existingUser = await userModel.findById(id);
    if (!existingUser)
      return res.status(401).json({ message: "User doesn't exist." });

    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json(error);
    }

    // const existingNewUser = await userModel.findOne({ email });
    // if (existingNewUser) {
    //   return res
    //     .status(422)
    //     .json({ message: "User already exists, please login!" });
    // }
    let existingNewUser;
    const normalizedEmail = email.toLowerCase();
    existingNewUser = await userModel.findOne({ email: normalizedEmail });
    if (existingNewUser) {
      return res
        .status(422)
        .json({ message: "User already exists, please login!" });
    }
    const normalizedUserName = userName.toLowerCase();
    existingNewUser = await userModel.findOne({ userName: normalizedUserName });
    if (existingNewUser) {
      return res
        .status(422)
        .json({ message: "User already exists, please login!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(req.body);
    const options = {
      width: 500,
      margin: 2,
    };
    const qrCodeUrl = await QRCode.toDataURL(
      `https://www.siiplatform.com/${userName}/qrcode-info`,
      options
    );

    const newUser = await userModel.create({
      userName: userName,
      fullName: fullName,
      email: email,
      password: hashedPassword,
      qrCodeUrl: qrCodeUrl,
      accountType: accountType,
    });
    if (mobileNumber) newUser.mobileNumber = mobileNumber;
    if (userCategory) newUser.userCategory = userCategory;
    if (accountType === "business") {
      newUser.isBusiness = true;
    }
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
    const { userId } = req.params;
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
    const { userId } = req.params;
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

export const getUserInterestedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await userModel
      .findById(userId)
      .select("interestingPosts")
      .populate({
        path: "interestingPosts",
        populate: {
          path: "owner",
          select: "fullName profileImage",
        },
      });
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }

    const interestingPosts = user.interestingPosts;
    return res.status(200).json(interestingPosts);
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
      accountType,
      showLikedPosts,
      showSavedPosts,
      showInterestedPosts,
      showFollowingsList,
    } = req.body;

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
    if (showLikedPosts) user.showLikedPosts = showLikedPosts;
    if (showSavedPosts) user.showSavedPosts = showSavedPosts;
    if (showInterestedPosts) user.showInterestedPosts = showInterestedPosts;
    if (showFollowingsList) user.showFollowingsList = showFollowingsList;
    if (accountType) user.accountType = accountType;
    if (accountType === "business") {
      user.isBusiness = true;
    } else {
      user.isBusiness = false;
    }

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
      user.followingsNumber = user.followingsNumber - 1;
      targetUser.followers = targetUser.followers.filter(
        id => id.toString() !== userId
      );
      targetUser.followersNumber = targetUser.followersNumber - 1;
      await user.save();
      await targetUser.save();
      res.status(200).json({ message: "Unfollowed successfully." });
    } else {
      // Follow logic
      user.followings.push(targetUserId);
      user.followingsNumber = user.followingsNumber + 1;
      targetUser.followers.push(userId);
      targetUser.followersNumber = targetUser.followersNumber + 1;
      await user.save();
      await targetUser.save();
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        secure: true,
        secureConnection: false,
        tls: {
          ciphers: "SSLv3",
        },
        requireTLS: true,
        port: 465,
        debug: true,
        connectionTimeout: 10000,
        auth: {
          user: process.env.FOLLOWER_MAIL,
          pass: process.env.FOLLOWER_PASSWORD,
        },
      });

      const mailOptions = {
        from: '"SII" <Newfollower@siimail.net>',
        to: targetUser.email,
        replyTo: "no-reply@siimail.net",
        subject: `You have a new follower!`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #FECE59;">You have a new follower!</h2>
            <p>Dear ${targetUser.fullName},</p>
            <p>${user.fullName} has started following you on SII platform.</p>
            <p>You can view their profile <a href="https://www.siiplatform.com/${user.userName}" style="color: #007bff;">here</a>.</p>
            <p>Best regards,</p>
            <p style="color: #FECE59;"><strong>SII Team</strong></p>
            <hr>
            <p style="font-size: 0.8em; color: #777;">This is an automated message, please do not reply to this email.</p>
          </div>
        `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
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
        ],
        accountType: { $ne: "personal" },
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
      host: "smtp.hostinger.com",
      secure: true,
      secureConnection: false,
      tls: {
        ciphers: "SSLv3",
      },
      requireTLS: true,
      port: 465,
      debug: true,
      connectionTimeout: 10000,
      auth: {
        user: process.env.NEW_ACCOUNT_MAIL,
        pass: process.env.NEW_ACCOUNT_PASSWORD,
      },
    });
    const resetLink = `https://www.siiplatform.com/reset-password/${resetToken}`;

    const mailOptions = {
      from: '"SII" <Newaccounts@siimail.net>',
      replyTo: "no-reply@siimail.net",
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
    const options = {
      width: 500,
      margin: 2,
    };
    const qrCodeUrl = await QRCode.toDataURL(
      `https://www.siiplatform.com/${userName}/qrcode-info`,
      options
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

export const addToUserSearch = async (req, res) => {
  try {
    const userId = req.userId;
    const { searchQuery, type } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    // if (!user.userSearch.includes(searchQuery)) {
    //   user.userSearch.push(searchQuery);
    //   await user.save();
    // }
    if (type === "user") {
      const users = user.userSearch.users;
      if (!users.includes(searchQuery)) {
        users.push(searchQuery);
        user.userSearch.users = users;
        await user.save();
      }
    } else if (type === "post") {
      const posts = user.userSearch.posts;
      if (!posts.includes(searchQuery)) {
        posts.push(searchQuery);
        user.userSearch.posts = posts;
        await user.save();
      }
    }

    return res.status(200).json("success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
export const deleteFromUserSearch = async (req, res) => {
  try {
    const userId = req.userId;
    const { searchQuery, type } = req.body;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const searchQueryObjectId = new mongoose.Types.ObjectId(searchQuery);
    if (type === "user") {
      user.userSearch.users = user.userSearch.users.filter(
        query => !query.equals(searchQueryObjectId)
      );
    } else if (type === "post") {
      user.userSearch.posts = user.userSearch.posts.filter(
        query => !query.equals(searchQueryObjectId)
      );
    }

    await user.save();
    return res.status(200).json("success");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const getUserSearchHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId).populate({
      path: "userSearch",
      populate: [
        {
          path: "users",
          select: "userName profilePhoto fullName",
        },
        {
          path: "posts",
          select: "owner caption postType",
          populate: {
            path: "owner",
            select: "userName profilePhoto fullName",
          },
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const users = user.userSearch.users;
    const posts = user.userSearch.posts;
    return res.status(200).json({ users, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const rateUser = async (req, res) => {
  const { userId, rating } = req.body;
  const raterId = req.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingRatingIndex = user.ratings.findIndex(
      rate => rate.user.toString() === raterId
    );

    if (existingRatingIndex !== -1) {
      user.ratings[existingRatingIndex].rating = rating;
    } else {
      user.ratings.push({ user: raterId, rating });
    }

    user.averageRating = user.calculateAverageRating();
    await user.save();

    res.status(200).json({
      message: "Rating submitted successfully",
      averageRating: user.averageRating,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
