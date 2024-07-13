import { infoHelpModel } from "../../models/info_help/infp_help_model.js";
import nodemailer from "nodemailer";

export const getInfoHelp = async (req, res) => {
  try {
    const info = await infoHelpModel.find();
    return res.status(200).json(info);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const addInfoHelp = async (req, res) => {
  try {
    const { title, titleAr, description, descriptionAr } = req.body;
    const newInfo = new infoHelpModel({
      title,
      titleAr,
      description,
      descriptionAr,
    });

    const savedInfo = await newInfo.save();
    return res.status(201).json(savedInfo);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const sendEmailSuggestion = async (req, res, next) => {
  try {
    const { email, name, mobile, message } = req.body;
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
        user: process.env.SUGGESTION_MAIL,
        pass: process.env.SUGGESTION_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"SII" <suggestion@siimail.net>',
      replyTo: "no-reply@siimail.net",
      to: "help@siiplatform.com",
      subject: `Suggestion`,
      html: `
      <p><strong>Name:</strong>${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p>    
      <p>${message}</p>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send("Enquiry submitted successfully");
      }
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const sendOfferMessage = async (req, res, next) => {
  try {
    const { postCaption, toEmail, email, name, mobile, message } = req.body;
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
        user: process.env.OFFERS_MAIL,
        pass: process.env.OFFERS_PASSWORD,
      },
    });

    const mailOptions = {
      from: '"SII" <Offers@siimail.net>',
      to: toEmail,
      subject: `request Offer`,
      html: `
      <p>Dear Sir/Madam,</p>
      <p>We hope this message finds you well.</p>
      <p>We are pleased to inform you that <strong>${name}</strong> has shown interest in your offer and would like to inquire further about the details.</p>
      <p>Below are the details provided by the user:</p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Mobile:</strong> ${mobile}</li>
        <li><strong>Post:</strong> ${postCaption}</li>
        <li><strong>Message:</strong> ${message}</li>
      </ul>
      <p>We appreciate your prompt attention to this inquiry and look forward to your response.</p>
      <p>Best regards,</p>
      <p><strong>SII Platform Team</strong></p>
      <p><em>This is an automated message. Please do not reply to this email.</em></p>
    `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send("Enquiry submitted successfully");
      }
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
