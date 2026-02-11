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
 * tags:
 *   - name: Media
 *     description: Media upload & management
 *
 * components:
 *   schemas:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.delete("/media/:mediaId", authGuard(), mediaController.deleteMedia);

module.exports = router;
