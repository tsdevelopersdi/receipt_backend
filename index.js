// --- IMPORTING EXTERNAL MODUlES
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import fileUpload from "express-fileupload";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import selectedBox from "./models/selectedBox.js";
dotenv.config();

// --- IMPORTING INTERNAL MODULES
import DB from "./config/Database.js";
import Siswa from "./models/SiswaModel.js";
import sld_draft from "./models/DraftModel.js";
import Users from "./models/UserModel.js";
import ProjectModel from "./models/ProjectModel.js";
import sld_draft_name from "./models/sld_draft.js";
import Pricelist from "./models/Pricelist.js";
import "./models/associations.js";
import BoxModel from "./models/BoxModel.js";
import invoice from "./models/invoiceModel.js";
import transaction from "./models/transactionModel.js";
import APIUsageGroup from "./models/api_ussage_group.js";
import APIUsageIndividual from "./models/api_ussage_individual.js";
// import Presensi from "./models/PresensiModel.js";
import router from "./routes/Routes.js";
import path from "path";
import fs from "fs";

// --- DEFINE APP FROM EXPRESS
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(/[,\n]/).map(o => o.trim()).filter(Boolean) : "*",
    methods: ["GET", "POST"]
  }
});

// Attach io to app for access in routes
app.set("io", io);

// Socket.io Connection Logic
io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join_draft", (draftId) => {
    socket.join(`draft_${draftId}`);
    console.log(`Socket ${socket.id} joined room: draft_${draftId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.set('trust proxy', 1);

// --- APP INTEGRATION
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(/[,\n]/).map(o => o.trim()).filter(Boolean)
      : true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(fileUpload());

// --- RATE LIMITING ---
// 1. General Rate Limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// 2. Strict Login Limiter: 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: { message: "Too many login attempts. Please try again in 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/login", loginLimiter);
app.use("/auth/login", loginLimiter);
// app.use(cors());
app.use(express.static("public"));
// app.use("/invoice-detail-image", express.static(path.resolve("upload")));
// app.use("/invoice-detail-image", express.static(process.env.ATTENDANCE_UPLOAD_DIR));
console.log("[DEBUG] invoice-detail-image path:", path.resolve(process.env.ATTENDANCE_UPLOAD_DIR));
app.use("/invoice-detail-image", (req, res, next) => {
  console.log("[HIT] invoice-detail-image request:", req.path);
  next();
});
// app.use("/invoice-detail-image", express.static(path.resolve(process.env.ATTENDANCE_UPLOAD_DIR)));
app.use("/invoice-detail-image", express.static(path.resolve(process.env.ATTENDANCE_UPLOAD_DIR)));
app.use(router);

// --- DATABASE CONNECTION

try {
  await DB.authenticate();
  console.log("Database Connected !");
  await Users.sync();
  await ProjectModel.sync();
  await sld_draft_name.sync();
  await sld_draft.sync();
  await BoxModel.sync();
  await Pricelist.sync();
  await selectedBox.sync();
  await invoice.sync();
  await transaction.sync();
  await APIUsageGroup.sync();
  await APIUsageIndividual.sync();
} catch (error) {
  console.log(error);
}

const PHOTO_DIR = path.resolve(process.env.ATTENDANCE_UPLOAD_DIR);
console.log(`[DEBUG] Resolved PHOTO_DIR: ${PHOTO_DIR}`);

if (fs.existsSync(PHOTO_DIR)) {
  console.log(`[DEBUG] Directory exists. Contents:`);
  try {
    const files = fs.readdirSync(PHOTO_DIR);
    console.log(files.slice(0, 5)); // Show first 5 files
  } catch (err) {
    console.error(`[DEBUG] Error reading directory:`, err);
  }
} else {
  console.error(`[DEBUG] Directory DOES NOT exist!`);
}

app.use('/photos', express.static(PHOTO_DIR));

// --- START THE SERVER
httpServer.listen(15753, () => {
  console.log("Server Start on port 15753");
});
