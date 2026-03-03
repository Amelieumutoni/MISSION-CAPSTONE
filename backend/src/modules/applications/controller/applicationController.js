// controllers/archive.controller.js
const { ArchiveApplication, Exhibition } = require("../../index");
const { Op } = require("sequelize");

// Public archive overview – accessible to everyone
exports.getPublicArchive = async (req, res) => {
  try {
    const archives = await Exhibition.findAll({
      where: { status: "COMPLETED" },
      attributes: [
        "exhibition_id",
        "title",
        "banner_url",
        "live_stream_url",
        "created_at",
      ],
    });
    res.json({ success: true, data: archives });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Public: Submit an application (no auth required)
exports.submitApplication = async (req, res) => {
  try {
    const { full_name, email, institution, research_purpose } = req.body;

    // Basic validation
    if (!full_name || !email || !research_purpose) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and research purpose are required.",
      });
    }

    const application = await ArchiveApplication.create({
      full_name,
      email,
      institution,
      research_purpose,
    });

    res.status(201).json({
      success: true,
      message:
        "Application submitted successfully. You will be contacted if approved.",
      data: { application_id: application.application_id },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Public: Check application status by email (optional, but could be useful)
exports.checkStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email required." });
    }
    const applications = await ArchiveApplication.findAll({
      where: { email },
      attributes: ["application_id", "status", "created_at", "updated_at"],
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ========== ADMIN ENDPOINTS ==========

// Admin gets all applications
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await ArchiveApplication.findAll({
      order: [["created_at", "DESC"]],
    });
    res.json({ success: true, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin updates application (approve/reject, provide access link, notes)
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, access_link, admin_notes, expires_at } = req.body;

    const application = await ArchiveApplication.findByPk(id);
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found." });
    }

    // Validate status if provided
    if (status && !["APPROVED", "REJECTED"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status." });
    }

    await application.update({
      status: status || application.status,
      access_link: access_link || application.access_link,
      admin_notes: admin_notes || application.admin_notes,
      expires_at: expires_at || application.expires_at,
    });

    // Optionally send email notification to the applicant (using a mail service)
    // If approved, send access_link; if rejected, notify with admin_notes.

    res.json({
      success: true,
      message: `Application ${status?.toLowerCase() || "updated"}.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
