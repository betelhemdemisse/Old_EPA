import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import epaLogo from "../../../assets/img/epa-logo.png";
import backgroundImage from "../../../assets/img/epaback.png";
import AuthService from "../../../services/auth.service";
import ToastMessage from "../../../components/Alerts/ToastMessage";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await AuthService.forgotPassword(email);
      
      setToast({
        open: true,
        type: "success",
        message: response.message || "Password reset link sent to your email."
      });
      
      // Reset form
      setEmail("");
      
      // Optionally navigate back to login after delay
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        message: error.response?.data?.message || "Failed to send reset link. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => navigate("/")}
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
            Forgot Password
          </h1>
          <p className="text-center text-gray-600 text-sm mb-6">
            Enter your email to receive a password reset link
          </p>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-green-500 focus:border-green-500 border-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#387E53] text-white font-semibold py-3 rounded-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The reset link will expire in 1 hour. 
              Check your spam folder if you don't see the email.
            </p>
          </div>
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