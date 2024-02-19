import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import createAxiosInstance from "../axios";

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permissions, setPermissions] = useState({});
  const axios = createAxiosInstance();

  const fetchUser = async () => {
    setIsLoading(true);
    
    try {
      const { data } = await axios.get("/user");
      setUser(data.user);
      setPermissions(data.permissions);
      const isAdmin = data.role !== 'user';
      setIsAdmin(isAdmin);
      setIsVerified(!!data.user.email_verified_at);
      setIsLoading(false);
      return data.role === 'user';
    } catch (error) {
      setUser(null);
      setIsVerified(false);
      setIsLoading(false);
      throw error;
    }
  };
  

  const logout = () => {
    setIsLoading(true);
    axios
      .post("/logout")
      .then(() => {
        setUser(null);
        setIsLoading(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    console.log('user :>> ', user);
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
