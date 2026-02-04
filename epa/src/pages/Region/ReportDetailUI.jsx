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
import RejectionReasonService from "../../services/RejectionReason.service.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/TeamAssignementModal.jsx";
import userService from "../../services/user.service.js";
import RegionalWorkFlow from "../../services/regionalWorkflow.service.js";
import RegionService from "../../services/region.service.js";
import baseDataService from "../../services/basedata.service.js";
import { Eye, Trash2, ShieldCheck, ArrowLeft, ChevronDown, ChevronUp  } from "lucide-react";
import sample_trash from "../../assets/sample_trash.jpeg";
import FilterTab from "../../components/Form/FilterTab.jsx";
import VoicePlayer from "../../components/VoicePlayer/VoicePlayer.jsx";
import AssignModal from "../../components/Modal/AssignModal.jsx";
import { resumeAndPrerender } from "react-dom/static";
import { QRCodeSVG } from "qrcode.react";
import chatService from "../../services/chat.service.js";

export default function ReportDetailUI({
  detail,
  isRegional = false,
  isEditing,
  setIsEditing,
  setFeedbackList,
  feedbackList,
  reportTypes,
  handlingUnit,
  setCaseAttachment,
  setHandlingUnit,
  isModalOpen,
  setIsModalOpen,
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

  console.log(feedbackList?.length, "feedbackList feedbackList")
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
  const isReturned = detail?.case?.status === "Returned";
const [isFinal, setIsFinal] = useState(() => {
  if (isReturned) return false;

  return detail?.case?.case_investigation?.[0]?.status === "final";
});
  const [isTeamMembersCollapsed, setIsTeamMembersCollapsed] = useState(true);
  const [isActivityLogCollapsed, setIsActivityLogCollapsed] = useState(true);
  const [totalAttachments, setTotalAttachments] = useState(0);
useEffect(() => {
  let attachments = [];
  if (Array.isArray(detail?.attachments)) {
    attachments = detail.attachments;
  } else if (detail?.attachments && typeof detail.attachments === 'object') {
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
    filePath = filePath.replace(/\\/g, '/');

    // If it's already a full URL, use it directly
    const fullUrl = filePath.startsWith("http")
      ? filePath
      : `${backendUrl}/${filePath.replace(/^public\//, "")}`;

    const extension = filePath.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension)) {
      images.push(fullUrl);
    } else if (["mp4", "avi", "mov", "wmv", "mkv", "webm", "ogg"].includes(extension)) {
      videos.push(fullUrl);
    } else if (["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(extension)) {
      voices.push(fullUrl);
    }
  });

  setMediaFiles({
    image: images,
    video: videos,
    voice: voices,
  });
}, [detail?.attachments]);

  const complaint_id = detail?.complaint_id;
  const [selectedReportType, setSelectedReportType] = useState("");
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    department: "",
    expert: [],
    description: "",
  });
  const [leaderUserId, setLeaderUserId] = useState(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [scale, setScale] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [regionOptions, setRegionOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
const [isReturnReasonCollapsed,setIsReturnReasonCollapsed]=useState(false)
  const [assignMenuOpen, setAssignMenuOpen] = useState(false);
const [isChatCollapsed, setIsChatCollapsed] = useState(true);
const [activeChatTab, setActiveChatTab] = useState('feedback');
const [zoneOptions, setZoneOptions] = useState([]);
const [subcityOptions, setSubcityOptions] = useState([]);
const [woredaOptions, setWoredaOptions] = useState([]);
const [expertType, setExpertType] = useState("regional"); // "regional" or "hq"
  const [feedbackChats, setFeedbackChats] = useState([]);
  const [issueChats, setIssueChats] = useState([]);
  const [extensionChats, setExtensionChats] = useState([]);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [extensionForm, setExtensionForm] = useState({
    title: '',
    reason: '',
    newDeadline: '',
    daysRequested: 7,
    files: []
  });
  const fetchChats = async () => {
    if (!complaint_id) {
      console.log('No complaint_id provided');
      return;
    }
  
    setLoadingChats(true);
    try {
      const response = await chatService.getChatsByComplaint(complaint_id);
      
      console.log('Full API response:', response);
      
      // Check if the response structure is correct
      if (!response || !response.success) {
        console.error('API returned error:', response?.message);
        throw new Error(response?.message || 'Failed to fetch chats');
      }
      
      const chats = response.data;
      console.log('Raw chats data:', chats);
      console.log('Number of chats:', chats.length);
      
      // Log each chat's type for debugging
      chats.forEach((chat, index) => {
        console.log(`Chat ${index}: type = "${chat.type}"`);
      });
  
      // Filter chats by type - with null checks
      const feedback = Array.isArray(chats) ? chats.filter(chat => chat.type === 'feedback') : [];
      const issues = Array.isArray(chats) ? chats.filter(chat => chat.type === 'issue') : [];
      const extensions = Array.isArray(chats) ? chats.filter(chat => chat.type === 'extension') : [];
  
      console.log('Filtered results:', {
        feedbackCount: feedback.length,
        issuesCount: issues.length,
        extensionsCount: extensions.length,
        feedback,
        issues,
        extensions
      });
  
      setFeedbackChats(feedback);
      setIssueChats(issues);
      setExtensionChats(extensions);
  
    } catch (error) {
      console.error('Error fetching chats:', error);
    
    } finally {
      setLoadingChats(false);
    }
  };
  const handleExtensionSubmit = async () => {
  
  
    console.log("i am here " )
    if (!extensionForm.title.trim() || !extensionForm.reason.trim() || !extensionForm.newDeadline) {
      setToast({
        open: true,
        message: 'Please fill all required fields',
        type: 'error'
      });
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('complaint_id', complaint_id);
      formData.append('type', 'extension');
      formData.append('title', extensionForm.title);
      formData.append('content', extensionForm.reason);
      formData.append('new_deadline', extensionForm.newDeadline);
      formData.append('days_requested', extensionForm.daysRequested);
  
      extensionForm.files.forEach((file) => {
        formData.append('files', file);
      });
  
      await chatService.sendMessageWithAttachments(formData);
  
      setToast({
        open: true,
        message: 'Extension requested successfully',
        type: 'success'
      });
  
      // Clear form
      setExtensionForm({
        title: '',
        reason: '',
        newDeadline: '',
        daysRequested: 7,
        files: []
      });
  
      // Refresh chats
      fetchChats();
    } catch (error) {
      console.error('Error requesting extension:', error);
      setToast({
        open: true,
        message: 'Failed to request extension',
        type: 'error'
      });
    }
  };
  
  const closeModal = () => {
    setIsExpanded(false);
    setTimeout(() => setScale(1), 200);
  };
const getTotalChatCount = () => {
  return feedbackChats.length + issueChats.length + extensionChats.length;
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
useEffect(() => {
  const fetchFilters = async () => {
    try {
      console.log("📡 Fetching all hierarchy filters...");

      // Regions
      const regionRes = await RegionService.getAllRegions();
      if (regionRes) setRegionOptions(regionRes);

      // Cities
      const cityRes = await baseDataService.CityService.getAllCities();
      if (cityRes) setCityOptions(cityRes);

      // Subcities (your API returns { subcity_id, name, city, ... })
      const subcityRes = await baseDataService.SubcityService.getAllSubcities(); // adjust service name
      if (subcityRes?.subcities) setSubcityOptions(subcityRes.subcities);

      const zoneRes = await baseDataService.ZoneService.getAllZones();
      if (zoneRes) setZoneOptions(zoneRes); // adjust if response has .zones

      const woredaRes = await baseDataService.WoredaService.getAllWoredas();
      if (woredaRes) setWoredaOptions(woredaRes);

    } catch (error) {
      console.error("❌ Error fetching filters:", error);
    }
  };

  fetchFilters();
}, []);

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
  const [loggedInUserHierarchy, setLoggedInUserHierarchy] = useState();
  const [qrCodeData, setQrCodeData] = useState(null); // Store QR code data after authorization
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const assignMenuRef = useRef(null);
const [selectedFiles, setSelectedFiles] = useState([]);

const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
const [rejectionReasons, setRejectionReasons] = useState([]);
const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
const [rejectionDescription, setRejectionDescription] = useState("");
const [isRejecting, setIsRejecting] = useState(false);
  const [additionalDescription,setAdditionalDescription] = useState("")

// Add this useEffect after your other useEffect hooks (around line 200-210)


const handleConfirmReturn = async () => {
  if (!selectedRejectionReason) {
    setToast({
      open: true,
      message: "Please select a rejection reason",
      type: "error",
    });
    return;
  }

  setIsReturning(true);

  try {
    const payload = {
      rejection_reason_id: selectedRejectionReason,
      description: additionalDescription,
    };

    const response = await caseService.returnCase(
      detail?.case?.case_id,
      payload
    );

    if (response?.success) {
      setToast({
        open: true,
        message: response.message || "Complaint returned successfully",
        type: "success",
      });

      setIsReturnModalOpen(false);
      setSelectedRejectionReason("");
      setAdditionalDescription("");
      loadData();
    } else {
      setToast({
        open: true,
        message: response?.message || "Failed to return complaint",
        type: "error",
      });
    }
  } catch (error) {
    console.error("Return error:", error);
    setToast({
      open: true,
      message: "An error occurred while returning the complaint",
      type: "error",
    });
  } finally {
    setIsReturning(false);
  }
};
  const handleReturn = () => {
    setIsReturnModalOpen(true);
  };
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

const backendUrl = "http://196.188.240.103:4032/public";
const getAttachmentUrl = (filePath) => {
    if (!filePath) return null;
    return filePath.startsWith("http")
      ? filePath
      : `${backendUrl}/public/complaint/${filePath}`;
  };

  // Determine if attachment is image/video/audio/document
  const getAttachmentType = (fileNameOrPath) => {
    if (!fileNameOrPath) return "unknown";
    const ext = (fileNameOrPath.split(".").pop() || "").toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) return "image";
    if (["mp4", "avi", "mov", "wmv", "mkv", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "m4a", "aac", "ogg"].includes(ext)) return "audio";
    if (["pdf", "doc", "docx", "xls", "xlsx"].includes(ext)) return "document";
    return "unknown";
  };

  // Handle view click - now opens the same expanded modal as Reported File
   const handleViewAttachment = (attachment) => {
    const filePath = getAttachmentUrl(attachment.file_path || attachment.file_name);
    const type = getAttachmentType(attachment.file_path || attachment.file_name);
const url = getAttachmentUrl(filePath)
  .replace(/\\/g, "/")     
  .replace(/\/public\//g, "/")
  .replace(/\/complaint\//g, "/");
console.log("urrrrllll",url)
 
    setSelectedAttachment({
      url,
      type,
      description: attachment.description || "Case attachment",
    });
    setIsExpanded(true);
  };

  // === DYNAMIC MEDIA FROM ATTACHMENTS ===
  const [mediaFiles, setMediaFiles] = useState({
    image: [],
    video: [],
    voice: [],
  });
console.log("detail?.attachments",detail?.attachments)
useEffect(() => {
  // Safety check: ensure detail.attachments exists and is an array
  const attachments = Array.isArray(detail?.attachments) ? detail.attachments : [];

  if (attachments.length === 0) {
    // No attachments — show fallback image
    setMediaFiles({
      image: [sample_trash],
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

    // If it's already a full URL, use it directly
    const fullUrl = filePath.startsWith("http") 
      ? filePath 
      : `${backendUrl}/public/complaint/${filePath}`;
console.log("fillrr",fullUrl)
    const extension = filePath.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension)) {
      images.push(fullUrl);
    } else if (["mp4", "avi", "mov", "wmv", "mkv", "webm", "ogg"].includes(extension)) {
      videos.push(fullUrl);
    } else if (["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(extension)) {
      voices.push(fullUrl);
    }
  });

  setMediaFiles({
    image: images.length > 0 ? images : [sample_trash], // fallback if no images
    video: videos,
    voice: voices,
  });
}, [detail?.attachments]); // Re-run when attachments change

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("decoded", decoded)
        setPermissions(decoded.permissions || []);
        console.log("decoded.permissions", decoded.permissions);
        setLoggedInUserHierarchy(decoded.organization_hierarchy_id)
        setCurrentUserId(decoded.id || decoded.user_id || decoded.sub);
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, [token]);
  console.log("loggedInUserHierarchy", loggedInUserHierarchy)
const handleReasonChange = (e) => {
  const selectedId = e.target.value;
  setSelectedRejectionReason(selectedId);

  const selectedReason = rejectionReasons?.data?.find(
    (r) => r.rejection_reason_id === selectedId
  );

  setAdditionalDescription(selectedReason?.description || "");
};
useEffect(() => {
  const fetchData = async () => {
    console.log("Starting data fetch...");
    
    try {
      console.log("Calling services...");
      const [usersRes, hierarchyRes] = await Promise.all([
        userService.getAllExperts(),
        userService.getOrganizationHierarchy(),
      ]);
      
      console.log("Raw users response:", usersRes);
      console.log("Type of users response:", typeof usersRes);
      
      console.log("Raw hierarchy response:", hierarchyRes);
      console.log("Type of hierarchy response:", typeof hierarchyRes);
      
      // Handle different response structures
      let usersData = [];
      if (usersRes) {
        if (Array.isArray(usersRes)) {
          usersData = usersRes;
        } else if (usersRes.data && Array.isArray(usersRes.data)) {
          usersData = usersRes.data;
        } else if (usersRes.data) {
          console.log("usersRes.data is not an array:", usersRes.data);
        }
      }
      
      let hierarchyData = [];
      if (hierarchyRes) {
        if (Array.isArray(hierarchyRes)) {
          hierarchyData = hierarchyRes;
        } else if (hierarchyRes.data && Array.isArray(hierarchyRes.data)) {
          hierarchyData = hierarchyRes.data;
        } else if (hierarchyRes.data) {
          console.log("hierarchyRes.data is not an array:", hierarchyRes.data);
        }
      }
      
      console.log("Processed users data:", usersData);
      console.log("Processed hierarchy data:", hierarchyData);
      
      setAllUsers(usersData);
      setDepartments(hierarchyData);
      
    } catch (error) {
      console.error("Failed to load data:", error);
      console.error("Error details:", error.message);
      setAllUsers([]);
      setDepartments([]);
    }
  };
  
  fetchData();
}, []);
useEffect(() => {
    const onDocClick = (e) => {
      if (
        assignMenuOpen &&
        assignMenuRef.current &&
        !assignMenuRef.current.contains(e.target) &&
        !e.target.closest(".assign-menu-button")
      ) {
        setAssignMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [assignMenuOpen]);

  const assignZoneOrCity = async (type) => {
    const payload = {
      complaint_id: detail?.complaint_id,
      assign_to: type,
    };


    try {
      const res = await RegionalWorkFlow.assignFromRegion(payload);
      setToast({
        open: true,
        message: "Report Assigned successfully!",
        type: "success",
      });
      loadData?.();
      onClose();
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
        await RegionalWorkFlow.assignFromRegion({
          complaint_id,
          organization_hierarchy_id,
          assign_to: "zone",
        });
        showToast("success", "Assigned to Zone Admin");
      } else if (type === "expert") {
        await RegionalWorkFlow.assignFromRegion({
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

  const filteredDepartments = departments?.filter((d) =>
      d.name?.toLowerCase().includes(departmentSearch.toLowerCase())
    )
    .map((d) => ({ value: d.id, label: d.name }));
 

const [isReportedFilesCollapsed, setIsReportedFilesCollapsed] = useState(false);
const [isFeedbackCollapsed, setIsFeedbackCollapsed] = useState(false);
const [isAttachmentsCollapsed, setIsAttachmentsCollapsed] = useState(false);


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
  const [regionalExperts, setRegionalExperts] = useState([]);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [selectedRegionCity, setSelectedRegionCity] = useState(""); // optional, for select value
  const [selectedSubcity, setSelectedSubcity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedSubcityZone, setSelectedSubcityZone] = useState("");
  const [selectedWoreda, setSelectedWoreda] = useState("");
  const getExperts = async () => {
    try {
      const res = await reportService.getExpertsByHierarchyId();
      setExperts(res);
      setRegionalExperts(res?.experts)
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
  // console.log(filteredSubcategories[0]?.sub_pollution_category , "filteredSubcategories")
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
    "Under Review",
    "Verified",
    "under_investigation",
    "investigation_submitted",
    "authorized",
    // "Rejected",
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
      setTeamFormData((prev) => {
        const isAlready = prev.expert.includes(value);
        const nextExpert = isAlready
          ? prev.expert.filter((id) => id !== value)
          : [...prev.expert, value];
        // If the removed user was the leader, clear leader selection
        if (isAlready && leaderUserId === value) {
          setLeaderUserId(null);
        }
        return { ...prev, expert: nextExpert };
      });
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
    if (leaderUserId === userId) setLeaderUserId(null);
  };

  const handleAssignTeam = async () => {
    setSubmitAttempted(true);

    const complaint_id = detail.complaint_id;
    const validUsers = teamFormData.expert.filter((id) => id != null && id !== "");

    if (!complaint_id) {
      setToast({ open: true, type: "error", message: "complaint Id is missing. Please refresh and try again." });
      return;
    }
    if (validUsers.length < 2) {
      setToast({ open: true, type: "error", message: "Please select at least 2 team members to form a team." });
      return;
    }
    if (!leaderUserId || !validUsers.includes(leaderUserId)) {
      setToast({ open: true, type: "error", message: "Exactly one leader is required." });
      return;
    }

    const usersPayload = validUsers.map((id) => ({ user_id: id, is_team_leader: id === leaderUserId }));

    try {
      const result = await caseService.createTeam({
        complaint_id,
        handling_unit: handlingUnit,
        users: usersPayload,
      });

      if (result.success) {
        setToast({ open: true, type: "success", message: result.message || "Team created successfully!" });
        setIsAssignTeamModalOpen(false);
        setTeamFormData({ department: "", expert: [], description: "" });
        setLeaderUserId(null);
        setSubmitAttempted(false);
        setUserSearch("");
        loadData?.();
      } else {
        setToast({ open: true, type: "error", message: result.error || "Failed to create team." });
      }
    } catch (error) {
      setToast({ open: true, type: "error", message: "Failed to create team." });
    }
  };

  const handleReject = async () => {
    if (!selectedRejectionReason) {
      setToast({
        open: true,
        message: "Please select a rejection reason",
        type: "error",
      });
      return;
    }

    if (!rejectionDescription.trim()) {
      setToast({
        open: true,
        message: "Please provide a rejection description",
        type: "error",
      });
      return;
    }

    setIsRejecting(true);
    try {
      const payload = {
        complaint_id: complaint_id,
        reason_id: selectedRejectionReason,
        description: rejectionDescription,
      };

      const response = await reportService.rejectComplaint(detail?.complaint_id,payload);

      if (response && response.success) {
        setToast({
          open: true,
          message: response.message || "Complaint rejected successfully",
          type: "success",
        });
        setIsRejectModalOpen(false);
        setSelectedRejectionReason("");
        setRejectionDescription("");
        loadData?.();
      } else {
        setToast({
          open: true,
          message: response?.message || "Failed to reject complaint",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Reject error:", error);
      setToast({
        open: true,
        message: "An error occurred while rejecting the complaint",
        type: "error",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  useEffect(() => {
    const fetchRejectionReasons = async () => {
      try {
        const reasons = await RejectionReasonService.getAllRejectionReasons();
        console.log("reasons", reasons);
        if (reasons) {
          setRejectionReasons(reasons);
        }
      } catch (error) {
        console.error("Error fetching rejection reasons:", error);
        setToast({
          open: true,
          message: "Failed to load rejection reasons",
          type: "error",
        });
      }
    };

      fetchRejectionReasons();
  }, []);
  console.log("rejectionReasons",rejectionReasons)
  console.log("detail?.case?.case_investigation?.[0]?.status", detail?.case);
  const handleVerifyAndAssign = async () => {
    if (!handlingUnit) {
      setToast({
        open: true,
        message: "Please fill all fields",
        type: "error",
      });
      return;
    }

    try {
    const res =  await complaintService.chooseHandlingUnit(detail?.complaint_id, {
        handling_unit: handlingUnit,
        is_team_formation_needed: isTeamFormationNeeded,
      });
      console.log("payloadpayload",res)
if(res?.success){
   setToast({
        open: true,
        message: "Report verified and assigned!",
        type: "success",
      });
}
     
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
  const generateQRCodeData = (complaintDetail) => {
    if (!complaintDetail || !complaint_id) return "";

    const qrData = {
      complaint_id: complaint_id,
      complaint_number: complaintDetail.complaint_number || "N/A",
      status: "authorized",
      pollution_category: complaintDetail.pollution_category?.name || "N/A",
      created_at: complaintDetail.created_at || "N/A",
      authorized_at: new Date().toISOString(),
      authorization_id: `AUTH-${Date.now()}-${complaint_id}`,
      type: "complaint_authorization"
    };

    return JSON.stringify(qrData);
  };
  const handleAuthorize = async () => {

    if (!complaint_id) {
      setToast({ open: true, message: "Complaint ID is missing", type: "error" });
      return;
    }

    setIsAuthorizing(true);
    try {
      const response = await reportService.authorizeComplaint(complaint_id);

      if (response.success) {
        // Generate QR code data
        const qrDataString = generateQRCodeData(detail);
        setQrCodeData(qrDataString);

        setToast({
          open: true,
          message: response.message || "Complaint authorized successfully. QR Code generated!",
          type: "success"
        });

        // Show QR code automatically
        setShowQRCode(true);

        // Refresh the data
        loadData?.();
      } else {
        setToast({
          open: true,
          message: response.message || "Failed to authorize complaint",
          type: "error"
        });
      }
    } catch (error) {
      console.error("Authorization error:", error);
      setToast({
        open: true,
        message: "An error occurred while authorizing the complaint",
        type: "error"
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

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
const investigationStatus =
  detail?.case?.case_investigation?.[0]?.status;

const caseStatus = detail?.case?.status;

const hasUploadPermission =
  permissions?.includes("expert:can-upload-investigation");

const caseLogs = detail?.activity_logs || [];
const complaintLogs = detail?.case?.activity_logs || []; 

const mergedLogs = [...caseLogs, ...complaintLogs].sort(
  (a, b) => new Date(a.created_at) - new Date(b.created_at)
);
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
console.log("detaillll",detail?.case?.caseHasReturn)

const canUpload =
  hasUploadPermission &&
  investigationStatus !== "final" &&
  [
    "under_investigation",
    "assigned_to_expert",
    "assigned_to_regional_expert",
    "assigned_to_woreda_expert",
    "assigned_to_zone_expert",
    "Returned",
    "teamCase",
  ].includes(caseStatus);

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

  const isComplaintAuthorized = detail.status?.toLowerCase() === "authorized";
  const canShowQRCode = isComplaintAuthorized && qrCodeData;
  console.log("isComplaintAuthorized",isComplaintAuthorized)
  const isRegionalReturn = detail?.handling_unit ==="regional_team" && detail.status === "investigation_submitted"  && permissions.includes("region:can-review-investigation")
 const canFillForm =
  !isReturned &&
  !isFinal &&
  caseStatus === "under_investigation";
   const latestReturn =
    detail?.case?.caseHasReturn?.length > 0
      ? detail.case.caseHasReturn[detail.case.caseHasReturn.length - 1]
      : null;

  // Get current user's region or city from loggedInUserHierarchy
  const getCurrentUserHierarchy = () => {
    if (!loggedInUserHierarchy || !departments.length) return null;
    
    const userHierarchy = departments.find(d => d.id === loggedInUserHierarchy);
    if (!userHierarchy) return null;
    
    // Return the hierarchy details for filtering
    return userHierarchy;
  };

  // Get filtered region and city options based on current user's hierarchy
  const getFilteredRegionCityOptions = () => {
    const currentUserHierarchy = getCurrentUserHierarchy();
    if (!currentUserHierarchy) return { regions: [], cities: [], selectedValue: "" };
    
    let filteredRegions = [];
    let filteredCities = [];
    let selectedValue = "";
    
    // If user is at region level, show only their region
    if (currentUserHierarchy.region_id && !currentUserHierarchy.city_id) {
      filteredRegions = regionOptions.filter(r => r.region_id === currentUserHierarchy.region_id);
      selectedValue = `${currentUserHierarchy.region_id}|`;
      // Show all cities under this region
      filteredCities = cityOptions.filter(c => c.region_id === currentUserHierarchy.region_id);
    }
    // If user is at city level, show only their city and its region
    else if (currentUserHierarchy.city_id && currentUserHierarchy.region_id) {
      filteredRegions = regionOptions.filter(r => r.region_id === currentUserHierarchy.region_id);
      filteredCities = cityOptions.filter(c => c.city_id === currentUserHierarchy.city_id);
      selectedValue = `${currentUserHierarchy.region_id}|${currentUserHierarchy.city_id}`;
    }
    // If user is at lower levels (subcity, woreda), show their region and city
    else if (currentUserHierarchy.region_id) {
      filteredRegions = regionOptions.filter(r => r.region_id === currentUserHierarchy.region_id);
      if (currentUserHierarchy.city_id) {
        filteredCities = cityOptions.filter(c => c.city_id === currentUserHierarchy.city_id);
        selectedValue = `${currentUserHierarchy.region_id}|${currentUserHierarchy.city_id}`;
      } else {
        // Show all cities in the region if no specific city is assigned
        filteredCities = cityOptions.filter(c => c.region_id === currentUserHierarchy.region_id);
        selectedValue = `${currentUserHierarchy.region_id}|`;
      }
    }
    
    return { regions: filteredRegions, cities: filteredCities, selectedValue };
  };

  // Auto-select user's region/city when component loads or data changes
  useEffect(() => {
    const { selectedValue } = getFilteredRegionCityOptions();
    if (selectedValue && !selectedRegion && !selectedCity) {
      const [regionId, cityId] = selectedValue.split("|");
      setSelectedRegion(regionId || "");
      setSelectedCity(cityId || "");
    }
  }, [loggedInUserHierarchy, departments, regionOptions, cityOptions]);

  return (
    <>
      <div className="flex justify-between items-center  px-6 ">
        <h1 className="text-3xl font-bold text-slate-800">Report Details</h1>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            {permissions.includes("taskForce:can-verify-complaint") &&
              detail.status?.toLowerCase() === "under review" && (
                <>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#387E53] hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2"
                  >
                    <Check className="w-5 h-5" /> Verify
                  </button>

                 {/* Update the Reject button in your JSX (around line 1180) */}
<button
  onClick={() => setIsRejectModalOpen(true)}
  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2"
>
  <X className="w-5 h-5" /> Reject
</button>
                </>
              )}
            {permissions.includes("region:can-assign") &&
  detail.status?.toLowerCase() === "verified" &&
  detail?.case?.status === "assigned_to_region" && (
    <>
      <div className="relative">
        <button
          className="assign-menu-button bg-[#387E53] hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          onClick={() => setAssignMenuOpen((s) => !s)}
        >
          Assign
          <ChevronDown className="w-4 h-4" />
        </button>

        {assignMenuOpen && (
          <div ref={assignMenuRef} className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg z-50">
            {/* Assign to Expert */}
            <button
              onClick={() => {
                setAssigmentType("expert");
                setIsAssignModalOpen(true);
                setAssignMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
            >
              <User className="w-4 h-4 text-slate-700" />
              <span>Assign to Expert</span>
            </button>

            {/* DYNAMIC LABEL: Assign to Zone/City OR Assign to Subcity */}
            <button
              onClick={() => {
                assignZoneOrCity("zone/city");
                setAssignMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
            >
              <MapPin className="w-4 h-4 text-slate-700" />
              <span>
                {(() => {
                  // Get region_id from any available source
                  const regionId =
                    formData?.region_id ??
                    detail?.case?.region_id ??
                    detail?.region_id ??
                    "";

                  // If no region_id → City Administration → assign to Subcity
                  // If has region_id → Regional state → assign to Zone/City
                  return regionId ? "Assign to Zone/City" : "Assign to Subcity";
                })()}
              </span>
            </button>

            {/* Form Team */}
            <button
              onClick={() => {
                setExpertType("regional");

                const r = formData?.region_id ?? detail?.case?.region_id ?? detail?.region_id ?? "";
                const c = formData?.city_id ?? detail?.case?.city_id ?? detail?.city_id ?? "";
                const sc = formData?.subcity_id ?? detail?.case?.subcity_id ?? detail?.subcity_id ?? "";
                const z = formData?.zone_id ?? detail?.case?.zone_id ?? detail?.zone_id ?? "";
                const w = formData?.woreda_id ?? detail?.case?.woreda_id ?? detail?.woreda_id ?? "";

                setSelectedRegion(r ? String(r) : "");
                setSelectedCity(c ? String(c) : "");
                setSelectedSubcity(sc ? String(sc) : "");
                setSelectedZone(z ? String(z) : "");
                setSelectedWoreda(w ? String(w) : "");

                setHandlingUnit("temporary_team");
                setIsTeamFormationNeeded(true);
                setIsAssignTeamModalOpen(true);
                setShowUserDropdown(true);
                setAssignMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
            >
              <Users className="w-4 h-4 text-slate-700" />
              <span>Form Team</span>
            </button>
          </div>
        )}
      </div>
    </>
  )}
            {/* {permissions.includes("region:can-assign" || "taskforce:can-get-compaint") &&  ( */}
              <div className="flex items-center gap-4">
                {/* Authorize Button - Only show if not already authorized */}
                {!isComplaintAuthorized  && (
             <>
              {permissions.includes("deputyDirector:approve_and_reject") || permissions.includes("region:can-review-investigation") && detail.status === "investigation_submitted"&&(
                  <button
                    onClick={handleAuthorize}
                    disabled={isAuthorizing}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isAuthorizing
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                  >
                    <ShieldCheck size={20} />
                    {isAuthorizing ? "Authorizing..." : "Authorize"}
                  </button>
              )}
                  </>
                                )}

                {/* Return Button */}
                {isComplaintAuthorized || isRegionalReturn && (
                  <button
                    onClick={handleReturn}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Return
                  </button>
                )}
              </div>
        
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
                          width: `${(currentStatusIndex / (statusSteps.length - 1)) *
                            100
                            }%`,
                        }}
                      />
                      <div className="flex justify-between relative">
                        {statusSteps.map((s, i) => {
                          const isActive = i <= currentStatusIndex;
                          const isReturned = detail?.status === "returned" && s === "investigation_submitted";
                          console.log("isReturned", isReturned)
                          return (
                            <div key={s} className="flex flex-col items-center w-24 text-center relative">
                              {/* Circle */}
                              <div
                                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all
          ${isReturned
                                    ? "bg-red-500 border-red-500 text-white"
                                    : isActive
                                      ? "bg-[#387E53] border-[#387E53] text-white"
                                      : "bg-white border-gray-300"
                                  }`}
                              >
                                {isActive ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 bg-gray-400 rounded-full" />}
                              </div>

                              {/* Label */}
                              <span
                                className={`mt-1 text-xs font-medium capitalize
          ${isReturned
                                    ? "text-red-500"
                                    : isActive
                                      ? "text-[#387E53]"
                                      : "text-gray-400"
                                  }`}
                              >
                                {isReturned ? "Returned" : s.replace("_", " ")}
                              </span>

                              {/* Date */}
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
                       <div className="lg:col-span-2">
        
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
                    <div className="flex justify-between items-center px-6 py-3 text-sm">
                            <span className="text-gray-600"> Region/City Adminstration</span>
                        {isEditing ? (
                          // Keep dropdowns exactly as original
                          <>
                         
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
                              <span className="font-medium text-gray-900">
                                {detail.region?.region_name || detail?.city?.city_name || "—"}
                              </span>
                            </span>
                            
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
                      {!isFinal &&canUpload &&  (
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                         
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

                     {canFillForm && (
  <button
    className="px-6 py-2 bg-[#387E53] text-white rounded-xl"
    onClick={() => {
      navigate("/report-fill-form", {
        state: {
          report_type_id:
            detail?.sub_pollution_category?.report_types?.report_type_id,
          case_id: detail.case?.case_id,
          mode: "update", // optional but recommended
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
                
                                  {/* Chat Content */}
                                  <div className="space-y-4">
                        
                                    {activeChatTab === "extension" &&
                                      isTaskForce &&
                                      extensionChats.length > 0 && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Extension Request Management
                                          </h3>
                                          <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                            {extensionChats.map((chat) => (
                                              <div
                                                key={chat.chat_id}
                                                className="bg-white p-4 rounded-lg border border-gray-300"
                                              >
                                                <div className="flex items-center justify-between mb-2">
                                                  <div className="flex items-center gap-2">
                                                    <h4 className="font-medium text-gray-900">
                                                      {chat.title || "Extension Request"}
                                                    </h4>
                                                    <span className="text-xs text-gray-500">
                                                      by{" "}
                                                      {chat.messages?.[0]?.sender?.name ||
                                                        "Unknown"}
                                                    </span>
                                                  </div>
                                                  <span
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                      chat.status === "pending_review"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : chat.status === "approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                                  >
                                                    {chat.status.replace("_", " ")}
                                                  </span>
                                                </div>
                
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                  <div>
                                                    <p className="text-sm text-gray-600">
                                                      Days Requested
                                                    </p>
                                                    <p className="font-medium text-blue-600">
                                                      {chat.days_requested || 7} days
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <p className="text-sm text-gray-600">
                                                      Current Deadline
                                                    </p>
                                                    <p className="font-medium">
                                                      {(() => {
                                                        const currentDays = detail?.case?.countdown_end_date || 0;
                                                        const endDate = new Date();
                                                        endDate.setDate(endDate.getDate() + currentDays);
                                                        return endDate.toLocaleDateString();
                                                      })()}
                                                    </p>
                                                  </div>
                                                </div>
                
                                                <div className="mb-4">
                                                  <p className="text-sm text-gray-600">
                                                    Reason
                                                  </p>
                                                  <div className="bg-gray-50 p-3 rounded-lg mt-1">
                                                    <p className="text-sm text-gray-800">
                                                      {chat.reason ||
                                                        chat.messages?.[0]?.content ||
                                                        "No reason provided"}
                                                    </p>
                                                  </div>
                                                </div>
                
                                                {chat.status === "pending_review" && (
                                                  <div className="flex justify-end gap-2">
                                                    <button
                                                      onClick={() => {
                                                        const reason = prompt(
                                                          "Enter rejection reason (optional):",
                                                          "Extension request rejected"
                                                        );
                                                        if (reason !== null) {
                                                          handleRejectExtension(
                                                            chat.chat_id || chat.id,
                                                            reason
                                                          );
                                                        }
                                                      }}
                                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                                                    >
                                                      <X className="w-4 h-4" />
                                                      Reject
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        const days = chat.days_requested || 7;
                                                        const comments = prompt(
                                                          "Enter approval comments (optional):",
                                                          `Extension of ${days} days approved`
                                                        );
                                                        if (comments !== null) {
                                                          handleApproveExtension(
                                                            chat.chat_id || chat.id,
                                                            comments,
                                                            days
                                                          );
                                                        }
                                                      }}
                                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                                                    >
                                                      <Check className="w-4 h-4" />
                                                      Approve {chat.days_requested || 7} days
                                                    </button>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                
                
                                    {/* Display Chats */}
                                    {activeChatTab === "feedback" &&
                                      renderChatList(feedbackChats, "#387E53")}
                                    {activeChatTab === "issue" &&
                                      renderChatList(issueChats, "#DC2626")}
                                    {activeChatTab === "extension" &&
                                      renderChatList(extensionChats, "#F59E0B")}
                                  </div>
                                </div>
                              </div>
                
                              {/* Case Attachments - Collapsable */}
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
                
                                          // File type detection logic...
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
                { value: "regional_team", icon: MapPin, label: "Region/City" },
              ].map(({ value, icon: Icon, label, onClick }) => (
                <button
                  key={value}
                  onClick={() => (onClick ? onClick() : setHandlingUnit(value))}
                  className={`p-6 rounded-xl border-2 transition-all ${handlingUnit === value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-400"
                    }`}
                >
                  <Icon className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
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
      setLeaderUserId(null);
      setSubmitAttempted(false);
      setUserSearch("");
    }}
    title="Assign Team"
    // description="Select users to form a team. You must select at least 2 members."
    width="w-full max-w-3xl"
    height="h-auto max-h-[90vh]"
    className="overflow-hidden text-sm"
    actions={
      <div className="flex flex-col sm:flex-row gap-3 w-1/2">
        <button
          onClick={() => {
            setIsAssignTeamModalOpen(false);
            setTeamFormData({
              department: "",
              expert: [],
              description: "",
            });
            setLeaderUserId(null);
            setSubmitAttempted(false);
          }}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleAssignTeam}
          disabled={teamFormData.expert.length < 2 || !leaderUserId}
          className={`flex-1 px-8 py-3 rounded-lg font-medium shadow-md transition-colors ${
            teamFormData.expert.length < 2 || !leaderUserId
              ? "bg-gray-400 cursor-not-allowed text-gray-200"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {teamFormData.expert.length < 2
            ? `Select ${2 - teamFormData.expert.length} more`
            : !leaderUserId
              ? "Pick a leader"
              : "Create Team"}
        </button>
      </div>
    }
  >
    <div className="space-y-6">
      {/* Header with description */}
      <div className="mb-2">
        <p className="text-gray-600 text-sm">
          Filter users by region or city, then add them to your team.
        </p>
      </div>

      
{/* Filters Section */}
<div className="">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    
    {/* Column 1: Region & City (Merged) */}
    
<div className="space-y-2">
  <label className="block text-sm font-medium text-slate-700">
    {selectedCity 
      ? "Selected City" 
      : selectedRegion 
        ? "Selected Region"
        : "Filter by Region & City"}
  </label>
  <div className="relative">
    <select
      value={selectedRegion && selectedCity ? `${selectedRegion}|${selectedCity}` : 
             selectedRegion ? `${selectedRegion}|` : 
             selectedCity ? `|${selectedCity}` : ""}
      onChange={(e) => {
        const value = e.target.value;
        if (value) {
          const [regionId, cityId] = value.split("|");
          setSelectedRegion(regionId || "");
          setSelectedCity(cityId || "");
        } else {
          setSelectedRegion("");
          setSelectedCity("");
        }
      }}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white pr-10"
    >
      {/* Get filtered options based on current user's hierarchy */}
      {(() => {
        const { regions: filteredRegions, cities: filteredCities } = getFilteredRegionCityOptions();
        
        return (
          <>
            {/* Regions standalone */}
            {filteredRegions.map((region) => (
              <option key={`region-${region.region_id}`} value={`${region.region_id}|`}>
                {region.region_name}
              </option>
            ))}
            
            {/* Cities (with region if linked) */}
            {filteredCities.map((city) => {
              const region = regionOptions.find(r => r.region_id === city.region_id);
              const displayName = region 
                ? `${region.region_name} - ${city.city_name}`
                : `${city.city_name}`;
              return (
                <option
                  key={`city-${city.city_id}`}
                  value={city.region_id ? `${city.region_id}|${city.city_id}` : `|${city.city_id}`}
                >
                  {displayName}
                </option>
              );
            })}
          </>
        );
      })()}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
      <ChevronDown className="h-5 w-5" />
    </div>
  </div>
</div>

    {/* Column 2: Dynamic Subcity & Zone */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {selectedCity && cityOptions.find(c => c.city_id === selectedCity)?.city_name.includes("Addis Abeba")
          ? "Filter by Subcity"
          : "Filter by Subcity & Zone"}
      </label>
      <div className="relative">
        <select
          value={selectedSubcity && selectedZone ? `${selectedSubcity}|${selectedZone}` : 
                 selectedSubcity ? `${selectedSubcity}|` : 
                 selectedZone ? `|${selectedZone}` : ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              const [subcityId, zoneId] = value.split("|");
              setSelectedSubcity(subcityId || "");
              setSelectedZone(zoneId || "");
            } else {
              setSelectedSubcity("");
              setSelectedZone("");
            }
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white pr-10"
        >
          <option value="">
            {selectedCity && cityOptions.find(c => c.city_id === selectedCity)?.city_name.includes("Addis Abeba")
              ? "All"
              : "All"}
          </option>
          
          {/* Filter subcities and zones based on selected region/city */}
          {(() => {
            // Filter subcities based on selected region and city
            const filteredSubcities = subcityOptions.filter(subcity => {
              // If a city is selected, only show subcities for that city
              if (selectedCity) {
                return subcity.city_id === selectedCity;
              }
              // If only a region is selected, show subcities for that region
              if (selectedRegion) {
                return subcity.region_id === selectedRegion;
              }
              return false;
            });
            
            // Filter zones based on selected region
            const filteredZones = zoneOptions.filter(zone => {
              if (selectedRegion) {
                return zone.region_id === selectedRegion;
              }
              return false;
            });
            
            return (
              <>
                {/* Subcities - filtered by selected region/city */}
                {filteredSubcities.map((subcity) => {
                  const cityName = subcity.city?.city_name || "Unknown City";
                  return (
                    <option key={`subcity-${subcity.subcity_id}`} value={`${subcity.subcity_id}|`}>
                      {subcity.name} - {cityName}
                    </option>
                  );
                })}
                
                {/* Zones - filtered by selected region */}
                {filteredZones.map((zone) => (
                  <option key={`zone-${zone.zone_id}`} value={`|${zone.zone_id}`}>
                    {zone.name || zone.zone_name}
                  </option>
                ))}
              </>
            );
          })()}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </div>

    {/* Column 3: Woreda */}
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Filter by Woreda
      </label>
      <div className="relative">
        <select
          value={selectedWoreda}
          onChange={(e) => setSelectedWoreda(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white pr-10"
        >
          <option value="">All</option>
          {/* Filter woredas based on selected hierarchy */}
          {(() => {
            const filteredWoredas = woredaOptions.filter(woreda => {
              // If a subcity is selected, only show woredas for that subcity
              if (selectedSubcity) {
                return woreda.subcity_id === selectedSubcity;
              }
              // If a city is selected, show woredas for that city
              if (selectedCity) {
                return woreda.city_id === selectedCity;
              }
              // If only a region is selected, show woredas for that region
              if (selectedRegion) {
                return woreda.region_id === selectedRegion;
              }
              return false;
            });
            
            return filteredWoredas.map((woreda) => (
              <option key={woreda.woreda_id} value={woreda.woreda_id}>
                {woreda.woreda_name || woreda.name}
              </option>
            ));
          })()}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </div>

  </div>
</div>

{/* Tabs: Regional vs HQ Experts */}
<div className="flex border-b border-gray-200 mb-4">
  <button
    onClick={() => setExpertType("regional")}
    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
      expertType === "regional"
        ? "border-green-500 text-green-600"
        : "border-transparent text-gray-500 hover:text-gray-700"
    }`}
  >
    Experts
  </button>
  {/* Add HQ tab if needed */}
</div>

{/* Helper to get hierarchy level label */}
{(() => {
  const getHierarchyLevel = (user) => {
    if (!user?.hierarchies?.length) return null;

    for (const h of user.hierarchies) {
      const hier = h.hierarchy;
      if (!hier) continue;

      if (hier.region_id && !hier.zone_id && !hier.city_id && !hier.woreda_id && !hier.subcity_id) {
        return { level: "Region", name: hier.name || "Region Level" };
      }
      if (hier.zone_id && hier.region_id && !hier.woreda_id) {
        return { level: "Zone", name: hier.name || "Zone Level" };
      }
      if (hier.city_id && hier.region_id && !hier.subcity_id) {
        return { level: "City", name: hier.name || "City Level" };
      }
      if (hier.woreda_id) {
        return { level: "Woreda", name: hier.name || "Woreda Level" };
      }
      if (hier.subcity_id) {
        return { level: "Subcity", name: hier.name || "Subcity Level" };
      }
    }
    return null;
  };

  
  const getLevelBadge = (level) => {
    const styles = {
      Region: "bg-purple-100 text-purple-800",
      Zone: "bg-blue-100 text-blue-800",
      City: "bg-indigo-100 text-indigo-800",
      Woreda: "bg-orange-100 text-orange-800",
      Subcity: "bg-pink-100 text-pink-800",
    };
    return styles[level] || "bg-gray-100 text-gray-800";
  };

  // Main rendering starts here
  return (
    <div ref={userContainerRef} className="space-y-4">
      {/* User Search */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Search Users
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={userInputRef}
            type="text"
            placeholder="Search by name, username, or email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            onFocus={() => setShowUserDropdown(true)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {showUserDropdown ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>

          {/* Users Dropdown */}
          {showUserDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-4 py-3">
                <span className="text-sm font-medium text-gray-700">
                  Available Users
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {(() => {
                  let baseUsers = allUsers;

                  const regionalUsers = allUsers.filter(user => 
                    user.hierarchies?.some(h => 
                      h.hierarchy?.region_id || 
                      h.hierarchy?.city_id || 
                      h.hierarchy?.subcity_id || 
                      h.hierarchy?.zone_id || 
                      h.hierarchy?.woreda_id
                    )
                  );

                  if (expertType === "hq") {
                    baseUsers = hqUsers;
                  } else {
                    baseUsers = regionalUsers;
                  }

                  const filteredUsers = baseUsers.filter(user => {
                    if (selectedRegion && !user.hierarchies?.some(h => h.hierarchy?.region_id === selectedRegion)) return false;
                    if (selectedCity && !user.hierarchies?.some(h => h.hierarchy?.city_id === selectedCity)) return false;
                    if (selectedSubcity && !user.hierarchies?.some(h => h.hierarchy?.subcity_id === selectedSubcity)) return false;
                    if (selectedZone && !user.hierarchies?.some(h => h.hierarchy?.zone_id === selectedZone)) return false;
                    if (selectedWoreda && !user.hierarchies?.some(h => h.hierarchy?.woreda_id === selectedWoreda)) return false;

                    if (userSearch.trim()) {
                      const search = userSearch.toLowerCase();
                      return user.name?.toLowerCase().includes(search) || 
                             user.email?.toLowerCase().includes(search);
                    }
                    return true;
                  });

                  return filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => {
                      const hierarchyInfo = getHierarchyLevel(user);
                      const isSelected = teamFormData.expert.includes(user.user_id);

                      return (
                        <div
                          key={user.user_id}
                          onClick={() => handleTeamFormChange("expert", user.user_id)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${
                            isSelected ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isSelected ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                              }`}>
                                {isSelected ? <Check className="h-5 w-5" /> : <User className="h-5 w-5" />}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  {user.name}
                                  {hierarchyInfo && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelBadge(hierarchyInfo.level)}`}>
                                      {hierarchyInfo.level}
                                    </span>
                                  )}
                                  {isSelected && <span className="ml-2 text-xs font-normal text-green-600">Selected</span>}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {user.email}
                                  {hierarchyInfo && hierarchyInfo.name && (
                                    <span className="ml-2">• {hierarchyInfo.name}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isSelected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                            }`}>
                              {isSelected ? "Remove" : "Add"}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-4 py-12 text-center">
                      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <User className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium">No experts found</p>
                      <p className="text-sm text-gray-400 mt-2">
                        {userSearch.trim()
                          ? `No results for "${userSearch}"`
                          : "Try adjusting filters or search term"}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Members Section */}
      {teamFormData.expert.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                Selected Team Members
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {teamFormData.expert.length} member{teamFormData.expert.length !== 1 ? 's' : ''} selected
                {teamFormData.expert.length < 2 && (
                  <span className="ml-2 text-red-600 font-medium">
                    • Need {2 - teamFormData.expert.length} more
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                setTeamFormData(prev => ({ ...prev, expert: [] }));
                setLeaderUserId(null);
              }}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teamFormData.expert.map((id) => {
              const user = allUsers?.find(u => u.user_id === id);
              if (!user) return null;

              const hierarchyInfo = getHierarchyLevel(user);
              const isLeader = leaderUserId === id;

              return (
                <div
                  key={id}
                  className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {user.name}
                        {hierarchyInfo && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getLevelBadge(hierarchyInfo.level)}`}>
                            {hierarchyInfo.level}
                          </span>
                        )}
                        {isLeader && <span className="text-xs text-green-700 font-medium">Leader</span>}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {user.email}
                        {hierarchyInfo && hierarchyInfo.name && ` • ${hierarchyInfo.name}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isLeader && (
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="teamLeader"
                          checked={isLeader}
                          onChange={() => setLeaderUserId(id)}
                          className="accent-green-600"
                        />
                        Set as Leader
                      </label>
                    )}
                    <button
                      onClick={() => removeUser(id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100"
                      title="Remove"
                    >
                      <X className="h-5 w-5 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {teamFormData.expert.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center mt-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No team members selected yet
          </h3>
          <p className="text-sm text-gray-500">
            Search and add experts to form your team
          </p>
        </div>
      )}
    </div>
  );
})()}
    </div>
  </Modal>
)}
      {isAssignModalOpen && (
        <>
          <AssignModal
            open={isAssignModalOpen}
            complaint_id={detail.complaint_id}
            experts={regionalExperts}
            departments={departments}
            loggedInUserHierarchy={loggedInUserHierarchy}
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
      <h3 className="text-lg font-semibold mb-2 text-gray-800">
        Return Complaint
      </h3>

      <p className="text-sm text-gray-600 mb-4">
        Please select a rejection reason and add an additional description if needed.
      </p>

      {/* Rejection Reason Dropdown */}
      <select
        value={selectedRejectionReason}
        onChange={handleReasonChange}
        disabled={isReturning}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <option value="">Select rejection reason</option>
        {rejectionReasons?.map((reason) => (
          <option
            key={reason.rejection_reason_id}
            value={reason.rejection_reason_id}
          >
            {reason.reason}
          </option>
        ))}
      </select>

      {/* Additional Description */}
      <textarea
        value={additionalDescription}
        onChange={(e) => setAdditionalDescription(e.target.value)}
        placeholder="Additional description (optional)"
        rows={3}
        disabled={isReturning}
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setIsReturnModalOpen(false);
            setSelectedRejectionReason("");
            setAdditionalDescription("");
          }}
          disabled={isReturning}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          onClick={handleConfirmReturn}
          disabled={isReturning || !selectedRejectionReason}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isReturning || !selectedRejectionReason
              ? "bg-red-600 text-white cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isReturning ? "Returning..." : "Return Complaint"}
        </button>
      </div>
    </div>
  </div>
)}
      {isRejectModalOpen && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
           
            <div>
              <h3 className="text-xl font-bold text-gray-900">Reject Complaint</h3>
              <p className="text-sm text-gray-600 mt-1">
                Provide details for rejecting this complaint
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRejectModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
            disabled={isRejecting}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Complaint Info */}
        
        
        {/* Rejection Reason */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={selectedRejectionReason}
              onChange={(e) => setSelectedRejectionReason(e.target.value)}
              className="w-full p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none bg-white pr-12"
              disabled={isRejecting}
            >
              <option value="" className="text-gray-400">Choose a reason...</option>
              {rejectionReasons.map((reason) => (
                <option key={reason.rejection_reason_id} value={reason.rejection_reason_id}>
                  {reason.reason}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900">
            Detailed Explanation <span className="text-red-500">*</span>
          
          </label>
          <textarea
            value={rejectionDescription}
            onChange={(e) => setRejectionDescription(e.target.value)}
            placeholder="Explain why this complaint needs to be rejected. Provide specific details that will help in future reference..."
            className="w-full p-3.5 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[120px]"
            rows={4}
            disabled={isRejecting}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Minimum 20 characters required
            </span>
            <span className={`text-xs ${
              rejectionDescription.length < 20 
                ? "text-red-500" 
                : "text-green-600"
            }`}>
              {rejectionDescription.length}/500
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => {
              setIsRejectModalOpen(false);
              setSelectedRejectionReason("");
              setRejectionDescription("");
            }}
            disabled={isRejecting}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={isRejecting || !selectedRejectionReason || rejectionDescription.length < 20}
            className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isRejecting || !selectedRejectionReason || rejectionDescription.length < 20
                ? "bg-red-300 cursor-not-allowed text-white"
                : "bg-red-600 hover:bg-red-700 text-white shadow-md"
            }`}
          >
            {isRejecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <X className="h-5 w-5" />
                Confirm Rejection
              </>
            )}
          </button>
        </div>
        
        
      </div>
    </div>
  </div>
)}
    </>
  );
}
