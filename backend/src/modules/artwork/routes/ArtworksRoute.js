const express = require("express");
const router = express.Router();

const artworkController = require("../controller/artworksController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");
const createUploader = require("../../../utils/multer");
const upload = createUploader({ folder: "artworks" });
/**
 * @swagger
 * tags:
 *   name: Artworks
 *   description: Artwork management (Author & Public access)
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
  upload.single("main_image"),
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
  upload.single("main_image"),
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
  authGuard("AUTHOR"),
  artworkController.archiveArtwork,
);

module.exports = router;
