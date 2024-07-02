import express from "express";
import { getSliderData } from "../controllers/slider/slider_ctrl.js";
const router = express.Router();

router.get("/", getSliderData);

export default router;
