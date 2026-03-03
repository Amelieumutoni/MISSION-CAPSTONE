const express = require("express");
const router = express.Router();
const shippingController = require("../controller/shipmentController");
const { authGuard } = require("../../../utils/middleware/AuthMiddlware");

router.get(
  "/artist/all",
  authGuard("AUTHOR"),
  shippingController.getArtistShipments,
);

router.put(
  "/:order_id/fulfill",
  authGuard("AUTHOR"),
  shippingController.fulfillOrder,
);

router.patch(
  "/:order_id/deliver",
  authGuard(),
  shippingController.confirmDelivery,
);

module.exports = router;
