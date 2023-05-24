const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PrincipalSchema = new Schema(
    {
        name: String,
        userName: { type: String, required: true },
        password: { type: String, required: true, select: false },
        email: String,
    },
    { timestamps: true }
);

const Principal = mongoose.model("principal", PrincipalSchema);

module.exports = Principal;
