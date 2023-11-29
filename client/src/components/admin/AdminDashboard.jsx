import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Container,
  Typography,
  IconButton,
  Divider,
  Button,
  TextField,
  Grid,
  TextareaAutosize,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../contexts/AuthContext";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import axios from "axios";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useHistory } from "react-router-dom";
import { compareAsc, format } from "date-fns";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [userList, setUserList] = useState([]);
  const [istaskUpdate, setTaskUpdate] = useState(false);
  const accessToken = localStorage.getItem("adminaccessToken");
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateTaskId, setUpdateTaskId] = useState(null);
  const [updateTaskDescription, setUpdateTaskDescription] = useState("");
  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
  const [assignTask, setAssignTask] = useState("");
  const [assignTaskDescription, setAssignTaskDescription] = useState("");


  const history = useHistory();
  const api = axios.create({
    baseURL: "http://localhost:5001",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await api.get("/api/users/get-all-users");
        console.log("User list response:", response);

        if (isMounted) {
          setUserList(response.data);
        }      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();

    return () => {s
      isMounted = false;
    };
  }, [istaskUpdate]);

  useEffect(() => {
    const fetchUserTasks = async () => {
      if (selectedUser) {
        try {
          const response = await api.get(
            `/api/admin/user-tasks/${selectedUser._id}`
          );
          console.log("User tasks response:", response.data.tasks);
          if (response.data) {
            setTaskList(response.data.tasks);
          }
        } catch (error) {
          console.error("Error fetching user tasks:", error);
        }
      }
    };

    fetchUserTasks();

    const intervalId = setInterval(fetchUserTasks, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [selectedUser]);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("adminaccessToken");
    history.push("/signin");
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
  };

  const handleNewTaskChange = (e) => {
    setNewTask(e.target.value);
  };

  const handleAssignTask = async () => {
    try {
      const response = await api.post("/api/admin/provide-task", {
        _id: selectedUser._id, // Corrected the field name to match  server-side code
        task: assignTask,
        description: assignTaskDescription,
      });
      toast.success(`Task successfully assigned to user...!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });

    



      setNewTask("");
      handleCloseAssignTaskModal();
      setAssignTask("");
      setAssignTaskDescription("");
      setTaskUpdate(!istaskUpdate);
    } catch (error) {
      toast.warning("Something went wrong...!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.error("Error assigning task:", error);
      handleCloseAssignTaskModal();
    }
  };

  const handleTaskUpdate = async (taskId, newDescription) => {
    try {
      const response = await api.put(`/api/admin/update-task/${taskId}`, {
        description: newDescription,
      });
      toast.success(`Task updated successfully...!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setTaskUpdate(!istaskUpdate);
      console.log(`Updating task ${taskId} to "${newDescription}"`);
    } catch (error) {
      toast.warning("Something went wrong...!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.error("Error updating task:", error);
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      const response = await api.delete(`/api/admin/delete-task/${taskId}`);
      toast.success(`Task deleted successfully...!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.log(`Deleting task ${taskId}`);
      setTaskUpdate(!istaskUpdate);
    } catch (error) {
      toast.warning("Something went wrong", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.error("Error deleting task:", error);
    }
  };
  const handleOpenUpdateModal = (taskId, description) => {
    setUpdateTaskId(taskId);
    setUpdateTaskDescription(description);
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
  };

  const handleOpenAssignTaskModal = () => {
    setAssignTaskModalOpen(true);
  };

  const handleCloseAssignTaskModal = () => {
    setAssignTaskModalOpen(false);
  };

  if (!accessToken) {
    toast.warning("Admin is not logged in...!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
    });
    history.push("/signin");
    return null;
  }

  console.log("selectedUsers:", selectedUser?._id);
  console.log("TaskList:", taskList.length, taskList);
  return (
    <div>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerOpen}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
            <ExitToAppIcon sx={{ ml: 1 }} />
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 8 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ textAlign: "center", mt: 3, mb: 3 }}
        >
          {selectedUser ? (
            <>
              <span style={{ color: "#4caf50" }}>{`Tasks for`}</span>
              <span style={{ color: "#2196f3", marginLeft: "0.5rem" }}>
                {selectedUser?.name}
              </span>
            </>
          ) : (
            "Select a user from the sidebar"
          )}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <TextField
              select
              label="Select User "
              variant="outlined"
              size="small"
              margin="normal"
              value={selectedUser}
              fullWidth
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {userList
                .filter((x) => x.role !== "admin")
                .map((user, index) => (
                  <MenuItem key={user.id || index} value={user}>
                    {user.name} {`(${user.email})`}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={12}>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th align="center">TaskId</th>
                  <th align="center">TaskName</th>
                  <th align="center">Description</th>
                  <th align="center">Date</th>
                  <th align="center">AssignedBy</th>
                  <th align="center">Status</th>
                  <th align="center">Comments</th>
                  <th align="center">Update</th>
                  <th align="center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {taskList &&
                  taskList.map((task, index) => (
                    <tr key={task._id || index}>
                      <td align="center">{task._id.slice(0, 8)}</td>
                      <td align="center">{task.task}</td>
                      <td align="center">{task?.description}</td>
                      <td align="center">
                        {format(
                          new Date(task.date),
                          "MMMM dd, yyyy, h:mm:ss a 'UTC'"
                        ).slice(0, 27)}
                      </td>
                      <td align="center">{task.admin.name}</td>
                      <td align="center">{task.status}</td>
                      <td align="center">{task?.comment}</td>
                      <td align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() =>
                            handleOpenUpdateModal(task._id, task.description)
                          }
                        >
                          Update
                        </Button>
                      </td>

                      <td align="center">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleTaskDelete(task._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Grid>

          {selectedUser && (
            <>
              <Grid item xs={12} md={12}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleOpenAssignTaskModal}
                  fullWidth
                >
                  Assign Task
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Container>
      <Dialog open={isUpdateModalOpen} onClose={handleCloseUpdateModal}>
        <DialogTitle>Update Task </DialogTitle>
        <DialogContent>
          <TextField
            label="Update Task Descriptio"
            multiline
            variant="outlined"
            size="small"
            maxRows="5"
            margin="normal"
            value={updateTaskDescription}
            onChange={(e) => setUpdateTaskDescription(e.target.value)}
            sx={{
              backgroundColor: "#f5f5f5",
              color: "#fff",
              borderRadius: "4px",
              padding: "8px",
              resize: "vertical",
              minHeight: "60px",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpdateModal}>Cancel</Button>
          <Button
            onClick={() => {
              handleTaskUpdate(updateTaskId, updateTaskDescription);
              handleCloseUpdateModal();
            }}
            color="primary"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={assignTaskModalOpen} onClose={handleCloseAssignTaskModal}>
        <DialogTitle>Assign Task</DialogTitle>
        <DialogContent>
          <TextField
            label="Task"
            variant="outlined"
            margin="normal"
            size="small"
            fullWidth
            value={assignTask}
            onChange={(e) => setAssignTask(e.target.value)}
          />
          <TextField
            label="Description"
            variant="outlined"
            margin="normal"
            size="small"
            fullWidth
            value={assignTaskDescription}
            onChange={(e) => setAssignTaskDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignTaskModal}>Cancel</Button>
          <Button
            onClick={() => {
              // Call API to assign the task here using assignTask and assignTaskDescription
              handleAssignTask();
            }}
            color="primary"
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
      <ToastContainer />
      <Container sx={{ mt: 8 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <h3 style={{textAlign:"center"}}>All Tasks</h3>
            <table style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th align="center">TaskId</th>
                  <th align="center">TaskName</th>
                  <th align="center">Description</th>
                  <th align="center">Date</th>
                  <th align="center">AssignedBy</th>
                  <th align="center">Status</th>
                  <th align="center">Comments</th>
                  <th align="center">Update</th>
                  <th align="center">Delete</th>
                </tr>
              </thead>
              <tbody>
                {userList &&
                 userList?.map((ele)=>{
                  return ele.tasks
                 })?.flat().map((task, index) => (
                    <tr key={task._id || index}>
                      <td align="center">{task._id.slice(0, 8)}</td>
                      <td align="center">{task.task}</td>
                      <td align="center">{task?.description}</td>
                      <td align="center">
                        {format(
                          new Date(task.date),
                          "MMMM dd, yyyy, h:mm:ss a 'UTC'"
                        ).slice(0, 27)}
                      </td>
                      <td align="center">{task.admin.name}</td>
                      <td align="center">{task.status}</td>
                      <td align="center">{task?.comment}</td>
                      <td align="center">
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() =>
                            handleOpenUpdateModal(task._id, task.description)
                          }
                        >
                          Update
                        </Button>
                      </td>

                      <td align="center">
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleTaskDelete(task._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </Grid>
        </Grid>
      </Container>

    </div>
  );
};

export default AdminDashboard;
