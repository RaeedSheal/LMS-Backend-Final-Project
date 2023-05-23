const express = require("express");
const studentController = require("../controller/studentController");
const { Authenticate } = require("../middleware/auth");
const router = express.Router();

// Register
router.post("/register", studentController.Register);
// Log in
router.post("/login", studentController.Login);
// Register in a course
router.post(
    "/registerCourse/:courseId",
    Authenticate,
    studentController.registerCourse
);
// cancel course
router.post(
    "/cancelCourse/:courseId",
    Authenticate,
    studentController.cancelCourse
);
// Get studnet courses
router.get("/courses", Authenticate, studentController.getCourses);
// Exports
module.exports = router;
