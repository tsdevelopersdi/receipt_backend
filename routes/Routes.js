import express from "express";

// >>> IMPORT THE CONTROLLERS
import {
  LoginUser,
  LogoutUser,
  RegisterUser,
  DeleteUser,
} from "../controllers/AuthController.js";
import { refreshToken } from "../controllers/RefreshTokenController.js";
import { priceFinderCallback } from "../controllers/CallbackController.js";
import { VerifyToken, adminOnly } from "../middleware/VerifyToken.js";
import {
  getUsers,
  getUserById,
  updateUser,
} from "../controllers/UserController.js";
import {
  saveDraft,
  save_project,
  getSpecificAttendance,
  getSpecificAttendanceByEmail,
  list_project,
  list_draft,
  getDraftItems,
  updateDraft,
  getAllPriceWithQuery,
  UpdateProject,
  box_list,
  saveBox,
  projectnya,
  buatPenawaran,
  list_invoice,
  invoiceDetail,
  getInvoiceSummary,
  updateInvoiceTransactions,
  updateInvoiceStatus,
  getAPIUsage,
  incrementAPIUsage,
  getInvoiceSummaryAdvanced,
} from "../controllers/SiswaController.js";
import { uploadFile } from "../controllers/UploadController.js";

// >>> DEFINE ROUTER FROM EXPRESS
const router = express.Router();

// ============================================================
// PUBLIC ROUTES — no authentication required
// ============================================================
router.get("/token", refreshToken);
router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/auth/login", LoginUser);
router.delete("/logout", LogoutUser);

// n8n callback — protected by n8n's own mechanism, no JWT needed
router.post("/api/callback/price-finder", priceFinderCallback);
router.get("/api/test-n8n", (req, res) => res.json({ message: "Backend is reachable!", timestamp: new Date() }));

// ============================================================
// PROTECTED ROUTES — VerifyToken required
// ============================================================

// --- Attendance ---
// router.get("/recent", VerifyToken, getSpecificAttendance);
// router.post("/recent", VerifyToken, getSpecificAttendance);
// router.post("/recent/:id", VerifyToken, getSpecificAttendanceByEmail);

// // --- Project Management ---
// router.get("/projects", VerifyToken, list_project);
// router.get("/projects/:id", VerifyToken, projectnya);
// router.post("/projects", VerifyToken, save_project);
// router.put("/projects/:id", VerifyToken, UpdateProject);

// // --- SLD Draft Management ---
// router.get("/list-draft", VerifyToken, list_draft);
// router.get("/list-draft/:id", VerifyToken, getDraftItems);
// router.post("/save-sld", VerifyToken, saveDraft);
// router.post("/update-sld", VerifyToken, updateDraft);

// --- Invoice Management ---
router.post("/upload", uploadFile);
router.get("/listinvoice", VerifyToken, list_invoice);
router.get("/invoice-detail/:id", VerifyToken, invoiceDetail);
router.get("/invoice-summary", VerifyToken, getInvoiceSummary);
router.get("/invoice-summary-advanced", VerifyToken, getInvoiceSummaryAdvanced);
router.get("/api-usage", VerifyToken, getAPIUsage);
router.post("/apiusage/:userId", VerifyToken, incrementAPIUsage);
router.post("/save-invoice", VerifyToken, adminOnly, updateInvoiceTransactions);
router.post("/update-invoice-status", VerifyToken, updateInvoiceStatus);

// --- Pricelist & Box ---
router.get("/pricelist", VerifyToken, getAllPriceWithQuery);
router.get("/box-list", VerifyToken, box_list);
router.post("/save-box", VerifyToken, saveBox);

// --- Penawaran ---
router.get("/draft-penawaran/:id", VerifyToken, buatPenawaran);

// --- User Management ---
router.get("/users", VerifyToken, getUsers);
router.post("/users", VerifyToken, getUsers);
router.delete("/users/:id", VerifyToken, DeleteUser);
router.get("/users/:id", VerifyToken, getUserById);
router.post("/users/:id", VerifyToken, getUserById);
router.put("/users/:id", VerifyToken, updateUser);

export default router;
