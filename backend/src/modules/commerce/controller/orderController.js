const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Order, OrderItem, Artwork, User, sequelize } = require("../../index");
const { Op } = require("sequelize");
// Creating an order
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, shipping_address } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    let calculatedTotal = 0;
    const stripeLineItems = [];
    const orderItemsToCreate = [];

    for (const item of items) {
      // 1. Fetch artwork WITHIN the transaction to prevent race conditions
      const artwork = await Artwork.findByPk(item.artwork_id, { transaction });

      if (!artwork) {
        throw new Error(`Artwork with ID ${item.artwork_id} not found.`);
      }

      // 2. Check stock
      if (artwork.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for: ${artwork.title}. Available: ${artwork.stock_quantity}`,
        );
      }

      // 3. REDUCE STOCK IMMEDIATELY
      // This "locks" the item for the buyer
      await artwork.decrement("stock_quantity", {
        by: item.quantity,
        transaction,
      });

      // 4. Update status if sold out
      // Refresh local artwork instance to check new stock level
      const updatedStock = artwork.stock_quantity - item.quantity;
      if (updatedStock <= 0) {
        await artwork.update({ status: "SOLD" }, { transaction });
      }

      const itemPrice = parseFloat(artwork.price);
      calculatedTotal += itemPrice * item.quantity;

      // Prepare Stripe line item
      stripeLineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: artwork.title,
            description: artwork.description?.substring(0, 100),
            images: artwork.main_image.startsWith("http")
              ? [artwork.main_image]
              : [
                  `${process.env.BACKEND_URL || "http://localhost:5000"}${artwork.main_image}`,
                ],
          },
          unit_amount: Math.round(itemPrice * 100),
        },
        quantity: item.quantity,
      });

      orderItemsToCreate.push({
        artwork_id: artwork.artwork_id,
        quantity: item.quantity,
        price_at_purchase: itemPrice,
      });
    }

    // 5. Create Parent Order
    const newOrder = await Order.create(
      {
        buyer_id: req.user.id,
        total_price: calculatedTotal,
        shipping_address,
        status: "PENDING",
      },
      { transaction },
    );

    // 6. Create OrderItems
    await OrderItem.bulkCreate(
      orderItemsToCreate.map((oi) => ({ ...oi, order_id: newOrder.order_id })),
      { transaction },
    );

    // 7. Initialize Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: stripeLineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/cart?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart?order_id=${newOrder.order_id}`,
      metadata: {
        order_id: newOrder.order_id.toString(),
      },
    });

    await newOrder.update({ stripe_session_id: session.id }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      checkout_url: session.url,
      order_id: newOrder.order_id,
    });
  } catch (error) {
    // If anything fails (including Stripe), the stock decrement is reversed automatically
    if (transaction) await transaction.rollback();
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        buyer_id: req.user.id,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Artwork,
              as: "artwork",
              attributes: ["title", "main_image", "price"],
            },
          ],
        },
      ],
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrdersByAdmin = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Artwork,
              as: "artwork",
              attributes: ["title", "main_image", "price"],
            },
          ],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["name", "email"],
        },
      ],
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Getting the order details and their items
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Artwork,
              as: "artwork",
              attributes: ["title", "main_image", "price"],
            },
          ],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["name", "email"],
        },
      ],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderItem, as: "items" }],
      transaction,
    });
    if (order && order.status === "PENDING") {
      for (const item of order.items) {
        await Artwork.increment("stock_quantity", {
          by: item.quantity,
          where: { artwork_id: item.artwork_id },
          transaction,
        });

        // Restore status if it was archived
        await Artwork.update(
          { status: "AVAILABLE" },
          {
            where: {
              artwork_id: item.artwork_id,
              stock_quantity: { [Op.gt]: 0 },
            },
            transaction,
          },
        );
      }

      await order.update({ status: "CANCELLED" }, { transaction });
      await transaction.commit();
      return res
        .status(200)
        .json({ message: "Order cancelled and stock restored." });
    }

    await transaction.rollback();
    res.status(400).json({ message: "Order cannot be cancelled." });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
};
