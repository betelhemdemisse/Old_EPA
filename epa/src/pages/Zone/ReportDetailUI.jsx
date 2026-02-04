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

import { Eye, Trash2 ,ArrowLeft} from "lucide-react";
import sample_trash from "../../assets/sample_trash.jpeg";
import FilterTab from "../../components/Form/FilterTab.jsx";
import VoicePlayer from "../../components/VoicePlayer/VoicePlayer.jsx";
import ZoneExpertAssignModal from "../../components/Modal/zoneExpertAssignModal.jsx";
import { resumeAndPrerender } from "react-dom/static";
import feedbackService from "../../services/feedback.service.js";

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
  const [isTeamMembersCollapsed, setIsTeamMembersCollapsed] = useState(true);
    const [isActivityLogCollapsed, setIsActivityLogCollapsed] = useState(true);
    const [returnReason, setReturnReason] = useState("");
  const [selectedReportType, setSelectedReportType] = useState("");
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    department: "",
    expert: [],
    description: "",
  });
  const [feedback, setFeedback] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [totalAttachments, setTotalAttachments] = useState(0);
const [isChatCollapsed, setIsChatCollapsed] = useState(true);
const [activeChatTab, setActiveChatTab] = useState('feedback');

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scale, setScale] = useState(1);
  const [loggedInUserHierarchy, setLoggedInUserHierarchy] = useState();
  const [isReportedFilesCollapsed, setIsReportedFilesCollapsed] =
    useState(false);
  const [isFeedbackCollapsed, setIsFeedbackCollapsed] = useState(false);
  const [isAttachmentsCollapsed, setIsAttachmentsCollapsed] = useState(false);
  const [feedbackChats, setFeedbackChats] = useState([]);
  const [issueChats, setIssueChats] = useState([]);
  const [extensionChats, setExtensionChats] = useState([]);
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
  useEffect(() => {
    // Safety check: ensure detail.attachments exists and handle both array and single object
    let attachments = [];
    if (Array.isArray(detail?.attachments)) {
      attachments = detail.attachments;
    } else if (detail?.attachments && typeof detail.attachments === "object") {
      // Single attachment object
      attachments = [detail.attachments];
    }

    setTotalAttachments(attachments.length);

    if (attachments.length === 0) {
      // No attachments — show fallback image
      setMediaFiles({
        image: [],
        video: [],
        voice: [],
      });
      return;
    }

    const images = [];
    const videos = [];
    const voices = [];

    attachments.forEach((attachment) => {
      // Handle different possible field names for the file
      let filePath =
        attachment.file_path ||
        attachment.path ||
        attachment.url ||
        attachment.file_name ||
        attachment.filename;

      if (!filePath) return;

      // Normalize path separators to forward slashes
      filePath = filePath.replace(/\\/g, "/");

      // If it's already a full URL, use it directly
      const fullUrl = filePath.startsWith("http")
        ? filePath
        : `${backendUrl}/${filePath.replace(/^public\//, "")}`;

      const extension = filePath.split(".").pop()?.toLowerCase();

      if (
        ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension)
      ) {
        images.push(fullUrl);
      } else if (
        ["mp4", "avi", "mov", "wmv", "mkv", "webm", "ogg"].includes(extension)
      ) {
        videos.push(fullUrl);
      } else if (
        ["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(extension)
      ) {
        voices.push(fullUrl);
      }
    });

    setMediaFiles({
      image: images, // fallback if no images
      video: videos,
      voice: voices,
    });
  }, [detail?.attachments]); // Re-run when attachments change

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
const [isReturnReasonCollapsed,setIsReturnReasonCollapsed]=useState(false)

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
        setLoggedInUserHierarchy(decoded.organization_hierarchy_id);
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
  const getExperts = async () => {
    try {
      const res = await reportService.getExpertsByZoneHierarchyId();
      console.log("ress", res);
      setExperts(res?.experts);
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
const caseLogs = detail?.activity_logs || [];
const complaintLogs = detail?.case?.activity_logs || []; 

const mergedLogs = [...caseLogs, ...complaintLogs].sort(
  (a, b) => new Date(a.created_at) - new Date(b.created_at)
);
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
    "Verified",
    "under_investigation",
    "investigation_submitted",
    "authorized",
    "closed",
  ];
let currentStatusIndex = statusSteps.includes(detail?.status)
  ? statusSteps.indexOf(detail.status)
  : statusSteps.indexOf("investigation_submitted");

if (
  detail?.status === "Verified" &&
  detail?.handling_unit === "temporary_team"
) {
  currentStatusIndex = statusSteps.indexOf("under_investigation");
}

  const isRegionMode = !!formData?.region_id;
  const isCityMode = !!formData?.city_id;

  const backendUrl = "http://196.188.240.103:4032/public";
  const getAttachmentUrl = (filePath) => {
    if (!filePath) return null;
    return filePath.startsWith("http")
      ? filePath
      : `${backendUrl}/public/complaint/${filePath}`;
  };
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
  const getTotalChatCount = () => {
  return feedbackChats.length + issueChats.length + extensionChats.length;
};
    const handleConfirmReturn = async () => {
      if (!returnReason.trim()) {
        setToast({ open: true, message: "Please provide a return reason", type: "error" });
        return;
      }
  
      setIsReturning(true);
      try {
        const response = await reportService.returnComplaint(complaint_id, returnReason);
  
        if (response && response.success) {
          setToast({
            open: true,
            message: response.message || "Complaint returned successfully",
            type: "success"
          });
          setIsReturnModalOpen(false);
          setReturnReason("");
          // Refresh the data
          loadData();
        } else {
          setToast({
            open: true,
            message: response?.message || "Failed to return complaint",
            type: "error"
          });
        }
      } catch (error) {
        console.error("Return error:", error);
        setToast({
          open: true,
          message: "An error occurred while returning the complaint",
          type: "error"
        });
      } finally {
        setIsReturning(false);
      }
    };
  const handleReturn = () => {
    setIsReturnModalOpen(true);
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
  const [expandedIndex, setExpandedIndex] = useState(null);
  useEffect(() => {
    const fetchFeedback = async () => {
      if (detail?.case?.case_id) {
        try {
          const feedbackRes = await feedbackService.getFeedbackByCase(
            detail.case.case_id
          );
          // Update to handle different API response structures
          setFeedbackList(
            feedbackRes?.data?.feedbacks ||
              feedbackRes?.feedbacks ||
              feedbackRes?.data ||
              feedbackRes ||
              []
          );
        } catch (error) {
          console.error("Failed to load feedback:", error);
          setFeedbackList([]);
        }
      }
    };
    fetchFeedback();
  }, [detail?.case?.case_id]);
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
    (["under_investigation", "assigned_to_expert"].includes(
      detail?.case?.status
    ) &&
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
const renderChatList = (chats, accentColor) => {
  return (
    <div className="space-y-4 max-h-[450px] overflow-y-auto ">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div key={chat.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div 
              className="px-4 py-3 flex justify-between items-center cursor-pointer"
              style={{ borderLeft: `4px solid ${accentColor}` }}
              onClick={() => {
                // Toggle chat expansion
                const updatedChats = chats.map(c => 
                  c.id === chat.id ? { ...c, expanded: !c.expanded } : c
                );
                // Update state based on active tab
                // You would need to implement state management for this
              }}
            >
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{chat.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{chat.participants?.length || 2} participants</span>
                  </div>
                  {chat.reason && (
                    <div className="text-xs text-gray-500">
                      Reason: {chat.reason}
                    </div>
                  )}
                  {chat.severity && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      chat.severity === 'high' ? 'bg-red-100 text-red-800' : 
                      chat.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {chat.severity} priority
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {new Date(chat.created_at).toLocaleDateString()}
                </span>
                <svg 
                  className="w-5 h-5 text-gray-400 transform transition-transform"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="border-t border-gray-100">
              <div className="max-h-96 overflow-y-auto p-4">
                <div className="space-y-4">
                  {chat.messages.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex gap-3 ${message.sender.id === 1 ? 'flex-row-reverse' : ''}`}
                    >
                      {/* Sender Avatar */}
                      <div className="flex-shrink-0">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ 
                            backgroundColor: message.sender.id === 1 ? '#1A3D7D' : 
                                           message.sender.id === 2 ? '#387E53' : 
                                           message.sender.id === 3 ? '#7C3AED' : '#F59E0B'
                          }}
                        >
                          {message.sender.avatar}
                        </div>
                      </div>
                      
                      {/* Message Content */}
                      <div className={`max-w-[70%] ${message.sender.id === 1 ? 'items-end' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.type === 'issue_report' && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              Issue Report
                            </span>
                          )}
                          {message.type === 'extension_request' && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                              Extension Request
                            </span>
                          )}
                        </div>
                        
                        <div 
                          className={`p-3 rounded-2xl ${
                            message.sender.id === 1 
                              ? 'bg-[#1A3D7D] text-white rounded-tr-none' 
                              : 'bg-gray-100 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          
                          {/* Attachments */}
                          {message.attachments && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.attachments.map((file, idx) => (
                                <div 
                                  key={idx}
                                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                                    message.sender.id === 1 
                                      ? 'bg-blue-800 text-blue-100' 
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                  </svg>
                                  {file}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Participants List */}
              <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Participants:</span>
                    <div className="flex -space-x-2">
                      {(chat.participants || [chat.reported_by, chat.assigned_to].filter(Boolean)).map((user, idx) => (
                        <div 
                          key={user.id || idx}
                          className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs text-gray-700"
                          title={`${user.name} (${user.role || user.email})`}
                        >
                          {user.name.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {chat.requested_extension && (
                      <div className="text-sm">
                        <span className="text-gray-500">Extension: </span>
                        <span className="font-medium">
                          {chat.original_deadline} → {chat.requested_extension}
                        </span>
                      </div>
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      chat.status === 'resolved' || chat.status === 'approved' ? 'bg-green-100 text-green-800' :
                      chat.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {chat.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No {activeChatTab.replace('_', ' ')} conversations yet</p>
        </div>
      )}
    </div>
  );
};
  const currentMediaList = mediaFiles[mediaType] || [];
  const currentMedia = currentMediaList[currentMediaIndex];
   const latestReturn =
    detail?.case?.caseHasReturn?.length > 0
      ? detail.case.caseHasReturn[detail.case.caseHasReturn.length - 1]
      : null;

  return (
    <>
      <div className="flex justify-between items-center  px-6 ">
        <h1 className="text-3xl font-bold text-slate-800">Report Details</h1>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            {permissions.includes("zone:can-assign") &&
              detail.status?.toLowerCase() === "verified" &&
              detail?.case?.status === "assigned_to_zone/city" && (
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

                  <button
                    onClick={() => assignWoreda("assigned_to_woreda")}
                    className="bg-[#387E53] hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    Assign to woreda
                  </button>
                  {/* <button
                    onClick={handleReturn}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Return
                  </button> */}
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
                     {detail.status === "Verified" && detail.case?.status === "teamCase"
  ? "Under Investigation"
  : detail.status.replace("_", " ") || "Pending..."}

                    </div>
                  </div>
{detail?.case.status === "Returned" &&(
  <div className="rounded-2xl p-4 border border-gray-300">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setIsReturnReasonCollapsed(!isReturnReasonCollapsed)}
      >
        <h3 className="font-medium text-gray-900">Return Reasons</h3>
        <div
          className={`transform transition-transform duration-200 ${
            isReturnReasonCollapsed ? "rotate-90" : "rotate-0"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#387E53]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Collapsible Content */}
     {isReturnReasonCollapsed && latestReturn && (
        <div className="mt-4">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-700 mb-1">
                  Complaint Rejected
                </h3>

                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium text-gray-900">
                      Rejection Reason:
                    </span>{" "}
                    {latestReturn.rejection_reason.reason}
                  </p>

                  {latestReturn.additional_description && (
                    <p className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-700">
                      <span className="font-medium text-gray-900">
                        Additional Description:
                      </span>{" "}
                      {latestReturn.additional_description}
                    </p>
                  )}

                  {latestReturn.rejectedBy?.name && (
                    <p className="text-right text-sm text-gray-500">
                      Rejected by: {latestReturn.rejectedBy.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
)}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <h2 className="px-6 pt-4 pb-2 text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Reporter Information
                      </h2>
                      <div>
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Full Name</span>
                          <span className="font-medium text-gray-900">
                            {detail.customer?.full_name || "Demeke Abera Siraj"}
                          </span>
                        </div>
                        <div className="mx-6 border-t border-gray-200"></div>
                      
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
                                                                                   {detail.location_url ? (
                                                       <a
                                                     href={`https://www.google.com/maps?q=${detail.location_url}`}
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
                                        {/* Reported Files Section - Collapsable */}
                                         <div className="lg:col-span-2">
                <div className="rounded-2xl p-4 border border-gray-300">
                  {/* Collapsable Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() =>
                      setIsReportedFilesCollapsed(!isReportedFilesCollapsed)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`transform transition-transform duration-300 ${
                          isReportedFilesCollapsed ? "rotate-0" : "rotate-90"
                        }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#387E53]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-[#1A3D7D]">
                        Reported Files ({totalAttachments})
                      </h2>
                    </div>
                  </div>

                  {/* Collapsable Content with Smooth Transition */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isReportedFilesCollapsed
                        ? "max-h-0 opacity-0"
                        : "max-h-[2000px] opacity-100 mt-4"
                    }`}
                  >
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
                            onClick={handlePrev}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                          >
                            <ChevronLeft className="w-5 h-5 text-[#387E53]" />
                          </button>

                          <button
                            onClick={handleNext}
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

                            {/* Expanded View Modal */}
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

                      {/* Indicators */}
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

                    {/* Media Thumbnails */}
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
              </div>
                          
                              
                                        <div className="rounded-2xl p-4 border border-gray-300">
                                          <div
                                            className="flex items-center justify-between cursor-pointer group"
                                            onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                                          >
                                            <div className="flex items-center gap-3">
                                              <div
                                                className={`transform transition-transform duration-300 ${
                                                  isChatCollapsed ? "rotate-0" : "rotate-90"
                                                }`}
                                              >
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  className="h-5 w-5 text-[#387E53]"
                                                  fill="none"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                >
                                                  <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                  />
                                                </svg>
                                              </div>
                                              <h2 className="text-xl font-semibold text-[#1A3D7D]">
                                                Chat & Requests ({getTotalChatCount()})
                                              </h2>
                                            </div>
                                          </div>
                          
                                          <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                              isChatCollapsed
                                                ? "max-h-0 opacity-0"
                                                : "max-h-[2000px] opacity-100 mt-4"
                                            }`}
                                          >
                                            {/* Category Tabs */}
                                            <div className="flex border-b border-gray-200 mb-4">
                                              <button
                                                className={`px-4 py-2 font-medium text-sm ${
                                                  activeChatTab === "feedback"
                                                    ? "text-[#387E53] border-b-2 border-[#387E53]"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                                onClick={() => setActiveChatTab("feedback")}
                                              >
                                                Feedback ({feedbackChats.length})
                                              </button>
                                              <button
                                                className={`px-4 py-2 font-medium text-sm ${
                                                  activeChatTab === "issue"
                                                    ? "text-[#387E53] border-b-2 border-[#387E53]"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                                onClick={() => setActiveChatTab("issue")}
                                              >
                                                Issue Raise ({issueChats.length})
                                              </button>
                                              <button
                                                className={`px-4 py-2 font-medium text-sm ${
                                                  activeChatTab === "extension"
                                                    ? "text-[#387E53] border-b-2 border-[#387E53]"
                                                    : "text-gray-500 hover:text-gray-700"
                                                }`}
                                                onClick={() => setActiveChatTab("extension")}
                                              >
                                                Date Extension ({extensionChats.length})
                                              </button>
                                            </div>
                          
                                            <div className="space-y-4">
                                  
                                       
                          
                          
                                              {activeChatTab === "feedback" &&
                                                renderChatList(feedbackChats, "#387E53")}
                                              {activeChatTab === "issue" &&
                                                renderChatList(issueChats, "#DC2626")}
                                              {activeChatTab === "extension" &&
                                                renderChatList(extensionChats, "#F59E0B")}
                                            </div>
                                          </div>
                                        </div>
                          
                                        {caseAttachment && caseAttachment.length > 0 && (
                                          <div className="rounded-2xl p-4 border border-gray-300">
                                            <div
                                              className="flex items-center justify-between cursor-pointer group"
                                              onClick={() =>
                                                setIsAttachmentsCollapsed(!isAttachmentsCollapsed)
                                              }
                                            >
                                              <div className="flex items-center gap-3">
                                                <div
                                                  className={`transform transition-transform duration-300 ${
                                                    isAttachmentsCollapsed ? "rotate-0" : "rotate-90"
                                                  }`}
                                                >
                                                  <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-[#387E53]"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M9 5l7 7-7 7"
                                                    />
                                                  </svg>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-800">
                                                  Case Timeline With Attachments ({caseAttachment.length})
                                                </h3>
                                              </div>
                                            </div>
                          
                                            <div
                                              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                                isAttachmentsCollapsed
                                                  ? "max-h-0 opacity-0"
                                                  : "max-h-[2000px] opacity-100 mt-4"
                                              }`}
                                            >
                                              <div className="relative border-l-4 border-green-200 pl-8 space-y-6 max-h-[380px] overflow-y-auto">
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
                          
                                                    const isExpandedDesc = expandedIndex === index;
                          
                                                    const fileName = attachment.file_name || "";
                                                    const fileExt =
                                                      fileName.split(".").pop()?.toLowerCase() || "";
                          
                                                    const imageExt = [
                                                      "jpg",
                                                      "jpeg",
                                                      "png",
                                                      "gif",
                                                      "bmp",
                                                      "webp",
                                                    ];
                                                    const videoExt = [
                                                      "mp4",
                                                      "avi",
                                                      "mov",
                                                      "wmv",
                                                      "mkv",
                                                      "webm",
                                                    ];
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
                          
                                                    const filePath = attachment.file_path || "";
                                                    const fullUrl = filePath
                                                      ? `${backendUrl}/${filePath.replace(
                                                          /^public\//,
                                                          ""
                                                        )}`
                                                      : "#";
                          
                                                    return (
                                                      <div
                                                        key={attachment.case_investigation_id || index}
                                                        className="relative group"
                                                      >
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
                                                              href={fullUrl}
                                                              target="_blank"
                                                              rel="noopener noreferrer"
                                                              className="text-md font-semibold text-gray-800 hover:underline"
                                                            >
                                                              {attachment.file_name ||
                                                                `Attachment ${index + 1}`}{" "}
                                                              <span className="text-green-600">
                                                                ({type})
                                                              </span>
                                                            </a>
                          
                                                            {attachment.description && (
                                                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                                {isExpandedDesc
                                                                  ? attachment.description
                                                                  : preview}
                                                                {isTruncated && (
                                                                  <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                      setExpandedIndex(
                                                                        isExpandedDesc ? null : index
                                                                      )
                                                                    }
                                                                    className="text-green-600 ml-2 font-medium hover:underline"
                                                                  >
                                                                    {isExpandedDesc
                                                                      ? "Show less"
                                                                      : "Show more"}
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
                                                                handleViewAttachment(attachment)
                                                              }
                                                              title="View"
                                                            />
                          
                                                            {detail?.case?.case_investigation?.[0]
                                                              ?.status !== "final" &&
                                                              permissions?.includes(
                                                                "teamLead:can-upload-investigation"
                                                              ) && (
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
                                          </div>
                                        )}
                                         {detail?.case?.teamCase && detail?.case?.teamCase?.length > 0 && (
                            <div className="rounded-2xl p-4 border border-gray-300">
                              {/* Header */}
                              <div
                                className="flex items-center justify-between cursor-pointer group"
                                onClick={() => setIsTeamMembersCollapsed(!isTeamMembersCollapsed)}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`transform transition-transform duration-300 ${
                                      isTeamMembersCollapsed ? "rotate-0" : "rotate-90"
                                    }`}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-[#387E53]"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                          
                                  <h3 className="text-xl font-semibold text-gray-800">
                                    Team Members ({detail.case.teamCase.length})
                                  </h3>
                                </div>
                              </div>
                          
                              {/* Team members list */}
                              {!isTeamMembersCollapsed && (
                                <div className="mt-4 space-y-3">
                                  {detail.case.teamCase.map((team) => (
                                    <div
                                      key={team.team_case_id}
                                      className="flex items-center justify-between p-3 border rounded-xl bg-gray-50"
                                    >
                                      <div>
                                        <p className="font-medium text-gray-800">
                                          {team.user?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                          {team.user?.email}
                                        </p>
                                      </div>
                          
                                      <span
                                        className={`text-xs px-3 py-1 rounded-full ${
                                          team.user?.isRegional
                                            ? "bg-green-100 text-green-700"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        {team.user?.isRegional ? "Regional Expert" : "Expert"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                              {!permissions.includes("expert:can-upload-investigation")&&(
                          <>
                          {detail?.case?.expertCase && (
                            <div className="rounded-2xl p-4 border border-gray-300">
                              
                              {/* Header */}
                              <div
                                className="flex items-center justify-between cursor-pointer group"
                                onClick={() => setIsTeamMembersCollapsed(!isTeamMembersCollapsed)}
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`transform transition-transform duration-300 ${
                                      isTeamMembersCollapsed ? "rotate-0" : "rotate-90"
                                    }`}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-[#387E53]"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                          
                                  <h3 className="text-xl font-semibold text-[#1A3D7D]">
                                    Assigned Expert
                                  </h3>
                                </div>
                              </div>
                          
                              {/* Expert details */}
                              {!isTeamMembersCollapsed && (
                                <div className="mt-4">
                                  <div className="flex items-center justify-between p-3 border rounded-xl bg-gray-50">
                                    
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {detail.case.expertCase.user?.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {detail.case.expertCase.user?.email}
                                      </p>
                                    </div>
                          
                                    <span
                                      className={`text-xs px-3 py-1 rounded-full ${
                                        detail.case.expertCase.user?.isRegional
                                          ? "bg-green-100 text-green-700"
                                          : "bg-blue-100 text-blue-700"
                                      }`}
                                    >
                                      {detail.case.expertCase.user?.isRegional
                                        ? "Regional Expert"
                                        : "Expert"}
                                    </span>
                          
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          
                              </>   )}  
                                   {/* Delete Confirmation Modal */}
                                        {attachmentToDelete && (
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
                                                  {attachmentToDelete?.description || "this attachment"}
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
                                                      setToast({
                                                        open: true,
                                                        message: "Attachment deleted successfully",
                                                        type: "success",
                                                      });
                                                    } catch (error) {
                                                      console.error("Error deleting attachment:", error);
                                                      setToast({
                                                        open: true,
                                                        message: "Failed to delete attachment",
                                                        type: "error",
                                                      });
                                                    }
                                                  }}
                                                >
                                                  Delete
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                          
                                       {isExpanded && selectedAttachment && (
                                                      <div
                                                        className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-black/30 p-4"
                                                        onClick={closeModal}
                                                      >
                                                        {/* Modal */}
                                                        <div
                                                          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[80vh] p-6 flex flex-col items-center justify-center"
                                                          onClick={(e) => e.stopPropagation()}
                                                        >
                                                         <button
                                        onClick={closeModal}
                                        aria-label="Close preview"
                                        className="
                                          absolute top-4 right-4
                                          p-3
                                          rounded-full
                                          bg-white
                                          shadow-lg
                                          hover:bg-gray-200
                                          focus:outline-none
                                          focus:ring-2
                                          focus:ring-black
                                          z-50
                                        "
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="w-7 h-7 text-black"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                          strokeWidth={2.5}
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                      
                                                          {/* Media Content */}
                                                          <div className="w-full flex items-center justify-center overflow-hidden">
                                                            {selectedAttachment.type === "image" && (
                                                              <img
                                                                src={sample_trash}
                                                                alt={selectedAttachment.description}
                                                                style={{ transform: `scale(${scale})` }}
                                                                className="
                                                    max-w-full
                                                    h-[80vh]
                                                    object-contain
                                                    transition-transform
                                                    duration-300
                                                    ease-in-out
                                                    select-none
                                                  "
                                                                draggable={false}
                                                              />
                                                            )}
                                      
                                                            {selectedAttachment.type === "video" && (
                                                              <video
                                                                src={selectedAttachment.url}
                                                                controls
                                                                autoPlay
                                                                className="max-w-full max-h-[100vh] rounded-xl"
                                                              />
                                                            )}
                                      
                                                            {selectedAttachment.type === "audio" && (
                                                              <div className="w-full max-w-md bg-gray-100 rounded-xl p-6">
                                                                <VoicePlayer src={selectedAttachment.url} />
                                                                <p className="text-center text-gray-700 mt-4">
                                                                  {selectedAttachment.description}
                                                                </p>
                                                              </div>
                                                            )}
                                      
                                                            {selectedAttachment.type === "document" && (
                                                              <iframe
                                                                src={selectedAttachment.url}
                                                                className="w-full h-[70vh] rounded-xl border"
                                                                title="Document Preview"
                                                              />
                                                            )}
                                      
                                                            {selectedAttachment.type === "unknown" && (
                                                              <div className="text-center space-y-4">
                                                                <p className="text-xl text-gray-700">
                                                                  Preview not available
                                                                </p>
                                                                <a
                                                                  href={selectedAttachment.url}
                                                                  target="_blank"
                                                                  rel="noopener noreferrer"
                                                                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium"
                                                                >
                                                                  Open File
                                                                </a>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    )}
                          
                          {mergedLogs && mergedLogs.length > 0 && (
                            <div className="rounded-2xl border border-gray-300 p-4">
                              {/* Header */}
                              <div
                                className="flex items-center justify-start gap-2  cursor-pointer select-none"
                                onClick={() => setIsActivityLogCollapsed(!isActivityLogCollapsed)}
                              >
                          
                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-[#387E53]"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth={2}
                                                      d="M9 5l7 7-7 7"
                                                    />
                                                  </svg>
                                <h2 className="text-xl font-semibold mb-4 text-[#1A3D7D]">
                                  Status Timeline ({mergedLogs.length})
                                </h2>
                          
                               
                              </div>
                          
                              <div
                                className={`overflow-hidden transition-all duration-300 ${
                                  isActivityLogCollapsed ? "max-h-0" : "max-h-[2000px]"
                                }`}
                              >
                                <ol className="relative max-h-[250px] overflow-y-auto border-l border-gray-200 ">
                                  {mergedLogs.map((log) => {
                                    const isStatusChange = log.old_status !== log.new_status
                          
                                    return (
                                      <li key={log.activity_log_id} className="relative mb-10 ml-8">
                                        {/* Timeline Dot */}
                                        <span className="absolute -left-4 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 ring-8 ring-white">
                                          <svg
                                            className="h-4 w-4 text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                        </span>
                          
                                        {/* Content Card */}
                                        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                                          <div className="flex items-center justify-between">
                                            <h3 className="text-sm ml-4 font-semibold text-gray-900">
                                              {isStatusChange ? "Status Updated" : "Activity Update"}
                                            </h3>
                          
                                            <time className="text-xs text-gray-400">
                                              {new Date(log.created_at).toLocaleString()}
                                            </time>
                                          </div>
                          
                                          {isStatusChange && (
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                                                {log.old_status}
                                              </span>
                          
                                              <svg
                                                className="h-4 w-4 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                              </svg>
                          
                                              <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 font-medium">
                                                {log.new_status}
                                              </span>
                                            </div>
                                          )}
                          
                                          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                                            <svg
                                              className="h-4 w-4"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                                              />
                                            </svg>
                                            <span>
                                              Handled by{" "}
                                              <span className="font-medium">
                                                {log.user?.name || "System"}
                                              </span>
                                            </span>
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  })}
                                </ol>
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
          <ZoneExpertAssignModal
            open={isAssignModalOpen}
            complaint_id={detail.complaint_id}
            loggedInUserHierarchy={loggedInUserHierarchy}
            departments={departments}
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
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Return Complaint</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for returning this complaint:
            </p>
            <textarea
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="Enter return reason..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              disabled={isReturning}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsReturnModalOpen(false);
                  setReturnReason("");
                }}
                disabled={isReturning}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReturn}
                disabled={isReturning || !returnReason.trim()}
                className={`px-4 py-2 rounded-lg transition-colors ${isReturning || !returnReason.trim()
                    ? "bg-red-600 hover:bg-red-700 text-white cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
              >
                {isReturning ? "Returning..." : "Return Complaint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
