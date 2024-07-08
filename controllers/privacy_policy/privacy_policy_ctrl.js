import { privacyPolicyModel } from "../../models/privacy_policy/privacy_policy_model.js";

export const getPrivacyPolicy = async (req, res) => {
  try {
    const privacyPolicy = await privacyPolicyModel.find();
    return res.status(200).json(privacyPolicy);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
