//get all posts

import { Comment } from "../../models/posts/comment_model.js";
import { PostModel } from "../../models/posts/post_model.js";
import { userModel } from "../../models/user/user_model.js";
import dotenv from "dotenv";

dotenv.config();

export const getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate({
        path: "owner",
        select: "fullName profileImage userName",
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "fullName profileImage userName" },
      })
      .sort({ _id: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

// get User Posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    const queryreq = {};
    if (type) {
      queryreq.postType = type;
    } else {
      queryreq.postType = "image";
    }
    const userPosts = await PostModel.find({ owner: userId, ...queryreq })
      .populate({
        path: "owner",
        select: "fullName profileImage userName",
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "fullName profileImage userName" },
      })
      .sort({ _id: -1 });

    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};
export const getUserVideosPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const userPosts = await PostModel.find({ owner: userId, postType: "video" })
      .populate({
        path: "owner",
        select: "fullName profileImage userName",
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "fullName profileImage userName" },
      })
      .sort({ _id: -1 });
    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};
export const getUserDocsPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    const userPosts = await PostModel.find({ owner: userId, postType: "doc" })
      .populate({
        path: "owner",
        select: "fullName profileImage userName",
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "fullName profileImage userName" },
      })
      .sort({ _id: -1 });
    return res.status(200).json(userPosts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

//get Post By Id

export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await PostModel.findById(id)
      .populate({
        path: "owner",
        select: "fullName profileImage userName",
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "fullName profileImage userName" },
      });
    return res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const createPost = async (req, res) => {
  try {
    const { caption, link, whatsAppNumber, mobileNumber, tags, postType } =
      req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const post = new PostModel({
      owner: user.id,
      caption: caption,
      link: link,
      whatsAppNumber: whatsAppNumber,
      mobileNumber: mobileNumber,
      tags: tags,
      postType,
    });
    if (req.files["postImages"]) {
      const postImages = req.files["postImages"];
      const imageUrls = [];
      if (!postImages || !Array.isArray(postImages)) {
        return res
          .status(404)
          .json({ message: "Attached files are missing or invalid." });
      }

      for (const image of postImages) {
        if (!image) {
          return res
            .status(404)
            .json({ message: "Attached file is not an image." });
        }

        const imageUrl = `${process.env.BASE_URL}/${image.path.replace(
          /\\/g,
          "/"
        )}`;
        imageUrls.push(imageUrl);
        post.images = imageUrls;
      }
    }
    if (req.files["video"]) {
      const video = req.files["video"][0];
      const urlVideo = `${process.env.BASE_URL}/${video.path.replace(
        /\\/g,
        "/"
      )}`;
      post.postVideo = urlVideo;
    }
    if (req.files["coverVideoImage"]) {
      const coverVideoImage = req.files["coverVideoImage"][0];
      const urlcoverVideoImage = `${
        process.env.BASE_URL
      }/${coverVideoImage.path.replace(/\\/g, "/")}`;
      post.coverVideoImage = urlcoverVideoImage;
    }
    if (req.files["coverPdfImage"]) {
      const coverPdfImage = req.files["coverPdfImage"][0];
      const urlcoverPdfImage = `${
        process.env.BASE_URL
      }/${coverPdfImage.path.replace(/\\/g, "/")}`;
      post.coverPdfImage = urlcoverPdfImage;
    }
    if (req.files["doc"]) {
      const doc = req.files["doc"][0];
      const urlDoc = `${process.env.BASE_URL}/${doc.path.replace(/\\/g, "/")}`;
      post.postDocs = urlDoc;
    }

    const savedPost = await post.save();
    user.posts.push(savedPost._id);
    await user.save();
    return res.status(201).json(savedPost);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

//edit Post
export const editPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { caption, link, whatsAppNumber, mobileNumber, tags } = req.body;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: " Post not found" });
    }

    if (post.owner.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ message: "You do not have permission to edit this post" });
    }

    if (caption) post.caption = caption;
    if (link) post.link = link;
    if (whatsAppNumber) post.whatsAppNumber = whatsAppNumber;
    if (mobileNumber) post.mobileNumber = mobileNumber;
    if (tags) post.tags = tags;

    const updatedPost = await post.save();

    return res.status(200).json(updatedPost);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

//delete Post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: " Post not found" });
    }

    if (post.owner.toString() !== userId.toString()) {
      return res
        .status(404)
        .json({ message: "You do not have permission to delete this post" });
    }
    const deletedPost = await PostModel.findByIdAndDelete(id);
    const user = await userModel.findById(userId);
    user.posts.pull(deletedPost._id);
    await user.save();
    return res.status(200).json("Deleted Post successfully");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: " Post not found" });
    }

    const existingLikeIndex = post.likes.findIndex(likeId =>
      likeId.equals(userId)
    );
    if (existingLikeIndex !== -1) {
      // If the like exists, remove it
      post.likes.splice(existingLikeIndex, 1);
      await post.save();
      const user = await userModel.findById(userId);
      user.likedPosts.pull(post._id);
      await user.save();
      res.status(200).json("Like removed successfully");
    } else {
      post.likes.push(userId);
      await post.save();
      const user = await userModel.findById(userId);
      user.likedPosts.push(post._id);
      await user.save();
      res.status(200).json("Like added successfully");
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const toggleSavePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const post = await PostModel.findById(id);

    if (!post) {
      return res.status(404).json({ message: " Post not found" });
    }
    const user = await userModel.findById(userId);
    const existingSaveIndex = user.savedPosts.findIndex(savedId =>
      savedId.equals(id)
    );
    if (existingSaveIndex !== -1) {
      user.savedPosts.splice(existingSaveIndex, 1);
      await user.save();
      post.saves.splice(existingSaveIndex, 1);
      await post.save();
      res.status(200).json("Post UnSaved successfully");
    } else {
      user.savedPosts.push(id);
      await user.save();
      post.saves.push(userId);
      await post.save();
      res.status(200).json("Post Saved successfully");
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await Comment.find({ post: id })
      .populate({
        path: "user",
        select: "userName fullName profileImage",
      })
      .select("text user");

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCommentToPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    const comment = new Comment({
      user: userId,
      post: id,
      text,
    });

    await comment.save();

    const post = await PostModel.findById(id);
    post.comments.push(comment._id);
    await post.save();

    res.status(200).json("Comment added successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
