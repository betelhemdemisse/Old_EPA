import { User, Users, MapPin, X, Check, Search, Plus, ChevronDown } from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import React, { useEffect, useState, useRef } from "react";
import caseService from "../../services/case.service.js";
import complaintService from "../../services/complaint.service.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal.jsx";
import userService from "../../services/user.service.js";

export default function ReportDetailUI({
  detail,
  isEditing,
  setIsEditing,
  reportTypes,
  handlingUnit,
  setHandlingUnit,
  isModalOpen,
  setIsModalOpen,
  investigationDays,
  setInvestigationDays,
  isTeamFormationNeeded,
  setIsTeamFormationNeeded,
  pollutionCategories,
  subPollutionCategories,
  regions,
  cities,
  zones,
  subcities,
  filteredWoredas,
  formData,
  handleChange,
  loadData,
  loadExpertData
}) {
  if (!detail) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }

  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [activity, setActivity] = useState("");
  const [isFinal, setIsFinal] = useState(
    detail?.case?.case_investigation?.[0]?.status === "final" || false
  );
  const [selectedReportType, setSelectedReportType] = useState("");

  // Team Assignment Modal
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    department: "",
    expert: [],
    description: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Data
  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Search & Dropdown States
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const userInputRef = useRef(null);
  const userContainerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userContainerRef.current && !userContainerRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Decode token
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPermissions(decoded.permissions || []);
        setCurrentUserId(decoded.id || decoded.user_id || decoded.sub);
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, [token]);

  // Load departments and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, hierarchyRes] = await Promise.all([
          userService.getAllUsers(),
          userService.getOrganizationHierarchy(),
        ]);
        setAllUsers(usersRes || []);
        setDepartments(hierarchyRes?.data || []);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    fetchData();
  }, []);

  // Filter departments
  const filteredDepartments = departments
    .filter((d) => d.name?.toLowerCase().includes(departmentSearch.toLowerCase()))
    .map((d) => ({ value: d.id, label: d.name }));

  // Get available users for team assignment
  const getAvailableUsers = () => {
    let available = allUsers;

    if (userSearch.trim()) {
      const query = userSearch.toLowerCase();
      available = available.filter(
        (user) =>
          (user.name || "").toLowerCase().includes(query) ||
          (user.username || "").toLowerCase().includes(query) ||
          (user.email || "").toLowerCase().includes(query)
      );
    }

    available = available.filter((user) => !teamFormData.expert.includes(user.id));

    return available.map((user) => ({
      id: user.user_id,
      name: user.name || user.username || user.email || "Unknown",
      email: user.email,
      role: user.role || user.user_type || "User",
    }));
  };

  const availableUsers = getAvailableUsers();

  // Location search states
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [zoneSearch, setZoneSearch] = useState("");
  const [subcitySearch, setSubcitySearch] = useState("");
  const [woredaSearch, setWoredaSearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSubcategoryDropdown, setShowSubcategoryDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);
  const [showSubcityDropdown, setShowSubcityDropdown] = useState(false);
  const [showWoredaDropdown, setShowWoredaDropdown] = useState(false);

  const filteredCategories = pollutionCategories?.filter((cat) =>
    cat.pollution_category.toLowerCase().includes(categorySearch.toLowerCase())
  ) || [];
  const filteredSubcategories = subPollutionCategories?.filter((sub) =>
    sub.sub_pollution_category.toLowerCase().includes(subcategorySearch.toLowerCase())
  );
  const filteredRegions = regions?.filter((r) =>
    r.region_name.toLowerCase().includes(regionSearch.toLowerCase())
  );
  const filteredCities = cities?.filter((c) =>
    c.city_name.toLowerCase().includes(citySearch.toLowerCase())
  );
  const filteredZones = zones?.filter((z) =>
    z.zone_name.toLowerCase().includes(zoneSearch.toLowerCase())
  );
  const filteredSubcities = subcities?.filter((s) =>
    (s.name || s.subcity_name).toLowerCase().includes(subcitySearch.toLowerCase())
  );
  const filteredWoredasForSearch = filteredWoredas?.filter((w) =>
    w.woreda_name.toLowerCase().includes(woredaSearch.toLowerCase())
  );

  // Sync location searches
  useEffect(() => {
    const cat = pollutionCategories?.find((c) => c.pollution_category_id === formData?.pollution_category_id);
    setCategorySearch(cat ? cat.pollution_category : "");
  }, [formData?.pollution_category_id, pollutionCategories]);

  useEffect(() => {
    const sub = subPollutionCategories?.find((s) => s.sub_pollution_category_id === formData?.sub_pollution_category_id);
    setSubcategorySearch(sub ? sub.sub_pollution_category : "");
  }, [formData?.sub_pollution_category_id, subPollutionCategories]);

  useEffect(() => {
    const reg = regions?.find((r) => r.region_id === formData?.region_id);
    setRegionSearch(reg ? `${reg.region_name} (Region)` : "");
  }, [formData?.region_id, regions]);

  useEffect(() => {
    const cit = cities?.find((c) => c.city_id === formData?.city_id);
    setCitySearch(cit ? `${cit.city_name} (City)` : "");
  }, [formData?.city_id, cities]);

  useEffect(() => {
    const zon = zones?.find((z) => z.zone_id === formData?.zone_id);
    setZoneSearch(zon ? zon.zone_name : "");
  }, [formData?.zone_id, zones]);

  useEffect(() => {
    const subcit = subcities?.find((s) => s.subcity_id === formData?.subcity_id);
    setSubcitySearch(subcit ? subcit.name || subcit.subcity_name : "");
  }, [formData?.subcity_id, subcities]);

  useEffect(() => {
    const wor = filteredWoredas?.find((w) => w.woreda_id === formData?.woreda_id);
    setWoredaSearch(wor ? wor.woreda_name : "");
  }, [formData?.woreda_id, filteredWoredas]);
  console.log("detaillll", detail)
  const statusSteps = ["submitted", "under review", "verified", "under_investigation", "authorized", "rejected", "closed"];
  const currentStatusIndex = statusSteps.indexOf(detail.status?.toLowerCase() || "submitted");
  console.log(currentStatusIndex, "currentStatusIndex currentStatusIndex currentStatusIndex")
  const isRegionMode = !!formData?.region_id;
  const isCityMode = !!formData?.city_id;

  const handleSend = async () => {

    if (files.length === 0) return setToast({ open: true, type: "error", message: "Please attach at least one file." });
    if (!activity.trim()) return setToast({ open: true, type: "error", message: "Please enter your activity." });

    const reportData = { files, description: activity, isFinal };
    const result = await caseService.submitExpertReport(detail?.case?.case_id, reportData);
    if (result.success) {
      setToast({ open: true, type: "success", message: "Report submitted successfully!" });
      setFiles([]);
      setActivity("");
      setIsFinal(detail?.case?.case_investigation?.[0]?.status === "final");
      loadExpertData?.();
    } else {
      setToast({ open: true, type: "error", message: "Failed to submit report." });
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        pollution_category_id: formData.pollution_category_id || null,
        subpollution_category_id: formData.sub_pollution_category_id || null,
        region_id: isRegionMode ? formData.region_id || null : null,
        city_id: isCityMode ? formData.city_id || null : null,
        zone_id: isRegionMode ? formData.zone_id || null : null,
        subcity_id: isCityMode ? formData.subcity_id || null : null,
        woreda_id: formData.woreda_id || null,
      };

      await complaintService.updateComplaint(detail?.complaint_id, payload);
      setToast({ open: true, message: "Updated successfully!", type: "success" });
      setIsEditing(false);
      loadData?.();
    } catch (err) {
      setToast({ open: true, message: "Update failed", type: "error" });
    }
  };

  const handleTeamFormChange = (name, value) => {
    if (name === "expert") {
      setTeamFormData((prev) => ({
        ...prev,
        expert: prev.expert.includes(value)
          ? prev.expert.filter((id) => id !== value)
          : [...prev.expert, value],
      }));
      setUserSearch("");
    } else {
      setTeamFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const removeUser = (userId) => {
    setTeamFormData((prev) => ({
      ...prev,
      expert: prev.expert.filter((id) => id !== userId),
    }));
  };

  const handleAssignTeam = async () => {
    setSubmitAttempted(true);



    const caseId = detail.case?.case_id;
    const validUsers = teamFormData.expert.filter(id => id != null && id !== "");

    if (!caseId) {
      setToast({ open: true, type: "error", message: "Case ID is missing. Please refresh and try again." });
      return;
    }

    if (validUsers.length === 0) {
      setToast({ open: true, type: "error", message: "No valid team members selected." });
      return;
    }

    try {
      const result = await caseService.createTeam(caseId, validUsers, currentUserId);

      if (result.success) {
        setToast({
          open: true,
          type: "success",
          message: result.message || "Team created successfully!",
        });

        setIsAssignTeamModalOpen(false);
        setTeamFormData({ department: "", expert: [], description: "" });
        setSubmitAttempted(false);
        setUserSearch("");
        loadData?.();
      } else {
        setToast({
          open: true,
          type: "error",
          message: result.error || "Failed to create team.",
        });
      }
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        message: "Failed to create team.",
      });
    }
  };

  const handleVerifyAndAssign = async () => {
    if (!handlingUnit || !investigationDays) {
      setToast({
        open: true,
        message: "Please fill all fields",
        type: "error",
      });
      return;
    }

    try {
      await complaintService.chooseHandlingUnit(detail?.complaint_id, {
        handling_unit: handlingUnit,
        investigation_days: parseInt(investigationDays),
        is_team_formation_needed: isTeamFormationNeeded,
      });
      setToast({
        open: true,
        message: "Report verified and assigned!",
        type: "success",
      });
      setIsModalOpen(false);
      loadData?.();
    } catch {
      setToast({
        open: true,
        message: "Assignment failed",
        type: "error",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Report Details</h1>
        <div className="flex gap-4">
          {permissions.includes("taskForce:can-verify-complaint") &&
            detail.status?.toLowerCase() === "under review" && (
              <>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#387E53] hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                >
                  <User className="w-5 h-5" /> Verify Report
                </button>
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2">
                  <X className="w-5 h-5" /> Reject Report
                </button>
              </>
            )}
        </div>
      </div>

      <div className="min-h-screen py-4" style={{ backgroundColor: "#EEEFF6" }}>
        <div className="max-w-7xl mx-auto px-6">
          <ToastMessage
            open={toast.open}
            type={toast.type}
            message={toast.message}
            onClose={() => setToast({ ...toast, open: false })}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 p-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Report Status */}
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="relative mt-2">
                <div className="absolute top-[14px] left-[6%] right-[6%] h-[2px] bg-gray-300" />
                <div
                  className="absolute top-[14px] left-[4%] h-[2px] bg-[#387E53] transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 90}%` }}
                />
                <div className="flex justify-between relative">
                  {statusSteps.map((s, i) => {
                    const isActive = i <= currentStatusIndex;
                    return (
                      <div key={s} className="flex flex-col items-center w-24 text-center">
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all 
                            ${isActive ? "bg-[#387E53] border-[#387E53] text-white" : "bg-white border-gray-300"}`}
                        >
                          {isActive ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                        </div>
                        <span
                          className={`mt-1 text-xs font-medium capitalize 
                            ${isActive ? "text-[#387E53]" : "text-gray-400"}`}
                        >
                          {s.replace("_", " ")}
                        </span>
                        {detail?.status_dates?.[s] && (
                          <span className="text-[10px] text-gray-500 mt-1">
                            {new Date(detail.status_dates[s]).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Report Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-[#027BDA]">Report Information</h2>
                {permissions.includes("taskForce:can-verify-complaint") &&
                  detail.status?.toLowerCase() === "under review" && (
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      {isEditing ? "Cancel" : "Edit"}
                    </button>
                  )}
              </div>

              <div className="space-y-6 text-sm">
                {/* Category */}
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-slate-600">Category</span>
                  {isEditing ? (
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Select Category"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        onFocus={() => setShowCategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                        className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {showCategoryDropdown && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredCategories.map((cat) => (
                            <div
                              key={cat.pollution_category_id}
                              onClick={() => {
                                handleChange("pollution_category_id", cat.pollution_category_id);
                                setCategorySearch(cat.pollution_category);
                                setShowCategoryDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {cat.pollution_category}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>{detail.pollution_category?.pollution_category || "—"}</span>
                  )}
                </div>

                {/* Subcategory */}
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="font-medium text-slate-600">Subcategory</span>
                  {isEditing ? (
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Select Subcategory"
                        value={subcategorySearch}
                        onChange={(e) => setSubcategorySearch(e.target.value)}
                        onFocus={() => setShowSubcategoryDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)}
                        className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={!formData?.pollution_category_id}
                      />
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      {showSubcategoryDropdown && formData?.pollution_category_id && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredSubcategories.map((sub) => (
                            <div
                              key={sub.sub_pollution_category_id}
                              onClick={() => {
                                handleChange("sub_pollution_category_id", sub.sub_pollution_category_id);
                                setSubcategorySearch(sub.sub_pollution_category);
                                setShowSubcategoryDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {sub.sub_pollution_category}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>{detail.sub_pollution_category?.sub_pollution_category || "—"}</span>
                  )}
                </div>

                {/* Location Type */}
                <div className="py-3 border-b">
                  <span className="font-medium text-slate-600 block mb-3">Location Type</span>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select Region"
                          value={regionSearch}
                          onChange={(e) => setRegionSearch(e.target.value)}
                          onFocus={() => setShowRegionDropdown(true)}
                          onBlur={() => setTimeout(() => setShowRegionDropdown(false), 200)}
                          className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {showRegionDropdown && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredRegions.map((r) => (
                              <div
                                key={r.region_id}
                                onClick={() => {
                                  handleChange("region_id", r.region_id);
                                  setRegionSearch(`${r.region_name} (Region)`);
                                  setShowRegionDropdown(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                {r.region_name} (Region)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Select City"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          onFocus={() => setShowCityDropdown(true)}
                          onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                          className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {showCityDropdown && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredCities.map((c) => (
                              <div
                                key={c.city_id}
                                onClick={() => {
                                  handleChange("city_id", c.city_id);
                                  setCitySearch(`${c.city_name} (City)`);
                                  setShowCityDropdown(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                {c.city_name} (City)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {detail.region?.region_name && <div>Region: {detail.region.region_name}</div>}
                      {detail.city?.city_name && <div>City: {detail.city.city_name}</div>}
                    </div>
                  )}
                </div>

                {isRegionMode && (
                  <div className="py-3 border-b">
                    <span className="font-medium text-slate-600">Zone</span>
                    {isEditing ? (
                      <div className="relative w-full mt-2">
                        <input
                          type="text"
                          placeholder="Select Zone"
                          value={zoneSearch}
                          onChange={(e) => setZoneSearch(e.target.value)}
                          onFocus={() => setShowZoneDropdown(true)}
                          onBlur={() => setTimeout(() => setShowZoneDropdown(false), 200)}
                          className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {showZoneDropdown && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredZones.map((z) => (
                              <div
                                key={z.zone_id}
                                onClick={() => {
                                  handleChange("zone_id", z.zone_id);
                                  setZoneSearch(z.zone_name);
                                  setShowZoneDropdown(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                {z.zone_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="block mt-2">{detail.zone?.zone_name || "—"}</span>
                    )}
                  </div>
                )}

                {isCityMode && (
                  <div className="py-3 border-b">
                    <span className="font-medium text-slate-600">Subcity</span>
                    {isEditing ? (
                      <div className="relative w-full mt-2">
                        <input
                          type="text"
                          placeholder="Select Subcity"
                          value={subcitySearch}
                          onChange={(e) => setSubcitySearch(e.target.value)}
                          onFocus={() => setShowSubcityDropdown(true)}
                          onBlur={() => setTimeout(() => setShowSubcityDropdown(false), 200)}
                          className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {showSubcityDropdown && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredSubcities.map((s) => (
                              <div
                                key={s.subcity_id}
                                onClick={() => {
                                  handleChange("subcity_id", s.subcity_id);
                                  setSubcitySearch(s.name || s.subcity_name);
                                  setShowSubcityDropdown(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                {s.name || s.subcity_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="block mt-2">{detail.subcity?.subcity_name || "—"}</span>
                    )}
                  </div>
                )}

                {(isRegionMode || isCityMode) && (
                  <div className="py-3">
                    <span className="font-medium text-slate-600">Woreda</span>
                    {isEditing ? (
                      <div className="relative w-full mt-2">
                        <input
                          type="text"
                          placeholder={formData?.zone_id || formData?.subcity_id ? "Select Woreda" : "Select Zone/Subcity first"}
                          value={woredaSearch}
                          onChange={(e) => setWoredaSearch(e.target.value)}
                          onFocus={() => setShowWoredaDropdown(true)}
                          onBlur={() => setTimeout(() => setShowWoredaDropdown(false), 200)}
                          className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          disabled={!formData?.zone_id && !formData?.subcity_id}
                        />
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        {showWoredaDropdown && (formData?.zone_id || formData?.subcity_id) && (
                          <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredWoredasForSearch.map((w) => (
                              <div
                                key={w.woreda_id}
                                onClick={() => {
                                  handleChange("woreda_id", w.woreda_id);
                                  setWoredaSearch(w.woreda_name);
                                  setShowWoredaDropdown(false);
                                }}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                              >
                                {w.woreda_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="block mt-2">{detail.woreda?.woreda_name || "—"}</span>
                    )}
                  </div>
                )}

                <div className="py-4">
                  <span className="font-medium text-slate-600 block mb-2">Description</span>
                  <p className="text-slate-700 bg-gray-50 p-4 rounded-lg">{detail.detail || "No description"}</p>
                </div>

               <div className="flex justify-between items-center px-6 py-3 text-sm">
                                         <span className="text-gray-600">Location</span>
                                                                         {detail.location_url ? (
                                         <a
                                           href={detail.location_url}
                                           target="_blank"
                                           rel="noreferrer"
                                           className="relative group text-blue-600"
                                         >
                                           <MapPin
                                             size={22}
                                             className="cursor-pointer hover:text-blue-800 transition"
                                           />
                                           <span className="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-10">
                                             {detail.location_url}
                                           </span>
                                         </a>
                                                                         ):(
                                                                        <span className="text-gray-400 italic">No location available</span>
                                                                         )}
                                       </div>

                <div className="py-3">
                  <span className="font-medium text-slate-600">Reported Date</span>
                  <span className="block mt-1">{new Date(detail.created_at).toLocaleString()}</span>
                </div>
              </div>

              {isEditing && (
                <div className="mt-8 flex justify-end gap-4">
                  <button onClick={() => setIsEditing(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Reported Media</h2>
              <div className="w-full h-96 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50">
                <img src="/report image.jpg" alt="Report" className="w-full h-full object-cover" />
              </div>
            </div>

            {permissions.includes("expert:can-upload-investigation") && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                {detail?.case?.case_investigation?.[0]?.status !== "final" && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Expert Attachment</h2>
                    <div
                      className="w-full h-25 rounded-xl border-2 border-dashed border-gray-300 bg-blue-50 flex items-center p-6 cursor-pointer"
                      onClick={() => document.getElementById("expert-file-upload").click()}
                    >
                      <input
                        id="expert-file-upload"
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => setFiles(Array.from(e.target.files))}
                      />
                      <div className="flex items-center justify-center w-14 h-14 bg-blue-300 rounded-lg">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-7 w-7 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 12l-4-4m0 0l-4 4m4-4v12"
                          />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-700">
                          {files.length > 0
                            ? files.map((file) => file.name).join(", ")
                            : "Document Attachment"}
                        </h3>
                        <p className="text-sm text-gray-600">(PDF, JPG, PNG)</p>
                      </div>
                    </div>

                    <div className="border-b my-6"></div>

                    <h2 className="text-xl font-semibold mb-2">Activity</h2>
                    <textarea
                      placeholder="Enter your activity..."
                      className="w-full h-22 border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                    ></textarea>

                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={isFinal}
                        onChange={(e) => setIsFinal(e.target.checked)}
                        className="rounded border-gray-300 focus:ring-2 focus:ring-blue-400"
                      />
                      Mark as Final
                    </label>

                    <div className="flex justify-end mt-4 gap-2">
                      <button
                        className="px-6 py-2 rounded-xl text-white font-semibold shadow-md"
                        style={{ backgroundColor: "#387E53" }}
                        onClick={handleSend}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {isFinal && detail?.case?.case_investigation?.[0]?.status === "final" && (
                  <>
                    <div className="mt-4">
                      <label className="block mb-2 font-medium">Select Report Type</label>
                      <select
                        className="border rounded-lg px-4 py-2 w-full"
                        value={selectedReportType}
                        onChange={(e) => setSelectedReportType(e.target.value)}
                      >
                        <option value="">-- Select Report Type --</option>
                        {reportTypes.map((type) => (
                          <option key={type.report_type_id} value={type.report_type_id}>
                            {type.report_type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isFinal && selectedReportType && (
                      <div className="mt-4 flex justify-end">
                        <button
                          className="px-6 py-2 bg-blue-600 text-white rounded-xl"
                          onClick={() => {
                            navigate(`/report-fill-form`, {
                              state: {
                                report_type_id: selectedReportType,
                                case_id: detail.case?.case_id,
                              },
                            });
                          }}
                        >
                          Fill Form
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Handling Unit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Assign Handling Unit</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "hq_expert", icon: User, label: "Individual" },
                {
                  value: "temporary_team",
                  icon: Users,
                  label: "Team",
                  onClick: () => {
                    setHandlingUnit("temporary_team");
                    setIsTeamFormationNeeded(true);
                    setIsModalOpen(false);
                    setIsAssignTeamModalOpen(true);
                  },
                },
                { value: "regional_team", icon: MapPin, label: "Region" },
              ].map(({ value, icon: Icon, label, onClick }) => (
                <button
                  key={value}
                  onClick={() => (onClick ? onClick() : setHandlingUnit(value))}
                  className={`p-6 rounded-xl border-2 transition-all ${handlingUnit === value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Investigation Days</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded-lg px-4 py-3"
                value={investigationDays}
                onChange={(e) => setInvestigationDays(e.target.value)}
                placeholder="e.g. 7"
              />
            </div>

            <button
              onClick={handleVerifyAndAssign}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
            >
              Confirm & Assign
            </button>
          </div>
        </div>
      )}

      {/* TEAM ASSIGNMENT MODAL */}
      <Modal
        open={isAssignTeamModalOpen}
        onClose={() => {
          setIsAssignTeamModalOpen(false);
          setTeamFormData({ department: "", expert: [], description: "" });
          setSubmitAttempted(false);
          setUserSearch("");
        }}
        title="Assign Team"
        width="w-full max-w-2xl"
        actions={
          <>
            <button
              onClick={() => {
                setIsAssignTeamModalOpen(false);
                setTeamFormData({ department: "", expert: [], description: "" });
                setSubmitAttempted(false);
              }}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignTeam}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md"
            >
              Save Team
            </button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Team Members */}
          <div ref={userContainerRef}>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Team Members</label>
            <div className="relative w-full">
              <input
                ref={userInputRef}
                type="text"
                placeholder="Search users by name, username, or email"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onFocus={() => setShowUserDropdown(true)}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-3 focus:ring-2 focus:ring-green-500"
              />

              {/* Search icon */}
              <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

              <ChevronDown
                className={`absolute right-3 top-3.5 h-5 w-5 text-gray-400 transition-transform ${showUserDropdown ? "rotate-180" : ""
                  }`}
              />

              {showUserDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b px-4 py-2 text-xs font-medium text-gray-500">
                    Available Users ({availableUsers.length})
                  </div>

                  {availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          handleTeamFormChange("expert", user.id);
                          userInputRef.current?.focus();
                        }}
                        className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              {user.email && (
                                <div className="text-xs text-gray-500">{user.email}</div>
                              )}
                            </div>
                          </div>

                          <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                            Add <Plus className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      {userSearch.trim()
                        ? `No users found for "${userSearch}"`
                        : "No users available"}
                    </div>
                  )}
                </div>
              )}
            </div>


            {/* Selected Members */}
            {teamFormData.expert.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-slate-700">
                    Selected Members ({teamFormData.expert.length})
                  </span>
                  <button
                    onClick={() => setTeamFormData((prev) => ({ ...prev, expert: [] }))}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {teamFormData.expert.map((id) => {
                    const user = allUsers?.find((u) => u.user_id === id);
                    if (!user) return null;
                    return (
                      <div
                        key={id}
                        className="flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-lg border border-green-200"
                      >
                        <User className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          {user.name || user.username || user.email}
                        </span>
                        <button
                          onClick={() => removeUser(id)}
                          className="ml-2 hover:bg-green-200 rounded p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}