"use strict";

const { Shipment, Order, User, OrderItem, Artwork } = require("../../index");
const notificationEmitter = require("../../../events/EventEmitter");

// shipment.controller.js (or wherever your controller is)

exports.getArtistShipments = async (req, res) => {
  try {
    const artistId = req.user.id;

    const shipments = await Shipment.findAll({
      include: [
        {
          model: Order,
          required: true, // inner join – only orders with items by this artist
          include: [
            {
              model: User, // buyer details
              as: "buyer",
              attributes: ["user_id", "name", "email"],
            },
            {
              model: OrderItem,
              as: "items",
              required: true,
              include: [
                {
                  model: Artwork,
                  as: "artwork",
                  where: { author_id: artistId }, // filter items to this artist's artworks only
                  attributes: ["artwork_id", "title", "main_image", "price"],
                },
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data: shipments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.fulfillOrder = async (req, res) => {
  const { order_id } = req.params;
  const { tracking_number, carrier } = req.body;
  const artistId = req.user.id;

  try {
    const shipment = await Shipment.findOne({
      where: { order_id },
      include: [
        {
          model: Order,
          include: [
            {
              model: OrderItem,
              as: "items",
              include: [{ model: Artwork, as: "artwork" }],
            },
          ],
        },
      ],
    });

    if (!shipment) {
      return res
        .status(404)
        .json({ success: false, message: "Shipment not found." });
    }

    // Verify the artist has at least one item in this order
    const hasArtistItem = shipment.Order.items.some(
      (item) => item.artwork.author_id === artistId,
    );
    if (!hasArtistItem) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You do not have any items in this order.",
      });
    }

    await shipment.update({
      tracking_number,
      carrier,
      status: "SHIPPED",
      shipped_at: new Date(),
    });

    // Notify buyer
    notificationEmitter.emit("sendNotification", {
      recipient_id: shipment.Order.buyer_id,
      type: "order_shipped",
      title: "Your Art is on the way! 🚚",
      message: `Your package is with ${carrier}. Tracking: ${tracking_number}`,
      priority: "normal",
      link: `/dashboard/orders/${order_id}`,
    });

    res.json({ success: true, message: "Order marked as shipped." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * 3. Confirm Delivery
 * This closes the cycle. Usually triggered by the Buyer.
 */
exports.confirmDelivery = async (req, res) => {
  const { order_id } = req.params;
  const userId = req.user.id;

  try {
    const shipment = await Shipment.findOne({
      where: { order_id },
      include: [{ model: Order }],
    });

    // Only the buyer of this order (or an admin) can confirm delivery
    if (
      !shipment ||
      (shipment.Order.buyer_id !== userId && req.user.role !== "ADMIN")
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    await shipment.update({
      status: "DELIVERED",
      delivered_at: new Date(),
    });

    // Notify the Artist that the customer received the art
    notificationEmitter.emit("sendNotification", {
      recipient_id: shipment.Order.artist_id,
      type: "order_delivered",
      title: "Package Delivered! ✅",
      message: `The buyer confirmed they received Order #${order_id}.`,
      priority: "high",
    });

    res.json({ success: true, message: "Delivery confirmed." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
