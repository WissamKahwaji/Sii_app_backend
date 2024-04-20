import { userModel } from "../../models/user/user_model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";

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
    const { firstName, lastName, email, password, mobileNumber } = req.body;
    const profileImage = req.files["profileImage"]
      ? req.files["profileImage"][0]
      : null;
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.json(error);
    }
    const profileUrlImage = profileImage
      ? "http://localhost:5001/" + profileImage.path.replace(/\\/g, "/")
      : null;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(422)
        .json({ message: "User already exists, please login!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    console.log(req.body);

    const newUser = await userModel.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      mobileNumber: mobileNumber,
      profileImage: profileUrlImage,
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
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
