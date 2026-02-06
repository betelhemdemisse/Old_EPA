import { Navigate } from "react-router-dom";

export default function ProtectedRoute({
  isLoggedIn,
  permissions = [],
  requiredPermissions = [],
  children,
}) {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (requiredPermissions.length === 0) {
    return children;
  }

  const hasPermission = requiredPermissions.some((perm) =>
    permissions.includes(perm)
  );

  if (!hasPermission) {
    return <Navigate to="/generaldashboard" replace />;
  }

  return children;
}
