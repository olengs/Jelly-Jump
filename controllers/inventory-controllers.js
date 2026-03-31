const Inventory = require("../models/inventory-model");

exports.purchase = async (req, res) => {
    res.render('inventory/purchase', {});
}

exports.purchaseShield = async (req, res) => {
    const user = req.session.user;
    const playerId = user._id

    const inventory = await Inventory.getInventory(playerId);

        const currencyBalance = inventory[0].currencyBalance || 0;
        const shields = inventory[0].shields || 0;
        const numberOfCoupons = inventory[0].numberOfCoupons || 0;

        res.render("inventory/purchase-shield", { 
            currencyBalance: currencyBalance,
            shields: shields,
            numberOfCoupons: numberOfCoupons
        });
        console.log(currencyBalance)
};


exports.purchaseShieldSuccess = async (req, res) => {
    const numberOfShieldsToBuy = parseInt(req.body.numberOfShieldsToBuy);
    // console.log(numberOfShieldsToBuy)
    // calculate total cost of shields user is buying -> numshields * cost
    const totalPrice = 50 * numberOfShieldsToBuy;
    // console.log(totalPrice);

    const user = req.session.user;
    const playerId = user._id
    try {
        // deduct money from currencybalance 
        const result = await Inventory.deductBalance(playerId, totalPrice)
        console.log(result)
        const result1 = await Inventory.addShields(playerId, numberOfShieldsToBuy);
        console.log(result1);
        // const currencyBalance = result1.currencyBalance
        // const shields = result1.shields

        const url = `/purchase-success?balance=${result1.currencyBalance}&shields=${result1.shields}&bought=${numberOfShieldsToBuy}`;
        res.redirect(url);

    } catch (error) {
        console.error(error);
        res.status(500).send("Purchase failed.");
    }
}

exports.purchaseSuccessPage = async (req, res) => {
    res.render("inventory/purchase-success", {});
}

exports.purchaseCoupon = async (req, res) => {
    const user = req.session.user;
    const playerId = user._id

    const inventory = await Inventory.getInventory(playerId);

        const currencyBalance = inventory[0].currencyBalance || 0;
        const shields = inventory[0].shields || 0;
        const numberOfCoupons = inventory[0].numberOfCoupons || 0;

        res.render("inventory/purchase-coupon", { 
            currencyBalance: currencyBalance,
            shields: shields,
            numberOfCoupons: numberOfCoupons
        });
      
}

exports.purchaseCouponSuccess = async (req, res) => {
    const numberOfCouponsToBuy = parseInt(req.body.numberOfCouponsToBuy);
    const totalPrice = 30 * numberOfCouponsToBuy;

    const user = req.session.user;
    const playerId = user._id
    try {
        // deduct money from currencybalance 
        const result = await Inventory.deductBalance(playerId, totalPrice)
        const result1 = await Inventory.addCoupons(playerId, numberOfCouponsToBuy);
        console.log(result1);

        const url = `/purchase-success?balance=${result1.currencyBalance}&coupons=${result1.numberOfCoupons}&bought=${numberOfCouponsToBuy}`;
        res.redirect(url);

    } catch (error) {
        console.error(error);
        res.status(500).send("Purchase failed.");
    }

}