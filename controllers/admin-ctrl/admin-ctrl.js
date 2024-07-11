import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { adminModel } from "../../models/admin/admin-model.js";

export const addAdmin = async (req, res) => {
  try {
    const { userName, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const newAdmin = await adminModel({
      userName,
      password: hashedPassword,
    });
    await newAdmin.save();
    const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1y",
    });
    return res.status(201).json({
      message: "Success",
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const adminSignIn = async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res.status(401).json({
      message: "Invalid username or password",
    });
  }

  const existingAdmin = await adminModel.findOne();
  if (!existingAdmin) {
    return res.status(401).json({
      message: "Admin doesn't exist.",
    });
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    existingAdmin.password
  );
  if (!isPasswordCorrect) {
    return res.status(401).json({
      message: "Invalid Credentials.",
    });
  }

  const token = jwt.sign(
    { id: existingAdmin._id },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1y",
    }
  );

  res.status(200).json({
    message: "LogIn Successfuled",
    token: token,
  });
  try {
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
