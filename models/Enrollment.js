import mongoose from "mongoose";

const schema = new mongoose.Schema({
  regId:{
    type: String,
    required:true,
    unique: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Enrollment = mongoose.model("registeredIds", schema);
