const express = require("express");
const router = express.Router();
const principalController = require("../controller/principalController");
const { cookieAuthentication } = require("../middleware/auth");

// Register Seed
router.post("/register", principalController.SeedPrincipalRegister);

// Login
router.get("/login", principalController.LoginForm);
router.post("/login", principalController.Login);

// Get Instructors
router.get(
    "/instructors",
    cookieAuthentication,
    principalController.getInstructors
);

// Get Courses
router.get("/courses", cookieAuthentication, principalController.getCourses);

// Delete Courses
router.get(
    "/delete/:courseId",
    cookieAuthentication,
    principalController.deleteCourse
);

module.exports = router;
