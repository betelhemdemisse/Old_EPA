import { useState } from "react";
import api from "./api";



class AuthService {
  // User Login
  async login(data) {
    console.log(data , "user data")
    try {
      const res = await api.post("/api/auth/login", data);

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      return res.data;
    } catch (err) {
      console.error("Error logging in:", err);
      return null;
    }
  }

  // User Logout
  async logout() {
    try {
      const res = await api.post("/api/auth/logout");

      // Remove token
      localStorage.removeItem("token");

      return res.data;
    } catch (err) {
      console.error("Error logging out:", err);
      return null;
    }
  }

  // Request Password Reset
  async resetPasswordRequest(data) {
    console.log()
    try {
      const res = await api.post("/api/auth/reset-password-request", data);
      return res.data;
    } catch (err) {
      console.error("Error requesting password reset:", err);
      return null;
    }
  }

  // Reset Password
  async resetPassword(data) {
    try {
      const res = await api.post("/api/auth/reset-password", data);
      return res.data;
    } catch (err) {
      console.error("Error resetting password:", err);
      return null;
    }
  }

  // Get User Permissions
  async getUserPermissions(userId) {
    try {
      const res = await api.get(`/api/auth/permissions/${userId}`);
      return res.data;
    } catch (err) {
      console.error(`Error fetching permissions for user ${userId}:`, err);
      return null;
    }
  }
  
// Get Current User Profile - works for ALL users (central + regional)
async getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token");

    // Decode token to get current user_id
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentUserId = payload.id;

    // Try central admins first
    let res = await api.get("/api/administrator");
    let currentUser = res.data.find(user => user.user_id === currentUserId);

    // If not found, try regional users
    if (!currentUser) {
      res = await api.get("/api/administrator/all_regional/user");
      currentUser = res.data.find(user => user.user_id === currentUserId);
    }

    if (!currentUser) {
      throw new Error("User not found in any list");
    }

    // Optional: cache it
    localStorage.setItem("user", JSON.stringify(currentUser));

    return currentUser;
  } catch (err) {
    console.error("Error fetching current user:", err);
    // Fallback to cached if available
    const cached = localStorage.getItem("user");
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }
}


 async forgotPassword(email) {
    try {
      const res = await api.post("/api/auth/reset-password-request", { email });
      return res.data;
    } catch (err) {
      console.error("Error requesting password reset:", err);
      // Handle specific error messages from backend
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error("Failed to send reset link. Please try again.");
    }
  }
  async resetPassword(token, newPassword, confirmPassword) {
    try {
      const res = await api.post("/api/auth/reset-password", {
        token,
        newPassword,
        confirmPassword
      });
      return res.data;
    } catch (err) {
      console.error("Error resetting password:", err);
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error("Failed to reset password. Please try again.");
    }
  }


  // Change Password (for logged-in user)
  async changePassword(data) {
    try {
      const res = await api.post("/api/auth/change-password", data);
      return res.data;
    } catch (err) {
      console.error("Error changing password:", err);
      return null;
    }
  }

}



export default new AuthService();
