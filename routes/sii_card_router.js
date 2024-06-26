import express from "express";
import {
  addSiiCard,
  editUserCard,
  getUserCard,
} from "../controllers/sii_card/sii_card_ctrl.js";
import auth from "../middlewares/auth.js";
const router = express.Router();

router.post("/add", auth, addSiiCard);
router.get("/user-card", auth, getUserCard);
router.put("/edit", auth, editUserCard);

export default router;
