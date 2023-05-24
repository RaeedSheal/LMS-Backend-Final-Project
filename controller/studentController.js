const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT);
const jwt = require("jsonwebtoken");
const Course = require("../models/Course");
const JWT_PRIVATE = process.env.JWT_PRIVATE;

module.exports = {
    Register: async (req, res) => {
        let hashedPass = "";
        try {
            hashedPass = await bcrypt.hash(req.body.password, saltRounds);
        } catch (err) {
            console.log(err);
        }
        try {
            const student = await Student.create({
                name: req.body.name,
                userName: req.body.userName,
                password: hashedPass,
                email: req.body.email,
                gender: req.body.gender,
            });
            res.json({ userName: student.userName, id: student._id });
        } catch (err) {
            console.log(err);
        }
    },
    Login: async (req, res) => {
        try {
            const student = await Student.findOne({
                userName: req.body.userName,
            }).select("+password");

            if (await bcrypt.compare(req.body.password, student.password)) {
                const token = jwt.sign(
                    {
                        name: student.name,
                        userName: student.userName,
                        id: student._id,
                    },
                    JWT_PRIVATE,
                    { expiresIn: "1h" }
                );
                res.json({ id: student._id, token });
            } else {
                res.status(401).json({ error: "Incorrect Information" });
            }
        } catch (err) {
            console.log(err);
            res.status(401).json({ error: "Incorrect Information" });
        }
    },
    getAll: async (req, res) => {
        const students = await Student.find().populate("courses");
        res.json({ students });
    },
    getCourses: async (req, res) => {
        try {
            const student = await Student.findById(
                res.locals.verifiedToken.id
            ).populate("courses");
            res.json({ courses: student.courses });
        } catch (err) {
            console.log("Error cannot get courses");
        }
    },
    registerCourse: async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const course = await Course.findById(courseId);
            const student = await Student.findByIdAndUpdate(
                res.locals.verifiedToken.id,
                {
                    $addToSet: {
                        courses: course,
                    },
                }
            );
            await course.updateOne({ $addToSet: { students: student } });
            res.json({ student });
        } catch (err) {
            console.log("Error registering course" + err);
            res.json({ err });
        }
    },
    cancelCourse: async (req, res) => {
        try {
            const courseId = req.params.courseId;
            const student = await Student.findByIdAndUpdate(
                res.locals.verifiedToken.id,
                {
                    $pull: {
                        courses: courseId,
                    },
                }
            );
            try {
                await Course.findByIdAndUpdate(courseId, {
                    $pull: {
                        students: student._id,
                    },
                });
            } catch (err) {
                console.log("Cancel Course err: " + err);
                res.status(400).json({
                    errMsg: "Error in finding course",
                    err,
                });
            }

            res.json({
                successMsg: "You've canceled your registeration in the course",
                student,
            });
        } catch (err) {
            console.log("Error cancelling course" + err);
            res.json({ errMsg: "Error in cancelling course", err });
        }
    },
};
