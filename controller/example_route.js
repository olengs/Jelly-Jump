const express = require("express");
const routers = express.Router();

routers.get("/", (req, res) => {
    res.render("example/example", {test: "testing123"});
});

routers.get("/create", (req, res) => {
    res.send("This is the example create homepage")
});

routers.get("/update", (req, res) => {
    res.send("This is the example update homepage")
});

routers.get("/delete", (req, res) => {
    res.send("This is the example delete homepage")
});

module.exports = routers;