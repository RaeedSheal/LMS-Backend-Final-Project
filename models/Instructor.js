const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const InstructorSchema = new Schema(
    {
        name: String,
        userName: { type: String, required: true },
        password: { type: String, required: true, select: false },
        email: String,
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "course",
            },
        ],
        assignedCourses: [
            { type: mongoose.Schema.Types.ObjectId, ref: "course" },
        ],
    },
    { timestamps: true }
);

const Instructor = mongoose.model("instructor", InstructorSchema);

module.exports = Instructor;
