import { siiCardModel } from "../../models/sii_card/sii_card_model.js";
import { userModel } from "../../models/user/user_model.js";
import nodemailer from "nodemailer";

const generateUniqueCardNumber = async () => {
  let cardNumber;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 9-digit number
    cardNumber = Math.floor(100000000 + Math.random() * 900000000).toString();

    // Check if this card number already exists in the database
    const existingCard = await siiCardModel.findOne({ cardNumber });
    if (!existingCard) {
      isUnique = true;
    }
  }

  return cardNumber;
};

export const addSiiCard = async (req, res) => {
  try {
    const { fullName, email, mobileNumber } = req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const userName = user.userName;

    const cardNumber = await generateUniqueCardNumber();

    const newSiiCard = new siiCardModel({
      fullName,
      email,
      mobileNumber,
      userName,
      cardNumber,
    });
    const savedCard = await newSiiCard.save();
    user.siiCard = savedCard._id;
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
        user: process.env.SIICARD_MAIL,
        pass: process.env.SIICARD_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"SII" <Siicard@siimail.net>',
      to: email,
      replyTo: "no-reply@siimail.net",
      subject: `Welcome to SII Card experience!`,
      html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #FECE59;">Welcome to the SII Card Experience, ${fullName}!</h2>
      <p>Dear ${fullName},</p>
      <p>We are thrilled to inform you that your SII Card request has been successfully processed. Below are your card details:</p>
      <ul>
        <li><strong>Card Number:</strong> ${cardNumber}</li>
        <li><strong>Full Name:</strong> ${fullName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Mobile Number:</strong> ${mobileNumber}</li>
      </ul>
      <p>Your SII Card brings you exclusive benefits and services. To get started, please visit your <a href="https://www.siiapp.net/sii-card" style="color: #007bff;">Sii Card</a> page.</p>
      <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@siiapp.net" style="color: #007bff;">support@siiapp.net</a>.</p>
      <p>We are excited to have you with us and hope you enjoy all the benefits that come with your SII Card.</p>
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
    return res.status(201).json(savedCard);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const getUserCard = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const card = await siiCardModel.findById(user.siiCard);
    return res.status(200).json(card);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const editUserCard = async (req, res) => {
  try {
    const userId = req.userId;
    const { email, mobileNumber } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }

    const editedCardParams = {};
    if (email) editedCardParams.email = email;
    if (mobileNumber) editedCardParams.mobileNumber = mobileNumber;

    const editedCard = await siiCardModel.findByIdAndUpdate(
      user.siiCard,
      editedCardParams,
      {
        new: true,
      }
    );

    if (!editedCard) {
      return res.status(404).json({ message: "Error when updating your card" });
    }

    return res.status(201).json(editedCard);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
