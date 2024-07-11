import express from "express";
import { addAdmin, adminSignIn } from "../controllers/admin-ctrl/admin-ctrl.js";

const router = express.Router();

router.post("/signin", adminSignIn);
router.post("/add", addAdmin);

export default router;
