const express = require("express");
const router = express.Router();

const exhibitionController = require("../controller/exhibitionController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");
const createUploader = require("../../../utils/multer");

/* Uploaders */
const uploadBanner = createUploader({
  folder: "exhibitions",
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  maxSize: 5 * 1024 * 1024, // 5MB for images
});

const uploadRecording = createUploader({
  folder: "recordings",
  allowedTypes: [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
  ],
  maxSize: 1024 * 1024 * 1024, // 1GB for recordings
});
/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Exhibition API
 *   description: Exhibition management endpoints
 *   version: 1.0.0
 *
 * servers:
 *   - url: /api/v1
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *
 *     Exhibition:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [CLASSIFICATION, LIVE]
 *         banner:
 *           type: string
 *         is_published:
 *           type: boolean
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   - name: Exhibitions
 *     description: Exhibition management
 */

/* ───────────────────────── PUBLIC ───────────────────────── */

/**
 * @swagger
 * /exhibitions/public:
 *   get:
 *     summary: Get published exhibitions
 *     tags: [Exhibitions]
 *     responses:
 *       200:
 *         description: Public exhibitions list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Exhibition'
 */
router.get("/public", exhibitionController.getPublicExhibitions);

/**
 * @swagger
 * /exhibitions/public/{exhibitionId}:
 *   get:
 *     summary: Get published exhibition by ID
 *     tags: [Exhibitions]
 *     parameters:
 *       - in: path
 *         name: exhibitionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Exhibition found
 *       404:
 *         description: Exhibition not found
 */
router.get("/public/:exhibitionId", exhibitionController.getExhibitionById);

/* ───────────────────────── AUTHOR ───────────────────────── */

router.get(
  "/my-exhibitions",
  authGuard("AUTHOR"),
  exhibitionController.getMyExhibitions,
);

router.get(
  "/my-exhibitions/:exhibitionId",
  authGuard("AUTHOR"),
  exhibitionController.getExhibitionByIdByMe,
);

/**
 * @swagger
 * /exhibitions:
 *   post:
 *     summary: Create an exhibition
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authGuard("AUTHOR"),
  uploadBanner.single("banner"),
  exhibitionController.createExhibition,
);

router.patch(
  "/:exhibitionId",
  authGuard("AUTHOR"),
  uploadBanner.single("banner"),
  exhibitionController.updateExhibition,
);

/**
 * @swagger
 * /exhibitions/{exhibitionId}/artworks:
 *   put:
 *     summary: Assign artworks to exhibition
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/:exhibitionId/artworks",
  authGuard("AUTHOR"),
  exhibitionController.assignArtworks,
);

/* ───────────────────────── ADMIN ───────────────────────── */

/**
 * @swagger
 * /exhibitions/{exhibitionId}/visibility:
 *   patch:
 *     summary: Publish or unpublish exhibition
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/:exhibitionId/visibility",
  authGuard("ADMIN"),
  exhibitionController.toggleVisibility,
);

/* ─────────────────────── LIVE STREAM ────────────────────── */

router.post(
  "/:exhibitionId/start-stream",
  authGuard("AUTHOR"),
  exhibitionController.startLiveStream,
);

/**
 * @swagger
 * /exhibitions/{exhibitionId}/end-stream:
 *   post:
 *     summary: End live stream and archive exhibition
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/:exhibitionId/end-stream",
  authGuard("AUTHOR"),
  exhibitionController.endLiveStream,
);

/* ─────────────────────── RECORDINGS ─────────────────────── */

/**
 * @swagger
 * /exhibitions/recordings/upload:
 *   post:
 *     summary: Upload stream recording
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/recordings/upload",
  authGuard("AUTHOR"),
  uploadRecording.single("recording"),
  exhibitionController.uploadRecording,
);

router.get("/all", authGuard("ADMIN"), exhibitionController.adminExhibitions);

module.exports = router;
