const Inventory = require("../models/inventory-model");
const InventoryError = require("../models/inventory-errors");

exports.purchase = async (req, res) => {
    res.render('inventory/purchase', {});
}

exports.purchaseShield = async (req, res) => {
    const user = req.session.user;
    const playerId = user._id

    const inventory = await Inventory.getInventory(playerId);

    const currencyBalance = inventory.currencyBalance || 0;
    const shields = inventory.shields || 0;
    const numberOfCoupons = inventory.numberOfCoupons || 0;

    res.render("inventory/purchase-shield", { 
        currencyBalance: currencyBalance,
        shields: shields,
        numberOfCoupons: numberOfCoupons
    });

    //console.log(currencyBalance);
};


exports.purchaseShieldSuccess = async (req, res) => {
    const numberOfShieldsToBuy = parseInt(req.body.numberOfShieldsToBuy);
    const playerId = req.session.user._id;

    try {
        await Inventory.buyShields(playerId, numberOfShieldsToBuy);
    } catch (error) {
        if (error instanceof InventoryError.InsufficientFundError) {
            const inventory = await Inventory.getInventory(playerId);

            const currencyBalance = inventory.currencyBalance || 0;
            const shields = inventory.shields || 0;
            const numberOfCoupons = inventory.numberOfCoupons || 0;
            return res.render("inventory/purchase-shield", {
                currencyBalance,
                shields,
                numberOfCoupons,
                errorMsg: error.message,
            });
        }
        throw error;
    }
    res.redirect(302, "/purchase-shield");
}

exports.purchaseCoupon = async (req, res) => {
    const user = req.session.user;
    const playerId = user._id

    const inventory = await Inventory.getInventory(playerId);

    const currencyBalance = inventory.currencyBalance || 0;
    const shields = inventory.shields || 0;
    const numberOfCoupons = inventory.numberOfCoupons || 0;

    res.render("inventory/purchase-coupon", { 
        currencyBalance: currencyBalance,
        shields: shields,
        numberOfCoupons: numberOfCoupons
    });
}

exports.purchaseCouponSuccess = async (req, res) => {
    const numberOfCouponsToBuy = parseInt(req.body.numberOfCouponsToBuy);

    const user = req.session.user;
    const playerId = user._id;
    try {
        await Inventory.buyCoupons(playerId, numberOfCouponsToBuy);
    } catch (error) {
        if (error instanceof InventoryError.InsufficientFundError) {
            const inventory = await Inventory.getInventory(playerId);
            const currencyBalance = inventory.currencyBalance || 0;
            const shields = inventory.shields || 0;
            const numberOfCoupons = inventory.numberOfCoupons || 0;
            return res.render("inventory/purchase-coupon", {
                currencyBalance,
                shields,
                numberOfCoupons,
                errorMsg: error.message,
            });
        }
        throw error;
    }
    res.redirect(302, "/purchase-coupon");
}