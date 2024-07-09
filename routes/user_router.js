import express from "express";
import { check } from "express-validator";
import {
  addToUserSearch,
  deleteFromUserSearch,
  deleteUserAccount,
  editUserProfile,
  forgetPassword,
  generateUserQrCode,
  getUserAccounts,
  getUserById,
  getUserByUserCategory,
  getUserByUserName,
  getUserFollowers,
  getUserFollowings,
  getUserInterestedPosts,
  getUserLikedPosts,
  getUserSavedPosts,
  getUserSearchHistory,
  rateUser,
  resetPassword,
  search,
  signUp,
  signin,
  signupWithAddAccount,
  switchAccount,
  toggleFollowUser,
} from "../controllers/user_ctrl/user_ctrl.js";
import auth from "../middlewares/auth.js";
import passport from "../services/passport.js";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user/user_model.js";

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
router.get("/user-followings/:userId", getUserFollowings);
router.get("/user-followers/:userId", getUserFollowers);
router.get("/user-accounts", auth, getUserAccounts);
router.get("/user-liked-posts/:userId", getUserLikedPosts);
router.get("/user-saved-posts/:userId", getUserSavedPosts);
router.get("/user-interested-posts/:userId", getUserInterestedPosts);
router.get("/by-userName/:userName", getUserByUserName);
router.post("/toggle-follow/:id", auth, toggleFollowUser);
router.get("/userCategory/:userCategory", getUserByUserCategory);
router.get("/search", search);
router.post("/forget-password", forgetPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/generate-qrcode", auth, generateUserQrCode);
router.delete("/delete-account", auth, deleteUserAccount);
router.post("/add-to-search", auth, addToUserSearch);
router.put("/delete-from-search", auth, deleteFromUserSearch);
router.get("/get-search-history", auth, getUserSearchHistory);
router.put("/rate-user", auth, rateUser);

// Google OAuth Routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // Generate a JWT token
      const token = jwt.sign(
        { email: req.user.email, id: req.user._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
      );

      // Find the user in the database to get userName
      const user = await userModel.findById(req.user._id);

      if (!user) {
        throw new Error("User not found");
      }

      // Redirect to the frontend with the token, userName, and email
      res.redirect(
        `https://www.siiapp.net/login?token=${token}&userName=${user.userName}&email=${user.email}&userId=${user._id}`
      );
    } catch (err) {
      console.error("Error in Google callback:", err);
      res.redirect("/login"); // Redirect to login page on error
    }
  }
);

router.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.redirect(
      `/login?token=${token}&userName=${req.user.userName}&email=${req.user.email}&userId=${req.user.id}`
    );
  }
);

export default router;
