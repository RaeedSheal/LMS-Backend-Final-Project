const Instructor = require("../models/Instructor");
const bcrypt = require("bcrypt");
const saltRounds = parseInt(process.env.SALT);
const jwt = require("jsonwebtoken");
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
            const instructor = await Instructor.create({
                name: req.body.name,
                userName: req.body.userName,
                password: hashedPass,
                email: req.body.email,
                gender: req.body.gender,
            });
            res.json({ userName: instructor.userName, id: instructor._id });
        } catch (err) {
            console.log(err);
        }
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
                res.json({ id: instructor._id, token });
            } else {
                res.status(401).json({ error: "Incorrect Information" });
            }
        } catch (err) {
            console.log(err);
            res.status(401).json({ error: "Incorrect Information" });
        }
    },
    getAll: async (req, res) => {
        const instructor = await Instructor.find().populate("courses");
        res.json({ instructor });
    },
    getCourses: async (req, res) => {
        try {
            const instructor = await Instructor.findById(
                res.locals.verifiedToken.id
            ).populate("courses");
            res.json({ courses: instructor.courses });
        } catch (err) {
            console.log("Error cannot get courses");
        }
    },
};
