//get all posts

import { Comment } from "../../models/posts/comment_model.js";
import { PostModel } from "../../models/posts/post_model.js";
import { userModel } from "../../models/user/user_model.js";
import nodemailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import ffmpeg from "ffmpeg";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);
// export const getAllPosts = async (req, res) => {
//   try {
//     const posts = await PostModel.find()
//       .populate({
//         path: "owner",
//         select: "fullName profileImage userName",
//       })
//       .populate({
//         path: "comments",
//         populate: { path: "user", select: "fullName profileImage userName" },
//       })
//       .sort({ _id: -1 });

//     return res.status(200).json(posts);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Something went wrong", error: error });
//   }
// };
// export const getAllPosts = async (req, res) => {
//   try {
//     // Fetch all posts
//     const allPosts = await PostModel.find()
//       .populate({
//         path: "owner",
//         select: "fullName profileImage userName",
//       })
//       .populate({
//         path: "comments",
//         populate: { path: "user", select: "fullName profileImage userName" },
//       });

//     const shuffledPosts = allPosts.sort(() => Math.random() - 0.5);

//     return res.status(200).json(shuffledPosts);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Something went wrong", error: error });
//   }
// };

// export const getAllPosts = async (req, res) => {
//   try {
//     // Get the current date and set the time to 00:00:00
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Fetch posts uploaded today
//     const todayPosts = await PostModel.find({ createdAt: { $gte: today } })
//       .populate({
//         path: "owner",
//         select: "fullName profileImage userName",
//       })
//       .populate({
//         path: "comments",
//         populate: { path: "user", select: "fullName profileImage userName" },
//       });

//     // Fetch posts uploaded before today
//     const beforeTodayPosts = await PostModel.find({ createdAt: { $lt: today } })
//       .populate({
//         path: "owner",
//         select: "fullName profileImage userName",
//       })
//       .populate({
//         path: "comments",
//         populate: { path: "user", select: "fullName profileImage userName" },
//       });

//     // Shuffle both lists
//     const shuffledTodayPosts = todayPosts.sort(() => Math.random() - 0.5);
//     const shuffledBeforeTodayPosts = beforeTodayPosts.sort(
//       () => Math.random() - 0.5
//     );

//     // Combine both lists
//     const finalPostList = [...shuffledTodayPosts, ...shuffledBeforeTodayPosts];

//     return res.status(200).json(finalPostList);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Something went wrong", error: error });
//   }
// };
// export const getAllPosts = async (req, res) => {
//   try {
//     // Fetch all posts
//     const allPosts = await PostModel.find()
//       .populate({
//         path: "owner",
//         select: "fullName profileImage userName",
//       })
//       .populate({
//         path: "comments",
//         populate: { path: "user", select: "fullName profileImage userName" },
//       });

//     // Helper function to format date to YYYY-MM-DD
//     const formatDate = date => {
//       const d = new Date(date);
//       let month = "" + (d.getMonth() + 1);
//       let day = "" + d.getDate();
//       const year = d.getFullYear();

//       if (month.length < 2) month = "0" + month;
//       if (day.length < 2) day = "0" + day;

//       return [year, month, day].join("-");
//     };

//     // Group posts by date
//     const groupedPosts = allPosts.reduce((acc, post) => {
//       const date = formatDate(post.createdAt);
//       if (!acc[date]) {
//         acc[date] = [];
//       }
//       acc[date].push(post);
//       return acc;
//     }, {});

//     // Shuffle posts within each group
//     const shuffledGroupedPosts = Object.keys(groupedPosts).reduce(
//       (acc, date) => {
//         acc[date] = groupedPosts[date].sort(() => Math.random() - 0.5);
//         return acc;
//       },
//       {}
//     );

//     // Sort the groups by date in descending order
//     const sortedDates = Object.keys(shuffledGroupedPosts).sort(
//       (a, b) => new Date(b) - new Date(a)
//     );

