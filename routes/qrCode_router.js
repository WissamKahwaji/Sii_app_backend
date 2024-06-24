import express from "express";
import {
  addOrUpdateUserQrCode,
  getUserQrCode,
} from "../controllers/qr-code/qrCode_ctrl.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/:userName", getUserQrCode);
router.post("/", auth, addOrUpdateUserQrCode);

export default router;
