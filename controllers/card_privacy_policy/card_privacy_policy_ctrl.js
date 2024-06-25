import { cardPrivacyPolicyModel } from "../../models/card_privacy_policy/card_privacy_policy_model.js";

export const getCardPrivacyPolicyInfo = async (req, res) => {
  try {
    const privacyPolicy = await cardPrivacyPolicyModel.findOne();
    return res.status(200).json(privacyPolicy);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
