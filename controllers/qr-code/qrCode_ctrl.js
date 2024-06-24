import { qrCodeModel } from "../../models/qr-code/qrcode_model.js";
import { userModel } from "../../models/user/user_model.js";

export const getUserQrCode = async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await userModel.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const qrCode = await qrCodeModel.findOne({ owner: user._id }).populate({
      path: "owner",
      select: "userName fullName profileImage",
    });
    return res.status(200).json(qrCode);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const addOrUpdateUserQrCode = async (req, res) => {
  try {
    console.log("aaaaaaaa");
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const {
      webSite,
      whatsApp,
      faceBook,
      linkedIn,
      instagram,
      threads,
      snapChat,
      youtube,
      tiktok,
      xPlatform,
      painterest,
      otherLink,
      location,
      companyProfile,
    } = req.body;
    const qrCode = await qrCodeModel.findOne({ owner: userId });
    if (qrCode) {
      if (webSite || webSite == "") qrCode.webSite = webSite;
      if (whatsApp || whatsApp == "") qrCode.whatsApp = whatsApp;
      if (faceBook || faceBook == "") qrCode.faceBook = faceBook;
      if (linkedIn || linkedIn == "") qrCode.linkedIn = linkedIn;
      if (instagram || instagram == "") qrCode.instagram = instagram;
      if (threads || threads == "") qrCode.threads = threads;
      if (snapChat || snapChat == "") qrCode.snapChat = snapChat;
      if (youtube || youtube == "") qrCode.youtube = youtube;
      if (tiktok || tiktok == "") qrCode.tiktok = tiktok;
      if (xPlatform || xPlatform == "") qrCode.xPlatform = xPlatform;
      if (painterest || painterest == "") qrCode.painterest = painterest;
      if (otherLink || otherLink == "") qrCode.otherLink = otherLink;
      if (location || location == "") qrCode.location = location;

      if (req.files && req.files["doc"]) {
        const doc = req.files["doc"][0];
        const urlDoc = `${process.env.BASE_URL}/${doc.path.replace(
          /\\/g,
          "/"
        )}`;
        qrCode.companyProfile = urlDoc;
      } else if (companyProfile == "") {
        qrCode.companyProfile = "";
      }
      const updatedQrCode = await qrCode.save();
      return res.status(201).json(updatedQrCode);
    } else {
      const newQrCode = new qrCodeModel({
        owner: userId,
        webSite,
        whatsApp,
        faceBook,
        linkedIn,
        instagram,
        threads,
        snapChat,
        youtube,
        tiktok,
        xPlatform,
        painterest,
        otherLink,
        location,
      });
      if (req.files && req.files["doc"]) {
        const doc = req.files["doc"][0];
        const urlDoc = `${process.env.BASE_URL}/${doc.path.replace(
          /\\/g,
          "/"
        )}`;
        newQrCode.companyProfile = urlDoc;
      }
      const savedQrCode = await newQrCode.save();
      return res.status(201).json(savedQrCode);
    }
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
