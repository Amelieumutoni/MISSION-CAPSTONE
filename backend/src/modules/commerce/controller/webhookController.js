const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const notificationEmitter = require("../../../events/EventEmitter");
const {
  Order,
  Artwork,
  OrderItem,
  Shipment,
  sequelize,
} = require("../../index");

exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the specific event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object;
      await handleSuccessfulPayment(session);
      break;

    case "checkout.session.async_payment_failed":
    case "payment_intent.payment_failed":
      const failedSession = event.data.object;
      await handleFailedPayment(failedSession);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

async function handleSuccessfulPayment(session) {
  const orderId = session.metadata.order_id;
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
    });

    if (!order || order.status === "PAID") {
      await transaction.rollback();
      return;
    }

    let artistId = null;

    for (const item of order.items) {
      const artwork = await Artwork.findByPk(item.artwork_id, { transaction });
      if (!artwork) continue;

      if (!artistId) artistId = artwork.author_id;

      const newStock = artwork.stock_quantity - item.quantity;
      const isOutOfStock = newStock <= 0;

      await artwork.update(
        {
          stock_quantity: Math.max(0, newStock),
          status: newStock <= 0 ? "SOLD" : "AVAILABLE",
        },
        { transaction },
      );

      notificationEmitter.emit("sendNotification", {
        recipient_id: artwork.author_id,
        actor_id: order.buyer_id,
        type: "artwork_sold",
        title: "Artwork Sold!",
        message: `Great news! "${artwork.title}" has been purchased. You have earned $${item.price_at_purchase * item.quantity}.`,
        entity_type: "artwork",
        entity_id: artwork.artwork_id,
        priority: "high",
        metadata: { amount: item.price_at_purchase, quantity: item.quantity },
      });

      if (isOutOfStock) {
        notificationEmitter.emit("sendNotification", {
          recipient_id: artwork.author_id,
          type: "artwork_out_of_stock",
          title: "Stock Alert: Sold Out",
          message: `"${artwork.title}" is now out of stock.`,
          entity_type: "artwork",
          entity_id: artwork.artwork_id,
          priority: "urgent",
        });
      }
    }

    await Shipment.create(
      {
        order_id: orderId,
        status: "PENDING",
      },
      { transaction },
    );

    await order.update({ status: "PAID" }, { transaction });

    await transaction.commit();

    if (artistId) {
      notificationEmitter.emit("sendNotification", {
        recipient_id: artistId,
        type: "order_paid",
        title: "New Shipment Pending 📦",
        message: `Order #${orderId} is ready to be shipped. Please provide tracking info in your dashboard.`,
        entity_type: "order",
        entity_id: orderId,
        priority: "high",
        link: `/dashboard/orders/${orderId}`,
      });
    }

    notificationEmitter.emit("sendNotification", {
      recipient_id: order.buyer_id,
      type: "order_paid",
      title: "Payment Confirmed",
      message: `Thank you! Your payment for Order #${orderId} was successful. The artist has been notified to ship your items.`,
      entity_type: "order",
      entity_id: orderId,
      priority: "high",
      link: `/account/orders/${orderId}`,
    });

    console.log(`Order ${orderId} paid — stock updated and shipment created.`);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(`Webhook success error: ${error.message}`);
  }
}
