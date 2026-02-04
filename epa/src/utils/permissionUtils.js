export function hasPermission(auth, permission) {
  if (!auth) return false;
  const { permissions = [], decoded = {} } = auth;
  if (permissions.includes(permission)) return true;
  // fallback: check role string
  const role = decoded.role || decoded.user_type || "";
  if (typeof role === "string" && role.toLowerCase().includes(permission.split(":")[0])) return true;
  return false;
}

export default { hasPermission };
