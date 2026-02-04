import {
  User,
  Users,
  MapPin,
  X,
  Check,
  Search,
  FileUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import React, { useEffect, useState, useRef } from "react";
import { Eye, Trash2 } from "lucide-react";
import caseService from "../../services/case.service.js";
import complaintService from "../../services/complaint.service.js";
import feedbackService from "../../services/feedback.service.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal.jsx";
import userService from "../../services/user.service.js";
import { QRCodeSVG } from "qrcode.react";
import sample_trash from "../../assets/sample_trash.jpeg";
import FilterTab from "../../components/Form/FilterTab.jsx";
import VoicePlayer from "../../components/VoicePlayer/VoicePlayer.jsx";
import ExpertAssignModal from "../../components/Modal/ExpertAssignModal.jsx"
export default function DeskHeadReportDetailUI({
  detail,
  isEditing,
  setIsEditing,
  reportTypes,
  handlingUnit,
  setHandlingUnit,
  setCaseAttachment,
  caseAttachment,
  isModalOpen,
  setIsModalOpen,
  investigationDays,
  setInvestigationDays,
  qrCodeData,
  qrCodeRef,
  canShowQRCode,
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
  loadExpertData,
}) {
  if (!detail) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }

  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [activity, setActivity] = useState("");
  const [isFinal, setIsFinal] = useState(
    detail?.case?.case_investigation?.[0]?.status === "final" || false
  );
  const [selectedReportType, setSelectedReportType] = useState("");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

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

  const [mediaType, setMediaType] = useState("image");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Mock media data - replace with actual data from your API
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

  // Close dropdown on outside click
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

  // Handle carousel navigation
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

  // Update carousel when media type changes
  useEffect(() => {
    setCurrentMediaIndex(0);
  }, [mediaType]);

  // Auto-advance carousel for images
  useEffect(() => {
    if (mediaType === "image" && mediaFiles.image.length > 1) {
      const interval = setInterval(() => {
        nextMedia();
      }, 5000); // Change every 5 seconds
      return () => clearInterval(interval);
    }
  }, [mediaType, currentMediaIndex]);

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

  useEffect(() => {
    const fetchFeedback = async () => {
      if (detail?.complaint_id) {
        try {
          const feedbackRes = await feedbackService.getFeedbackByCase(detail.case.case_id);
          setFeedbackList(feedbackRes?.data?.feedbacks || []);
        } catch (error) {
          console.error("Failed to load feedback:", error);
        }
      }
    };
    fetchFeedback();
  }, [detail?.complaint_id]);

useEffect(() => {
  const fetchFeedback = async () => {
    if (detail?.case?.case_id) {
      try {
        const feedbackRes = await feedbackService.getFeedbackByCase(detail.case.case_id);
        // Update to handle different API response structures
        setFeedbackList(feedbackRes?.data?.feedbacks || feedbackRes?.feedbacks || feedbackRes?.data || feedbackRes || []);
      } catch (error) {
        console.error("Failed to load feedback:", error);
        setFeedbackList([]);
      }
    }
  };
  fetchFeedback();
}, [detail?.case?.case_id]); 
  // Filter departments
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
  const [selectedAttachment, setSelectedAttachment] = useState(null);

  // Feedback states
  const [feedback, setFeedback] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

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
  const [expandedIndex, setExpandedIndex] = useState(null);
const [experts, setExperts] = useState([]);

  const getExperts = async () => {
    try {
      const res = await caseService.getHQExperts();
      console.log("expertsresss", res)
      setExperts(res);
    } catch {

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

  const truncateWords = (text, limit = 8) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return { preview: text, isTruncated: false };

    return {
      preview: words.slice(0, limit).join(" "),
      isTruncated: true,
    };
  };

  
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
      setFiles([]);
      setActivity("");
      setIsFinal(detail?.case?.case_investigation?.[0]?.status === "final");
      loadExpertData?.();
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

    if (validUsers.length === 0) {
      setToast({
        open: true,
        type: "error",
        message: "No valid team members selected.",
      });
      return;
    }

    try {
      const result = await caseService.createTeam(
        complaint_id,
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

  const currentMediaList = mediaFiles[mediaType] || [];
  const currentMedia = currentMediaList[currentMediaIndex];
  
  return (
    <>
      <div className="flex justify-between items-center ">
        <div className="flex gap-4">
         
          {detail.status?.toLowerCase() === "verified" &&(
           < button
                    onClick={() => {
                      setIsAssignModalOpen(true);
                    }}
                    className="bg-[#387E53] hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    Assign to Expert
                  </button>
          )}
            
        </div>
      </div>

      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <div className="min-h-screen ">
        <div className="mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-6">
            <div className="lg:col-span-3 space-y-8">
              {/* Gray background container */}
              <div
                className="min-h-screen py-2 rounded-3xl"
                style={{ backgroundColor: "#EEEFF6" }}
              >
                <div className="max-w-7xl max-h-4xl overflow-auto mx-auto px-6 space-y-2">
                  {/* NEW HEADER SECTION: Report ID and Status Pill */}

                  <div className="flex justify-between items-center">
                    {/* Left: Report ID Label and Badge */}
                    <div className="flex items-center gap-3">
                      <h2
                        className="text-2xl font-bold"
                        style={{ color: "#11255AE0" }}
                      >
                        Report ID
                      </h2>
                      <span className="bg-[#387E53] text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-sm">
                        {detail.complaint_code || `${detail.report_id}`}
                      </span>
                    </div>

                    {/* Right: Status Pill */}
                    <div className="px-5 py-1.5 rounded-full border border-yellow-500 bg-orange-50 text-slate-800 font-bold capitalize">
                      {detail.status || "Pending..."}
                    </div>
                  </div>

                  {/* Report Status Progress Bar */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="relative mt-2">
                      <div className="absolute top-[14px] bg-[#387E53] left-[6%] right-[6%] h-[2px]" />
                      <div
                        className=""
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT: CUSTOMER INFORMATION */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <h2 className="px-6 pt-4 pb-2 text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Information
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

                    {/* RIGHT: LOCATION & DATE */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <h2 className="px-6 pt-4 pb-2 text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Report Meta
                      </h2>
                      <div>
                        {/* Location */}
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Location</span>
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
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-12">
                    <div className="flex justify-between items-center px-6 pt-4 pb-2">
                      <h2 className="text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Report Information
                      </h2>
                      {permissions.includes("taskForce:can-verify-complaint") && (
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
                        <span className="text-gray-600">Category</span>
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

                      {/* Location Type */}
                      <div className="px-6 py-3 text-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Location Type</span>
                        </div>
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div className="relative">
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
                                        handleChange("region_id", r.region_id);
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
                                onChange={(e) => setCitySearch(e.target.value)}
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
                            {detail.region?.region_name && (
                              <div className="font-medium text-gray-900">
                                Region: {detail.region.region_name}
                              </div>
                            )}
                            {detail.city?.city_name && (
                              <div className="font-medium text-gray-900">
                                City: {detail.city.city_name}
                              </div>
                            )}
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
                              <div className="relative w-48">
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
                              <div className="relative w-48">
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
                              <div className="relative w-48">
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
                        <span className="text-gray-800 block mb-2 text-lg font-semibold">
                          Description
                        </span>

                        <div>
                          <p className="text-[#959595]">
                            {detail.detail || "No description"}
                          </p>
                        </div>
                        {canShowQRCode && (
                          <div className="flex flex-col items-end">
                            <div
                              ref={qrCodeRef}
                              className="bg-white p-4 rounded-lg border-2 border-green-500"
                            >
                              <QRCodeSVG
                                value={qrCodeData}
                                size={80}
                                level="H"
                                includeMargin={true}
                                fgColor="#1f2937"
                                bgColor="#ffffff"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
                  {/* Navigation Arrows */}
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

                  {/* Media Display */}
                  <div className="w-full h-64 flex items-center justify-center overflow-hidden">
                    {mediaType === "image" && currentMedia && (
                      <img
                        src={currentMedia}
                        alt={`Report image ${currentMediaIndex + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/report image.jpg"; // Fallback image
                        }}
                      />
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
                          Audio {currentMediaIndex + 1} of {currentMediaList.length}
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

              {/* Feedback Section */}

              {detail.status==="under_investigation"&&<div className="rounded-2xl p-4 border border-gray-300 mt-6">

                <h2 className="text-xl font-semibold text-[#1A3D7D] mb-3">
                  Feedback
                </h2>

                {detail.status !== "authorized" && detail.status !== "closed" && detail.status !== "returned" && (
                  <div className="space-y-4">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Enter your feedback here..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                      rows={4}
                    />

                    <button
                      onClick={async () => {
                        if (!feedback.trim()) {
                          setToast({
                            open: true,
                            type: "error",
                            message: "Please enter feedback before submitting.",
                          });
                          return;
                        }

                        setIsSubmittingFeedback(true);
                        try {
                          const result = await feedbackService.submitFeedback(detail?.case?.case_id, feedback.trim());
                          if (result) {
                            setToast({
                              open: true,
                              type: "success",
                              message: "Feedback created successfully!",
                            });
                            setFeedback("");
                            // Reload feedback list
                            const feedbackRes = await feedbackService.getFeedbackByCase(detail.case.case_id);
                            setFeedbackList(feedbackRes || []);
                          } else {
                            setToast({
                              open: true,
                              type: "error",
                              message: "Failed to submit feedback.",
                            });
                          }
                        } catch (error) {
                          console.error("Error submitting feedback:", error);
                          setToast({
                            open: true,
                            type: "error",
                            message: "Failed to submit feedback.",
                          });
                        } finally {
                          setIsSubmittingFeedback(false);
                        }
                      }}
                      disabled={isSubmittingFeedback}
                      className="bg-[#387E53] hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingFeedback ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                )}

                {/* Feedback List */}
                {feedbackList.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Previous Feedback ({feedbackList.length})
                    </h3>
                    <div className="space-y-3">
                      {feedbackList.map((item, index) => (
                        <div key={item.feedback_id || index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#387E53]">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#387E53] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {item.user?.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item.user?.name || 'Unknown User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.user?.email || ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.stamp_date ? new Date(item.stamp_date).toLocaleString() : new Date(item.created_at).toLocaleString()}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {item.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>}

          {caseAttachment && caseAttachment.length > 0 && (
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Case Attachments Timeline
              </h3>
          
              <div className="relative border-l-4 border-green-200 pl-8 space-y-6 max-h-[240px] overflow-y-auto">
                {caseAttachment
                  ?.slice()
                  .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                  .map((attachment, index) => {
                    const { preview, isTruncated } = truncateWords(
                      attachment.description || "",
                      8
                    );
          
                    const isExpanded = expandedIndex === index;
          
                    // Determine the type based on file extension
                    const fileExt = (attachment.file_name || attachment.file_path)
                      .split(".")
                      .pop()
                      .toLowerCase();
          
                    const imageExt = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
                    const videoExt = ["mp4", "avi", "mov", "wmv", "mkv"];
                    const audioExt = ["mp3", "wav", "aac", "m4a", "ogg"];
                    const documentExt = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"];
          
                    let type = "unknown";
                    if (imageExt.includes(fileExt)) type = "image";
                    else if (videoExt.includes(fileExt)) type = "video";
                    else if (audioExt.includes(fileExt)) type = "audio";
                    else if (documentExt.includes(fileExt)) type = "document";
          
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
                              Case Attachment {index + 1} <span className="text-green-600">({type})</span>
                            </a>
          
                            {attachment.description && (
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {isExpanded ? attachment.description : preview}
                                {isTruncated && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedIndex(isExpanded ? null : index)
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
                                Created at: {new Date(attachment.created_at).toLocaleString()}
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
                              onClick={() => setSelectedAttachment(attachment)}
                              title="View"
                            />
                            {detail?.case?.case_investigation?.[0]?.status !== "final" && (
                              <Trash2
                                className="w-5 h-5 text-red-600 cursor-pointer hover:scale-110 transition-transform"
                                onClick={() => setAttachmentToDelete(attachment)}
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
            </div>
          </div>
        </div>
      </div>

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
        {isAssignModalOpen && (
              <>
                < ExpertAssignModal
                  open={isAssignModalOpen}
                  complaint_id={detail.complaint_id}
                  loggedInUserHierarchy={loggedInUserHierarchy}
                  departments={departments}
                  experts={experts}
                  loadData={loadData}
                  title={"Assign to Expert"                  }
                  onClose={() => setIsAssignModalOpen(false)}
                  onConfirm={handleModalConfirm}
                />
              </>
            )}
    </>
  );
}