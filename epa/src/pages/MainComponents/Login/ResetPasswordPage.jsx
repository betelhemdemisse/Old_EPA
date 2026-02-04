import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import epaLogo from "../../../assets/img/epa-logo.png";
import backgroundImage from "../../../assets/img/epaback.png";
import AuthService from "../../../services/auth.service";
import ToastMessage from "../../../components/Alerts/ToastMessage";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setToast({
        open: true,
        type: "error",
        message: "Invalid or missing reset token. Please request a new password reset."
      });
      setTimeout(() => navigate("/forgot-password"), 3000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setToast({
        open: true,
        type: "error",
        message: "Passwords do not match"
      });
      return;
    }
    
    if (newPassword.length < 8) {
      setToast({
        open: true,
        type: "error",
        message: "Password must be at least 8 characters long"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await AuthService.resetPassword(token, newPassword, confirmPassword);
      
      if (response.success) {
        setToast({
          open: true,
          type: "success",
          message: response.message || "Password reset successfully!"
        });
        
        // Redirect to login after successful reset
        setTimeout(() => {
          navigate("");
        }, 2000);
      }
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        message: error.response?.data?.message || "Failed to reset password. Please try again."
      });
      
      // If token is invalid/expired, redirect to forgot password
      if (error.response?.status === 400) {
        setTimeout(() => {
          navigate("/forgot-password");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="text-center bg-white/85 p-8 rounded-2xl">
          <p className="text-red-600">Invalid reset link. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div
        className="bg-white/85 border border-white/30 py-10 rounded-2xl shadow-2xl 
             w-full max-w-md flex flex-col overflow-hidden"
      >
        <div className="px-8 py-6">
          {/* Back button */}
          <button
            onClick={() => navigate("")}
            className="flex items-center text-gray-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Login
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={epaLogo}
              alt="EPA Logo"
              className="w-40"
            />
          </div>

          {/* Title */}
          <h1 className="text-center text-[#387E53] text-2xl font-bold mb-2">
            Reset Password
          </h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Create a new password for your account
          </p>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="8"
                  className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-green-500 focus:border-green-500 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="8"
                  className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-green-500 focus:border-green-500 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-1">
                Password Requirements:
              </p>
              <ul className="text-xs text-gray-500 list-disc pl-4">
                <li>Minimum 8 characters</li>
                <li>Use a combination of letters, numbers, and symbols</li>
                <li>Avoid using easily guessable passwords</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-[#387E53] text-white font-semibold py-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

      {/* Toast Message */}
      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={5000}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}