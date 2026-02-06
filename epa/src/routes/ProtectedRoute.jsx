import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({
  isLoggedIn,
  permissions = [],
  requiredPermissions = [],
  children,
}) {
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!permissions || permissions.length === 0) {
    return null;
  }

  if (requiredPermissions.length === 0) {
    return children;
  }

  const hasPermission = requiredPermissions.some((perm) =>
    permissions.includes(perm)
  );

  if (!hasPermission) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
