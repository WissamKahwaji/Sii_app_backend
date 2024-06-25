import express from "express";
import {
  addInfoHelp,
  getInfoHelp,
  sendEmailSuggestion,
  sendOfferMessage,
} from "../controllers/info_help/info_help_ctrl.js";

const router = express.Router();

router.get("/", getInfoHelp);
router.post("/add", addInfoHelp);
router.post("/send-suggestion", sendEmailSuggestion);
router.post("/send-offer-message", sendOfferMessage);

export default router;
