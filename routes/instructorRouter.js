const express = require("express");
const router = express.Router();
const instructorController = require("../controller/instructorController");
const { Authenticate } = require("../middleware/auth");

// Register
router.post("/register", instructorController.Register);
// Log in
router.post("/login", instructorController.Login);
// Show all instructors
router.get("/getAll", instructorController.getAll);
// Show all Courses
router.get("/courses", Authenticate, instructorController.getCourses);
// Exports
module.exports = router;
