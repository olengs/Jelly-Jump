const UserModel = require("../models/user-model");

exports.requireUser = async (req, res, next) => {
    if (req.session && req.session.user) {
        //update user
        try {
            req.session.user = await UserModel.getUserById(req.session.user._id);
        } catch (error) {
            req.session.destroy(() => {
                return res.redirect(302, "/login");
            });
            return;
        }

        return next();
    }

    res.redirect(302, "/login");
}

exports.requireNavbar = async (req, res, next) => {
    res.locals.userRole = req.session && req.session.user ? req.session.user.role : undefined;
    return next();
}

exports.requireAdmin = async (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.role) {
        return res.redirect(302, "/login");
    }

    //update user
    try {
        req.session.user = await UserModel.getUserById(req.session.user._id);
    } catch (error) {
        return res.redirect(302, "/login");
    }

    if (req.session.user.role === "admin" || req.session.user.role === "sysadmin") {
        return next();
    }

    let error = new Error("Account has no access to view page");
    error.statusCode = 403;
    throw error;
}

exports.requireSysadmin = async (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.role) {
        return res.redirect(302, "/login");
    }

    //update user
    try {
        req.session.user = await UserModel.getUserById(req.session.user._id);
    } catch (error) {
        return res.redirect(302, "/login");
    }

    if (req.session.user.role === "sysadmin") {
        return next();
    }

    let error = new Error("Account has no access to view page");
    error.statusCode = 403;
    throw error;
}

exports.autoLoginIfAuthenticated = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }

    //update user
    try {
        req.session.user = await UserModel.getUserById(req.session.user._id);
    } catch (error) {
        req.session.destroy(() => {
            return res.redirect(302, "/login");
        });
        return;
    }

    return res.redirect("/");
}