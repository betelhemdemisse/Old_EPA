// Main.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./SideBar";
import RegionalAdminSidebar from "./RegionalAdminSidebar";
import RegionalExpertSidebar from "./RegionalExpertSidebar";
import Header from "./Header";
import useAuth from "../../hooks/useAuth";

export default function Main({ children, setIsLoggedIn }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
    const user = localStorage.getItem("user");
  const auth = useAuth();
  const isRegion = auth?.isRegionAdmin;
  const isExpert = auth?.isAnyExpert || auth?.isRegionalExpert;
  const isZone = auth?.isZoneAdmin;
  const isWoreda = auth?.isWoredaAdmin;
  // Handle responsive sidebar & localStorage
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const stored = localStorage.getItem("sidebarOpen");

    if (mq.matches) {
      setSidebarOpen(stored == null ? true : stored === "1");
    } else {
      setSidebarOpen(false);
    }

    const handler = (e) => {
      if (e.matches) {
        const s = localStorage.getItem("sidebarOpen");
        setSidebarOpen(s == null ? true : s === "1");
      } else {
        setSidebarOpen(false);
      }
    };

    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, []);

  // Toggle sidebar open/close
  const toggleSidebar = () => {
    const mq = window.matchMedia("(min-width: 640px)");
    setSidebarOpen((prev) => {
      const next = !prev;
      if (mq.matches) localStorage.setItem("sidebarOpen", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div
      className="flex h-[100dvh] overflow-hidden"
      style={{ backgroundColor: "#F5F5FF" }}
    >
      {/* Sidebar selection priority:
          1) Any expert (regional/zone/woreda) -> expert sidebar
          2) Region/Zone/Woreda admins -> deputy-style generic sidebar
          3) Fallback -> generic sidebar
      */}
      {isExpert && (
        <RegionalExpertSidebar open={sidebarOpen} onToggle={toggleSidebar} />
      )}
      {!isExpert && (isRegion || isZone || isWoreda) && (
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      )}
      {!isExpert && !isRegion && !isZone && !isWoreda && (
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header
          onToggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
          setIsLoggedIn={setIsLoggedIn}
          user={user}
        />

        {/* Page content */}
          <main className=" w-full mt-38 flex-1 overflow-auto p-4 items-center justify-center">
          {children}
        </main>
      </div>
    </div>
  );



}
