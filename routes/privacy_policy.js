import express from "express";
import { getPrivacyPolicy } from "../controllers/privacy_policy/privacy_policy_ctrl.js";

const router = express.Router();

router.get("/", getPrivacyPolicy);

export default router;
