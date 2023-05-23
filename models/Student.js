const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const StudentSchema = new Schema(
    {
        name: String,
        userName: { type: String, required: true },
        password: { type: String, required: true, select: false },
        email: String,
        gender: String,
        courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "course",
            },
        ],
    },
    { timestamps: true }
);

const Student = mongoose.model("student", StudentSchema);

module.exports = Student;
