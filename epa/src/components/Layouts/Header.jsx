import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../Buttons/IconButton.jsx";
import { ChevronDown } from "lucide-react";
import Toggle from "../Toggle/Toggle.jsx";
import SearchInput from "../Form/SearchInput.jsx";
import LanguageSwitcher from "../LanguageSwitcher.jsx";
import {
  SunIcon,
  MoonIcon,
  Menu,
  Bell,
  Settings,
  LogOut,
  User,
  Key
} from "lucide-react";
import avater from "../../assets/avater.png";

export default function Header({ setIsLoggedIn, user }) {
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  const parsedUser = user ? JSON.parse(user) : null;

  useEffect(() => {
    if (parsedUser) {
      setUserName(parsedUser.name || parsedUser.email?.split('@')[0] || "User");

      if (parsedUser.roles && parsedUser.roles.length > 0) {
        setUserRole(parsedUser.roles[0].name);
      } else if (parsedUser.isCentral !== undefined) {
        setUserRole(parsedUser.isCentral ? "Central Admin" : "Regional Admin");
      }
    }
  }, [parsedUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate("/profile"); 
  };



  return (
    <header className="sticky top-0 z-40 border mt-4 mx-4 rounded-lg border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-2">
        <div className="flex items-center gap-3 flex-1">
          {/* Search can be added back later */}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center border-r border-gray-300 pr-4">
            <LanguageSwitcher />

            <IconButton title="Notifications" className="px-4">
              <Bell className="h-5 w-5" />
            </IconButton>
          </div>

          {/* User Dropdown */}
          <div className="relative ml-2">
           <div
  className="flex items-center gap-2 cursor-pointer select-none"
  onClick={() => setDropdownOpen(!dropdownOpen)}
>
  <img
    src={avater}
    alt="User Avatar"
    className="h-10 w-10 rounded-full border-2 border-gray-300"
  />

  <div className="hidden md:flex items-center gap-1 text-left">
    <div className="text-sm font-medium text-gray-900">
      {parsedUser?.roles?.[0]?.name || "No role assigned"}
    </div>

    <ChevronDown
      className={`h-4 w-4 text-gray-500 transition-transform ${
        dropdownOpen ? "rotate-180" : ""
      }`}
    />
  </div>
</div>


            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={avater} alt="Avatar" className="h-10 w-10 rounded-full" />
                    <div>
                      <div className="font-medium text-gray-900">{parsedUser?.name}</div>
                      <div className="text-xs text-gray-600">{parsedUser?.email}</div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </button>

                

                  <div className="border-t border-gray-200 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}