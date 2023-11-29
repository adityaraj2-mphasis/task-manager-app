const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  task: String,
  description: String,
  date: { type: Date, default: Date.now },
  admin: {
    name: String,
  },
  comment: String,
  status: {
    type: String,
    enum: ["pending", "inProgress", "completed"],
    default: "pending",
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add the name"],
  },
  email: {
    type: String,
    required: [true, "Please add the email"],
    unique: [true, "Email address already in use"],
  },
  userid: {
    type: Number,
    required: [true, "Please add the userId"],
    unique: [true, "userId already in use"],
  },
  mobile: {
    type: Number,
    required: [true, "Please add the mobile"],
    unique: [true, "Mobile number already in use"],
  },
  password: {
    type: String,
    required: [true, "Please add the password"],
  },
  role: {
    type: String,
    required: [true, "Please add the role"],
  },
  tasks: [taskSchema],
});

module.exports = mongoose.model("User", userSchema);
