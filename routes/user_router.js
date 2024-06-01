import express from "express";
import { check } from "express-validator";
import {
  editUserProfile,
  getUserById,
  getUserByUserCategory,
  getUserByUserName,
  getUserFollowers,
  getUserFollowings,
  getUserLikedPosts,
  getUserSavedPosts,
  search,
  signUp,
  signin,
  toggleFollowUser,
} from "../controllers/user_ctrl/user_ctrl.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/signin",
  [
    check("email").isEmail().withMessage("Please enter a valid email address"),
    check("password")
      .trim()
      .isLength({ min: 7 })
      .not()
      .isEmpty()
      .withMessage("Please enter a valid email address"),
  ],
  signin
);

router.post(
  "/signUp",
  [
    check("email").isEmail().withMessage("Please enter a valid email address"),
    check("password")
      .trim()
      .isLength({ min: 7 })
      .not()
      .isEmpty()
      .withMessage("Please enter a valid email address"),
  ],
  signUp
);

router.get("/ById", auth, getUserById);

router.put("/edit-profile", auth, editUserProfile);
router.get("/user-followings", auth, getUserFollowings);
router.get("/user-followers", auth, getUserFollowers);
router.get("/user-liked-posts", auth, getUserLikedPosts);
router.get("/user-saved-posts", auth, getUserSavedPosts);
router.get("/by-userName/:userName", getUserByUserName);
router.post("/toggle-follow/:id", auth, toggleFollowUser);
router.get("/userCategory/:userCategory", getUserByUserCategory);
router.get("/search", search);
export default router;
