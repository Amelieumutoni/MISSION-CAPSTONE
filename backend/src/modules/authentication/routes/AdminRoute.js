const express = require("express");
const router = express.Router();
const adminController = require("../controller/adminController");
const artworkController = require("../../artwork/controller/artworksController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

/**
 * @swagger
 * /admin/artists:
 *   get:
 *     summary: Get all users with their profiles (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: integer
 *                         example: 12
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john@mail.com"
 *                       status:
 *                         type: string
 *                         example: "PENDING"
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       profile:
 *                         type: object
 *                         properties:
 *                           bio:
 *                             type: string
 *                             example: "Professional sculptor"
 *                           location:
 *                             type: string
 *                             example: "Kigali"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get("/artists", authGuard("ADMIN"), adminController.getAllArtists);

/**
 * @swagger
 * /admin/artists/{userId}/status:
 *   patch:
 *     summary: Update artist account status (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Artist user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, PENDING]
 *                 example: ACTIVE
 *     responses:
 *       200:
 *         description: Artist status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Artist status updated to ACTIVE
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 12
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *       400:
 *         description: Invalid status type`
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Artist not found
 */
router.patch(
  "/artists/:userId/status",
  authGuard("ADMIN"),
  adminController.updateArtistStatus,
);

/**
 * @swagger
 * /admin/{artworkId}/archive:
 *   patch:
 *     summary: Archive an artwork (Admin endpoint)
 *     tags: [Admin]
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
  authGuard("ADMIN"),
  artworkController.archiveArtwork,
);

module.exports = router;
