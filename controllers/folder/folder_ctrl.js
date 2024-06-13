import { folderModel } from "../../models/folder/folder_model.js";
import { userModel } from "../../models/user/user_model.js";

export const getUserFolders = async (req, res) => {
  try {
    const { userId } = req.params;
    const userFolders = await folderModel
      .find({ owner: userId })
      .populate({
        path: "owner",
        select: "fullName profileImage userName",
      })
      .sort({ _id: -1 });
    return res.status(200).json(userFolders);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const getFolderById = async (req, res) => {
  try {
    const { id } = req.params;
    const folder = await folderModel.findById(id).populate({
      path: "owner",
      select: "fullName profileImage userName isBusiness",
    });
    return res.status(200).json(folder);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const addFolder = async (req, res) => {
  try {
    const { name, caption, link, whatsAppNumber, mobileNumber } = req.body;
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const folder = new folderModel({
      owner: user.id,
      name,
      caption,
      link,
      whatsAppNumber,
      mobileNumber,
    });
    if (req.files["folderImages"]) {
      const folderImages = req.files["folderImages"];
      const imageUrls = [];
      if (!folderImages || !Array.isArray(folderImages)) {
        return res
          .status(404)
          .json({ message: "Attached files are missing or invalid." });
      }

      for (const image of folderImages) {
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
        folder.images = imageUrls;
      }
    }
    if (req.files["folderCoverImg"]) {
      const coverImg = req.files["folderCoverImg"][0];
      const urlcoverImg = `${process.env.BASE_URL}/${coverImg.path.replace(
        /\\/g,
        "/"
      )}`;
      folder.coverImg = urlcoverImg;
    }
    const savedFolder = await folder.save();
    return res.status(201).json(savedFolder);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { removeImages } = req.body;
    const updates = req.body;
    const userId = req.userId;

    const folder = await folderModel.findById(id);

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.owner.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this folder" });
    }

    // Remove specific images if provided
    if (removeImages && Array.isArray(removeImages)) {
      folder.images = folder.images.filter(
        image => !removeImages.includes(image)
      );
    }

    if (req.files) {
      if (req.files["folderImages"]) {
        const folderImages = req.files["folderImages"];
        const imageUrls = [];

        for (const image of folderImages) {
          const imageUrl = `${process.env.BASE_URL}/${image.path.replace(
            /\\/g,
            "/"
          )}`;
          imageUrls.push(imageUrl);
        }

        folder.images = folder.images.concat(imageUrls);
      }

      if (req.files["folderCoverImg"]) {
        const coverImg = req.files["folderCoverImg"][0];
        const urlcoverImg = `${process.env.BASE_URL}/${coverImg.path.replace(
          /\\/g,
          "/"
        )}`;
        updates.coverImg = urlcoverImg;
      }
    }

    Object.keys(updates).forEach(key => {
      if (key !== "images") {
        folder[key] = updates[key];
      }
    });

    const updatedFolder = await folder.save();

    return res.status(200).json(updatedFolder);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
};

export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Find the folder by ID
    const folder = await folderModel.findById(id);

    // Check if the folder exists
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Check if the folder belongs to the user
    if (folder.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete the folder
    await folderModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};
