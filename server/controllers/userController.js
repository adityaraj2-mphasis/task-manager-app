const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//@desc register a user
//@route GET /api/users/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, userid, mobile, password, role } = req.body;
  if (!name || !email || !userid || !mobile || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const userAvailable = await User.findOne({ userid });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    userid,
    mobile,
    password: hashedPassword,
    role: role || "user",
  });
  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      userid: newUser.userid,
      role: newUser.role,
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong");
  }
});

//@desc login a user
//@route GET /api/users/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
  const { userid, password } = req.body;
  if (!userid || !password) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await User.findOne({ userid });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user: {
          name: user.name,
          email: user.email,
          userid: user.userid,
          _id: user._id,
          role: user.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m" }
    );
    res
      .status(200)
      .json({ accessToken, role: user.role, id: user._id, name: user.name });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

//@desc Get a list of all users
//@route GET /api/users/get-all-users
//@access public
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//@desc Get tasks assigned to the user with admin names
//@route GET /api/users/get-tasks
//@access private
const getTasks = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    await user.populate("tasks.admin", "name").execPopulate();

    res.status(200).json({ tasks: user.tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//@desc Update the status of a task for a specific user by task ID
//@route PUT /api/users/update-task-status/:taskId
//@access private
const updateTaskStatus = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newStatus } = req.body;
    const { comment } = req.body;
    console.log("taskId", taskId, newStatus, comment);
    if (!["pending", "inProgress", "completed"].includes(newStatus)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const user = await User.findOneAndUpdate(
      { "tasks._id": taskId },
      { $set: { "tasks.$.status": newStatus, "tasks.$.comment": comment } },
      { new: true }
    ).select("tasks");

    if (!user) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Task status updated successfully", tasks: user.tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//@desc current user info
//@route GET /api/users/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  getAllUsers,
  getTasks,
  updateTaskStatus,
};
