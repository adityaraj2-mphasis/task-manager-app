import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("accessToken") || null
  );


  const api = axios.create({
    baseURL: "http://localhost:5001",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  // login
  const login = async (formData) => {
    try {
      const response = await api.post("/api/users/login", formData);
      console.log("login response", response, response.data.role);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      if (response.data.role == "user") {
        localStorage.setItem("user-id", response.data.id);
        localStorage.setItem("name", response.data.name);
      }
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error.response.data;
    }
  };

  //signup
  const signup = async (formData) => {
    try {
      console.log("formData", formData);
      const response = await api.post("/api/users/register", formData);
      setAccessToken(response.data.accessToken);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error.response.data;
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {};

  useEffect(() => {
    const tokenExpirationTime = 60 * 60 * 1000;
    const refreshTokenTimer = setInterval(
      refreshAccessToken,
      tokenExpirationTime
    );

    return () => clearInterval(refreshTokenTimer);
  }, []);

  const contextValue = {
    user,
    accessToken,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
