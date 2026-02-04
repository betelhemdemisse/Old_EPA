import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, MapPin, FileText, Archive, ClipboardList, Database } from "lucide-react";
import LOGO from "../../assets/EAPLOGO.png";

const NavItem = ({ path, icon, children, collapsed, matchStartsWith = false }) => {
  const location = useLocation();
  const active = matchStartsWith
    ? location.pathname.startsWith(path)
    : location.pathname === path;

  const base = `px-3 py-3 text-sm font-medium rounded-lg flex items-center transition ${
    collapsed ? "justify-center" : "gap-3"
  }`;

  const activeClass = active
    ? "bg-emerald-600 text-white shadow-md"
    : "text-gray-700 hover:bg-gray-100";

  return (
    <li>
      <Link to={path}>
        <div className={`${base} ${activeClass}`}>
          <span className="w-5 h-5">{icon}</span>
          {!collapsed && <span>{children}</span>}
        </div>
      </Link>
    </li>
  );
};

export default function RegionalAdminSidebar({ open = true, onToggle = () => {} }) {
  const collapsed = !open;

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } sticky top-0 h-[calc(100dvh-2rem)] my-4 ml-4 shrink-0 border-r rounded-lg border-gray-200 bg-white p-3 transition-all shadow-sm`}
    >
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-4">
        <div className={`w-full text-center ${collapsed ? "" : "hidden sm:block"}`}>
          {!collapsed && <img src={LOGO} alt="EPA" className="h-20 mx-auto" />}
        </div>
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="p-1 rounded hover:bg-gray-100"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
      </div>

      <nav className="space-y-6">
        <ul className="space-y-1">
          <NavItem path="/generaldashboard" icon={<Home size={20} />} collapsed={collapsed}>
            Dashboard
          </NavItem>
        </ul>

        <ul className="space-y-1">
          

          <NavItem
            path="/regional/region-admin"
            icon={<MapPin size={20} />}
            collapsed={collapsed}
            matchStartsWith
          >
            Region Assignment
          </NavItem>

          <NavItem
            path="/regional/zone-admin"
            icon={<MapPin size={20} />}
            collapsed={collapsed}
            matchStartsWith
          >
            Zone Assignment
          </NavItem>

          <NavItem
            path="/regional/woreda-admin"
            icon={<MapPin size={20} />}
            collapsed={collapsed}
            matchStartsWith
          >
            Woreda Assignment
          </NavItem>

          <NavItem
            path="/regional/expert/cases"
            icon={<ClipboardList size={20} />}
            collapsed={collapsed}
            matchStartsWith
          >
            Expert Cases
          </NavItem>

          <NavItem
            path="/regional/results"
            icon={<Archive size={20} />}
            collapsed={collapsed}
          >
            Results & Archive
          </NavItem>
        </ul>

        
      </nav>
    </aside>
  ); 
}