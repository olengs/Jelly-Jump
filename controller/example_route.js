const express = require("express");
const routera = express.Router();

routera.get("/", (req, res) => {
    res.render("example/example", {test: "testing123"});
});

routera.get("/create", (req, res) => {
    res.send("This is the example create homepage")
});

routera.get("/update", (req, res) => {
    res.send("This is the example update homepage")
});

routera.get("/delete", (req, res) => {
    res.send("This is the example delete homepage")
});

module.exports = routera;