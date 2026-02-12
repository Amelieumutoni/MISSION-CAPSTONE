const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { Order, OrderItem, Artwork, User, sequelize } = require("../../index");
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
      const artwork = await Artwork.findByPk(item.artwork_id);

      if (!artwork) {
        throw new Error(`Artwork with ID ${item.artwork_id} not found.`);
      }

      if (artwork.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for: ${artwork.title}. Available: ${artwork.stock_quantity}`,
        );
      }

      const itemPrice = parseFloat(artwork.price);
      calculatedTotal += itemPrice * item.quantity;

      // Prepare Stripe line item (Stripe uses cents/smallest currency unit)
      stripeLineItems.push({
        price_data: {
          currency: "usd", // Testing mode
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

    // 2. Create the Parent Order record
    const newOrder = await Order.create(
      {
        buyer_id: req.user.id,
        total_price: calculatedTotal,
        shipping_address,
        status: "PENDING",
      },
      { transaction },
    );

    // 3. Create the OrderItems linked to the new Order ID
    await OrderItem.bulkCreate(
      orderItemsToCreate.map((oi) => ({ ...oi, order_id: newOrder.order_id })),
      { transaction },
    );

    // 4. Initialize Stripe Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: stripeLineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/?order_id=${newOrder.order_id}`,
      metadata: {
        order_id: newOrder.order_id.toString(),
      },
    });

    // 5. Save the Session ID back to the Order
    await newOrder.update({ stripe_session_id: session.id }, { transaction });

    // Everything went well, commit the DB changes
    await transaction.commit();

    res.status(201).json({
      success: true,
      checkout_url: session.url, // Redirect your frontend to this Stripe URL
      order_id: newOrder.order_id,
    });
  } catch (error) {
    await transaction.rollback();
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
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, {
      where: {
        buyer_id: req.user.id,
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    // Business Logic: Only cancel if not already shipped
    if (order.status === "PAID") {
      return res.status(400).json({ message: "Cannot cancel paid order" });
    }

    await order.update({ status: "CANCELLED" });

    res
      .status(200)
      .json({ success: true, message: "Order has been cancelled." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
