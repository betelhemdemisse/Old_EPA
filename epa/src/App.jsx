import React, { useState, useEffect } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "./routes/Route";
import { jwtDecode } from "jwt-decode";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  });

  const [permissions, setPermissions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const decoded = jwtDecode(token);
    setPermissions(decoded.permissions || []);
  } catch (err) {
    console.error("Token decode error:", err);
    setPermissions([]);
  }
}, [isLoggedIn]);


  useEffect(() => {
    if (isLoggedIn) {
      const storedPath = localStorage.getItem("currentPath");
      if (storedPath && storedPath !== "/" && storedPath !== location.pathname) {
        localStorage.removeItem("currentPath");
        navigate(storedPath, { replace: true });
      }
    } else {
      if (location.pathname !== "/") {
        localStorage.setItem("currentPath", location.pathname);
      }
    }
  }, [isLoggedIn, location.pathname, navigate]);

  return (
   <AppRoutes
  key={permissions.join(",")}
  isLoggedIn={isLoggedIn}
  permissions={permissions}
  setIsLoggedIn={setIsLoggedIn}
/>

  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
