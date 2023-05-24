const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Get routes

const instructorRouter = require("./routes/instructorRouter");
const studentApiRouter = require("./routes/studentApiRouter");
const principalApiRouter = require("./routes/principalRouter");

// Uses

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Mongoose

mongoose
    .connect(process.env.DB_URL)
    .then(() => {
        console.log("Connected");
    })
    .catch(() => {
        console.log("Error Not Connected");
    });

// Use Routes

app.use("/instructor", instructorRouter);
app.use("/api", studentApiRouter);
app.use("/principal", principalApiRouter);

// Routes

app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Listening

app.listen("8888", () => {
    console.log("Listening..");
});
