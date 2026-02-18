const express = require("express");
const router = express.Router();

const artworkController = require("../controller/artworksController");
const mediaController = require("../controller/mediaController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");
const createUploader = require("../../../utils/multer");

const uploadArtwork = createUploader({ folder: "artworks" });
const uploadMedia = createUploader({
  folder: "artworks/media",
  multiple: true,
});

/**
 * @swagger
 * tags:
 *   - name: Artworks
 *     description: Artwork management (Author & Public access)
 *   - name: Media
 *     description: Media upload & management
 *
 * components:
 *   schemas:
 *     Artwork:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         technique:
 *           type: string
 *         materials:
 *           type: string
 *         dimensions:
 *           type: string
 *         creation_year:
 *           type: integer
 *         price:
 *           type: number
 *         stock_quantity:
 *           type: integer
 *         main_image:
 *           type: string
 *           format: binary
 *     Media:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         url:
 *           type: string
 *         is_primary:
 *           type: boolean
 *         artworkId:
 *           type: integer
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * ---------------------------
 * Artwork Routes
 * ---------------------------
 */

/**
 * @swagger
 * /artworks:
 *   post:
 *     summary: Create a new artwork (Author only)
 *     tags: [Artworks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - main_image
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               technique:
 *                 type: string
 *               materials:
 *                 type: string
 *               dimensions:
 *                 type: string
 *                 example: "50 x 40 x 5 cm"
 *               creation_year:
 *                 type: integer
 *               price:
 *                 type: number
 *                 format: decimal
 *               stock_quantity:
 *                 type: integer
 *               main_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Artwork created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authGuard("AUTHOR"),
  uploadArtwork.single("main_image"),
  artworkController.createArtwork,
);

/**
 * @swagger
 * /artworks/me:
 *   get:
 *     summary: Get artworks created by the logged-in author
 *     tags: [Artworks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of author's artworks
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authGuard("AUTHOR"), artworkController.getMyArtworks);

/**
 * @swagger
 * /artworks:
 *   get:
 *     summary: Get all artworks (Public)
 *     tags: [Artworks]
 *     responses:
 *       200:
 *         description: List of artworks
 */
router.get("/", artworkController.getArtworks);

/**
 * @swagger
 * /artworks/{artworkId}:
 *   get:
 *     summary: Get artwork by ID
 *     tags: [Artworks]
 *     parameters:
 *       - in: path
 *         name: artworkId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artwork details
 *       404:
 *         description: Artwork not found
 */
router.get("/:artworkId", artworkController.getArtworkById);

/**
 * @swagger
 * /artworks/{artworkId}:
 *   patch:
 *     summary: Update an artwork (Author only)
 *     tags: [Artworks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artworkId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               technique:
 *                 type: string
 *               materials:
 *                 type: string
 *               dimensions:
 *                 type: string
 *               creation_year:
 *                 type: integer
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *               main_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Artwork updated successfully
 *       404:
 *         description: Artwork not found
 */
router.patch(
  "/:artworkId",
  authGuard("AUTHOR"),
  uploadArtwork.single("main_image"),
  artworkController.updateArtwork,
);

/**
 * @swagger
 * /artworks/{artworkId}/archive:
 *   patch:
 *     summary: Archive an artwork (Author only)
 *     tags: [Artworks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artworkId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artwork archived successfully
 *       404:
 *         description: Artwork not found
 */
router.patch(
  "/:artworkId/archive",
  authGuard("AUTHOR", "ADMIN"),
  artworkController.archiveArtwork,
);

/**
 * ---------------------------
 * Media Routes (nested under artworks)
 * ---------------------------
 */

/**
 * @swagger
 * /artworks/{artworkId}/media:
 *   post:
 *     summary: Bulk upload media for an artwork (AUTHOR only)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: artworkId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               media:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
 */
router.post(
  "/:artworkId/media",
  authGuard("AUTHOR"),
  uploadMedia.array("media", 10),
  mediaController.bulkUploadMedia,
);

/**
 * @swagger
 * /artworks/{artworkId}/media:
 *   get:
 *     summary: Get all media for an artwork (PUBLIC)
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: artworkId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Artwork media list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
 */
router.get("/:artworkId/media", mediaController.getArtworkMedia);

/**
 * @swagger
 * /artworks/media/{mediaId}/primary:
 *   patch:
 *     summary: Set a media as primary (AUTHOR only)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Primary media updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 */
router.patch(
  "/media/:mediaId/primary",
  authGuard("AUTHOR"),
  mediaController.setPrimaryMedia,
);

/**
 * @swagger
 * /artworks/media/{mediaId}:
 *   delete:
 *     summary: Delete media (AUTHOR own or ADMIN)
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: mediaId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Media deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/media/:mediaId", authGuard(), mediaController.deleteMedia);

module.exports = router;
