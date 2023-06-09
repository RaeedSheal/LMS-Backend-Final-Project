const express = require("express");
const router = express.Router();
const instructorController = require("../controller/instructorController");
const { Authorize, cookieAuthentication } = require("../middleware/auth");

// Register
router.get("/register", instructorController.RegisterForm);
router.post("/register", instructorController.Register);
// Log in
router.get("/login", instructorController.LoginForm);
router.post("/login", instructorController.Login);
// Show all Courses
router.get("/courses", cookieAuthentication, instructorController.getCourses);
router.get(
    "/assignedCourses",
    cookieAuthentication,
    instructorController.getAssignedCourses
);

// Create Course
router.get(
    "/createCourse",
    cookieAuthentication,
    instructorController.createCourseForm
);
router.post(
    "/createCourse",
    cookieAuthentication,
    instructorController.createCourse
);
// Delete Course
router.get(
    "/delete/:courseId",
    cookieAuthentication,
    Authorize,
    instructorController.deleteCourse
);
// Edit Course
router.get(
    "/edit/:courseId",
    cookieAuthentication,
    Authorize,
    instructorController.editCourseForm
);
router.post(
    "/edit/:courseId",
    cookieAuthentication,
    Authorize,
    instructorController.editCourse
);
router.get("/logout", (req, res) => {
    res.clearCookie("access_token").redirect("/");
});
// Exports
module.exports = router;
