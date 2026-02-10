const express = require("express");
const router = express.Router();

const mediaController = require("../controller/media.controller");
const { authGuard } = require("../../../middleware/auth.middleware");
const createUploader = require("../../../utils/multerHelper");

const uploadMedia = createUploader({
  folder: "artworks/media",
  multiple: true,
});

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
 *       - in: formData
 *         name: primary_index
 *         type: integer
 *         description: Index of the primary media (0-based)
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
 */
router.post(
  "/artworks/:artworkId/media",
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
 */
router.get("/artworks/:artworkId/media", mediaController.getArtworkMedia);

/**
 * @swagger
 * /media/{mediaId}/primary:
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
 */
router.patch(
  "/media/:mediaId/primary",
  authGuard("AUTHOR"),
  mediaController.setPrimaryMedia,
);

/**
 * @swagger
 * /media/{mediaId}:
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
 */
router.delete("/media/:mediaId", authGuard(), mediaController.deleteMedia);

module.exports = router;
