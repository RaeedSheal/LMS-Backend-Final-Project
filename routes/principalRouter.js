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
//Assign
router.get(
    "/assign/:courseId",
    cookieAuthentication,
    principalController.assignInstructorForm
);
router.post(
    "/assign/:courseId",
    cookieAuthentication,
    principalController.assignInstructor
);
// Details
router.get(
    "/details/:courseId",
    cookieAuthentication,
    principalController.details
);

//logout
router.get("/logout", (req, res) => {
    res.clearCookie("access_token").redirect("/");
});

module.exports = router;
