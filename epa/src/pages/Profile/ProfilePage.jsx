import { useState, useEffect } from "react";
import AuthService from "../../services/auth.service"; // Adjust path if needed
import { User, Mail, Phone, Briefcase, Calendar, Shield, AlertTriangle, Key } from "lucide-react";
import avater from "../../assets/avater.png";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Buttons/Buttons";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(""); // For "cached" or error info

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setStatusMessage("");

        // Try to fetch fresh data from server
        const userData = await AuthService.getCurrentUser();

        if (userData) {
          setUser(userData);
          // Update cache
          localStorage.setItem("user", JSON.stringify(userData));
          setStatusMessage("");
        }
      } catch (err) {
        console.warn("Server unreachable, falling back to cached data:", err);

        // Fallback: Load from localStorage
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          setUser(parsed);
          setStatusMessage("Showing cached profile (server offline)");
        } else {
          setStatusMessage("Server is offline and no cached data available");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);
  const navigate =useNavigate();

    const handleChangePasswordClick = () => {
    navigate("/change-password"); 
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!user && statusMessage.includes("no cached data")) {
    return (
      <div className="max-w-4xl mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-xl text-center">
        <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <p className="text-red-700 text-lg">{statusMessage}</p>
        <p className="text-gray-600 mt-2">Please check your connection and try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Status Message (cached/offline) */}
        {statusMessage && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3 text-yellow-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-green-100 rounded-2xl shadow-lg overflow-hidden">
          <div className=" h-32"></div>
          
          <div className="relative px-8 pb-10 -mt-16">
            <div className="flex flex-col items-center border-green sm:flex-row sm:items-end gap-6">
              <img
                src={avater}
                alt="Profile"
                className="w-32 h-32 bg-white rounded-full border-6 border-white shadow-2xl object-cover"
              />

              <div className="text-center font-bold space-y-2 sm:text-left flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.name || "User"}
                </h1>
                <p className="text-lg capitalize text-gray-600 mt-1 flex items-center gap-2 justify-center sm:justify-start">
                  <Briefcase className="h-5 w-5 text-green-700" />
                  {user?.roles?.[0]?.name || "No role assigned"}
                </p>
                {user?.isRegional !== undefined && (
                  <p className="text-sm capitalize text-gray-500  mt-2 flex items-center gap-2 justify-center sm:justify-start">
                    <Shield className="h-4 w-4 text-green-700" />
                    {user.isRegional ? "Regional User" : "Headquarters (Central)"}
                  </p>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-7">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <User className="h-7 w-7 text-green-600" />
              Personal Information
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{user?.email || "N/A"}</p>
                </div>
              </div>

              {user?.phone && (
                <div className="flex items-center gap-4">
                  <Phone className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}

              {user?.gender && (
                <div className="flex items-center gap-4">
                  <User className="h-6 w-6 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium text-gray-900 capitalize">{user.gender}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-white rounded-xl shadow-md p-7">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Briefcase className="h-7 w-7 text-green-600" />
              Account Details
            </h2>
            <div className="space-y-6">
            
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green mt-1">
                  Active
                </span>
              </div>
           <div className="w-full justify-end flex">
            <Button
                    onClick={handleChangePasswordClick}
                    className="flex items-center gap-3  px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Key className="h-4 w-4" />
                    Change Password
                  </Button>

           </div>
                

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}