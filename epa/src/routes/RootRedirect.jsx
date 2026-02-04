import { Navigate, useLocation } from "react-router-dom";
import { getHomeRoute } from "../utils/getHomeRoute";

export default function RootRedirect({ permissions }) {
  const location = useLocation();

  if (location.pathname === "/") {
    const homeRoute = getHomeRoute(permissions);
    return homeRoute ? <Navigate to={homeRoute} replace /> : null;
  }

  return null;
}
