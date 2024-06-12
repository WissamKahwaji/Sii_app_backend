import express from "express";
import { check } from "express-validator";
import {
  editUserProfile,
  forgetPassword,
  generateUserQrCode,
  getUserAccounts,
  getUserById,
  getUserByUserCategory,
  getUserByUserName,
  getUserFollowers,
  getUserFollowings,
  getUserLikedPosts,
  getUserSavedPosts,
  resetPassword,
  search,
  signUp,
  signin,
  signupWithAddAccount,
  switchAccount,
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

router.post(
  "/signUpWithAdd",
  [
    check("email").isEmail().withMessage("Please enter a valid email address"),
    check("password")
      .trim()
      .isLength({ min: 7 })
      .not()
      .isEmpty()
      .withMessage("Please enter a valid email address"),
  ],
  auth,
  signupWithAddAccount
);

router.post("/switchAccount", auth, switchAccount);

router.get("/ById", auth, getUserById);

router.put("/edit-profile", auth, editUserProfile);
router.get("/user-followings", auth, getUserFollowings);
router.get("/user-followers", auth, getUserFollowers);
router.get("/user-accounts", auth, getUserAccounts);
router.get("/user-liked-posts", auth, getUserLikedPosts);
router.get("/user-saved-posts", auth, getUserSavedPosts);
router.get("/by-userName/:userName", getUserByUserName);
router.post("/toggle-follow/:id", auth, toggleFollowUser);
router.get("/userCategory/:userCategory", getUserByUserCategory);
router.get("/search", search);
router.post("/forget-password", forgetPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/generate-qrcode", auth, generateUserQrCode);
export default router;
