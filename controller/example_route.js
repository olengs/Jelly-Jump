const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("example/example", {test: "testing123"});
});

router.get("/create", (req, res) => {
    res.send("This is the example create homepage")
});

router.get("/update", (req, res) => {
    res.send("This is the example update homepage")
});

router.get("/delete", (req, res) => {
    res.send("This is the example delete homepage")
});

module.exports = router;