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
        await Artwork.decrement("stock_quantity", {
          by: item.quantity,
          where: { artwork_id: item.artwork_id },
          transaction,
        });
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
  const orderId = session.metadata.order_id;
  await Order.update({ status: "FAILED" }, { where: { order_id: orderId } });
  console.log(`Order ${orderId} marked as FAILED.`);
}
