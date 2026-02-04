export const getHomeRoute = (permissions = []) => {
  console.log(permissions , "permissionssss")
  if (permissions.includes("Dashboard:read")) {
    return "/generaldashboard";
  }
    if (permissions.includes("BaseData:read")) {
    return "/users";
  }

  if (permissions.includes("expert:report-list-read")) {
    return "/expert_case_get";
  }

  if (permissions.includes("taskForce:can-get-complaint")) {
    return "/task_force_case_get";
  }

  if (permissions.includes("region:can-get-complaint")) {
    return "/regional/region-admin";
  }

  if (permissions.includes("zone:can-get-complaint")) {
    return "/regional/zone-admin";
  }

  if (permissions.includes("woreda:can-get-complaint")) {
    return "/regional/woreda-admin";
  }

  return null;
};
