// routes/customer/shippingController.js

const express = require("express");
const router = express.Router();
const shippingController = require("../../controllers/customer/shippingController");

router.get("/areas", shippingController.getAreas);
router.post("/calculate", shippingController.calculateShipping);
router.post("/validate-address", shippingController.validateAddress);
router.get("/store-location", shippingController.getStoreLocation);
router.get("/delivery-options", shippingController.getDeliveryOptions);

module.exports = router;
