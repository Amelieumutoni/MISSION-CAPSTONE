const express = require("express");
const router = express.Router();

const exhibitionController = require("../controller/exhibitionController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");
const createUploader = require("../../../utils/multer");

const uploadBanner = createUploader({ folder: "exhibitions" });

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
 *       500:
 *         description: Server error
 */
router.get("/public", exhibitionController.getPublicExhibitions);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exhibition'
 *       404:
 *         description: Exhibition not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */
router.get("/public/:exhibitionId", exhibitionController.getExhibitionById);

/**
 * @swagger
 * /exhibitions/{exhibitionId}/visibility:
 *   patch:
 *     summary: Publish or unpublish exhibition
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: exhibitionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visibility updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exhibition not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */
router.patch(
  "/:exhibitionId/visibility",
  authGuard("ADMIN"),
  exhibitionController.toggleVisibility,
);

router.patch(
  "/:exhibitionId",
  authGuard("AUTHOR"),
  uploadBanner.single("banner_image"),
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
 *     parameters:
 *       - in: path
 *         name: exhibitionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [artworkIds]
 *             properties:
 *               artworkIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Artworks assigned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Exhibition not found
 *       500:
 *         description: Server error
 */
router.put(
  "/:exhibitionId/artwork",
  authGuard("AUTHOR"),
  exhibitionController.assignArtworks,
);

router.post(
  "/:exhibitionId/start-stream",
  authGuard("AUTHOR"),
  exhibitionController.startLiveStream,
);

/**
 * @swagger
 * /exhibitions:
 *   post:
 *     summary: Create an exhibition
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, type]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [CLASSIFICATION, LIVE]
 *               stream_link:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               banner:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Exhibition created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Exhibition'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  authGuard("AUTHOR"),
  uploadBanner.single("banner"),
  exhibitionController.createExhibition,
);

module.exports = router;
