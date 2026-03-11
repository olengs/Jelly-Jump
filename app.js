const express = require('express');
const bcrypt = require("bcrypt");
const server = express();

const hostname = 'localhost';
const port = 8000;

// Serve static files from the 'public' folder
server.use('/', express.static('public'));

// Parse URL-encoded data from POST requests
server.use(express.urlencoded({extended: true}));
server.set("view engine", "ejs");

// Server all imported routes
const example = require("./routes/example_route");
const gameRoutes = require("./routes/game_routes");
const userRoutes = require("./routes/user_routes");

server.use("/example", example);
server.use("/game", gameRoutes);
server.use("/", userRoutes);

//Home page
server.get("/", (req, res) => {
  res.redirect("/login");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});