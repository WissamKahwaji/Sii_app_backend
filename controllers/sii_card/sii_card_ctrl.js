import { siiCardModel } from "../../models/sii_card/sii_card_model.js";
import { userModel } from "../../models/user/user_model.js";

export const addSiiCard = async (req, res) => {
  try {
    const { fullName, email, mobileNumber } = req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const userName = user.userName;
    const newSiiCard = new siiCardModel({
      fullName,
      email,
      mobileNumber,
      userName,
    });
    const savedCard = await newSiiCard.save();
    user.siiCard = savedCard._id;
    await user.save();
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
