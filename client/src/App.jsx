import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "./components/contexts/AuthContext";
import Login from "./components/pages/Signin";
import Signup from "./components/pages/Signup";
import UserDashboard from "./components/users/UserDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";

const theme = createTheme();

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Switch>
            <Route path="/signin" component={Login} />
            <Route path="/signup" component={Signup} />
            <Route path="/user-dashboard" component={UserDashboard} />
            <Route path="/admin-dashboard" component={AdminDashboard} />
            <Redirect to="/signin" />
          </Switch>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
