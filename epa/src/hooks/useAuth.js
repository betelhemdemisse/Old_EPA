import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function useAuth() {
  const [auth, setAuth] = useState({
    token: null,
    decoded: null,
    permissions: [],
    isRegionAdmin: false,
    isRegionalExpert: false,
    isZoneAdmin: false,
    isWoredaAdmin: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuth((a) => ({ ...a, token: null, decoded: null, permissions: [] }));
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const permissions = decoded.permissions || [];

      const isRegionAdmin = permissions.includes("region:can-assign") || permissions.includes("region:can-get-complaint") || (decoded.role && decoded.role.toLowerCase().includes("region"));
      const isRegionalExpert = permissions.includes("expert:can-get-case") || (decoded.role && decoded.role.toLowerCase().includes("expert"));
      const isAnyExpert =
        permissions.some((p) => typeof p === "string" && p.toLowerCase().includes("expert")) ||
        (decoded.role && decoded.role.toLowerCase().includes("expert"));
      const isZoneAdmin = permissions.includes("zone:can-assign") || permissions.includes("zone:can-get-complaint") || (decoded.role && decoded.role.toLowerCase().includes("zone"));
      const isWoredaAdmin = permissions.includes("woreda:can-assign") || permissions.includes("woreda:can-get-complaint") || (decoded.role && decoded.role.toLowerCase().includes("woreda"));

      setAuth({ token, decoded, permissions, isRegionAdmin, isRegionalExpert, isZoneAdmin, isWoredaAdmin, isAnyExpert });
    } catch (err) {
      console.error("useAuth: failed to decode token", err);
      setAuth((a) => ({ ...a, token: null, decoded: null, permissions: [] }));
    }
  }, []);

  return auth;
}
