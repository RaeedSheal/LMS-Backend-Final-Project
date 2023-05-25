const Course = require("../models/Course");
const Instructor = require("../models/Instructor");
const Principal = require("../models/Principal");
const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT);
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const JWT_PRIVATE = process.env.JWT_PRIVATE;

module.exports = {
    SeedPrincipalRegister: async (req, res) => {
        //Hashing
        let hashedPass = "";
        try {
            hashedPass = await bcrypt.hash("admin", saltRounds);
        } catch (err) {
            console.log(err);
        }
        // Creating Principal
        try {
            const principal = await Principal.create({
                name: "The Principal",
                userName: "principal",
                password: hashedPass,
                email: "pricipal@c.c",
            });

            res.json({ principal });
        } catch (err) {
            console.log(err);
        }
    },
    // Login
    LoginForm: (req, res) => {
        res.render("loginPrincipal.ejs");
    },
    Login: async (req, res) => {
        try {
            const principal = await Principal.findOne({
                userName: req.body.userName,
            }).select("+password");

            if (await bcrypt.compare(req.body.password, principal.password)) {
                const token = jwt.sign(
                    {
                        name: principal.name,
                        userName: principal.userName,
                        id: principal._id,
                    },
                    JWT_PRIVATE,
                    { expiresIn: "1h" }
                );
                res.cookie("access_token", token, {
                    httpOnly: true,
                }).redirect("/principal/courses");
            } else {
                res.redirect("/principal/login");
            }
        } catch (err) {
            console.log("Login Error: " + err);
            res.redirect("/principal/login");
        }
    },
    getInstructors: async (req, res) => {
        if (req.cookies.access_token) {
            const instructors = await Instructor.find().populate("courses");
            res.render("principalInstructor.ejs", {
                instructors,
                creator: "principal",
            });
        } else res.redirect("/");
    },
    getCourses: async (req, res) => {
        if (req.cookies.access_token) {
            const courses = await Course.find()
                .populate("instructor")
                .populate("creator");
            res.render("principalCourses.ejs", {
                courses,
                creator: "principal",
            });
        } else res.redirect("/");
    },
    deleteCourse: async (req, res) => {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (course.creator) {
            const creator = await Instructor.findByIdAndUpdate(
                course.creator._id,
                {
                    $pull: {
                        courses: courseId,
                    },
                }
            );
        }
        if (course.instructor) {
            const instructor = await Instructor.findByIdAndUpdate(
                course.instructor._id,
                {
                    $pull: {
                        assignedCourses: courseId,
                    },
                }
            );
        }

        const student = await Student.updateMany(
            { courses: courseId },
            {
                $pull: { courses: courseId },
            },
            { multi: true }
        );
        await course.deleteOne();
        res.redirect("/principal/courses");
    },
    assignInstructorForm: async (req, res) => {
        if (req.cookies.access_token) {
            const course = await Course.findById(req.params.courseId);
            const instructors = await Instructor.find();
            res.render("assignInstructor.ejs", { course, instructors });
        } else res.redirect("/");
    },
    assignInstructor: async (req, res) => {
        const instructorId = req.body.courseInstructor;
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (course.instructor) {
            const OldInstructor = await Instructor.findByIdAndUpdate(
                course.instructor._id,
                {
                    $pull: { assignedCourses: courseId },
                }
            );
        }
        await course.updateOne({
            instructor: instructorId,
        });
        const instructor = await Instructor.findByIdAndUpdate(
            instructorId,
            {
                $addToSet: {
                    assignedCourses: courseId,
                },
            },
            { new: true }
        );

        res.redirect("/principal/courses");
    },
    details: async (req, res) => {
        const course = await Course.findById(req.params.courseId).populate(
            "students"
        );
        res.render("courseDetails.ejs", { course });
    },
};
