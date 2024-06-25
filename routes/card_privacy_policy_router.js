import express from "express";
import { getCardPrivacyPolicyInfo } from "../controllers/card_privacy_policy/card_privacy_policy_ctrl.js";

const router = express.Router();

router.get("/", getCardPrivacyPolicyInfo);

export default router;
