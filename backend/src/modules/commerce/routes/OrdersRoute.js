const express = require("express");
const router = express();
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");
const orderController = require("../controller/orderController");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order & payment management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create an order and Stripe checkout
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, shipping_address]
 *             properties:
 *               shipping_address:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [artwork_id, quantity]
 *                   properties:
 *                     artwork_id:
 *                       type: integer
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Checkout session created
 */
router.post("/", authGuard("BUYER"), orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get logged-in user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders list
 */
router.get("/", authGuard("BUYER"), orderController.getAllOrders);

/**
 * @swagger
 * /orders/all:
 *   get:
 *     summary: Get order details
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 */
router.get("/all", authGuard("ADMIN"), orderController.getAllOrdersByAdmin);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders,Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order details
 */
router.get(
  "/:id",
  authGuard("BUYER", "ADMIN"),
  orderController.getOrderDetails,
);

/**
 * @swagger
 * /orders/{orderId}/cancel:
 *   patch:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order cancelled
 */
router.patch(
  "/:orderId/cancel",
  authGuard("BUYER"),
  orderController.cancelOrder,
);

module.exports = router;
