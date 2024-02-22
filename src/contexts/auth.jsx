import React, { createContext, useEffect, useState } from "react";
import createAxiosInstance from "../axios";

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const axios = createAxiosInstance();

  const fetchUser = async () => {
    setIsLoading(true);
    
    axios
      .get("/user/info")
      .then((response) => {
        setUser(response.data.user.user);
        setPermissions(response.data.user.permissions);
        setIsAdmin(isAdmin);
        setIsVerified(true);
      })
      .catch((error) => {
        setUser(null);
        setIsVerified(false);
        if (location.href != "http://localhost:5173/login" && location.href.includes("admin") || location.href.includes("user")) {
          window.location.href = "http://localhost:5173/login";
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const logout = () => {
    setIsLoading(true);
    axios
      .post("user/logout")
      .then(() => {
        setUser(null);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    console.log("user :>> ", user);
    if (!user) {
      fetchUser();
    }
  }, []);

  const value = {
    user,
    isLoading,
    permissions,
    isVerified,
    isAdmin,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
