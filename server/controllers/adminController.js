const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");

//@desc Assign a task to a user by name
//@route POST /api/admin/assign-task
//@access private (admin)
const assignTaskToUser = asyncHandler(async (req, res) => {
  const { _id, task, description } = req.body;

  try {
    const user = await User.findOne({ _id: _id });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    user.tasks.push({
      task,
      description,
      admin: { name: req.user.name },
      date: new Date(),
    });

    await user.save();

    res.status(200).json({ message: "Task assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//@desc Get tasks assigned to a specific user by user ID
//@route GET /api/admin/user-tasks/:userId
//@access private (admin)
const getUserTasks = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("tasks");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ tasks: user.tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//@desc Update a task for a specific user by task ID
//@route PUT /api/admin/update-task/:taskId
//@access private (admin)
const updateTask = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;
    // const { newTask } = req.body;
    const { description } = req.body;

    const user = await User.findOneAndUpdate(
      { "tasks._id": taskId },
      { $set: { "tasks.$.description": description } },
      { new: true }
    ).select("tasks");

    if (!user) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", tasks: user.tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//@desc Delete a task for a specific user by task ID
//@route DELETE /api/admin/delete-task/:taskId
//@access private (admin)
const deleteTask = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;

    const user = await User.findOneAndUpdate(
      { "tasks._id": taskId },
      { $pull: { tasks: { _id: taskId } } },
      { new: true }
    ).select("tasks");

    if (!user) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res
      .status(200)
      .json({ message: "Task deleted successfully", tasks: user.tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { assignTaskToUser, getUserTasks, updateTask, deleteTask };
