const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("game/gameview", {});
});

module.exports = router;