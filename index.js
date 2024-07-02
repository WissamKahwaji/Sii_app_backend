import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import usrsRoutes from "./routes/user_router.js";
import courseRoutes from "./routes/course_router.js";
import postRoutes from "./routes/post_router.js";
import siiCardRoutes from "./routes/sii_card_router.js";
import foldersRoutes from "./routes/folder_router.js";
import privacyPolicyRoutes from "./routes/privacy_policy.js";
import infoHelpRoutes from "./routes/info_help_router.js";
import qrcodeRoutes from "./routes/qrCode_router.js";
import cardPrivacyPolicyRoutes from "./routes/card_privacy_policy_router.js";
import sliderRoutes from "./routes/slider_router.js";

import passport from "./services/passport.js";
import session from "express-session";

const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    const filename = `${file.originalname.split(".")[0]}-${Date.now()}${ext}`;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "video/mp4" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/msword"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with your secret key
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// const corsOptions = {
//   credentials: true,
//   origin: "http://localhost:5173",
//   methods: "GET,POST,PUT,DELETE",
// };

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).fields([
    { name: "profileImage", maxCount: 1 },
    { name: "img", maxCount: 1 },
    { name: "coverVideoImage", maxCount: 1 },
    { name: "coverPdfImage", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "doc", maxCount: 1 },
    { name: "postImages", maxCount: 10 },
    { name: "folderImages", maxCount: 15 },
    { name: "folderCoverImg", maxCount: 1 },
  ])
);

app.use("/users", usrsRoutes);
app.use("/course", courseRoutes);
app.use("/post", postRoutes);
app.use("/sii-card", siiCardRoutes);
app.use("/folders", foldersRoutes);
app.use("/privacy-policy", privacyPolicyRoutes);
app.use("/info-help", infoHelpRoutes);
app.use("/qrcode", qrcodeRoutes);
app.use("/card-privacy-policy", cardPrivacyPolicyRoutes);
app.use("/slider", sliderRoutes);

app.get("/", (req, res) => res.send("Server is running"));

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.CONNECTION_URL;

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(PORT, () => {
      console.log(`Server Running on ${PORT}`);
    })
  )
  .catch(error => console.log(error.message));

mongoose.set("strictQuery", true);
