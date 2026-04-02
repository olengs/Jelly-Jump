//require('dotenv').config({path: './config.env'});

const express = require('express');
const session = require('express-session');
const server = express();
require("dotenv").config({quiet: true});
const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);
mongoose.set('transactionAsyncLocalStorage', true);

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
        maxAge: 30 * 60 * 1000 //30 mins
        // maxAge: 20 * 1000, //20s for testing
    }
}));

// Serve static files from the 'public' folder
server.use('/', express.static('public'));

// Parse URL-encoded data from POST requests
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");

// Server all imported routes
const gameRoutes = require("./routes/game_routes");
const userRoutes = require("./routes/user_routes");
const friendRoutes= require('./routes/friends-routes');
const scoreboardRoutes = require('./routes/scoreboard_routes');
const homeRoutes = require('./routes/home-routes');
const profileRoutes = require('./routes/profile-routes');
const inventoryRoutes = require("./routes/inventory-routes.js");
const announcementRoutes = require('./routes/announcement_routes.js');
const jellyRoutes = require("./routes/jelly_routes.js");

const userMiddleware = require("./middleware/user-middleware.js");
const userModel = require("./models/user-model.js");
server.use(userMiddleware.requireNavbar);

server.use("/game", gameRoutes);
server.use("/", userRoutes);
server.use('/',friendRoutes);
server.use('/scoreboard', scoreboardRoutes);
server.use("/", homeRoutes);
server.use('/profile', profileRoutes);
server.use('/', inventoryRoutes);
server.use('/announcement', announcementRoutes);
server.use("/jellies", jellyRoutes);


//Home page
server.get("/", (req, res) => {
    res.redirect("/");
});

server.get("/index.html", (req, res) => {
    res.redirect(301, "/")
})

// error handling route
server.use((err, req, res, next) => {
    console.log(`Error encountered:\n${err.stack}`);
    let statusCode = err.statusCode || 500;
    res.render("error", {statusCode});
});

// not found route
server.use((req, res, next) => {
    res.render("error", {statusCode: 404});
});

//console.log(process.env.DB_TEST_URI);
async function main() {
    try {
        await mongoose_connect_promise;
        await userModel.checkAndCreateSysadminUser();
        server.listen(port, hostname, () => {
            console.log(`Server running at http://${hostname}:${port}/`);
        });
    } catch (error) {
        console.log(`Error connecting to db: \n${error.stack}`);
        return;
    }
}

main();
