const express = require("express");
const router = express.Router();

const ExampleController = require("../controllers/example_controller");

router.get("/", ExampleController.exampleHome);

router.get("/create", ExampleController.exampleCreate);

router.get("/update", ExampleController.exampleUpdate);

router.get("/delete", ExampleController.exampleDelete);

module.exports = router;
