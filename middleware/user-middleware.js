const userModel = require("../models/user-model");

exports.requireUser = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    res.redirect(302, "/login");
}

exports.requireAdmin = (req, res, next) => {
    if (!req.session && !req.session.user && !req.session.user.role) {
        return res.redirect(302, "/login");
    }

    if (req.session.user.role === "admin") {
        return next();
    }

    res.status(403).render("error", {errorMsg: "access denied"});
}

exports.autoLoginIfAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect("/home");
    }
    next();
}