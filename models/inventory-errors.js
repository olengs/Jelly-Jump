class InsufficientFundError extends Error {
    constructor() {
        super("Purchase failed: Insufficient funds");
    }
}

class InsufficientCouponsError extends Error {
    constructor() {
        super("Purchase failed: Insufficient funds");
    }
}

module.exports = {
    InsufficientCouponsError,
    InsufficientFundError,
}