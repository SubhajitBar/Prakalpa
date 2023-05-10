import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema({

    employeeId: {
        type: String,
        required: [true, "Please enter guide's employee id"],
        unique: true,
    },
    employeeEmail: {
        type: String,
        required: [true, "Please enter guide's email address"],
        unique: true,
        validate: validator.isEmail,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Guidesdata = mongoose.model("guidesdata", schema);
