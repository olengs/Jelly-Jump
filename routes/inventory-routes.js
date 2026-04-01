const express = require("express");
const router = express.Router();
const userMiddleware = require("../middleware/user-middleware");

const inventoryController = require("../controllers/inventory-controllers");

router.get('/purchase', userMiddleware.requireUser, inventoryController.purchase);
router.get('/purchase-shield', userMiddleware.requireUser, inventoryController.purchaseShield);
router.post('/purchase-shield', userMiddleware.requireUser, inventoryController.purchaseShieldSuccess);
router.get('/purchase-coupon', userMiddleware.requireUser, inventoryController.purchaseCoupon);
router.post('/purchase-coupon', userMiddleware.requireUser, inventoryController.purchaseCouponSuccess);

module.exports = router;