import React, { useState , useEffect  } from "react";
import { useNavigate } from "react-router-dom";
import epaLogo from "../../../assets/img/epa-logo.png";
import backgroundImage from "../../../assets/img/epaback.png";
import { Eye, EyeOff } from "lucide-react";
import AuthService from "../../../services/auth.service";
import ToastMessage from "../../../components/Alerts/ToastMessage";
import useAuth from "../../../hooks/useAuth";
export default function LoginPage({ setIsLoggedIn }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, type: "error", messafge: "" });
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
    const auth = useAuth();
    const permissions = auth.permissions || [];
  const [email, setEmail] = useState("");
useEffect(() => {
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    setEmail(savedEmail);
    setRememberMe(true);
  }
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (rememberMe) {
    localStorage.setItem("rememberedEmail", email);
  } else {
    localStorage.removeItem("rememberedEmail");
  }

    try {
      const res = await AuthService.login({ email, password });

      if (!res) {
        setToast({ open: true, type: "error", message: "Invalid email or password." });
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);
      if (res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
      }
      setToast({ open: true, type: "success", message: "Login successful!" });
      setTimeout(() => {
        setLoading(false);
        if (permissions.includes("Director:read") ||permissions.includes("deputydirector:read")) {
             navigate("/generaldashboard");
              }

        else if(permissions.includes("BaseData:read")){
        navigate("/users");
        }
         else if(permissions.includes("taskforce:can-get-complaint")){
        navigate("/users");
        }
      }, 1500);
    } catch (err) {
      console.error("❌ Login error:", err);
      setToast({ open: true, type: "error", message: "Something went wrong. Please try again." });
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
             w-full max-w-3xl md:max-w-4xl flex flex-col md:flex-row overflow-hidden"
      >

        {/* Left Section */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <img
            src={epaLogo}
            alt="EPA Logo"
            className="mx-auto w-[22rem] md:w-[26rem] lg:w-[30rem]"
          />
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-10">
          <h1 className="text-center text-[#387E53] text-4xl font-bold  mb-8">
            Login
          </h1>

          <form className="space-y-5 " onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Expert@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-green-500 focus:border-green-500 
          border-gray-300"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border px-3 py-3 text-sm outline-none focus:ring-green-500 focus:border-green-500 
          border-gray-300"
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

            {/* Remember / Forgot */}
            <div className="flex items-center justify-between text-sm text-gray-800">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2 accent-green-600" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
/>

                Remember me
              </label>

              <button
                type="button"
                className="text-blue-700 hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#387E53] text-white font-semibold py-2 rounded-md hover:bg-green-700 transition"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        </div>
      </div>

      {/* Toast Message */}
      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={3000}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
