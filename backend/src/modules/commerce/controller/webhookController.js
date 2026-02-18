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
    const order = await Order.findByPk(orderId, { transaction });
    if (order && order.status !== "PAID") {
      await order.update({ status: "PAID" }, { transaction });

      const items = await OrderItem.findAll({
        where: { order_id: orderId },
        transaction,
      });
      for (const item of items) {
        const updatedArtwork = await Artwork.decrement("stock_quantity", {
          by: item.quantity,
          where: { artwork_id: item.artwork_id },
          transaction,
        });

        const artwork = await Artwork.findByPk(item.artwork_id, {
          transaction,
        });

        if (artwork && artwork.stock_quantity <= 0) {
          await artwork.update(
            {
              status: "ARCHIVED",
              stock_quantity: 0,
            },
            { transaction },
          );
        }
      }
      await transaction.commit();
      console.log(`Order ${orderId} successfully paid and stock updated.`);
    }
  } catch (error) {
    await transaction.rollback();
    console.error(`Error processing success webhook: ${error.message}`);
  }
}

async function handleFailedPayment(session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  const transaction = await sequelize.transaction();

  try {
    // 1. Find the order and its items
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem }],
      transaction,
    });

    if (!order || order.status === "FAILED") {
      await transaction.rollback();
      return;
    }

    // 2. Increment the stock back for each item
    for (const item of order.OrderItems) {
      await Artwork.increment("stock_quantity", {
        by: item.quantity,
        where: { artwork_id: item.artwork_id },
        transaction,
      });

      // If the artwork was ARCHIVED because stock hit 0, bring it back to AVAILABLE
      const artwork = await Artwork.findByPk(item.artwork_id, { transaction });
      if (
        artwork &&
        artwork.status === "ARCHIVED" &&
        artwork.stock_quantity > 0
      ) {
        await artwork.update({ status: "AVAILABLE" }, { transaction });
      }
    }

    // 3. Mark the order as FAILED
    await order.update({ status: "FAILED" }, { transaction });

    await transaction.commit();
    console.log(`Order ${orderId} failed: Stock restored and status updated.`);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error(
      `Error processing failure webhook for Order ${orderId}:`,
      error.message,
    );
  }
}
