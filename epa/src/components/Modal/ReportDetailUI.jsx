import {
  User,
  Users,
  MapPin,
  X,
  Check,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import React, { useEffect, useState, useRef } from "react";
import caseService from "../../services/case.service.js";
import complaintService from "../../services/complaint.service.js";
import reportService from "../../services/report.service.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/TeamAssignementModal.jsx";
import userService from "../../services/user.service.js";
import RegionalWorkFlow from "../../services/regionalWorkflow.service.js";

import { Eye, Trash2 } from "lucide-react";
import sample_trash from "../../assets/sample_trash.jpeg";
import FilterTab from "../../components/Form/FilterTab.jsx";
import VoicePlayer from "../../components/VoicePlayer/VoicePlayer.jsx";
import WoredaExpertAssignModal from "../../components/Modal/WoredaExpertAssignModal.jsx";
import { resumeAndPrerender } from "react-dom/static";
export default function ReportDetailUI({
  detail,
  isRegional = false,
  isEditing,
  setIsEditing,
  reportTypes,
  handlingUnit,
  setCaseAttachment,
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
  caseAttachment,
  cities,
  zones,
  subcities,
  filteredWoredas,
  formData,
  handleChange,
  loadData,
  loadExpertData,
}) {
  if (!detail) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [timeLeft, setTimeLeft] = useState(detail?.case?.remaining_days);
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [activity, setActivity] = useState("");
  const [isFinal, setIsFinal] = useState(
    detail?.case?.case_investigation?.[0]?.status === "final" || false
  );
  const [selectedReportType, setSelectedReportType] = useState("");
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    department: "",
    expert: [],
    description: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scale, setScale] = useState(1);

  const closeModal = () => {
    setIsExpanded(false);
    setTimeout(() => setScale(1), 200);
  };

  useEffect(() => {
    if (!detail?.case?.remaining_days) return;

    const endDate = new Date(detail.case.remaining_days.endDate);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeLeft({ ...timeLeft, isExpired: true });
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        daysLeft: days,
        hoursLeft: hours,
        minutesLeft: minutes,
        secondsLeft: seconds,
        isExpired: false,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [detail?.case?.remaining_days]);
  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.5, 1));
  };

  // Download handler
  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = currentMedia;
    // Suggest a filename for the download
    link.download = `report-image-${currentMediaIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }; // Mock media data - replace with actual data from your API

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentMediaIndex < currentMediaList.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
      setScale(1); // Reset zoom
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
      setScale(1); // Reset zoom
    }
  };

  useEffect(() => {
    if (!isExpanded) return;

    const handleKey = (e) => {
      if (e.key === "ArrowRight") handleNext(e);
      if (e.key === "ArrowLeft") handlePrev(e);
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isExpanded, currentMediaIndex]);

  const [mediaFiles, setMediaFiles] = useState({
    image: [
      "/report image.jpg",
      "/sample_trash.jpg",
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800",
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w-800",
    ],
    video: [
      "/sample-video.mp4",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    ],
    voice: [
      "/sample-audio.mp3",
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    ],
  });
  const mediaFilters = [
    { key: "image", label: "Image" },
    { key: "video", label: "Video" },
    { key: "voice", label: "Voice" },
  ];
  // Data
  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  // Search & Dropdown States
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [assigmentType, setAssigmentType] = useState("");
  const userInputRef = useRef(null);
  const userContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        userContainerRef.current &&
        !userContainerRef.current.contains(e.target)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nextMedia = () => {
    const mediaList = mediaFiles[mediaType] || [];
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === mediaList.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevMedia = () => {
    const mediaList = mediaFiles[mediaType] || [];
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === 0 ? mediaList.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [mediaType]);

  useEffect(() => {
    if (mediaType === "image" && mediaFiles.image.length > 1) {
      const interval = setInterval(() => {
        nextMedia();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mediaType, currentMediaIndex]);

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPermissions(decoded.permissions || []);
        console.log("decoded.permissions", decoded.permissions);
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
  const assignWoreda = async (type) => {
    const payload = {
      complaint_id: detail?.complaint_id,
      assign_to: type, 
    };

    console.log("payload", payload);

    try {
      const res = await RegionalWorkFlow.assignFromZone(payload);
       setToast({
        open: true,
        message: "Report Assigned successfully!",
        type: "success",
      });
      loadData?.();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };
  const handleModalConfirm = async ({
    organization_hierarchy_id,
    expert_id,
  }) => {
    if (!modalMode) return;
    const { complaint_id, type } = modalMode;
    try {
      if (type === "zone") {
        await regionalWorkflowService.assignFromRegion({
          complaint_id,
          organization_hierarchy_id,
          assign_to: "zone",
        });
        showToast("success", "Assigned to Zone Admin");
      } else if (type === "expert") {
        await regionalWorkflowService.assignFromRegion({
          complaint_id,
          organization_hierarchy_id,
          assign_to: "expert",
          expert_id,
        });
        showToast("success", "Assigned to Regional Expert");
      }
      setModalMode(null);
      fetchComplaints();
    } catch (err) {
      showToast("error", "Assignment failed");
    }
  };

  const filteredDepartments = departments
    .filter((d) =>
      d.name?.toLowerCase().includes(departmentSearch.toLowerCase())
    )
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

    available = available.filter(
      (user) => !teamFormData.expert.includes(user.id)
    );

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
  const [experts, setExperts] = useState([]);
  const backendUrl = "http://196.188.240.103:4032/";
  const getExperts = async () => {
    try {
      const res = await reportService.getExpertsByHierarchyId();
      setExperts(res);
    } catch {
      setToast({
        open: true,
        message: "Error fetching experts",
        type: "error",
      });
    }
  };
  useEffect(() => {
    getExperts();
  }, []);

  const filteredCategories =
    pollutionCategories?.filter((cat) =>
      cat.pollution_category
        .toLowerCase()
        .includes(categorySearch.toLowerCase())
    ) || [];
  const filteredSubcategories = subPollutionCategories?.filter((sub) =>
    sub.sub_pollution_category
      .toLowerCase()
      .includes(subcategorySearch.toLowerCase())
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
    (s.name || s.subcity_name)
      .toLowerCase()
      .includes(subcitySearch.toLowerCase())
  );
  const filteredWoredasForSearch = filteredWoredas?.filter((w) =>
    w.woreda_name.toLowerCase().includes(woredaSearch.toLowerCase())
  );
  // Sync location searches
  useEffect(() => {
    const cat = pollutionCategories?.find(
      (c) => c.pollution_category_id === formData?.pollution_category_id
    );
    setCategorySearch(cat ? cat.pollution_category : "");
  }, [formData?.pollution_category_id, pollutionCategories]);

  useEffect(() => {
    const sub = subPollutionCategories?.find(
      (s) => s.sub_pollution_category_id === formData?.sub_pollution_category_id
    );
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
    const subcit = subcities?.find(
      (s) => s.subcity_id === formData?.subcity_id
    );
    setSubcitySearch(subcit ? subcit.name || subcit.subcity_name : "");
  }, [formData?.subcity_id, subcities]);

  useEffect(() => {
    const wor = filteredWoredas?.find(
      (w) => w.woreda_id === formData?.woreda_id
    );
    setWoredaSearch(wor ? wor.woreda_name : "");
  }, [formData?.woreda_id, filteredWoredas]);

  const statusSteps = [
    "submitted",
    "under review",
    "verified",
    "under_investigation",
    "investigation_submitted",
    "authorized",
    "closed",
  ];
  const currentStatusIndex = statusSteps.indexOf(
    detail.status?.toLowerCase() || "submitted"
  );
  const isRegionMode = !!formData?.region_id;
  const isCityMode = !!formData?.city_id;

  const handleSend = async () => {
    if (files.length === 0)
      return setToast({
        open: true,
        type: "error",
        message: "Please attach at least one file.",
      });

    if (!activity.trim())
      return setToast({
        open: true,
        type: "error",
        message: "Please enter your activity.",
      });

    const reportData = { files, description: activity, isFinal };

    const result = await caseService.submitExpertReport(
      detail?.case?.case_id,
      reportData
    );

    if (result.success) {
      setToast({
        open: true,
        type: "success",
        message: "Report submitted successfully!",
      });

      if (isFinal) {
        return navigate(`/report-fill-form`, {
          state: {
            report_type_id:
              detail?.sub_pollution_category?.report_types?.report_type_id,
            case_id: detail?.case?.case_id,
          },
        });
      }

      setFiles([]);
      setActivity("");
      setIsFinal(false);
      await loadExpertData?.();
    } else {
      setToast({
        open: true,
        type: "error",
        message: "Failed to submit report.",
      });
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
      setToast({
        open: true,
        message: "Updated successfully!",
        type: "success",
      });
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

    const complaint_id = detail.complaint_id;
    const validUsers = teamFormData.expert.filter(
      (id) => id != null && id !== ""
    );

    if (!complaint_id) {
      setToast({
        open: true,
        type: "error",
        message: "complaint Id is missing. Please refresh and try again.",
      });
      return;
    }
    if (validUsers.length < 2) {
      setToast({
        open: true,
        type: "error",
        message: "Please select at least 2 team members to form a team.",
      });
      return;
    }

    if (validUsers.length === 0) {
      setToast({
        open: true,
        type: "error",
        message: "No valid team members selected.",
      });
      return;
    }
    const is_Team_Formation_needed = true;
    try {
      const result = await caseService.createTeam(
        complaint_id,
        handlingUnit,
        is_Team_Formation_needed,
        validUsers,
        currentUserId
      );

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
  console.log("detail?.case?.case_investigation?.[0]?.status", detail?.case);
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
    } catch (err){
      setToast({
        open: true,
        message: "Assignment failed",
        type: "error",
      });
      
      setIsModalOpen(false);
      loadData?.();
    }
  };
  const [expandedIndex, setExpandedIndex] = useState(null);

  const truncateWords = (text, limit = 8) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return { preview: text, isTruncated: false };

    return {
      preview: words.slice(0, limit).join(" "),
      isTruncated: true,
    };
  };
  console.log("detail?.case?.status", detail?.case?.status);
  console.log("permissions", permissions);
  const canUpload =
    ([
      "under_investigation",
      "assigned_to_expert",
    ].includes(detail?.case?.status) &&
      permissions?.includes("expert:can-upload-investigation")) ||
    (detail?.case?.status === "teamCase" &&
      permissions?.includes("teamCase:read"));

  console.log("canUpload", canUpload);
  const handleClose = async () => {
    try {
      await reportService.closeComplaint(detail?.complaint_id);
      setToast({
        open: true,
        message: "Report closed successfully!",
        type: "success",
      });
      loadData?.();
    } catch {
      setToast({
        open: true,
        message: "Failed to close report",
        type: "error",
      });
    }
  };

  // Get current media list
  const currentMediaList = mediaFiles[mediaType] || [];
  const currentMedia = currentMediaList[currentMediaIndex];
  console.log(
    "detail?.sub_pollution_category?.rep",
    detail?.sub_pollution_category?.report_types?.report_type_id
  );
  console.log("detail?.case?.status", detail?.case?.status);
  console.log("detail.status", detail.status);
  return (
    <>
      <div className="flex justify-between items-center  px-6 ">
        <h1 className="text-3xl font-bold text-slate-800">Report Details</h1>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
           
            {permissions.includes("woreda:can-assign") &&
              detail.status?.toLowerCase() === "verified" &&
              detail?.case?.status === "assigned_to_woreda" && (
                <>
                  <button
                    onClick={() => {
                      setAssigmentType("expert");
                      setIsAssignModalOpen(true);
                    }}
                    className="bg-[#387E53] hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    Assign to Expert
                  </button>
                </>
              )}
            {permissions.includes("expert:can-upload-investigation") &&
              timeLeft &&
              detail?.case?.status !== "investigation_submitted" && (
                <div className="mt-4 flex flex-col border rounded-2xl p-4 items-start">
                  {!timeLeft.isExpired ? (
                    <>
                      <div className="flex gap-3">
                        <span className="text-base font-medium text-gray-700 mt-3">
                          Time left for investigation
                        </span>
                        {[
                          { value: timeLeft.daysLeft, label: "Days" },
                          { value: timeLeft.hoursLeft, label: "Hours" },
                          { value: timeLeft.minutesLeft, label: "Minutes" },
                          { value: timeLeft.secondsLeft, label: "Seconds" },
                        ].map((unit, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-center bg-gray-100 text-gray-800 px-3 py-2 rounded-lg shadow-sm min-w-[3rem]"
                          >
                            <span className="text-lg text-red-500 font-semibold">
                              {unit.value}
                            </span>
                            <span className="text-xs uppercase tracking-wide">
                              {unit.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-red-600 font-semibold text-sm">
                      Investigation period has expired
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <div className="min-h-screen ">
        <div className=" mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-6">
            <div className="lg:col-span-3 space-y-8">
              <div
                className="min-h-screen py-6 rounded-3xl"
                style={{ backgroundColor: "#EEEFF6" }}
              >
                <div className="max-w-7xl mx-auto px-6 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-[#1e293b]">
                        Report ID
                      </h2>
                      <span className="bg-[#387E53] text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-sm">
                        {detail.complaint_code || `${detail.report_id}`}
                      </span>
                    </div>

                    <div className="px-5 py-1.5 rounded-full border border-yellow-500 bg-orange-50 text-slate-800 font-bold capitalize">
                      {detail.status.replace("_", " ") || "Pending..."}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg p-4">
                    <div className="relative mt-2">
                      <div className="absolute top-[14px] bg-[#387E53] left-[6%] right-[6%] h-[2px] " />
                      <div
                        className=" "
                        style={{
                          width: `${
                            (currentStatusIndex / (statusSteps.length - 1)) *
                            100
                          }%`,
                        }}
                      />
                      <div className="flex justify-between relative">
                        {statusSteps.map((s, i) => {
                          const isActive = i <= currentStatusIndex;
                          return (
                            <div
                              key={s}
                              className="flex flex-col items-center w-24 text-center"
                            >
                              <div
                                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all 
                                  ${
                                    isActive
                                      ? "bg-[#387E53] border-[#387E53] text-white"
                                      : "bg-white border-gray-300"
                                  }`}
                              >
                                {isActive ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                )}
                              </div>
                              <span
                                className={`mt-1 text-xs font-medium capitalize 
                                  ${
                                    isActive
                                      ? "text-[#387E53]"
                                      : "text-gray-400"
                                  }`}
                              >
                                {s.replace("_", " ")}
                              </span>
                              {detail?.status_dates?.[s] && (
                                <span className="text-[10px] text-gray-500 mt-1">
                                  {new Date(
                                    detail.status_dates[s]
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Report Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ✅ LEFT: CUSTOMER INFORMATION */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <h2 className="px-6 pt-4 pb-2 text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Reporter Information
                      </h2>
                      <div>
                        {/* Full Name */}
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Full Name</span>
                          <span className="font-medium text-gray-900">
                            {detail.customer?.full_name || "Demeke Abera Siraj"}
                          </span>
                        </div>
                        <div className="mx-6 border-t border-gray-200"></div>
                        {/* Phone Number */}
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Phone Number</span>
                          <span className="font-medium text-gray-900">
                            {detail.customer?.phone_number || "0923282347"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ✅ RIGHT: LOCATION & DATE */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <h2 className="px-6 pt-4 pb-2 text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Address and Date
                      </h2>
                      <div>
                        {/* Location */}
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Location</span>
                           {detail.location_url?(
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
                          </a>):(
                            <p>
                              There is no location
                            </p>
                          )}
                        </div>
                        <div className="mx-6 border-t border-gray-200"></div>
                        {/* Reported Date */}
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Reported Date</span>
                          <span className="font-medium text-gray-900">
                            {new Date(detail.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Information - Now matching the style of Report Meta */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6">
                    <div className="flex justify-between items-center px-6 pt-4 pb-2">
                      <h2 className="text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Report Information
                      </h2>
                      {permissions.includes("taskForce:can-verify-complaint") &&
                        detail.status?.toLowerCase() === "under review" && (
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            {isEditing ? "Cancel" : "Edit"}
                          </button>
                        )}
                    </div>

                    <div>
                      {/* Category */}
                      <div className="flex justify-between items-center px-6 py-3 text-sm">
                        <span className="text-gray-600">Main Category</span>
                        {isEditing ? (
                          <div className="relative w-64">
                            <input
                              type="text"
                              placeholder="Select Category"
                              value={categorySearch}
                              onChange={(e) =>
                                setCategorySearch(e.target.value)
                              }
                              onFocus={() => setShowCategoryDropdown(true)}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowCategoryDropdown(false),
                                  200
                                )
                              }
                              className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            {showCategoryDropdown && (
                              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                {filteredCategories.map((cat) => (
                                  <div
                                    key={cat.pollution_category_id}
                                    onClick={() => {
                                      handleChange(
                                        "pollution_category_id",
                                        cat.pollution_category_id
                                      );
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
                          <span className="font-medium text-gray-900">
                            {detail.pollution_category?.pollution_category ||
                              "—"}
                          </span>
                        )}
                      </div>
                      <div className="mx-6 border-t border-gray-200"></div>

                      {/* Subcategory */}
                      <div className="flex justify-between items-center px-6 py-3 text-sm">
                        <span className="text-gray-600">Subcategory</span>
                        {isEditing ? (
                          <div className="relative w-64">
                            <input
                              type="text"
                              placeholder="Select Subcategory"
                              value={subcategorySearch}
                              onChange={(e) =>
                                setSubcategorySearch(e.target.value)
                              }
                              onFocus={() => setShowSubcategoryDropdown(true)}
                              onBlur={() =>
                                setTimeout(
                                  () => setShowSubcategoryDropdown(false),
                                  200
                                )
                              }
                              className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              disabled={!formData?.pollution_category_id}
                            />
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            {showSubcategoryDropdown &&
                              formData?.pollution_category_id && (
                                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                  {filteredSubcategories.map((sub) => (
                                    <div
                                      key={sub.sub_pollution_category_id}
                                      onClick={() => {
                                        handleChange(
                                          "sub_pollution_category_id",
                                          sub.sub_pollution_category_id
                                        );
                                        setSubcategorySearch(
                                          sub.sub_pollution_category
                                        );
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
                          <span className="font-medium text-gray-900">
                            {detail.sub_pollution_category
                              ?.sub_pollution_category || "—"}
                          </span>
                        )}
                      </div>
                      <div className="mx-6 border-t border-gray-200"></div>
                      <div className="px-6 py-3 text-sm">
                        {isEditing ? (
                          // Keep dropdowns exactly as original
                          <>
                            <span className="text-gray-600 font-medium">
                              Region/City Adminstration
                            </span>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              <div className="relative w-64">
                                <input
                                  type="text"
                                  placeholder="Select Region"
                                  value={regionSearch}
                                  onChange={(e) =>
                                    setRegionSearch(e.target.value)
                                  }
                                  onFocus={() => setShowRegionDropdown(true)}
                                  onBlur={() =>
                                    setTimeout(
                                      () => setShowRegionDropdown(false),
                                      200
                                    )
                                  }
                                  className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                {showRegionDropdown && (
                                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {filteredRegions.map((r) => (
                                      <div
                                        key={r.region_id}
                                        onClick={() => {
                                          handleChange(
                                            "region_id",
                                            r.region_id
                                          );
                                          setRegionSearch(
                                            `${r.region_name} (Region)`
                                          );
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
                                  onChange={(e) =>
                                    setCitySearch(e.target.value)
                                  }
                                  onFocus={() => setShowCityDropdown(true)}
                                  onBlur={() =>
                                    setTimeout(
                                      () => setShowCityDropdown(false),
                                      200
                                    )
                                  }
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
                                          setCitySearch(
                                            `${c.city_name} (City)`
                                          );
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
                          </>
                        ) : (
                          // Read-only view: label on left, value on right
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-gray-600 font-medium">
                              Region/City Adminstration
                            </span>
                            <div className="text-gray-900 font-medium">
                              {detail.region?.region_name && (
                                <>Region: {detail.region.region_name} </>
                              )}
                              {detail.city?.city_name && (
                                <>City: {detail.city.city_name}</>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mx-6 border-t border-gray-200"></div>

                      {/* Zone (if region mode) */}
                      {isRegionMode && (
                        <>
                          <div className="flex justify-between items-center px-6 py-3 text-sm">
                            <span className="text-gray-600">Zone</span>
                            {isEditing ? (
                              <div className="relative w-64">
                                <input
                                  type="text"
                                  placeholder="Select Zone"
                                  value={zoneSearch}
                                  onChange={(e) =>
                                    setZoneSearch(e.target.value)
                                  }
                                  onFocus={() => setShowZoneDropdown(true)}
                                  onBlur={() =>
                                    setTimeout(
                                      () => setShowZoneDropdown(false),
                                      200
                                    )
                                  }
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
                              <span className="font-medium text-gray-900">
                                {detail.zone?.zone_name || "—"}
                              </span>
                            )}
                          </div>
                          <div className="mx-6 border-t border-gray-200"></div>
                        </>
                      )}

                      {/* Subcity (if city mode) */}
                      {isCityMode && (
                        <>
                          <div className="flex justify-between items-center px-6 py-3 text-sm">
                            <span className="text-gray-600">Subcity</span>
                            {isEditing ? (
                              <div className="relative w-64">
                                <input
                                  type="text"
                                  placeholder="Select Subcity"
                                  value={subcitySearch}
                                  onChange={(e) =>
                                    setSubcitySearch(e.target.value)
                                  }
                                  onFocus={() => setShowSubcityDropdown(true)}
                                  onBlur={() =>
                                    setTimeout(
                                      () => setShowSubcityDropdown(false),
                                      200
                                    )
                                  }
                                  className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                {showSubcityDropdown && (
                                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {filteredSubcities.map((s) => (
                                      <div
                                        key={s.subcity_id}
                                        onClick={() => {
                                          handleChange(
                                            "subcity_id",
                                            s.subcity_id
                                          );
                                          setSubcitySearch(
                                            s.name || s.subcity_name
                                          );
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
                              <span className="font-medium text-gray-900">
                                {detail.subcity?.subcity_name || "—"}
                              </span>
                            )}
                          </div>
                          <div className="mx-6 border-t border-gray-200"></div>
                        </>
                      )}

                      {/* Woreda */}
                      {(isRegionMode || isCityMode) && (
                        <>
                          <div className="flex justify-between items-center px-6 py-3 text-sm">
                            <span className="text-gray-600">Woreda</span>
                            {isEditing ? (
                              <div className="relative w-64">
                                <input
                                  type="text"
                                  placeholder={
                                    formData?.zone_id || formData?.subcity_id
                                      ? "Select Woreda"
                                      : "Select Zone/Subcity first"
                                  }
                                  value={woredaSearch}
                                  onChange={(e) =>
                                    setWoredaSearch(e.target.value)
                                  }
                                  onFocus={() => setShowWoredaDropdown(true)}
                                  onBlur={() =>
                                    setTimeout(
                                      () => setShowWoredaDropdown(false),
                                      200
                                    )
                                  }
                                  className="border rounded-lg pl-10 pr-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                  disabled={
                                    !formData?.zone_id && !formData?.subcity_id
                                  }
                                />
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                {showWoredaDropdown &&
                                  (formData?.zone_id ||
                                    formData?.subcity_id) && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                      {filteredWoredasForSearch.map((w) => (
                                        <div
                                          key={w.woreda_id}
                                          onClick={() => {
                                            handleChange(
                                              "woreda_id",
                                              w.woreda_id
                                            );
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
                              <span className="font-medium text-gray-900">
                                {detail.woreda?.woreda_name || "—"}
                              </span>
                            )}
                          </div>
                          <div className="mx-6 border-t border-gray-200"></div>
                        </>
                      )}

                      {/* Description */}
                      <div className="px-6 py-3 text-sm">
                        <span className="text-gray-600 block mb-2">
                          Description
                        </span>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700">
                            {detail.detail || "No description"}
                          </p>
                        </div>
                      </div>
                      {canUpload && (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          {detail?.case?.case_investigation[0]?.status !==
                            "final" && (
                            <div>
                              <h2 className="text-xl font-semibold mb-2">
                                File Attachment
                              </h2>
                              <div
                                className="w-full h-25 rounded-xl border-2 border-dashed border-gray-300 bg-blue-50 flex items-center p-6 cursor-pointer"
                                onClick={() =>
                                  document
                                    .getElementById("expert-file-upload")
                                    .click()
                                }
                              >
                                <input
                                  id="expert-file-upload"
                                  type="file"
                                  multiple
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={(e) =>
                                    setFiles(Array.from(e.target.files))
                                  }
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
                                      ? files
                                          .map((file) => file.name)
                                          .join(", ")
                                      : "Add Attachment"}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    (PDF, JPG, PNG)
                                  </p>
                                </div>
                              </div>

                              <div className="border-b my-6"></div>

                              <h2 className="text-xl font-semibold mb-2">
                                Activity Description
                              </h2>
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

                          {isFinal &&
                            detail?.case?.case_investigation?.[0]?.status ===
                              "final" && (
                              <button
                                className="px-6 py-2 bg-[#387E53] text-white rounded-xl"
                                onClick={() => {
                                  navigate(`/report-fill-form`, {
                                    state: {
                                      report_type_id:
                                        detail?.sub_pollution_category
                                          ?.report_types?.report_type_id,
                                      case_id: detail.case?.case_id,
                                    },
                                  });
                                }}
                              >
                                Fill Form
                              </button>
                            )}
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                          >
                            Save Changes 
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div className="lg:col-span-2">
                <div className="rounded-2xl p-4 border border-gray-300">
                  <h2 className="text-xl font-semibold text-[#1A3D7D] mb-3">
                    Reported File ({currentMediaList.length})
                  </h2>

                  <div className="mb-3">
                    <FilterTab
                      options={mediaFilters}
                      value={mediaType}
                      onChange={setMediaType}
                    />
                  </div>

                  {/* Media Carousel */}
                  <div className="relative w-full rounded-xl overflow-hidden bg-[#FFFFFF] border border-gray-200">
                    {currentMediaList.length > 1 && (
                      <>
                        <button
                          onClick={prevMedia}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 text-[#387E53]" />
                        </button>

                        <button
                          onClick={nextMedia}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                        >
                          <ChevronRight className="w-5 h-5 text-[#387E53]" />
                        </button>
                      </>
                    )}

                    <div className="w-full h-64 flex items-center justify-center overflow-hidden">
                      {mediaType === "image" && currentMedia && (
                        <>
                          <img
                            src={currentMedia}
                            alt={`Report image ${currentMediaIndex + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setIsExpanded(true)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/report image.jpg";
                            }}
                          />

                          {/* ================= EXPANDED MODAL VIEW ================= */}
                          {isExpanded && (
                            <div
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 backdrop-blur-sm p-4"
                              onClick={closeModal}
                            >
                              {/* --- CONTROL TOOLBAR (Top Right) --- */}
                              <div
                                className="absolute top-4 right-4 flex items-center gap-2 z-10 p-2 bg-black bg-opacity-50 rounded-lg text-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Zoom Out */}
                                <button
                                  onClick={handleZoomOut}
                                  className={`p-2 hover:bg-white/20 rounded-full transition ${
                                    scale === 1
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  disabled={scale === 1}
                                  title="Zoom Out"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19.5 12h-15"
                                    />
                                  </svg>
                                </button>

                                {/* Zoom In */}
                                <button
                                  onClick={handleZoomIn}
                                  className={`p-2 hover:bg-white/20 rounded-full transition ${
                                    scale === 3
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  disabled={scale === 3}
                                  title="Zoom In"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 4.5v15m7.5-7.5h-15"
                                    />
                                  </svg>
                                </button>

                                {/* Download */}
                                <button
                                  onClick={handleDownload}
                                  className="p-2 hover:bg-white/20 rounded-full transition border-l border-white/30 ml-2 pl-4"
                                  title="Download Image"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M12 12.75l-4.5-4.5M12 12.75l4.5-4.5M12 3v9.75"
                                    />
                                  </svg>
                                </button>

                                {/* Close */}
                                <button
                                  onClick={closeModal}
                                  className="p-2 hover:bg-red-500/50 rounded-full transition ml-2"
                                  title="Close"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className="w-6 h-6"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>

                              {/* ======= NEXT & PREVIOUS BUTTONS ======= */}
                              <button
                                onClick={handlePrev}
                                disabled={currentMediaIndex === 0}
                                className={`absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white 
                      hover:bg-black/60 transition z-10 ${
                        currentMediaIndex === 0
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }`}
                              >
                                {/* Prev Icon */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2.5}
                                  stroke="currentColor"
                                  className="w-7 h-7"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19l-7-7 7-7"
                                  />
                                </svg>
                              </button>

                              <button
                                onClick={handleNext}
                                disabled={
                                  currentMediaIndex ===
                                  currentMediaList.length - 1
                                }
                                className={`absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/40 text-white 
                      hover:bg-black/60 transition z-10 ${
                        currentMediaIndex === currentMediaList.length - 1
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }`}
                              >
                                {/* Next Icon */}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2.5}
                                  stroke="currentColor"
                                  className="w-7 h-7"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </button>

                              {/* --- EXPANDED IMAGE CONTAINER --- */}
                              <div className="w-full h-full flex items-center justify-center overflow-hidden relative">
                                <img
                                  src={currentMedia}
                                  alt="Expanded view"
                                  style={{
                                    transform: `scale(${scale})`,
                                    cursor: scale > 1 ? "grab" : "default",
                                  }}
                                  className="max-w-full max-h-full object-contain transition-transform duration-300 ease-in-out"
                                  onClick={(e) => e.stopPropagation()}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/report image.jpg";
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {mediaType === "video" && currentMedia && (
                        <video
                          key={currentMedia}
                          src={currentMedia}
                          controls
                          className="w-full h-full object-contain bg-black"
                        />
                      )}

                      {mediaType === "voice" && currentMedia && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6">
                          <VoicePlayer src={currentMedia} />
                          <p className="mt-4 text-sm text-gray-600">
                            Audio {currentMediaIndex + 1} of{" "}
                            {currentMediaList.length}
                          </p>
                        </div>
                      )}

                      {(!currentMedia || currentMediaList.length === 0) && (
                        <div className="text-gray-500 text-center p-4">
                          <p>No media available for {mediaType}</p>
                        </div>
                      )}
                    </div>

                    {/* Indicators/Dots */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                      {currentMediaList.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentMediaIndex
                              ? "bg-[#387E53] w-6"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Counter */}
                    {currentMediaList.length > 1 && (
                      <div className="absolute top-3 right-3 bg-[#387E53]/90 text-white text-xs px-2 py-1 rounded">
                        {currentMediaIndex + 1} / {currentMediaList.length}
                      </div>
                    )}
                  </div>

                  {/* Media Thumbnails (for images only) */}
                  {mediaType === "image" && currentMediaList.length > 1 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                      {currentMediaList.map((media, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentMediaIndex
                              ? "border-[#387E53] ring-2 ring-[#387E53]/30"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={media}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/report image.jpg";
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {caseAttachment && caseAttachment.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Case Attachments Timeline
                  </h3>

                  <div className="relative border-l-4 border-green-200 pl-8 space-y-6 h-[240px] overflow-y-auto">
                    {caseAttachment
                      ?.slice()
                      .sort(
                        (a, b) =>
                          new Date(a.created_at) - new Date(b.created_at)
                      )
                      .map((attachment, index) => {
                        const { preview, isTruncated } = truncateWords(
                          attachment.description || "",
                          8
                        );

                        const isExpanded = expandedIndex === index;

                        // Determine the type based on file extension
                        const fileExt = (
                          attachment.file_name || attachment.file_path
                        )
                          .split(".")
                          .pop()
                          .toLowerCase();

                        const imageExt = [
                          "jpg",
                          "jpeg",
                          "png",
                          "gif",
                          "bmp",
                          "webp",
                        ];
                        const videoExt = ["mp4", "avi", "mov", "wmv", "mkv"];
                        const audioExt = ["mp3", "wav", "aac", "m4a", "ogg"];
                        const documentExt = [
                          "pdf",
                          "doc",
                          "docx",
                          "xls",
                          "xlsx",
                          "ppt",
                          "pptx",
                        ];

                        let type = "unknown";
                        if (imageExt.includes(fileExt)) type = "image";
                        else if (videoExt.includes(fileExt)) type = "video";
                        else if (audioExt.includes(fileExt)) type = "audio";
                        else if (documentExt.includes(fileExt))
                          type = "document";

                        return (
                          <div key={index} className="relative group">
                            {/* Step Number */}
                            <div className="absolute -left-5 top-3">
                              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white border-2 border-green-500 text-green-600 font-bold shadow-md">
                                {index + 1}
                              </div>
                            </div>

                            {/* Card */}
                            <div className="flex justify-between items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                              {/* Left: Content */}
                              <div className="flex-1 pr-4">
                                <a
                                  href={attachment.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-md font-semibold text-gray-800 hover:underline"
                                >
                                  Case Attachment {index + 1}{" "}
                                  <span className="text-green-600">
                                    ({type})
                                  </span>
                                </a>

                                {attachment.description && (
                                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    {isExpanded
                                      ? attachment.description
                                      : preview}
                                    {isTruncated && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setExpandedIndex(
                                            isExpanded ? null : index
                                          )
                                        }
                                        className="text-green-600 ml-2 font-medium hover:underline"
                                      >
                                        {isExpanded ? "Show less" : "Show more"}
                                      </button>
                                    )}
                                  </p>
                                )}

                                {attachment.created_at && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Created at:{" "}
                                    {new Date(
                                      attachment.created_at
                                    ).toLocaleString()}
                                  </p>
                                )}

                                {attachment.isFinal && (
                                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Final Submission
                                  </span>
                                )}
                              </div>

                              {/* Right: Icons */}
                              <div className="flex gap-3">
                                <Eye
                                  className="w-5 h-5 text-green-600 cursor-pointer hover:scale-110 transition-transform"
                                  onClick={() =>
                                    setSelectedAttachment(attachment)
                                  }
                                  title="View"
                                />
                                {detail?.case?.case_investigation?.[0]
                                  ?.status !== "final" && (
                                  <Trash2
                                    className="w-5 h-5 text-red-600 cursor-pointer hover:scale-110 transition-transform"
                                    onClick={() =>
                                      setAttachmentToDelete(attachment)
                                    }
                                    title="Delete"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {permissions.includes("taskForce:can-verify-complaint") ||
                (permissions.includes("taskForce:can-verify-complaint") &&
                  attachmentToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
                      <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-lg">
                        <button
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                          onClick={() => setAttachmentToDelete(null)}
                        >
                          <X className="w-6 h-6" />
                        </button>

                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          Confirm Deletion
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to delete{" "}
                          <span className="font-medium">
                            {attachmentToDelete?.description ||
                              "this attachment"}
                          </span>
                          ?
                        </p>

                        <div className="flex justify-end gap-3">
                          <button
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            onClick={() => setAttachmentToDelete(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            onClick={async () => {
                              try {
                                await caseService.deleteAttachment(
                                  attachmentToDelete.case_attachement_id
                                );
                                setCaseAttachment((prev) =>
                                  prev.filter(
                                    (att) =>
                                      att.case_attachement_id !==
                                      attachmentToDelete.case_attachement_id
                                  )
                                );
                                setAttachmentToDelete(null);
                              } catch (error) {
                                console.error(
                                  "Error deleting attachment:",
                                  error
                                );
                                alert(
                                  "Failed to delete attachment. Please try again."
                                );
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

              {selectedAttachment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                  <div className="bg-white relative w-[50vw] h-[70vh] rounded-lg overflow-hidden flex items-center justify-center">
                    <button
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 z-10"
                      onClick={() => setSelectedAttachment(null)}
                    >
                      <X className="w-6 h-6" />
                    </button>

                    {selectedAttachment.file_path.endsWith(".pdf") ? (
                      <iframe
                        src={sample_trash}
                        className="w-full h-full"
                        title="Attachment Preview"
                      />
                    ) : (
                      <img
                        src={sample_trash}
                        alt="Attachment Preview"
                        className="p-10 w-full h-full object-cover object-center"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isRegional && isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Assign Handling Unit</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "hq_expert", icon: User, label: "Head Quarter Experts" },
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
                  className={`p-6 rounded-xl border-2 transition-all ${
                    handlingUnit === value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Investigation Days
              </label>
              <input
                type="number"
                min="1"
                className="w-full border rounded-lg px-4 py-3"
                value={investigationDays}
                onChange={(e) => setInvestigationDays(e.target.value)}
                placeholder="e.g. 7"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleVerifyAndAssign}
                className="w-[120px] bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {!isRegional && (
        <Modal
          open={isAssignTeamModalOpen}
          onClose={() => {
            setIsAssignTeamModalOpen(false);
            setTeamFormData({ department: "", expert: [], description: "" });
            setSubmitAttempted(false);
            setUserSearch("");
          }}
          title="Assign Team"
          description="Select users to form a team"
          width="w-full max-w-2xl"
          height="h-[40vh]"
          // className="!h-auto overflow-visible"
          actions={
            <>
              <button
                onClick={() => {
                  setIsAssignTeamModalOpen(false);
                  setTeamFormData({
                    department: "",
                    expert: [],
                    description: "",
                  });
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
          <div className="space-y-6 overflow-visible">
            <div ref={userContainerRef}>
              {/* Label */}
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Team Members
              </label>

              {/* User search input */}
              <div className="relative w-full">
                <input
                  ref={userInputRef}
                  type="text"
                  placeholder="Search users by name, username, or email"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onFocus={() => setShowUserDropdown(true)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500"
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                {showUserDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
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
                                  <div className="text-xs text-gray-500">
                                    {user.email}
                                  </div>
                                )}
                              </div>
                            </div>
                            <span className="text-green-600 text-sm font-medium">
                              Add →
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
                      onClick={() =>
                        setTeamFormData((prev) => ({ ...prev, expert: [] }))
                      }
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
      )}
      {isAssignModalOpen && (
        <>
          < WoredaExpertAssignModal
            open={isAssignModalOpen}
            complaint_id={detail.complaint_id}
            experts={experts}
            loadData={loadData}
            title={
              assigmentType === "expert" ? "expert" : "Assign to Organization"
            }
            onClose={() => setIsAssignModalOpen(false)}
            onConfirm={handleModalConfirm}
          />
        </>
      )}
    </>
  );
}