//     // Combine the shuffled groups in sorted order
//     const finalPostList = sortedDates.reduce((acc, date) => {
//       return [...acc, ...shuffledGroupedPosts[date]];
//     }, []);

//     return res.status(200).json(finalPostList);
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ message: "Something went wrong", error: error });
//   }
// };
export const getAllPosts = async (req, res) => {
  try {
    // Fetch all posts
    const allPosts = await PostModel.find()
      .populate({
        path: "owner",
        select: "fullName profileImage userName",
      })
      .populate({
        path: "comments",
        populate: { path: "user", select: "fullName profileImage userName" },
      });

    // Helper function to format date to YYYY-MM-DD
    const formatDate = date => {
      const d = new Date(date);
      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    };

    // Group posts by date
    const groupedPosts = allPosts.reduce((acc, post) => {
      const date = formatDate(post.createdAt);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(post);
      return acc;
    }, {});

    // Shuffle posts within each group and convert to array of objects
    const shuffledGroupedPosts = Object.keys(groupedPosts).map(date => ({
      date,
      posts: groupedPosts[date].sort(() => Math.random() - 0.5),
    }));

    // Sort the groups by date in descending order
    const sortedGroupedPosts = shuffledGroupedPosts.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Flatten the sorted groups into a final list
    const finalPostList = sortedGroupedPosts.reduce((acc, group) => {
      return [...acc, ...group.posts];
    }, []);

    return res.status(200).json(finalPostList);
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
        select: "fullName profileImage userName isBusiness email accountType",
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
    const {
      caption,
      otherCaptions,
      link,
      whatsAppNumber,
      mobileNumber,
      tags,
      postType,
      discountPercentage,
      discountFunctionType,
      startDiscountDate,
      endDiscountDate,
    } = req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    if (discountPercentage && (!startDiscountDate || !endDiscountDate)) {
      return res.status(400).json({
        message:
          "startDiscountDate and endDiscountDate are required when discount is applied.",
      });
    }
    const post = new PostModel({
      owner: user.id,
      caption: caption,
      otherCaptions: otherCaptions,
      link: link,
      whatsAppNumber: whatsAppNumber,
      mobileNumber: mobileNumber,
      tags: tags,
      postType,
      discountPercentage,
      discountFunctionType,
      startDiscountDate,
      endDiscountDate,
    });

    if (discountPercentage) {
      post.agreedToPolicy = true;
    }
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
    // if (req.files["video"]) {
    //   try {
    //     const video = req.files["video"][0];
    //     // const inputVideoPath = `${process.env.BASE_URL}/${video.path.replace(
    //     //   /\\/g,
    //     //   "/"
    //     // )}`;
    //     const inputVideoPath = path
    //       .join(__dirname, `../../images/${video.filename}`)
    //       .replace(/\\/g, "/");
    //     const outputVideoPath = path.resolve(
    //       `images/processed-${video.filename}`
    //     );
    //     console.log("111111");
    //     // Local path to the watermark image
    //     const watermarkPath = path
    //       .join(__dirname, "../../assets/watermark.png")
    //       .replace(/\\/g, "/");
    //     // const watermarkPath = `${process.env.BASE_URL}/images/logo_sii_new_2.png`;
    //     console.log(watermarkPath);
    //     console.log("222222222");
    //     // Ensure watermark image exists
    //     if (!fs.existsSync(watermarkPath)) {
    //       console.log("33333333");
    //       return res.status(500).json({ message: "Watermark image not found" });
    //     }
    //     console.log("4444444444");
    //     const outputDir = path.dirname(outputVideoPath);
    //     if (!fs.existsSync(outputDir)) {
    //       fs.mkdirSync(outputDir, { recursive: true });
    //     }
    //     const outputPath = `${inputVideoPath.split(".")[0]}_watermarked.mp4`;
    //     const outputUrl = `images/${
    //       video.filename.split(".")[0]
    //     }_watermarked.mp4`;
    //     console.log("5555555555555");
    //     // Add watermark and username to the video using ffmpeg
    //     // const ffmpegCommand = `ffmpeg -i ${inputVideoPath} -i ${watermarkPath} -filter_complex "[0:v][1:v] overlay=W-w-10:H-h-10, drawtext=text='@${user.userName}':fontcolor=white:fontsize=24:x=10:y=10" -codec:a copy ${outputPath}`;
    //     const ffmpegCommand = `ffmpeg -i "${inputVideoPath}" -i "${watermarkPath}" -filter_complex "[0:v][1:v] overlay=W-w-30:(main_h-overlay_h)/1.4" -codec:a copy "${outputPath}"`;

    //     console.log("66666666666");
    //     await execAsync(ffmpegCommand);
    //     console.log("77777777777777");
    //     const urlVideo = `${process.env.BASE_URL}/${outputUrl.replace(
    //       /\\/g,
    //       "/"
    //     )}`;
    //     post.postVideo = urlVideo;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }
    // if (req.files["video"]) {
    //   const video = req.files["video"][0];
    //   const inputVideoPath = video.path.replace(/\\/g, "/");
    //   const outputVideoPath = path.resolve(
    //     `images/processed-${video.filename}`
    //   );
    //   // const watermarkPath = path.resolve(
    //   //   `${process.env.BASE_URL}/assets/logo_sii_new_2.png`
    //   // );
    //   const videoPath = video.path;
    //   const watermarkPath = path
    //     .join(__dirname, "assets/logo_sii_new_2.png")
    //     .replace(/\\/g, "/");

    //   const outputPath = `${videoPath.split(".")[0]}_watermarked.${
    //     videoPath.split(".")[1]
    //   }`;
    //   const settings = {
    //     position: "SE", // Position: NE NC NW SE SC SW C CE CW
    //     margin_nord: null, // Margin nord
    //     margin_sud: null, // Margin sud
    //     margin_east: null, // Margin east
    //     margin_west: null, // Margin west
    //   };
    //   var ffprocess = new ffmpeg(videoPath);
    //   ffprocess.then(
    //     function (video) {
    //       console.log("The video is ready to be processed");
    //       // var watermarkPath = "assets/logo_sii_new_2.png",
    //       // outputPath, settings;
    //       var callback = function (error, files) {
    //         if (error) {
    //           console.log("ERROR: ", error);
    //         } else {
    //           console.log("TERMINOU", files);
    //         }
    //       };
    //       //add watermark
    //       video.fnAddWatermark(watermarkPath, outputPath, settings, callback);
    //     },
    //     function (err) {
    //       console.log("Error: " + err);
    //     }
    //   );
    // }
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
    if (discountPercentage) {
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        secure: true,
        secureConnection: false,
        tls: {
          ciphers: "SSLv3",
        },
        requireTLS: true,
        port: 465,
        debug: true,
        connectionTimeout: 10000,
        auth: {
          user: process.env.OFFERS_MAIL,
          pass: process.env.OFFERS_PASSWORD,
        },
      });

      const mailOptions = {
        from: '"SII" <Offers@siimail.net>',
        to: user.email,
        replyTo: "no-reply@siimail.net",
        subject: `New Post with Discount Created`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #FECE59;">New Post Created with a Discount!</h2>
            <p>Dear ${user.fullName},</p>
            <p>Thank you for creating a new post on our platform. We noticed that your post includes a discount of ${discountPercentage}%.</p>
            <p>Here are the details of your post:</p>
            <ul>
              <li><strong>Caption:</strong> ${caption}</li>
              
              <li><strong>Discount Percentage:</strong> ${discountPercentage}%</li>
              <li><strong>Discount Function Type:</strong> ${discountFunctionType}</li>
            </ul>
            <p>If you have any questions or need assistance, feel free to reach out to our support team at <a href="mailto:support@siiapp.net" style="color: #007bff;">support@siiapp.net</a>.</p>
            <p>Best regards,</p>
            <p style="color: #FECE59;"><strong>SII Team</strong></p>
            <hr>
            <p style="font-size: 0.8em; color: #777;">This is an automated message, please do not reply to this email.</p>
          </div>
        `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

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
    const {
      caption,
      otherCaptions,
      link,
      whatsAppNumber,
      mobileNumber,
      tags,
      // discountPercentage,
      discountFunctionType,

      endDiscountDate,
    } = req.body;
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
    if (otherCaptions) post.otherCaptions = otherCaptions;

    if (link) post.link = link;
    if (whatsAppNumber) post.whatsAppNumber = whatsAppNumber;
    if (mobileNumber) post.mobileNumber = mobileNumber;
    if (tags) post.tags = tags;
    // if (discountPercentage && discountPercentage != "undefined")
    //   post.discountPercentage = discountPercentage;
    if (discountFunctionType) post.discountFunctionType = discountFunctionType;
    if (endDiscountDate) post.endDiscountDate = endDiscountDate;

    const updatedPost = await post.save();

    return res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
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

export const deletePostDashboard = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await PostModel.findById(id);
    const adminId = process.env.ADMIN_ID;
    if (!post) {
      return res.status(404).json({ message: " Post not found" });
    }

    // if (
    //   post.owner.toString() !== userId.toString() &&
    //   userId.toString() !== adminId.toString()
    // ) {
    //   return res
    //     .status(404)
    //     .json({ message: "You do not have permission to delete this post" });
    // }
    const userId = post.owner.toString();
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

export const toggleInterestingPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const post = await PostModel.findById(id).populate("owner");

    if (!post) {
      return res.status(404).json({ message: " Post not found" });
    }
    const user = await userModel.findById(userId);
    const existingInterestedIndex = user.interestingPosts.findIndex(
      interestId => interestId.equals(id)
    );
    if (existingInterestedIndex !== -1) {
      user.interestingPosts.splice(existingInterestedIndex, 1);
      await user.save();
      post.interests.splice(existingInterestedIndex, 1);
      await post.save();
      res.status(200).json("The post has been removed from the interest list");
    } else {
      user.interestingPosts.push(id);
      await user.save();
      post.interests.push(userId);
      await post.save();
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        secure: true,
        secureConnection: false,
        tls: {
          ciphers: "SSLv3",
        },
        requireTLS: true,
        port: 465,
        debug: true,
        connectionTimeout: 10000,
        auth: {
          user: process.env.NEW_INTEREST_MAIL,
          pass: process.env.NEW_INTEREST_PASSWORD,
        },
      });

      const mailOptions = {
        from: '"SII" <NewInterest@siimail.net>',
        to: post.owner.email,
        replyTo: "no-reply@siimail.net",
        subject: `You have a new interest!`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #FECE59;">You have a new interest!</h2>
            <p>Dear ${post.owner.fullName},</p>
            <p>${user.fullName} has interested in your post on SII platform.</p>
            <p>The Post is : ${post.caption}</p>
            <p>You can view their profile <a href="https://www.siiapp.net/${user.userName}" style="color: #007bff;">here</a>.</p>
            <p>Best regards,</p>
            <p style="color: #FECE59;"><strong>SII Team</strong></p>
            <hr>
            <p style="font-size: 0.8em; color: #777;">This is an automated message, please do not reply to this email.</p>
          </div>
        `,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
      res.status(200).json("The post has been added to your interest list");
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

export const ratePost = async (req, res) => {
  const { postId, rating } = req.body;
  const userId = req.userId;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Invalid rating value" });
  }

  try {
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user has already rated this post
    const existingRatingIndex = post.ratings.findIndex(
      rate => rate.userId && rate.userId.toString() === userId
    );

    if (existingRatingIndex !== -1) {
      post.ratings[existingRatingIndex].rating = rating;
    } else {
      post.ratings.push({ userId, rating });
    }

    post.averageRating = post.calculateAverageRating();
    await post.save();

    res
      .status(200)
      .json({ message: "Rating submitted", averageRating: post.averageRating });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};
