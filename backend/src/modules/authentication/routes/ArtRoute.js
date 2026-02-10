const express = require("express");
const router = express.Router();
const artisanController = require("../controller/artProfile");

/**
 * @swagger
 * /artisans/{artisanId}:
 *   get:
 *     summary: Get artisan public profile and artwork history
 *     description: >
 *       Returns an artisan's public profile information along with all their artworks
 *       and associated gallery media. This endpoint is public and does not require authentication.
 *     tags: [Public Artisans]
 *     parameters:
 *       - in: path
 *         name: artisanId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the artisan (AUTHOR role)
 *     responses:
 *       200:
 *         description: Artisan profile and artwork history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Artisan not found
 *       500:
 *         description: Internal server error
 */
router.get("/artisans/:artisanId", artisanController.getArtisanHistory);

module.exports = router;
