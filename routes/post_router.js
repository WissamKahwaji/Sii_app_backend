import express from "express";
import {
  addCommentToPost,
  createPost,
  deletePost,
  editPost,
  getAllPosts,
  getPostById,
  getPostComments,
  getUserDocsPosts,
  getUserPosts,
  getUserVideosPosts,
  toggleLike,
  toggleSavePost,
} from "../controllers/posts/post_ctrl.js";
import auth from "../middlewares/auth.js";
const router = express.Router();

router.get("/", getAllPosts);
router.get("/user-posts/:userId", auth, getUserPosts);
router.get("/user-videos-posts/:userId", auth, getUserVideosPosts);
router.get("/user-docs-posts/:userId", auth, getUserDocsPosts);

router.post("/create", auth, createPost);
router.put("/edit/:id", auth, editPost);
router.delete("/delete/:id", auth, deletePost);
router.put("/:id/toggleLike", auth, toggleLike);
router.get("/:id/comments", auth, getPostComments);
router.post("/:id/add-comment", auth, addCommentToPost);
router.put("/:id/toggle-save-post", auth, toggleSavePost);
router.get("/:id", getPostById);

export default router;
