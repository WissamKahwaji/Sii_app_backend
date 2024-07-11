import express from "express";
import {
  addCommentToPost,
  createPost,
  deletePost,
  deletePostDashboard,
  editPost,
  getAllPosts,
  getPostById,
  getPostComments,
  getUserDocsPosts,
  getUserPosts,
  getUserVideosPosts,
  ratePost,
  toggleInterestingPost,
  toggleLike,
  toggleSavePost,
} from "../controllers/posts/post_ctrl.js";
import auth from "../middlewares/auth.js";
const router = express.Router();

router.get("/", getAllPosts);
router.get("/user-posts/:userId", getUserPosts);
router.get("/user-videos-posts/:userId", getUserVideosPosts);
router.get("/user-docs-posts/:userId", getUserDocsPosts);

router.post("/create", auth, createPost);
router.put("/edit/:id", auth, editPost);
router.delete("/delete/:id", auth, deletePost);
router.delete("/delete-dash/:id", auth, deletePostDashboard);
router.put("/:id/toggleLike", auth, toggleLike);
router.put("/:id/toggle-interesting-post", auth, toggleInterestingPost);

router.get("/:id/comments", auth, getPostComments);
router.post("/:id/add-comment", auth, addCommentToPost);
router.put("/:id/toggle-save-post", auth, toggleSavePost);
router.get("/:id", getPostById);
router.put("/rate-post", auth, ratePost);

export default router;
