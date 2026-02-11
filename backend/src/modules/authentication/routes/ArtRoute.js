const express = require("express");
const router = express.Router();
const artisanController = require("../controller/artProfile");

/**
 * @swagger
 * /artists/{artistId}:
 *   get:
 *     summary: Get artisan public profile and artwork history
 *     description: >
 *       Returns an artist's public profile information along with all their artworks
 *       and associated gallery media. This endpoint is public and does not require authentication.
 *     tags: [Public Artists]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the artists (AUTHOR role)
 *     responses:
 *       200:
 *         description: Artists profile and artwork history retrieved successfully
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
 *         description: Artists not found
 *       500:
 *         description: Internal server error
 */
router.get("/:artistId", artisanController.getArtisanHistory);

module.exports = router;
