const Instructor = require("../models/Instructor");
const Course = require("../models/Course");
const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT);
const jwt = require("jsonwebtoken");
const JWT_PRIVATE = process.env.JWT_PRIVATE;

module.exports = {
    // Register
    RegisterForm: (req, res) => {
        res.render("registerInstructor.ejs");
    },
    Register: async (req, res) => {
        //Hashing
        let hashedPass = "";
        try {
            hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        } catch (err) {
            console.log(err);
        }
        // Creating Instructor
        try {
            const instructor = await Instructor.create({
                name: req.body.name,
                userName: req.body.userName,
                password: hashedPass,
                email: req.body.email,
                gender: req.body.gender,
            });

            res.redirect("/instructor/login");
        } catch (err) {
            console.log(err);
        }
    },
    // Login
    LoginForm: (req, res) => {
        res.render("loginInstructor.ejs");
    },
    Login: async (req, res) => {
        try {
            const instructor = await Instructor.findOne({
                userName: req.body.userName,
            }).select("+password");

            if (await bcrypt.compare(req.body.password, instructor.password)) {
                const token = jwt.sign(
                    {
                        name: instructor.name,
                        userName: instructor.userName,
                        id: instructor._id,
                    },
                    JWT_PRIVATE,
                    { expiresIn: "1h" }
                );
                res.cookie("access_token", token, {
                    httpOnly: true,
                }).redirect("/instructor/courses");
            } else {
                res.send({ error: "Incorrect Information" });
            }
        } catch (err) {
            console.log("Login Error: " + err);
            res.send({ error: "Incorrect Information" });
        }
    },
    // Courses
    //      Get All Courses for a speicif instructor
    getCourses: async (req, res) => {
        try {
            const instructor = await Instructor.findById(
                res.locals.verifiedToken.id
            ).populate("courses");
            res.render("courses.ejs", {
                courses: instructor.courses,
                creator: "instructor",
            });
        } catch (err) {
            console.log("Error cannot get courses");
        }
    },
    getAssignedCourses: async (req, res) => {
        try {
            const instructor = await Instructor.findById(
                res.locals.verifiedToken.id
            ).populate("assignedCourses");
            res.render("courses.ejs", {
                courses: instructor.assignedCourses,
                creator: "instructor",
            });
        } catch (err) {
            console.log("Error cannot get courses");
        }
    },
    //      Create Course for a speicifc instructor
    createCourseForm: (req, res) => {
        if (req.cookies.access_token) res.render("createCourseInst.ejs");
        else res.send("error");
    },
    createCourse: async (req, res) => {
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
            res.redirect("/instructor/courses");
        } catch (err) {
            console.log("Create Course: " + err);
        }
    },
    //      Delete Course for a speicifc instructor
    deleteCourse: async (req, res) => {
        const courseId = req.params.courseId;
        const course = await Course.findByIdAndDelete(courseId);
        // Delete Course From Instructor
        const creator = await Instructor.findByIdAndUpdate(course.creator._id, {
            $pull: {
                courses: courseId,
            },
        });
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

        res.redirect("/instructor/courses");
    },
    //      Edit Course for a speicifc instructor
    editCourseForm: async (req, res) => {
        if (req.cookies.access_token) {
            const course = await Course.findById(req.params.courseId);
            res.render("editCourseInst.ejs", { course });
        } else res.redirect("/");
    },
    editCourse: async (req, res) => {
        let name = req.body.name;
        let code = req.body.code;
        const editedCourse = await Course.findByIdAndUpdate(
            req.params.courseId,
            {
                name,
                code,
            },
            { new: true }
        );
        res.redirect("/instructor/courses");
    },
};
