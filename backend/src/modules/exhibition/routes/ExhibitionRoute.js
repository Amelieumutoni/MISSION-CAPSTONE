const express = require("express");
const router = express.Router();

const exhibitionController = require("../controller/exhibition.controller");
const { authGuard } = require("../../../middleware/auth.middleware");
const createUploader = require("../../../utils/multerHelper");

const uploadBanner = createUploader({ folder: "exhibitions" });

/**
 * @swagger
 * tags:
 *   name: Exhibitions
 *   description: Exhibition management
 */

/**
 * @swagger
 * /exhibitions:
 *   post:
 *     summary: Create an exhibition (ADMIN)
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
 */
router.post(
  "/exhibitions",
  authGuard("ADMIN"),
  uploadBanner.single("banner"),
  exhibitionController.createExhibition,
);

/**
 * @swagger
 * /exhibitions/{exhibitionId}/visibility:
 *   patch:
 *     summary: Publish or unpublish exhibition (ADMIN)
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  "/exhibitions/:exhibitionId/visibility",
  authGuard("ADMIN"),
  exhibitionController.toggleVisibility,
);

/**
 * @swagger
 * /exhibitions/{exhibitionId}/artworks:
 *   put:
 *     summary: Assign artworks to exhibition (ADMIN)
 *     tags: [Exhibitions]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  "/exhibitions/:exhibitionId/artworks",
  authGuard("ADMIN"),
  exhibitionController.assignArtworks,
);

/**
 * @swagger
 * /exhibitions/public:
 *   get:
 *     summary: Get published exhibitions (PUBLIC)
 *     tags: [Exhibitions]
 */
router.get("/exhibitions/public", exhibitionController.getPublicExhibitions);

/**
 * @swagger
 * /exhibitions/public/{exhibitionId}:
 *   get:
 *     summary: Get single published exhibition (PUBLIC)
 *     tags: [Exhibitions]
 */
router.get(
  "/exhibitions/public/:exhibitionId",
  exhibitionController.getExhibitionById,
);

module.exports = router;
