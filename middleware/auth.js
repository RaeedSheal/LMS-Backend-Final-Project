const Instructor = require("../models/Instructor");

const jwt = require("jsonwebtoken");
const JWT_PRIVATE = process.env.JWT_PRIVATE;

module.exports = {
    Authenticate: async (req, res, next) => {
        const tokenHeader = req.headers.authorization;
        if (!tokenHeader) {
            res.json({ error: "No Token" });
            return;
        }
        const token = tokenHeader.split(" ")[1];
        try {
            res.locals.verifiedToken = jwt.verify(token, JWT_PRIVATE);
            next();
        } catch (err) {
            console.log("Authenticate: " + err);
            res.json({ error: "Not Authenticated" });
        }
    },
    Authorize: async (req, res, next) => {
        try {
            res.locals.instructor = await Instructor.findById(
                res.locals.verifiedToken.id
            );
            if (res.locals.instructor.courses.includes(req.params.courseId)) {
                next();
            } else {
                res.json({ err: "Course doesn't belong to User" });
            }
        } catch (err) {
            console.log("error delete course: " + err);
        }
    },
};
