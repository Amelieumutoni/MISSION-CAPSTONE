// routes/archive.routes.js
const express = require("express");
const router = express.Router();
const archiveController = require("../controller/applicationController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");

// Public routes
router.get("/public", archiveController.getPublicArchive);
router.post("/apply", archiveController.submitApplication);
router.get("/status", archiveController.checkStatus); // optional: check by email

// Admin only routes
router.get(
  "/admin/applications",
  authGuard("ADMIN"),
  archiveController.getAllApplications,
);
router.put(
  "/admin/applications/:id",
  authGuard("ADMIN"),
  archiveController.updateApplication,
);

module.exports = router;
