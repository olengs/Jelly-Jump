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

    if (req.session.user.role === "admin") {
        return next();
    }

    res.status(403).render("error", {statusCode: 403});
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

    return res.redirect("/home");
}