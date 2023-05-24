const Instructor = require("../models/Instructor");
const Course = require("../models/Course");
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
    getAll: async (req, res) => {
        const instructor = await Instructor.find().populate("courses");
        res.json({ instructor });
    },
    // Courses
    //      Get All Courses for a speicif instructor
    getCourses: async (req, res) => {
        try {
            const instructor = await Instructor.findById(
                res.locals.verifiedToken.id
            ).populate("courses");
            res.render("courses.ejs", { courses: instructor.courses });
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
        const instructor = res.locals.instructor;
        const courseId = req.params.courseId;
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        // Delete Course From Instructor
        let index = instructor.courses.indexOf(courseId);
        instructor.courses.splice(index, 1);
        await instructor.save();
        res.redirect("/instructor/courses");
    },
    //      Edit Course for a speicifc instructor
    editCourseForm: (req, res) => {
        if (req.cookies.access_token)
            res.render("editCourseInst.ejs", { courseId: req.params.courseId });
        else res.send("error");
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
