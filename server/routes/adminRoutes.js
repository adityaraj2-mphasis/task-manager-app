const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {
  assignTaskToUser,
  getUserTasks,
  updateTask,
  deleteTask,
} = require("../controllers/adminController");

router.post("/provide-task", validateToken, assignTaskToUser);

router.get("/user-tasks/:userId", getUserTasks);

router.put("/update-task/:taskId", validateToken, updateTask);

router.delete("/delete-task/:taskId", validateToken, deleteTask);

module.exports = router;
