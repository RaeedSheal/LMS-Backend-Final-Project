const express = require("express");
const router = express.Router();
const { Authenticate, Authorize } = require("../middleware/auth");
const Course = require("../models/Course");
const Instructor = require("../models/Instructor");

router.post("/create", Authenticate, async (req, res) => {
    const instructorId = res.locals.verifiedToken.id;
    try {
        // create the course
        const course = await Course.create({
            name: req.body.name,
            code: req.body.code,
            creator: instructorId,
        });
        // add the course to Instructor
        const instructor = await Instructor.findById(instructorId);
        instructor.courses.push(course);
        await instructor.save();
        res.json({ course, instructor });
    } catch (err) {
        console.log("Create Course: " + err);
    }
});

router.delete(
    "/delete/:courseId",
    Authenticate,
    Authorize,
    async (req, res) => {
        const instructor = res.locals.instructor;
        const courseId = req.params.courseId;
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        // Delete Course From Instructor
        let index = instructor.courses.indexOf(courseId);
        instructor.courses.splice(index, 1);
        await instructor.save();
        res.json({ deletedCourse });
    }
);

router.patch("/edit/:courseId", Authenticate, Authorize, async (req, res) => {
    let name = req.body.name;
    let code = req.body.code;
    const updateCourse = await Course.findByIdAndUpdate(req.params.courseId, {
        name,
        code,
    });
    res.json({ updateCourse });
});

module.exports = router;
