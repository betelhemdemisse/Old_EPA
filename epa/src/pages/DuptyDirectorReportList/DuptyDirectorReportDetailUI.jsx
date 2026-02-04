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
  MessageSquare,
  Send,
  Paperclip,
  Calendar,
  AlertTriangle,
  Clock,
  Eye,
  Trash2,
  Loader2
} from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import React, { useEffect, useState, useRef } from "react";
import caseService from "../../services/case.service.js";
import complaintService from "../../services/complaint.service.js";
import feedbackService from "../../services/feedback.service.js";
import chatService from "../../services/chat.service.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal.jsx";
import userService from "../../services/user.service.js";
import { QRCodeSVG } from "qrcode.react";
import sample_trash from "../../assets/sample_trash.jpeg";
import FilterTab from "../../components/Form/FilterTab.jsx";
import VoicePlayer from "../../components/VoicePlayer/VoicePlayer.jsx";

export default function DuptyDirectorReportDetailUI({
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
  rejectionReasons,
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
  const complaint_id = detail?.complaint_id;

  // Team Assignment Modal
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
    const [isActivityLogCollapsed, setIsActivityLogCollapsed] = useState(true);
    const [totalAttachments, setTotalAttachments] = useState(0);
  
  const [teamFormData, setTeamFormData] = useState({
    department: "",
    expert: [],
    description: "",
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

const caseLogs = detail?.activity_logs || [];
const complaintLogs = detail?.case?.activity_logs || []; 

const mergedLogs = [...caseLogs, ...complaintLogs].sort(
  (a, b) => new Date(a.created_at) - new Date(b.created_at)
);
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
  const [isLoading, setIsLoading] = useState(true);

  // Media files state
  const [mediaFiles, setMediaFiles] = useState({
    image: [],
    video: [],
    voice: [],
  });

  // Collapsible states
  const [isReportedFileCollapsed, setIsReportedFileCollapsed] = useState(false);
  const [isCaseAttachmentsCollapsed, setIsCaseAttachmentsCollapsed] = useState(true);
  const [isReportedFilesCollapsed, setIsReportedFilesCollapsed] = useState(false);

  // Attachment modal states
  const [isExpanded, setIsExpanded] = useState(false);
  const [scale, setScale] = useState(1);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);
  const [isTeamMembersCollapsed, setIsTeamMembersCollapsed] = useState(true);

  // Chat functionality
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [activeChatTab, setActiveChatTab] = useState('feedback');
  const [loadingChats, setLoadingChats] = useState(false);
  const [feedbackChats, setFeedbackChats] = useState([]);
  const [issueChats, setIssueChats] = useState([]);
  const [extensionChats, setExtensionChats] = useState([]);

  // Feedback states
  const [feedback, setFeedback] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Extension states
  const [extensionDate, setExtensionDate] = useState("");
  const [extensionReason, setExtensionReason] = useState("");
  const [isSubmittingExtension, setIsSubmittingExtension] = useState(false);

  // Issue states
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [isSubmittingIssue, setIsSubmittingIssue] = useState(false);

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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
  // Touch support for mobile zoom
  const [touchStart, setTouchStart] = useState(null);

  // Normalize attachments from API
  const normalizeAttachments = (attachments) => {
    if (!attachments) return [];

    const list = Array.isArray(attachments) ? attachments : [attachments];

    return list
      .map(att => {
        if (typeof att === "string") {
          return {
            file_path: att,
            file_name: att.split("/").pop(),
          };
        }

        if (typeof att === "object") {
          return {
            file_path: att.file_path || att.path || "",
            file_name: att.file_name || att.file_path?.split("/").pop(),
            file_size: att.file_size,
            created_at: att.created_at,
            description: att.description,
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  // Media filters for tabs
const mediaFilters = [
    { key: "image", label: `Images (${mediaFiles.image.length})` },
    { key: "video", label: `Videos (${mediaFiles.video.length})` },
    { key: "voice", label: `Voices (${mediaFiles.voice.length})` },
  ];
    useEffect(() => {
      let attachments = Array.isArray(detail?.attachments)
        ? detail.attachments
        : detail?.attachments
          ? [detail.attachments]
          : [];
  
      setTotalAttachments(attachments.length);
  
      const images = [];
      const videos = [];
      const voices = [];
  
      attachments.forEach((attachment) => {
        let filePath =
          attachment.file_path ||
          attachment.path ||
          attachment.url ||
          attachment.file_name ||
          attachment.filename;
  
        if (!filePath) return;
  
        filePath = filePath.replace(/\\/g, "/");
        const fullUrl = filePath.startsWith("http")
          ? filePath
          : `${backendUrl}/${filePath.replace(/^public\//, "")}`;
        const ext = filePath.split(".").pop()?.toLowerCase();
  
        if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)) images.push(fullUrl);
        else if (["mp4", "avi", "mov", "wmv", "mkv", "webm", "ogg"].includes(ext)) videos.push(fullUrl);
        else if (["mp3", "wav", "m4a", "aac", "ogg", "flac"].includes(ext)) voices.push(fullUrl);
      });
  
      setMediaFiles({ image: images, video: videos, voice: voices });
    }, [detail?.attachments]);
  
  // Get attachment URL
const backendUrl = "http://196.188.240.103:4032/public";
  const getAttachmentUrl = (filePath) => {
    if (!filePath) return null;

    if (filePath.startsWith("http")) return filePath;

    return `${backendUrl}/public/${filePath}`;
  };

  // Get attachment type
  const getAttachmentType = (filePath) => {
    if (!filePath) return "unknown";

    const ext = filePath.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
    if (["mp3", "wav", "m4a", "ogg"].includes(ext)) return "audio";

    return "unknown";
  };

  // Process media files on component mount
  useEffect(() => {
    if (!detail?.attachments) {
      setIsLoading(false);
      return;
    }

    const attachments = normalizeAttachments(detail.attachments);
    const grouped = {
      image: [],
      video: [],
      voice: [],
    };

    attachments.forEach(att => {
      const type = getAttachmentType(att.file_path);
      const filePath = getAttachmentUrl(att.file_path);

const url = getAttachmentUrl(filePath)
  .replace(/\\/g, "/")     
  .replace(/\/public\//g, "/");
console.log("urlurl",url)

      if (url) {
        if (type === "image") grouped.image.push(url);
        if (type === "video") grouped.video.push(url);
        if (type === "audio") grouped.voice.push(url);
      }
    });
    setMediaFiles(grouped);
    setIsLoading(false);
  }, [detail?.attachments]);

  // Handle carousel navigation
  const nextMedia = () => {
    const mediaList = mediaFiles[mediaType] || [];
    if (mediaList.length === 0) return;
    
    setCurrentMediaIndex((prevIndex) =>
      prevIndex === mediaList.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevMedia = () => {
    const mediaList = mediaFiles[mediaType] || [];
    if (mediaList.length === 0) return;
    
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
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mediaType, currentMediaIndex, mediaFiles.image.length]);

  // Decode token for permissions
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


  // Fetch chats from API
  const fetchChats = async () => {
    if (!complaint_id) return;

    setLoadingChats(true);
    try {
      const chats = await chatService.getChatsByComplaint(complaint_id);
      
      // Filter chats by type
      const feedback = (Array.isArray(chats) ? chats : chats?.data || []).filter(chat => chat.type === 'feedback') || [];
      const issues = (Array.isArray(chats) ? chats : chats?.data || []).filter(chat => chat.type === 'issue') || [];
      const extensions = (Array.isArray(chats) ? chats : chats?.data || []).filter(chat => chat.type === 'extension') || [];

      setFeedbackChats(feedback);
      setIssueChats(issues);
      setExtensionChats(extensions);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoadingChats(false);
    }
  };
  const caseStatus = detail?.case?.status;

  // Fetch chats when component mounts or complaint_id changes
  useEffect(() => {
    fetchChats();
  }, [complaint_id]);

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

  // Sync location searches with form data
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

  // Filter functions for location dropdowns
  const filteredCategories = pollutionCategories?.filter((cat) =>
    cat.pollution_category.toLowerCase().includes(categorySearch.toLowerCase())
  ) || [];
  
  const filteredSubcategories = subPollutionCategories?.filter((sub) =>
    sub.sub_pollution_category.toLowerCase().includes(subcategorySearch.toLowerCase())
  ) || [];
  
  const filteredRegions = regions?.filter((r) =>
    r.region_name.toLowerCase().includes(regionSearch.toLowerCase())
  ) || [];
  
  const filteredCities = cities?.filter((c) =>
    c.city_name.toLowerCase().includes(citySearch.toLowerCase())
  ) || [];
  
  const filteredZones = zones?.filter((z) =>
    z.zone_name.toLowerCase().includes(zoneSearch.toLowerCase())
  ) || [];
  
  const filteredSubcities = subcities?.filter((s) =>
    (s.name || s.subcity_name).toLowerCase().includes(subcitySearch.toLowerCase())
  ) || [];
  
  const filteredWoredasForSearch = filteredWoredas?.filter((w) =>
    w.woreda_name.toLowerCase().includes(woredaSearch.toLowerCase())
  ) || [];

  // Text truncation helper
  const truncateWords = (text, limit = 8) => {
    if (!text) return { preview: "", isTruncated: false };
    
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return { preview: text, isTruncated: false };

    return {
      preview: words.slice(0, limit).join(" "),
      isTruncated: true,
    };
  };

  // Status steps for progress bar
  const statusSteps = [
    "submitted",
    "under review",
    "verified",
    "under_investigation",
    "investigation_submitted",
    "authorized",
    "closed",
  ];
  
  const currentStatusIndex = statusSteps.includes(detail?.status?.toLowerCase()) 
    ? statusSteps.indexOf(detail.status.toLowerCase()) 
    : statusSteps.indexOf("investigation_submitted");

  const safeCurrentStatusIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;
  const isRegionMode = !!formData?.region_id;
  const isCityMode = !!formData?.city_id;

  // Calculate total reported files
  const totalReportedFiles =
    (mediaFiles.image?.length || 0) +
    (mediaFiles.video?.length || 0) +
    (mediaFiles.voice?.length || 0);

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle viewing attachments
  const handleViewAttachment = (attachment) => {
    const filePath = attachment.file_path;
    const type = getAttachmentType(filePath);
    const url = getAttachmentUrl(filePath)
      ?.replace(/\\/g, "/")
      .replace(/\/public\//g, "/")
      .replace(/\/complaint\//g, "/");
    
    if (!url) {
      setToast({
        open: true,
        message: "Could not load attachment",
        type: "error",
      });
      return;
    }

    setSelectedAttachment({
      url,
      type,
      fileName: attachment.file_name,
      fileSize: attachment.file_size,
      description: attachment.description || "Attachment",
      created_at: attachment.created_at,
    });

    setIsExpanded(true);
    setScale(1);
  };

  // Close modal
  const closeModal = () => {
    setIsExpanded(false);
    setTimeout(() => setScale(1), 200);
  };

  // Zoom handlers
  const handleZoomIn = (e) => {
    if (e) e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e) => {
    if (e) e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.5, 1));
  };
  const [isReturnReasonCollapsed,setIsReturnReasonCollapsed]=useState(false)

  // Download handler
  const handleDownload = (e) => {
    if (e) e.stopPropagation();
    if (selectedAttachment?.url) {
      const link = document.createElement("a");
      link.href = selectedAttachment.url;
      link.download = selectedAttachment.fileName || `download-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Touch handlers for mobile zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setTouchStart({
        distance: Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      });
    }
  };
  const [feedbackContent, setFeedbackContent] = useState('');
  

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchStart) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      const delta = currentDistance - touchStart.distance;
      if (Math.abs(delta) > 10) {
        setScale(prev => Math.min(3, Math.max(1, prev + delta * 0.01)));
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isExpanded || !selectedAttachment) return;
      
      switch(e.key) {
        case 'Escape':
          closeModal();
          break;
        case '+':
        case '=':
          if (selectedAttachment.type === 'image') handleZoomIn();
          break;
        case '-':
          if (selectedAttachment.type === 'image') handleZoomOut();
          break;
        case '0':
          if (selectedAttachment.type === 'image') setScale(1);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, selectedAttachment]);

  // Submit report handler
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

  // Save changes handler
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

  // Team form change handler
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

  // Remove user from team
  const removeUser = (userId) => {
    setTeamFormData((prev) => ({
      ...prev,
      expert: prev.expert.filter((id) => id !== userId),
    }));
  };

  // Assign team handler
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
        message: "Complaint ID is missing. Please refresh and try again.",
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

  // Verify and assign handler
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

  // Chat submission handlers
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      setToast({
        open: true,
        message: "Please enter your feedback",
        type: "error",
      });
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const chatData = {
        complaint_id: complaint_id,
        type: 'feedback',
        message: feedback,
        files: selectedFiles,
      };

      await chatService.createChat(chatData);

      setToast({
        open: true,
        message: "Feedback submitted successfully",
        type: "success",
      });

      setFeedback("");
      setSelectedFiles([]);
      fetchChats();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setToast({
        open: true,
        message: "Failed to submit feedback",
        type: "error",
      });
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSubmitIssue = async () => {
    if (!issueTitle.trim() || !issueDescription.trim()) {
      setToast({
        open: true,
        message: "Please fill in both title and description",
        type: "error",
      });
      return;
    }

    setIsSubmittingIssue(true);
    try {
      const chatData = {
        complaint_id: complaint_id,
        type: 'issue',
        title: issueTitle,
        message: issueDescription,
        files: selectedFiles,
      };

      await chatService.createChat(chatData);

      setToast({
        open: true,
        message: "Issue reported successfully",
        type: "success",
      });

      setIssueTitle("");
      setIssueDescription("");
      setSelectedFiles([]);
      fetchChats();
    } catch (error) {
      console.error("Error submitting issue:", error);
      setToast({
        open: true,
        message: "Failed to submit issue",
        type: "error",
      });
    } finally {
      setIsSubmittingIssue(false);
    }
  };

  const handleSubmitExtension = async () => {
    if (!extensionDate || !extensionReason.trim()) {
      setToast({
        open: true,
        message: "Please fill in both date and reason",
        type: "error",
      });
      return;
    }

    setIsSubmittingExtension(true);
    try {
      const chatData = {
        complaint_id: complaint_id,
        type: 'extension',
        extension_date: extensionDate,
        message: extensionReason,
        files: selectedFiles,
      };

      await chatService.createChat(chatData);

      setToast({
        open: true,
        message: "Extension request submitted successfully",
        type: "success",
      });

      setExtensionDate("");
      setExtensionReason("");
      setSelectedFiles([]);
      fetchChats();
    } catch (error) {
      console.error("Error submitting extension request:", error);
      setToast({
        open: true,
        message: "Failed to submit extension request",
        type: "error",
      });
    } finally {
      setIsSubmittingExtension(false);
    }
  };

  // Get total chat count
  const getTotalChatCount = () => {
    return (feedbackChats?.length || 0) + (issueChats?.length || 0) + (extensionChats?.length || 0);
  };
  const expertStatuses = [
    "under_investigation",
    "assigned_to_expert",
    "assigned_to_regional_expert",
    "assigned_to_woreda_expert",
    "assigned_to_zone_expert",
    "teamCase",
  ];
  // Render chat list
const renderChatList = (chats, accentColor) => {
  return (
    <div className="space-y-4 max-h-[450px] overflow-y-auto ">
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div key={chat.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Chat Header */}
         

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
                              <span className="text-xs text-gray-500">
                  {new Date(chat.created_at).toLocaleDateString()}
                </span>
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
                          {user?.name}
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

  // Current media list
  const currentMediaList = mediaFiles[mediaType] || [];
  const currentMedia = currentMediaList[currentMediaIndex];

  // Ensure index stays valid
  // useEffect(() => {
  //   if (currentMediaList.length > 0 && currentMediaIndex >= currentMediaList.length) {
  //     setCurrentMediaIndex(0);
  //   }
  // }, [currentMediaList.length, currentMediaIndex]);
 const latestReturn =
    detail?.case?.caseHasReturn?.length > 0
      ? detail.case.caseHasReturn[detail.case.caseHasReturn.length - 1]
      : null;

  return (
    <>
      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ ...toast, open: false })}
      />

      <div className="min-h-screen">
        <div className="mx-auto px-2">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 p-6">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-3 space-y-8">
              <div
                className="min-h-screen py-2 rounded-3xl"
                style={{ backgroundColor: "#EEEFF6" }}
              >
                <div className="max-w-7xl max-h-4xl overflow-auto mx-auto px-6 space-y-2">
                  {/* Header Section */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold" style={{ color: "#11255AE0" }}>
                        Report ID
                      </h2>
                      <span className="bg-[#387E53] text-white text-sm font-medium px-3 py-1.5 rounded-md shadow-sm">
                        {detail.complaint_code || `${detail.report_id}`}
                      </span>
                    </div>
                    <div className="px-4 py-1.5 rounded-full border border-yellow-500 bg-orange-50 text-slate-800 font-bold capitalize text-sm md:text-base">
                      {detail.status?.replace("_", " ") || "Pending..."}
                    </div>
                  </div>

                  {/* Status Progress Bar */}
  {detail?.case?.status === "Returned" &&(
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
                      <div className="absolute top-[14px] bg-[#387E53] left-[6%] right-[6%] h-[2px]" />
                      <div className="flex justify-between relative">
                        {statusSteps.map((s, i) => {
                          const isActive = i <= safeCurrentStatusIndex;
                          const isReturned = detail?.status === "returned" && s === "investigation_submitted";
                          
                          return (
                            <div key={s} className="flex flex-col items-center w-24 text-center relative">
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

                  {/* Report Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Customer Information */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <h2 className="px-6 pt-4 pb-2 text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Information
                      </h2>
                      <div>
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Full Name</span>
                          <span className="font-medium text-gray-900">
                            {detail.customer?.full_name || "Demeke Abera Siraj"}
                          </span>
                        </div>
                        <div className="mx-6 border-t border-gray-200"></div>
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Phone Number</span>
                          <span className="font-medium text-gray-900">
                            {detail.customer?.phone_number || "0923282347"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Date */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <h2 className="px-6 pt-4 pb-2 text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Report Meta
                      </h2>
                      <div>
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
                        <div className="flex justify-between items-center px-6 py-3 text-sm">
                          <span className="text-gray-600">Reported Date</span>
                          <span className="font-medium text-gray-900">
                            {new Date(detail.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Report Information */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-6 md:mt-12">
                    <div className="flex justify-between items-center px-4 md:px-6 pt-4 pb-2">
                      <h2 className="text-base font-medium leading-none tracking-normal text-[#027BDA]">
                        Report Information
                      </h2>
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
                          <span className="font-medium text-gray-900">
                            {detail.pollution_category?.pollution_category || "—"}
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
                          <span className="font-medium text-gray-900">
                            {detail.sub_pollution_category?.sub_pollution_category || "—"}
                          </span>
                        )}
                      </div>
                      <div className="mx-6 border-t border-gray-200"></div>

                      {/* Location Type */}
                      <div className="px-6 py-3 text-sm">
                        
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-3 mt-2">
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
                          <div className="space-y-1 flex justify-between ">
                            {detail.region?.region_name && (
                              <div className="font-medium text-gray-900">
                                Region
                              <div className="font-medium text-gray-900">

                                {detail.region.region_name}
                              </div>
                              </div>
                            )}
                            {detail.city?.city_name && (
                              <>
                               <div className="font-medium text-gray-900">
                                City
                              </div>
                                <div className="font-medium text-gray-900">
                                 {detail.city.city_name}
                              </div>
                              </>
                             
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
                              <span className="font-medium text-gray-900">
                                {detail.woreda?.woreda_name || "—"}
                              </span>
                            )}
                          </div>
                          <div className="mx-6 border-t border-gray-200"></div>
                        </>
                      )}

                      {/* Description */}
                      <div className="px-4 md:px-6 py-3 text-sm">
                        <span className="text-gray-800 block mb-2 text-lg font-semibold">
                          Description
                        </span>
                        <p className="text-[#959595]">
                          {detail.detail || "No description"}
                        </p>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <div className="px-4 md:px-6 py-4 border-t border-gray-200">
                        <button
                          onClick={handleSave}
                          className="w-full md:w-auto bg-[#387E53] hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                          type="button"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Reported File Section */}
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
                                      className={`transform transition-transform duration-300 ${isReportedFilesCollapsed ? "rotate-0" : "rotate-90"
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
                                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isReportedFilesCollapsed
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
                                          className={`w-2 h-2 rounded-full transition-all ${index === currentMediaIndex
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
                                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === currentMediaIndex
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

              {/* Chat Section */}
             <div className="rounded-2xl p-4 border border-gray-300">
               <div 
                 className="flex items-center justify-between cursor-pointer group"
                 onClick={() => setIsChatCollapsed(!isChatCollapsed)}
               >
                 <div className="flex items-center gap-3">
                   <div className={`transform transition-transform duration-300 ${isChatCollapsed ? 'rotate-0' : 'rotate-90'}`}>
                     <svg 
                       xmlns="http://www.w3.org/2000/svg" 
                       className="h-5 w-5 text-[#387E53]" 
                       fill="none" 
                       viewBox="0 0 24 24" 
                       stroke="currentColor"
                     >
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   </div>
                   <h2 className="text-xl font-semibold text-[#1A3D7D]">
                     Chat & Requests ({getTotalChatCount()})
                   </h2>
                 </div>
                 
               </div>
             
               <div 
                 className={`overflow-hidden transition-all duration-300 ease-in-out ${isChatCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100 mt-4'}`}
               >
                 {/* Category Tabs */}
                 <div className="flex border-b border-gray-200 mb-4">
                   <button
                     className={`px-4 py-2 font-medium text-sm ${activeChatTab === 'feedback' ? 'text-[#387E53] border-b-2 border-[#387E53]' : 'text-gray-500 hover:text-gray-700'}`}
                     onClick={() => setActiveChatTab('feedback')}
                   >
                     Feedback ({feedbackChats.length})
                   </button>
                   <button
                     className={`px-4 py-2 font-medium text-sm ${activeChatTab === 'issue' ? 'text-[#387E53] border-b-2 border-[#387E53]' : 'text-gray-500 hover:text-gray-700'}`}
                     onClick={() => setActiveChatTab('issue')}
                   >
                     Issue Raise ({issueChats.length})
                   </button>
                   <button
                     className={`px-4 py-2 font-medium text-sm ${activeChatTab === 'extension' ? 'text-[#387E53] border-b-2 border-[#387E53]' : 'text-gray-500 hover:text-gray-700'}`}
                     onClick={() => setActiveChatTab('extension')}
                   >
                     Date Extension ({extensionChats.length})
                   </button>
                 </div>
             
                 {/* Chat Content */}
                 <div className="space-y-4">
                   {/* Feedback Form - Only show in feedback tab */}
                   {activeChatTab === 'feedback' && (expertStatuses.includes(caseStatus)) && (
                     <div className="bg-white border border-gray-200 rounded-lg p-4">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Feedback</h3>
                       <div className="space-y-4">
                         {/* Feedback content form */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Feedback Content
                           </label>
                           <textarea
                             value={feedbackContent}
                             onChange={(e) => setFeedbackContent(e.target.value)}
                             placeholder="Enter your feedback here..."
                             className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                             rows={4}
                           />
                         </div>
             
                        
             
                         <div className="flex justify-end gap-2">
                           <button
                             onClick={() => {
                               setFeedbackContent('');
                               setSelectedFiles([]);
                             }}
                             className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                           >
                             Clear
                           </button>
                           <button
                             onClick={async () => {
                               if (!feedbackContent.trim()) {
                                 setToast({
                                   open: true,
                                   message: 'Please enter feedback content',
                                   type: 'error'
                                 });
                                 return;
                               }
             
                               try {
                                 const formData = new FormData();
                                 formData.append('complaint_id', complaint_id);
                                 formData.append('type', 'feedback');
                                 formData.append('content', feedbackContent);
             
                                 selectedFiles.forEach((file, index) => {
                                   formData.append(`files`, file);
                                 });
             
                                 await chatService.createChat(formData);
             
                                 setToast({
                                   open: true,
                                   message: 'Feedback submitted successfully',
                                   type: 'success'
                                 });
             
                                 // Clear form
                                 setFeedbackContent('');
                                 setSelectedFiles([]);
             
                                 // Refresh chats
                                 fetchChats();
                               } catch (error) {
                                 console.error('Error submitting feedback:', error);
                                 setToast({
                                   open: true,
                                   message: 'Failed to submit feedback',
                                   type: 'error'
                                 });
                               }
                             }}
                             className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                             </svg>
                             Submit Feedback
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
             
                   {/* Issue Raise Form - Only for experts */}
                   {activeChatTab === 'issue' && permissions?.includes("expert:can-upload-investigation") && (
                     <div className="bg-white border border-gray-200 rounded-lg p-4">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Raise an Issue</h3>
                       <div className="space-y-4">
                     
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Reason for Issue <span className="text-red-500">*</span>
                           </label>
                           <textarea
                             placeholder="Explain the issue in detail..."
                             className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                             rows={4}
                           />
                         </div>
             
                       
                         
             
                         <div className="flex justify-end gap-2">
                           <button
                             className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                           >
                             Cancel
                           </button>
                           <button
                             className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                           >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                             </svg>
                             Raise Issue
                           </button>
                         </div>
                       </div>
                     </div>
                   )}
             
                   {/* Date Extension Form - Only for experts */}
                {activeChatTab === 'extension' && permissions?.includes("taskForce:can-verify-complaint") && extensionChats.length > 0 && (
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Extension Request Management</h3>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto">
                   {extensionChats
                     .filter(chat => chat.status === 'pending_review')
                     .map((chat) => {
                       // Calculate current deadline based on case countdown
                       const currentDays = detail?.case?.countdown_end_date || 0;
                       const daysRequested = chat.days_requested || 7;
                       const newTotalDays = currentDays + daysRequested;
                       
                       return (
                         <div key={chat.chat_id} className="bg-white p-4 rounded-lg border border-gray-300">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <h4 className="font-medium text-gray-900">{chat.title || 'Extension Request'}</h4>
                               <span className="text-xs text-gray-500">
                                 by {chat.messages?.[0]?.sender?.name || 'Unknown'}
                               </span>
                             </div>
                             <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                               Pending Review
                             </span>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4 mb-4">
                             <div>
                               <p className="text-sm text-gray-600">Current Deadline</p>
                               <p className="font-medium">
                                 {currentDays > 0 
                                   ? `${currentDays} days from now` 
                                   : 'No deadline set'}
                               </p>
                               {currentDays > 0 && (
                                 <p className="text-xs text-gray-500">
                                   {(() => {
                                     const endDate = new Date();
                                     endDate.setDate(endDate.getDate() + currentDays);
                                     return `Ends: ${endDate.toLocaleDateString()}`;
                                   })()}
                                 </p>
                               )}
                             </div>
                             <div>
                               <p className="text-sm text-gray-600">After Extension</p>
                               <p className="font-medium text-green-600">
                                 {newTotalDays} days from now
                               </p>
                               <p className="text-xs text-gray-500">
                                 {(() => {
                                   const endDate = new Date();
                                   endDate.setDate(endDate.getDate() + newTotalDays);
                                   return `Ends: ${endDate.toLocaleDateString()}`;
                                 })()}
                               </p>
                             </div>
                           </div>
                           
                           <div className="mb-4">
                             <p className="text-sm text-gray-600">Days Requested</p>
                             <div className="flex items-center gap-2">
                               <span className="font-medium text-blue-600 text-lg">{daysRequested}</span>
                               <span className="text-gray-600">days</span>
                               <span className="text-xs text-gray-500">(+{daysRequested} days)</span>
                             </div>
                           </div>
                           
                           <div className="mb-4">
                             <p className="text-sm text-gray-600">Reason</p>
                             <div className="bg-gray-50 p-3 rounded-lg mt-1">
                               <p className="text-sm text-gray-800">{chat.reason || chat.messages?.[0]?.content || 'No reason provided'}</p>
                             </div>
                           </div>
                           
                           <div className="flex justify-end gap-2">
               {/* Only show buttons if status is pending_review */}
               {chat.status === 'pending_review' && (
                 <>
                   <button
                     onClick={() => {
                       const reason = prompt('Enter rejection reason (optional):', 'Extension request rejected');
                       if (reason !== null) {
                         handleRejectExtension(chat.chat_id, reason);
                       }
                     }}
                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm transition-colors"
                   >
                     <X className="w-4 h-4" />
                     Reject
                   </button>
                   <button
                     onClick={() => {
                       const comments = prompt('Enter approval comments (optional):', `Extension of ${daysRequested} days approved`);
                       if (comments !== null) {
                         handleApproveExtension(chat.chat_id, comments, daysRequested);
                       }
                     }}
                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm transition-colors"
                   >
                     <Check className="w-4 h-4" />
                     Approve {daysRequested} days
                   </button>
                 </>
               )}
               
               {/* Show status badge if not pending */}
               {chat.status !== 'pending_review' && (
                 <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                   chat.status === 'approved' 
                     ? 'bg-green-100 text-green-800 border border-green-200'
                     : 'bg-red-100 text-red-800 border border-red-200'
                 }`}>
                   {chat.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                 </div>
               )}
             </div>
                         </div>
                       );
                     })}
                 </div>
               </div>
             )}
             
                   {/* Taskforce Action Panel for Issue Raise - Only for taskforce */}
                   {activeChatTab === 'issue' && permissions?.includes("taskForce:can-verify-complaint") && issueChats.length > 0 && (
                     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                       <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Management Panel</h3>
                       <div className="space-y-4">
                         <div className="bg-white p-4 rounded-lg border border-gray-300">
                           <div className="flex items-center justify-between mb-2">
                             <h4 className="font-medium text-gray-900">Active Issue: Material Cracking</h4>
                             <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">High Priority</span>
                           </div>
                           <p className="text-sm text-gray-600 mb-4">
                             Materials showing cracks after 24 hours of installation
                           </p>
                           
                           <div className="flex justify-end gap-2">
                             <button
                               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                               </svg>
                               Reject Issue
                             </button>
                             <button
                               className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                             >
                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                               Approve Resolution
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}
             
                   {/* Taskforce Action Panel for Date Extension - Only for taskforce */}
                   {activeChatTab === 'extension' && permissions?.includes("taskForce:can-verify-complaint") && extensionChats.length > 0 && (
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Extension Request Management</h3>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto">
                   {extensionChats.map((chat) => (
             
                     <div key={chat.chat_id} className="bg-white p-4 rounded-lg border border-gray-300">
                       <div className="flex items-center justify-between mb-2">
                         <h4 className="font-medium text-gray-900">{chat.title || 'Extension Request'}</h4>
                         <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                           {chat.status === 'pending_review' ? 'Pending' : chat.status}
                         </span>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 mb-4">
                         <div>
                           <p className="text-sm text-gray-600">Current Deadline</p>
                           <p className="font-medium">
                             {chat.original_deadline ? new Date(chat.original_deadline).toLocaleDateString() : 'Not specified'}
                           </p>
                         </div>
                         <div>
                           <p className="text-sm text-gray-600">Requested Extension</p>
                           <p className="font-medium">
                             {chat.requested_extension ? new Date(chat.requested_extension).toLocaleDateString() : 'Not specified'}
                           </p>
                         </div>
                       </div>
                       
                       <div className="mb-4">
                         <p className="text-sm text-gray-600">Days Requested</p>
                         <p className="font-medium text-blue-600">{chat.days_requested || 7} days</p>
                       </div>
                       
                       <div className="mb-4">
                         <p className="text-sm text-gray-600">Reason</p>
                         <p className="text-sm">{chat.reason || chat.content || 'No reason provided'}</p>
                       </div>
                       
                       <div className="flex justify-end gap-2">
                         <button
                           onClick={() => handleRejectExtension(chat.chat_id || chat.id, 'Extension rejected')}
                           className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
                         >
                           <X className="w-4 h-4" />
                           Reject Extension
                         </button>
                         <button
                           onClick={() => handleApproveExtension(chat.chat_id || chat.id, 'Extension approved', chat.days_requested || 7)}
                           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                         >
                           <Check className="w-4 h-4" />
                           Approve Extension
                         </button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             
                   {/* Display Chats */}
                   {activeChatTab === 'feedback' && renderChatList(feedbackChats, '#387E53')}
                   {activeChatTab === 'issue' && renderChatList(issueChats, '#DC2626')}
                   {activeChatTab === 'extension' && renderChatList(extensionChats, '#F59E0B')}
                 </div>
               </div>
             </div>

              {/* Case Attachments Timeline */}
              {caseAttachment && caseAttachment.length > 0 && (
                <div className="rounded-2xl p-4 border border-gray-300">
                  <div
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => setIsCaseAttachmentsCollapsed(!isCaseAttachmentsCollapsed)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={!isCaseAttachmentsCollapsed}
                    onKeyDown={(e) => e.key === 'Enter' && setIsCaseAttachmentsCollapsed(!isCaseAttachmentsCollapsed)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`transform transition-transform duration-300 ${isCaseAttachmentsCollapsed ? 'rotate-0' : 'rotate-90'}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-[#387E53]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-[#1A3D7D]">
                        Case Attachments Timeline ({caseAttachment.length})
                      </h3>
                    </div>
                    
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isCaseAttachmentsCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100 mt-4'}`}
                  >
                    <div className="relative border-l-4 border-green-200 pl-6 md:pl-8 space-y-4 md:space-y-6 max-h-[300px] overflow-y-auto pr-2">
                      {caseAttachment
                        ?.slice()
                        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0))
                        .map((attachment, index) => {
                          const { preview, isTruncated } = truncateWords(
                            attachment.description || "",
                            8
                          );

                          const isExpanded = expandedIndex === index;
                          const type = getAttachmentType(attachment.file_path || attachment.file_name);

                          return (
                            <div key={index} className="relative group">
                              {/* Step Number */}
                              <div className="absolute -left-4 md:-left-5 top-3">
                                <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-white border-2 border-green-500 text-green-600 font-bold shadow-md text-sm md:text-base">
                                  {index + 1}
                                </div>
                              </div>

                              {/* Card */}
                              <div className="flex flex-col md:flex-row md:justify-between md:items-start p-3 md:p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all">
                                {/* Content */}
                                <div className="flex-1 pr-2 md:pr-4">
                                  <button
                                    onClick={() => handleViewAttachment(attachment)}
                                    className="text-sm md:text-md font-semibold text-gray-800 hover:underline text-left flex items-center gap-2"
                                    type="button"
                                  >
                                    <span>Case Attachment {index + 1}</span>
                                    <span className="text-green-600">({type})</span>
                                    {attachment.file_size && (
                                      <span className="text-xs text-gray-500">
                                        ({formatFileSize(attachment.file_size)})
                                      </span>
                                    )}
                                  </button>

                                  {attachment.description && (
                                    <p className="text-xs md:text-sm text-gray-600 mt-1 leading-relaxed">
                                      {isExpanded ? attachment.description : preview}
                                      {isTruncated && (
                                        <button
                                          type="button"
                                          onClick={() => setExpandedIndex(isExpanded ? null : index)}
                                          className="text-green-600 ml-2 font-medium hover:underline"
                                        >
                                          {isExpanded ? "Show less" : "Show more"}
                                        </button>
                                      )}
                                    </p>
                                  )}

                                  {attachment.created_at && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(attachment.created_at).toLocaleString()}
                                    </p>
                                  )}

                                  {attachment.isFinal && (
                                    <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                      Final Submission
                                    </span>
                                  )}
                                </div>

                                {/* Icons */}
                                <div className="flex gap-3 mt-2 md:mt-0">
                                  <button
                                    onClick={() => handleViewAttachment(attachment)}
                                    className="p-1 md:p-0"
                                    title="View"
                                    type="button"
                                  >
                                    <Eye className="w-4 h-4 md:w-5 md:h-5 text-green-600 hover:scale-110 transition-transform" />
                                  </button>
                                  {detail?.case?.case_investigation?.[0]?.status !== "final" && (
                                    <button
                                      onClick={() => setAttachmentToDelete(attachment)}
                                      className="p-1 md:p-0"
                                      title="Delete"
                                      type="button"
                                    >
                                      <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-600 hover:scale-110 transition-transform" />
                                    </button>
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
    


      {/* Unified Full-Screen View Modal */}
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
    </>
  );
}