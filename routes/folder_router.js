import express from "express";
import {
  addFolder,
  deleteFolder,
  getFolderById,
  getUserFolders,
  updateFolder,
} from "../controllers/folder/folder_ctrl.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.get("/user-folders/:userId", getUserFolders);
router.post("/add-folder", auth, addFolder);
router.put("/update/:id", auth, updateFolder);
router.delete("/delete/:id", auth, deleteFolder);
router.get("/by-id/:id", getFolderById);

export default router;
