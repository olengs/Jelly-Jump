//require('dotenv').config({path: './config.env'});

const express = require('express');
const session = require('express-session');
const server = express();
require("dotenv").config({quiet: true});
const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);

// start running mongoose connect early
let mongoose_connect_promise = mongoose.connect(process.env.DB_TEST_URI);

const hostname = 'localhost';
const port = 8000;

server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // stops extra writes if session is not modified
    saveUninitialized: false, // save session only when session is modified.
    rolling: true, //will reset cookie lifetime on each request
    cookie: {
        httpOnly: true,
        maxAge: 30 * 60 * 1000 //10 mins
        // maxAge: 20 * 1000, //20s for testing
    }
}));

// Serve static files from the 'public' folder
server.use('/', express.static('public'));

// Parse URL-encoded data from POST requests
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");

// Server all imported routes
const example = require("./routes/example_route");
const gameRoutes = require("./routes/game_routes");
const userRoutes = require("./routes/user_routes");
const friendRoutes= require('./routes/friends-routes');
const scoreboardRoutes = require('./routes/scoreboard_routes');
const homeRoutes = require('./routes/home-routes');
const profileRoutes = require('./routes/profile-routes');


server.use("/example", example);
server.use("/game", gameRoutes);
server.use("/", userRoutes);
server.use('/',friendRoutes);
server.use('/scoreboard', scoreboardRoutes);
server.use("/", homeRoutes);
server.use('/', profileRoutes);
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
