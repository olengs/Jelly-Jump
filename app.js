const express = require('express');
const bcrypt = require("bcrypt");
const server = express();
require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);


let mongoose_connect_promise = mongoose.connect(process.env.DB_TEST_URI);

const hostname = 'localhost';
const port = 8000;

// Serve static files from the 'public' folder
server.use('/', express.static('public'));

// Parse URL-encoded data from POST requests
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");

// Server all imported routes
const example = require("./routes/example_route");
const gameRoutes = require("./routes/game_routes");
const userRoutes = require("./routes/user_routes");
const friendRoutes= require('./routes/friends-routes')

server.use("/example", example);
server.use("/game", gameRoutes);
server.use("/", userRoutes);
server.use('/',friendRoutes)

//Home page
server.get("/", (req, res) => {
    res.redirect("/login");
});

//console.log(process.env.DB_TEST_URI);
async function main() {
    try {
        await mongoose_connect_promise;
        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    } catch (error) {
        console.log(`Error connecting to db: ${error}`);
        return;
    }
}

main();