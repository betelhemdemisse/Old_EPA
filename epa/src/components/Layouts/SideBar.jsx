import LOGO from "../../assets/EAPLOGO.png";
import {
  Home,
  Users,
  Lock,
  FileText,
  FlaskConical,
  Database,
  BarChart,
  ClipboardList,
  ChevronDown,MapPin
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";

const NavItem = ({
  path,
  active: forcedActive,
  icon,
  children,
  collapsed,
  matchStartsWith = false,
}) => {
  const location = useLocation();

  const base = `px-2 py-2 text-sm font-medium transition flex items-center ${
    collapsed ? "justify-center" : "gap-3"
  }`;
  let active = !!forcedActive;
  if (path) {
    if (matchStartsWith) active = location.pathname.startsWith(path) || active;
    else active = location.pathname === path || active;
  }
  const activeClass = active
    ? `bg-[#387E53] text-white ${
        collapsed ? "rounded-full w-10 h-10" : "rounded-lg"
      }`
    : "text-gray-700 hover:bg-gray-100";

  const content = (
    <div
      title={
        collapsed
          ? typeof children === "string"
            ? children
            : undefined
          : undefined
      }
      aria-label={typeof children === "string" ? children : undefined}
      className={`${base} ${activeClass}`}
    >
      <span className="h-5 w-5 flex items-center justify-center">{icon}</span>
      {!collapsed && <span className="truncate">{children}</span>}
    </div>
  );

  return <span>{path ? <Link to={path}>{content}</Link> : content}</span>;
};

export default function Sidebar({ open = true, onToggle = () => {} }) {
  const { t } = useTranslation();
  const collapsed = !open;
  const auth = useAuth();
  const permissions = auth.permissions || [];
  const hasDeputyAccess =
    permissions.includes("deputyDirector:read")
  const isExpertUser = auth.isAnyExpert || auth.isRegionalExpert;
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } sticky top-0 h-[calc(100dvh-2rem)] my-4 ml-4 shrink-0 border-r rounded-lg border-gray-200 bg-white p-3 transition-all shadow-sm`}
    >
      <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-4">
        <div
          className={`text-center w-full ${collapsed ? "" : "hidden sm:block"}`}
        >
          {!collapsed && <img src={LOGO} alt="EPA" className="h-20 mx-auto" />}
        </div>
        <button
          onClick={onToggle}
          aria-label="Toggle sidebar"
          className="ml-auto p-1 rounded-md hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
          </svg>
        </button>
      </div>

      <nav className="space-y-2">
        <ul className="">
   {permissions.includes("Dashboard:read") && (
          <NavItem
            path="/generaldashboard"
            icon={<ClipboardList size={20} />}
            collapsed={collapsed}
          >
            {t('sidebar.generalDashboard')}
          </NavItem>
        )}
          {/* Permission check for Users */}
          {permissions.includes("User:read") && (
            <div className="space-y-1">
              {/* Parent menu */}
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Users size={20} />
                {!collapsed && (
                  <span className="ml-3 flex-1 text-left text-[15px] text-grey-100">
                    {t('sidebar.userManagement')}
                  </span>
                )}
                {!collapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              {/* Dropdown items */}
              {userMenuOpen && !collapsed && (
                <div className="ml-8 space-y-1">
                  <NavItem
                    path="/users"
                    icon={<Users size={16} />}
                    collapsed={collapsed}
                    matchStartsWith
                  >
                    {t('sidebar.staffUsers')}
                  </NavItem>

                  <NavItem
                    path="/regional-users"
                    icon={<Users size={16} />}
                    collapsed={collapsed}
                    matchStartsWith
                  >
                    {t('sidebar.regionalCityUsers')}
                  </NavItem>

                  <NavItem
                    path="/customers"
                    icon={<Users size={16} />}
                    collapsed={collapsed}
                    matchStartsWith
                  >
                    {t('sidebar.customers')}
                  </NavItem>
                </div>
              )}
            </div>
          )}

          {permissions.includes("Role:read") && (
            <NavItem
              path="/role-and-permission"
              icon={<Lock size={20} />}
              collapsed={collapsed}
            >
              {t('sidebar.rolesPermissions')}
            </NavItem>
          )}
        </ul>

       {hasDeputyAccess && (
            <NavItem
              path="/dupty_director_reports"
              icon={<FlaskConical size={20} />}
              collapsed={collapsed}
              matchStartsWith
            >
              {t('sidebar.report')}
            </NavItem>
          )}
         
          
           {/* Regional admin quick links (region/zone/woreda) - shown to admins with respective permissions */}
          {permissions.includes("region:can-get-complaint") && (
            <NavItem
              path="/regional/region-admin"
              icon={<FlaskConical size={20} />}
              collapsed={collapsed}
              matchStartsWith
            >
              {t('sidebar.reportList')}
            </NavItem>
          )}
          {permissions.includes("zone:can-get-complaint") && (
            <NavItem
              path="/regional/zone-admin"
              icon={<FlaskConical size={20} />}
              collapsed={collapsed}
              matchStartsWith
            >
               {t('sidebar.reportList')}
            </NavItem>
          )}
          {permissions.includes("woreda:can-get-complaint") && (
            <NavItem
              path="/regional/woreda-admin"
              icon={<FlaskConical size={20} />}
              collapsed={collapsed}
              matchStartsWith
            >
               {t('sidebar.reportList')}
            </NavItem>
          )}
        
           {/* <NavItem
              path="/desk-head/reportlist"
              icon={<FlaskConical size={20} />}
              collapsed={collapsed}
            >
              DeskHead Report List
            </NavItem> */}
          {permissions.includes("BaseData:read") && (
            <NavItem
              path="/base-data"
              icon={<Database size={20} />}
              collapsed={collapsed}
              matchStartsWith
            >
              Base Data
            </NavItem>
          )}
          {/* {permissions.includes("BaseData:read") && (
       
          <NavItem path="/stats" icon={<BarChart size={20} />} collapsed={collapsed}>Statics Reporting</NavItem>
                  )} */}

          {permissions.includes("taskForce:can-get-complaint") && (
            <>
              <NavItem
                path="/task_force_case_get"
                icon={<ClipboardList size={20} />}
                collapsed={collapsed}
                matchStartsWith
              >
                {t('sidebar.getReport')}
              </NavItem>
              <NavItem
                path="/task_force_report_list"
                icon={<ClipboardList size={20} />}
                collapsed={collapsed}
                matchStartsWith
              >
                {t('sidebar.reportList')}
              </NavItem>
            </>
          )}

          {permissions.includes("expert:can-get-case") && (
            <NavItem
              path="/expert_case_get"
              icon={<ClipboardList size={20} />}
              collapsed={collapsed}
              matchStartsWith
            >
              {t('sidebar.getReport')}
            </NavItem>
          )}
        

          {permissions.includes("expert:report-list-read") && (
            <NavItem
              path="/expert_report_list"
              icon={<ClipboardList size={20} />}
              collapsed={collapsed}
              matchStartsWith
            >
              {t('sidebar.reportList')}
            </NavItem>
          )}
   {permissions.includes("Dashboard:read") && (

          <NavItem
            path="/generalreport"
            icon={<ClipboardList size={20} />}
            collapsed={collapsed}
          >
            {t('sidebar.generalReport')}
          </NavItem>
   )}
     {permissions.includes("taskForce:can-get-complaint") && (
            <NavItem
              path="/results"
              icon={<FlaskConical size={20} />}
              collapsed={collapsed}
            >
              {t('sidebar.archive')}
            </NavItem>
          )}
      </nav>
    </aside>
  );
}
