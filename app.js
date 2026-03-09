// Week 4 - Extra Question 9 - server.js
// -------------------------------------

const express = require('express');
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
const gameRoute = require("./routes/game_routes");
const userRoute = require("./routes/user_routes");
const authRoute = require("./routes/iam_routes");

server.use("/example", example);
server.use("/game", gameRoute);
server.use("/", userRoute);
server.use("/auth", authRoute);

//Home page
server.get("/", (req, res) => {
  res.redirect("/login");
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
