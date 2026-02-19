const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Order, Artwork, OrderItem, sequelize } = require("../../index");

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

// Stripe success and failure payment handling

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

    // Decrement stock and mark SOLD only on successful payment
    for (const item of order.items) {
      const artwork = await Artwork.findByPk(item.artwork_id, { transaction });
      if (!artwork) continue;

      const newStock = artwork.stock_quantity - item.quantity;

      await artwork.update(
        {
          stock_quantity: Math.max(0, newStock),
          status: newStock <= 0 ? "SOLD" : "AVAILABLE",
        },
        { transaction },
      );
    }

    await order.update({ status: "PAID" }, { transaction });
    await transaction.commit();
    console.log(`Order ${orderId} paid — stock updated.`);
  } catch (error) {
    await transaction.rollback();
    console.error(`Webhook success error: ${error.message}`);
  }
}

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

    // Decrement stock and mark SOLD only on successful payment
    for (const item of order.items) {
      const artwork = await Artwork.findByPk(item.artwork_id, { transaction });
      if (!artwork) continue;

      const newStock = artwork.stock_quantity - item.quantity;

      await artwork.update(
        {
          stock_quantity: Math.max(0, newStock),
          status: newStock <= 0 ? "SOLD" : "AVAILABLE",
        },
        { transaction },
      );
    }

    await order.update({ status: "PAID" }, { transaction });
    await transaction.commit();
    console.log(`Order ${orderId} paid — stock updated.`);
  } catch (error) {
    await transaction.rollback();
    console.error(`Webhook success error: ${error.message}`);
  }
}
