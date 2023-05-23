const express = require("express");
const mongoose = require("mongoose");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");

// Get routes

const instructorRouter = require("./routes/instructorRouter");
const courseRouter = require("./routes/courseRouter");
const studentApiRouter = require("./routes/studentApiRouter");

// Uses

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

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
app.use("/course", courseRouter);
app.use("/api", studentApiRouter);

// Routes

app.get("/", (req, res) => {
    res.send("welcome");
});

// Listening

app.listen("8888", () => {
    console.log("Listening..");
});
