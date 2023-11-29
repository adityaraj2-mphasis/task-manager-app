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
  Button,
  Menu,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextareaAutosize,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { compareAsc, format } from "date-fns";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { TextField } from "@mui/material";
import { useHistory } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

const UserDashboard = () => {
  const { logout, accessToken } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [comment, setComment] = useState("");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredStatus, setFilteredStatus] = useState("");
  const userId = localStorage.getItem("user-id");
  const name = localStorage.getItem("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState("asc");

  const history = useHistory();
  console.log("selected", selectedUser);
  const tableHeaders = [
    { id: "taskId", label: "Task Id", sortable: false },
    { id: "task", label: "Task Name", sortable: true },
    { id: "description", label: "Description", sortable: true },
    { id: "date", label: "Date", sortable: true },
    { id: "assignedBy", label: "Assigned By", sortable: false },
    { id: "status", label: "Status", sortable: false },
    { id: "comment", label: "Comments", sortable: true },
    { id: "update", label: "Update", sortable: false },
  ];

  // Default sort order
  const defaultOrderBy = "taskName";
  const defaultOrder = "asc";

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
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!selectedUser) {
          const response = await api.get(`/api/admin/user-tasks/${userId}`);
          if (response.data) {
            setTaskList(response.data.tasks);
          }
        } else {
          const response = await api.get(
            `/api/admin/user-tasks/${selectedUser._id}`
          );
          if (response.data) {
            setTaskList(response.data.tasks);
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [userId, selectedUser]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get(`/api/admin/user-tasks/${userId}`);
        if (response.data) {
          const previousLength = taskList.length;

          setTaskList(response.data.tasks);
          let assignedBy = response.data.tasks[taskList.length - 1].admin.name;
          const currentLength = response.data.tasks.length;

          if (previousLength < currentLength) {
            toast.success(`You have new tasks Assigned by ${assignedBy}!`, {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
            });
          } else if (previousLength > currentLength) {
            toast.warning("Some tasks have been removed.", {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    const interval = setInterval(fetchTasks, 20000);

    return () => clearInterval(interval);
  }, [taskList]);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user-id");
    localStorage.removeItem("name");
    localStorage.removeItem("useraccessToken");
    history.push("/signin");
  };

  const handleTaskStatusClick = (task) => (event) => {
    setSelectedTask(task);
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setSelectedTask(null);
    setStatusMenuAnchor(null);
  };

  const handleUpdateTaskStatus = async (status) => {
    try {
      const commentData = comment ? comment : "";

      await api.put(`/api/users/update-task-status/${selectedTask._id}`, {
        newStatus: status,
        comment: commentData,
      });
      toast.success(`Task updated successfully...!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });

      const updatedTasks = taskList.map((taskItem) =>
        taskItem._id === selectedTask._id
          ? { ...taskItem, status, comment }
          : taskItem
      );
      setTaskList(updatedTasks);
      handleStatusMenuClose();
      setComment("");
    } catch (error) {
      toast.warning("Something went wrong...!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
      });
      console.error("Error updating task status:", error);
    }
  };

  const handleUpdateButtonClick = (task) => {
    setSelectedTask(task);
    setUpdateDialogOpen(true);
  };
  const handleFilterChange = (event) => {
    setFilteredStatus(event.target.value);
  };

  const handleSortRequest = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrderBy(property);
    setOrder(isAsc ? "desc" : "asc");
  };

  // const clearFilter = () => {
  //   setFilteredStatus("");
  // };
  console.log("filtered status", filteredStatus);
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  };

  const filteredTasks = filteredStatus
    ? taskList.filter((task) => task.status === filteredStatus)
    : taskList;

  const searchedTasks = searchQuery
    ? filteredTasks.filter((task) => {
        return Object.values(task).some((value) =>
          value.toString().toLowerCase().includes(searchQuery)
        );
      })
    : filteredTasks;

  const sortedTasks = stableSort(searchedTasks, getComparator(order, orderBy));

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  function descendingComparator(a, b, orderBy) {
    const keyA =
      typeof a[orderBy] === "string" ? a[orderBy]?.toLowerCase() : a[orderBy];
    const keyB =
      typeof b[orderBy] === "string" ? b[orderBy]?.toLowerCase() : b[orderBy];

    if (keyB < keyA) {
      return -1;
    }
    if (keyB > keyA) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  if (!userId) {
    toast.warning("User is not logged in...!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
    });
    history.push("/signin");
    return null;
  }
  return (
    <div style={{ display: "flex" }}>
      <CssBaseline />
      <AppBar>
        <Toolbar>
          {/* <IconButton color="inherit" onClick={handleDrawerOpen}>
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Welcome, {name}!
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
            <ExitToAppIcon sx={{ ml: 1 }} />
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ width: "230%", mt: 10, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={6}>
            <Typography variant="h5" gutterBottom>
              Your Tasks
            </Typography>
          </Grid>
          <Grid
            item
            xs={6}
            md={6}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
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
                    {user.name} {`(${user.userid})`}
                  </MenuItem>
                ))}
            </TextField>
            <TextField
              label="Search..."
              variant="outlined"
              size="small"
              margin="normal"
              sx={{ m: 2 }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <FormControl
              variant="outlined"
              sx={{ width: "200px", height: "10px", m: 2 }}
              size="small"
            >
              <InputLabel id="filter-select-label">Filter</InputLabel>
              <Select
                labelId="filter-select-label"
                id="filter-select"
                value={filteredStatus}
                onChange={handleFilterChange}
                label="Filter"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="inProgress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            {/* <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={clearFilter}
              sx={{ height: "55px" }}
            >
              Clear Filter
            </Button> */}
          </Grid>

          <Grid item xs={12} md={12}>
            <TableContainer>
              <Table fullWidth>
                <TableHead>
                  <TableRow>
                    {tableHeaders.map((header) => {
                      if (header.id === "update" && selectedUser) {
                        if (userId !== selectedUser?._id) return null;
                      }

                      return (
                        <TableCell
                          key={header.id}
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f0f0f0",
                            cursor: header.sortable ? "pointer" : "default",
                            position: "relative",
                          }}
                          onClick={() => handleSortRequest(header.id)}
                        >
                          {header.label}
                          {header.sortable && (
                            <>
                              {orderBy === header.id && order === "asc" && (
                                <ArrowDropUpIcon
                                  style={{ position: "absolute", right: 0 }}
                                />
                              )}
                              {orderBy === header.id && order === "desc" && (
                                <ArrowDropDownIcon
                                  style={{ position: "absolute", right: 0 }}
                                />
                              )}
                            </>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedTasks.map((task, index) => (
                    <TableRow key={task._id}>
                      <TableCell align="center">
                        {task._id.slice(0, 8)}
                      </TableCell>
                      <TableCell align="center">{task.task}</TableCell>
                      <TableCell align="center">{task?.description}</TableCell>
                      <TableCell align="center">{format(
                          new Date(task.date),
                          "MMMM dd, yyyy, h:mm:ss a 'UTC'"
                        ).slice(0, 27)}
                      </TableCell>
                      <TableCell align="center">{task.admin.name}</TableCell>
                      <TableCell align="center">{task.status}</TableCell>
                      <TableCell align="center">{task?.comment}</TableCell>
                      {userId && !selectedUser ? (
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            onClick={() => handleUpdateButtonClick(task)}
                          >
                            Update
                          </Button>
                        </TableCell>
                      ) : userId && userId == selectedUser?._id ? (
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            onClick={() => handleUpdateButtonClick(task)}
                          >
                            Update
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Dialog
              open={updateDialogOpen}
              onClose={() => setUpdateDialogOpen(false)}
            >
              <DialogTitle>Update Task</DialogTitle>
              <DialogContent>
                <TextField
                  label="Comment"
                  multiline
                  variant="outlined"
                  size="small"
                  maxRows="5"
                  margin="normal"
                  fullWidth
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    color: "#fff",
                    borderRadius: "4px",
                    padding: "8px",
                    resize: "vertical",
                    minHeight: "60px",
                  }}
                />

                <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    id="status-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    label="Status"
                    sx={{
                      backgroundColor: "#f5f5f5", // Set your desired background color
                    }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="inProgress">InProgress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdateTaskStatus(selectedStatus);
                    setUpdateDialogOpen(false);
                  }}
                  color="primary"
                >
                  Update
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </Container>
      <ToastContainer />
    </div>
  );
};

export default UserDashboard;
