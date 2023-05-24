const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CourseSchema = new Schema(
    {
        name: String,
        code: String,
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "instructor",
            require: true,
        },
        instructor: { type: mongoose.Schema.Types.ObjectId, ref: "instructor" },
        students: [{ type: mongoose.Schema.Types.ObjectId, ref: "student" }],
    },
    { timestamps: true }
);

const Course = mongoose.model("course", CourseSchema);

module.exports = Course;
