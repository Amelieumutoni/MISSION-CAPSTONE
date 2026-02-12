const express = require("express");
const router = express.Router();
const { handleStripeWebhook } = require("../controller/webhookController");

/**
 * @swagger
 * tags:
 *   name: Stripe Webhook
 *   description: Stripe event listener
 */

/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     summary: Stripe webhook endpoint
 *     tags: [Stripe Webhook]
 *     responses:
 *       200:
 *         description: Webhook received
 */
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook,
);

module.exports = router;
