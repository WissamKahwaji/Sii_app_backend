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
      port: 465,
      host: "smtp.gmail.com",
      auth: {
        user: "sii.app.developer@gmail.com",
        pass: "xyuf bypy grqf mlot",
      },
      secure: true,
    });

    const mailOptions = {
      from: "sii.app.developer@gmail.com",
      to: "info@siimedia.net",
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
        user: "Offers@siimail.net",
        pass: "Llw@!#kasd2",
      },
    });

    const mailOptions = {
      from: '"SII Offers" <Offers@siimail.net>',
      to: toEmail,
      subject: `request Offer`,
      html: `
      <p>The user ${name} saw your offer on the post and wants to inquire about the offer</p>
      <p><strong>Name:</strong>${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Mobile:</strong> ${mobile}</p> 
      <p><strong>Post:</strong> ${postCaption}</p> 
      <p><strong>User Message:</strong> ${message}</p>
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
