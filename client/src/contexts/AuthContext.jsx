import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const server = import.meta.env.VITE_API_URL;

  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null
  );
  const [phonenumber, setPhonenumber] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || "student");

  // Helper function to clear authentication state
  const clearAuthState = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setToken("");
    setUser(null);
    setRole("student");
  };

  // Helper function to validate token format
  const isValidToken = (token) => {
    if (!token) return false;
    // Basic JWT format validation (header.payload.signature)
    const parts = token.split('.');
    return parts.length === 3;
  };

  useEffect(() => {
    // Validate token on startup
    const storedToken = localStorage.getItem("token");
    if (storedToken && !isValidToken(storedToken)) {
      console.log("Invalid token detected, clearing auth state");
      clearAuthState();
    } else if (token && !user) {
      fetchMe();
    }
  }, [token]);

  useEffect(() => {
    role
      ? localStorage.setItem("role", role)
      : localStorage.removeItem("role");
  }, [role]);

  // [DISABLED FOR NOW]: OTP functions commented out for email+password switch
  // 🔹 Send OTP for Register
  // const sendOtpForRegister = async (phone) => {
  //   try {
  //     const res = await axios.post(`${server}/send-otp-register`, { phonenumber: phone }, {
  //       timeout: 45000, // 45 second timeout
  //       headers: {
  //         'Content-Type': 'application/json',
  //       }
  //     });
  //     setPhonenumber(phone);
  //     toast.success("OTP sent for registration");
  //     return { success: true };
  //   } catch (err) {
  //     console.error("Send OTP Register Error:", {
  //       message: err.message,
  //       code: err.code,
  //       status: err.response?.status,
  //       data: err.response?.data,
  //       phone: phone
  //     });
  //     
  //     let errorMessage = "Failed to send OTP";
  //     if (err.response?.data?.message) {
  //       errorMessage = err.response.data.message;
  //     } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
  //       errorMessage = "Request timed out. Please check your internet connection and try again.";
  //     } else if (err.code === 'NETWORK_ERROR' || !err.response) {
  //       errorMessage = "Network error. Please check your internet connection and try again.";
  //     }
  //     
  //     toast.error(errorMessage);
  //     return { success: false, message: errorMessage };
  //   }
  // };

  // 🔹 Send OTP for Login
  // const sendOtpForLogin = async (phone) => {
  //   try {
  //     const res = await axios.post(`${server}/send-otp-login`, { phonenumber: phone });
  //     setPhonenumber(phone);
  //     toast.success("OTP sent for login"); 
  //     return { success: true };
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Failed to send OTP");
  //     return { success: false, message: err.response?.data?.message || "Failed" };
  //   }
  // };

  // 🔹 Verify OTP and Register
  // const verifyOtpAndRegister = async (formData, otp, navigate) => {
  //   try {
  //     const res = await axios.post(`${server}/verify-otp-register`, {
  //       ...formData,
  //       otp,
  //       phonenumber,
  //     });
  //     const { token, user } = res.data;
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("user", JSON.stringify(user));
  //     setToken(token);
  //     setUser(user);
  //     toast.success("Registered successfully");
  //     navigate("/dashboard");
  //     return { success: true };
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Registration failed");
  //     return { success: false, message: err.response?.data?.message || "Failed" };
  //   }
  // };

  // 🔹 Verify OTP and Login
  // const verifyOtpAndLogin = async (otp, navigate) => {
  //   try {
  //     const res = await axios.post(`${server}/verify-otp-login`, {
  //       phonenumber,
  //       otp,
  //     });
  //     const { token, user } = res.data;
  //     localStorage.setItem("token", token);
  //     localStorage.setItem("user", JSON.stringify(user));
  //     setToken(token);
  //     setUser(user);
  //     toast.success("Logged in successfully");
  //     console.log("Redirecting...")
  //     navigate("/dashboard");
  //     return { success: true };
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Login failed");
  //     return { success: false, message: err.response?.data?.message || "Failed" };
  //   }
  // };

  // 🔹 Register with Email and Password (new)
  const registerWithEmailPassword = async (formData, navigate) => {
    try {
      const res = await axios.post(`${server}/register`, formData);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
      toast.success("Registered successfully");
      navigate("/dashboard");
      return { success: true };
    } catch (err) {
      // Verbose client-side logging for debugging (no UI toast)
      console.error("Registration error (client):", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        stack: err?.stack
      });
      return { 
        success: false, 
        message: err.response?.data?.message || "Failed",
        error: err.response?.data 
      };
    }
  };

  // 🔹 Login with Email and Password (new)
  const loginWithEmailPassword = async (email, password, navigate) => {
    try {
      const res = await axios.post(`${server}/login`, { email, password });
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
      toast.success("Logged in successfully");
      navigate("/dashboard");
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      return { success: false, message: err.response?.data?.message || "Failed" };
    }
  };

  // 🔹 Fetch Logged-in User
  const fetchMe = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${server}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      return { success: true };
    } catch (err) {
      console.error("Fetch /me failed:", err);
      
      // If token is invalid (401), clear auth state
      if (err.response?.status === 401) {
        console.log("Invalid token detected, clearing auth state");
        clearAuthState();
      }
      
      return { success: false, message: err.response?.data?.message || "Fetch failed" };
    }
  };

  // 🔹 Logout
  const logout = (navigate) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setToken("");
    setUser(null);
    setRole("student");
    setPhonenumber("");
    navigate("/login");
  };

  // 🔹 Direct user state update (for cases like avatar upload where we have complete user data)
  const updateUserState = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 🔹 Update User Profile
  const updateUser = async (field, value) => {
    if (!token) return { success: false, message: "Not authenticated" };
    
    try {
      const res = await axios.put(`${server}/update-profile`, {
        [field]: value
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.data.success) {
        // Update user state with the returned user data from server
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile updated successfully");
        return { success: true };
      } else {
        toast.error(res.data.message || "Update failed");
        return { success: false, message: res.data.message || "Update failed" };
      }
    } catch (err) {
      console.error("Update profile failed:", err);
      const errorMessage = err.response?.data?.message || "Update failed";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // 🔹 Admin login - Now uses backend authentication for security
  const loginAsAdmin = async (username, password, navigate) => {
    try {
      const res = await axios.post(`${server}/special/admin-login`, { 
        username, 
        password 
      }, {
        timeout: 60000, // 60 second timeout for admin login (bcrypt can be slow)
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (res.data.success) {
        const { token: newToken, user: userData } = res.data;
        
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", "admin");
        
        setToken(newToken);
        setUser(userData);
        setRole("admin");
        
        toast.success("Admin login successful");
        navigate("/");
        return { success: true };
      } else {
        toast.error("Invalid admin credentials");
        return { success: false, message: "Invalid credentials" };
      }
    } catch (err) {
      console.error("Admin login failed:", {
        message: err.message,
        code: err.code,
        status: err.response?.status,
        data: err.response?.data,
        username: username
      });
      
      let errorMessage = "Admin login failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        errorMessage = "Login request timed out. Please try again.";
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (err.response?.status === 401) {
        errorMessage = "Invalid admin credentials";
      }
      
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // 🔹 Sales login
  const loginAsSales = async (username, password, navigate) => {
    try {
      const res = await axios.post(`${server}/special/login`, { 
        username, 
        password 
      });

      const { token: newToken, user: userData } = res.data;
      
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", userData.role);
      
      setToken(newToken);
      setUser(userData);
      setRole(userData.role);
      
      toast.success("Sales login successful");
      navigate("/sales/dashboard");
      return { success: true };
    } catch (err) {
      console.error('Sales login error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || "Login failed. Please check your credentials." 
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        phonenumber,
        // [DISABLED FOR NOW]: OTP functions commented out for email+password switch
        // sendOtpForRegister,
        // sendOtpForLogin,
        // verifyOtpAndRegister,
        // verifyOtpAndLogin,
        registerWithEmailPassword,
        loginWithEmailPassword,
        fetchMe,
        logout,
        updateUser,
        updateUserState,
        role,
        loginAsAdmin,
        loginAsSales,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
