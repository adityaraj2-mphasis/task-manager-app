const express = require("express");
const {
  registerUser,
  loginUser,
  currentUser,
  getAllUsers,
  updateTaskStatus,
} = require("../controllers/userController");
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

// router.post("/current", validateToken, currentUser);

router.get("/get-all-users", getAllUsers);

router.put("/update-task-status/:taskId",validateToken, updateTaskStatus);

module.exports = router;
