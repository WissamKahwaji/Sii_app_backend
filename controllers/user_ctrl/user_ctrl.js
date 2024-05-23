import { userModel } from "../../models/user/user_model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
import dotenv from "dotenv";

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
    const existingUser = await userModel.findOne({ email });
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
    console.log("success");
    return res.status(201).json({
      result: newUser,
      message: "User created",
      token: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error in registration" });
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

export const getUserFollowings = async (req, res) => {
  try {
    const id = req.userId;
    const userFollowings = await userModel
      .findById(id)
      .select(["userName", "fullName", "followings"])
      .populate("followings");
    return res.status(200).json(userFollowings);
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
    return res.status(200).json(userFollowers);
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

    const { fullName, bio, mobileNumber, socialMedia } = req.body;

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
    if (socialMedia) user.socialMedia = socialMedia;

    const updatedUser = await user.save();
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error : ${error}` });
  }
};
