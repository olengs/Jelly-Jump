const express = require("express");
const router = express.Router();

const ExampleControllers = require("../controllers/example_controllers");

router.get("/", ExampleControllers.exampleHome);

router.get("/create", ExampleControllers.exampleCreate);

router.get("/update", ExampleControllers.exampleUpdate);

router.get("/delete", ExampleControllers.exampleDelete);

module.exports = router;
