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
import chatService from "../../services/chat.service.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/TeamAssignementModal.jsx";
import userService from "../../services/user.service.js";
import RegionalWorkFlow from "../../services/regionalWorkflow.service.js";
import RegionService from "../../services/region.service.js";
import baseDataService from "../../services/basedata.service.js";
import {
  Eye,
  Trash2,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
} from "lucide-react";
import sample_trash from "../../assets/sample_trash.jpeg";
import FilterTab from "../../components/Form/FilterTab.jsx";
import VoicePlayer from "../../components/VoicePlayer/VoicePlayer.jsx";
import AssignModal from "../../components/Modal/AssignModal.jsx";
import { QRCodeSVG } from "qrcode.react";

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

  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [isReturnReasonCollapsed, setIsReturnReasonCollapsed] = useState(false)

  const [timeLeft, setTimeLeft] = useState(detail?.case?.remaining_days);
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [activity, setActivity] = useState("");
  const isReturned = detail?.status === "returned";
  const isRejected = detail?.status === "Rejected";
  const [isFinal, setIsFinal] = useState(() => {
    if (isReturned) return false;

    return detail?.case?.case_investigation?.[0]?.status === "final";
  });
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

  const [zoneOptions, setZoneOptions] = useState([]);
  const [subcityOptions, setSubcityOptions] = useState([]);
  const [woredaOptions, setWoredaOptions] = useState([]);
  const [expertType, setExpertType] = useState("regional"); // "regional" or "hq"

  const closeModal = () => {
    setIsExpanded(false);
    setTimeout(() => setScale(1), 200);
  };
  const [additionalDescription, setAdditionalDescription] = useState("")

  // State for chat functionality
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [isTeamMembersCollapsed, setIsTeamMembersCollapsed] = useState(true);
  const [isActivityLogCollapsed, setIsActivityLogCollapsed] = useState(true);
  const [closingFile, setClosingFile] = useState(null);
  const [activeChatTab, setActiveChatTab] = useState("feedback");
  const [loadingChats, setLoadingChats] = useState(false);
  const [feedbackChats, setFeedbackChats] = useState([]);
  const [issueChats, setIssueChats] = useState([]);
  const [extensionChats, setExtensionChats] = useState([]);
  const [openCloseModal,setOpenCloseModal] = useState(false);
  // State for feedback form
  const [feedbackContent, setFeedbackContent] = useState("");
  const [issueContent, setIssueContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [closingDescription, setClosingDescription] = useState("");

  const fetchChats = async () => {
    if (!complaint_id) {
      return;
    }

    setLoadingChats(true);
    try {
      const response = await chatService.getChatsByComplaint(complaint_id);


      // Check if the response structure is correct
      if (!response || !response.success) {
        console.error("API returned error:", response?.message);
        throw new Error(response?.message || "Failed to fetch chats");
      }

      const chats = response.data;


      // Filter chats by type - with null checks
      const feedback = Array.isArray(chats)
        ? chats.filter((chat) => chat.type === "feedback")
        : [];
      const issues = Array.isArray(chats)
        ? chats.filter((chat) => chat.type === "issue")
        : [];
      const extensions = Array.isArray(chats)
        ? chats.filter((chat) => chat.type === "extension")
        : [];



      setFeedbackChats(feedback);
      setIssueChats(issues);
      setExtensionChats(extensions);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [complaint_id]);

  const [isReassigning, setIsReassigning] = useState(false);
  // Add this useEffect after your other useEffect hooks
  // Initialize reassign form data when detail changes
  useEffect(() => {
    if (detail) {
      setReassignFormData({
        detail: detail?.detail || "",
        location_url: detail?.location_url || "",
        specific_address: detail?.specific_address || "",

        pollution_category_id: detail.pollution_category_id || null,
        subpollution_category_id: detail.sub_pollution_category_id || null,
        region_id: isRegionMode ? detail.region_id || null : null,
        city_id: isCityMode ? detail.city_id || null : null,
        zone_id: isRegionMode ? detail.zone_id || null : null,
        subcity_id: isCityMode ? detail.subcity_id || null : null,
        woreda_id: detail.woreda_id || null,
      });
    }
  }, [detail]);

  const getTotalChatCount = () => {
    return feedbackChats.length + issueChats.length + extensionChats.length;
  };
  useEffect(() => {
    const countdownDays = detail?.case?.countdown_end_date; // This is number of days, not a date

    if (!countdownDays || typeof countdownDays !== "number") {

      if (detail?.case?.remaining_days?.daysLeft !== undefined) {
        const days = detail?.case.remaining_days?.daysLeft;
        const hours = detail?.case.remaining_days?.hoursLeft || 0;
        const minutes = detail?.case.remaining_days?.minutesLeft || 0;
        const seconds = detail?.case.remaining_days?.secondsLeft || 0;

        const totalSeconds =
          days * 86400 + hours * 3600 + minutes * 60 + seconds;

        if (totalSeconds > 0) {
          let remainingSeconds = totalSeconds;

          const interval = setInterval(() => {
            remainingSeconds--;

            if (remainingSeconds <= 0) {
              setTimeLeft({ isExpired: true });
              clearInterval(interval);
              return;
            }

            const daysLeft = Math.floor(remainingSeconds / 86400);
            const hoursLeft = Math.floor((remainingSeconds % 86400) / 3600);
            const minutesLeft = Math.floor((remainingSeconds % 3600) / 60);
            const secondsLeft = remainingSeconds % 60;
            setTimeLeft({
              daysLeft,
              hoursLeft,
              minutesLeft,
              secondsLeft,
              isExpired: false,
              totalSeconds: remainingSeconds,
            });
          }, 1000);

          return () => clearInterval(interval);
        }
      }
      return;
    }


    // Calculate end date from current date + countdown days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + countdownDays);

    // Store the original days for reference
    const originalDays = countdownDays;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        setTimeLeft({
          daysLeft: 0,
          hoursLeft: 0,
          minutesLeft: 0,
          secondsLeft: 0,
          isExpired: true,
          originalDays: originalDays,
          endDate: endDate,
        });
        clearInterval(interval);
        return;
      }

      const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutesLeft = Math.floor((diff / (1000 * 60)) % 60);
      const secondsLeft = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        daysLeft,
        hoursLeft,
        minutesLeft,
        secondsLeft,
        isExpired: false,
        originalDays: originalDays,
        endDate: endDate,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [detail?.case?.countdown_end_date, detail?.case?.remaining_days]);
  console.log("timeLeft", timeLeft);
  // Add near your other state declarations
  const [investigationStarted, setInvestigationStarted] = useState(false);
  const [investigationDays, setInvestigationDays] = useState(0);

  // Add this useEffect to track investigation start
  useEffect(() => {
    if (detail?.case?.case_investigation?.length > 0) {
      // Find the earliest investigation date
      const investigationDates = detail.case.case_investigation
        .map(inv => new Date(inv.created_at))
        .filter(date => !isNaN(date.getTime()));

      if (investigationDates.length > 0) {
        const earliestDate = new Date(Math.min(...investigationDates));
        setInvestigationStarted(true);

        // Calculate days since investigation started
        const today = new Date();
        const timeDiff = today.getTime() - earliestDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        setInvestigationDays(daysDiff);
      }
    } else {
      setInvestigationStarted(false);
      setInvestigationDays(0);
    }
  }, [detail?.case?.case_investigation]);

  const handleReasonChange = (e) => {
    const selectedId = e.target.value;
    setSelectedRejectionReason(selectedId);

    const selectedReason = rejectionReasons?.data?.find(
      (r) => r.rejection_reason_id === selectedId
    );

    setAdditionalDescription(selectedReason?.description || "");
  };
  const handleReassignIssue = async (chatId) => {
    setReassignChatId(chatId);
    setIsReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!reassignChatId) return;

    setIsReassigning(true);
    try {
      const comments = prompt("Enter reassignment reason/comments:");
      if (comments === null) {
        setIsReassigning(false);
        return;
      }

      // First, update the complaint with new data
      const complaintUpdateResult = await complaintService.updateComplaint(
        complaint_id,
        {
          detail: reassignFormData.detail,
          location_url: reassignFormData.location_url,
          specific_address: reassignFormData.specific_address,
          pollution_category_id: reassignFormData.pollution_category_id,
          subpollution_category_id: reassignFormData.subpollution_category_id,
          region_id: reassignFormData.region_id,
          city_id: reassignFormData.city_id,
          zone_id: reassignFormData.zone_id,
          subcity_id: reassignFormData.subcity_id,
          woreda_id: reassignFormData.woreda_id,
        }
      );

      if (!complaintUpdateResult.success) {
        throw new Error("Failed to update complaint");
      }

      // Then, call the reassign API
      const response = await chatService.reassignChat(reassignChatId, {
        action: 'reassign',
        comments,
        updated_complaint: reassignFormData
      });

      if (response.success) {
        setToast({
          open: true,
          message: 'Issue reassigned successfully. Report is now editable.',
          type: 'success'
        });

        // Close modal
        setIsReassignModalOpen(false);
        setReassignChatId(null);

        // Refresh data
        fetchChats();
        loadData?.();
      } else {
        throw new Error(response.message || "Failed to reassign issue");
      }
    } catch (error) {
      console.error('Error reassigning issue:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || error.message || 'Failed to reassign issue',
        type: 'error'
      });
    } finally {
      setIsReassigning(false);
    }
  };

  const handleRejectIssue = async (chatId) => {
    try {
      const reason = prompt("Enter rejection reason:");
      if (reason === null) return;

      await chatService.rejectChat(chatId, {
        action: 'reject',
        comments: reason
      });

      setToast({
        open: true,
        message: "Issue rejected successfully",
        type: "success"
      });

      fetchChats();
      loadData?.();
    } catch (error) {
      console.error("Error rejecting issue:", error);
      setToast({
        open: true,
        message: error.response?.data?.message || "Failed to reject issue",
        type: "error"
      });
    }
  };

  // Add these functions with your other handlers
  const handleReassignChange = (name, value) => {
    setReassignFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReassignLocationChange = (type, value) => {
    if (type === 'pollution_category_id') {
      setReassignFormData(prev => ({
        ...prev,
        pollution_category_id: value,
        subpollution_category_id: '' // Reset subcategory when main category changes
      }));
    } else {
      setReassignFormData(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };
  const renderChatList = (chats, accentColor) => {
    const [selectedCaseId, setSelectedCaseId] = useState(null)
    console.log("detail.location_url", detail.location_url)
    return (
      <div className="space-y-4 max-h-[450px] overflow-y-auto">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat.id || chat.chat_id}
              onClick={() => setSelectedCaseId(chat.chat_id)}
              className={`bg-white rounded-lg overflow-hidden cursor-pointer transition
              ${selectedCaseId === chat.chat_id
                  ? "border-2 border-blue-500 ring-2 ring-blue-100"
                  : "border border-gray-200"
                }`}
            >
              {/* Chat Messages */}
              <div className="border-t border-gray-100">
                <div className="max-h-96 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {chat.messages?.map((message) => (
                      <div
                        key={message.id || message.message_id}
                        className={`flex gap-3 ${message.sender_id === currentUserId
                            ? "flex-row-reverse"
                            : ""
                          }`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{
                              backgroundColor:
                                message.sender_id === currentUserId
                                  ? "#1A3D7D"
                                  : message.sender?.id === 2
                                    ? "#387E53"
                                    : message.sender?.id === 3
                                      ? "#7C3AED"
                                      : "#F59E0B",
                            }}
                          >
                            {message.sender?.name?.charAt(0) || "U"}
                          </div>
                        </div>

                        {/* Message */}
                        <div
                          className={`max-w-[70%] ${message.sender_id === currentUserId
                              ? "items-end"
                              : ""
                            }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {message.sender?.name || "Unknown User"}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                message.created_at || message.timestamp
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {chat.type === "issue" && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                Issue Report
                              </span>
                            )}
                            {chat.type === "extension" && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Extension Request
                              </span>
                            )}
                          </div>

                          <div
                            className={`p-3 rounded-2xl ${message.sender_id === currentUserId
                                ? "bg-[#1A3D7D] text-white rounded-tr-none"
                                : "bg-gray-100 text-gray-800 rounded-tl-none"
                              }`}
                          >
                            <p className="text-sm">{message.content}</p>

                            {message.attachments && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {message.attachments.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${message.sender_id === currentUserId
                                        ? "bg-blue-800 text-blue-100"
                                        : "bg-gray-200 text-gray-700"
                                      }`}
                                  >
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

                {/* Footer */}
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <div className="flex items-center justify-between">
                    {/* Participants */}


                    {/* Status + Actions */}
                    <div className="flex items-center gap-3">
                      {/* Actions ONLY for selected case */}
                      {isTaskForce &&
                        chat.type === "issue" &&
                        (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReassignIssue(chat.chat_id)
                              }}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                            >
                              Reassign
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRejectIssue(chat.chat_id)
                              }}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                      <span
                        className={`text-xs px-2 py-1 rounded-full ${chat.status === "resolved" ||
                            chat.status === "approved" ||
                            chat.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : chat.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : chat.status === "reassigned"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {chat.status === "pending_review"
                          ? "Pending Review"
                          : chat.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    {isTaskForce &&
                      chat.type === "issue" &&
                      selectedCaseId === chat.chat_id &&
                      <div className="flex items-center gap-3">
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
                      </div>}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No {activeChatTab.replace("_", " ")} conversations yet</p>
          </div>
        )}
      </div>
    )
  }


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

        // Regions
        const regionRes = await RegionService.getAllRegions();
        if (regionRes) setRegionOptions(regionRes);

        // Cities
        const cityRes = await baseDataService.CityService.getAllCities();
        if (cityRes) setCityOptions(cityRes);

        // Subcities (your API returns { subcity_id, name, city, ... })
        const subcityRes =
          await baseDataService.SubcityService.getAllSubcities(); // adjust service name
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

  // Add these state variables near your other state declarations
  const [issueForm, setIssueForm] = useState({
    title: "",
    reason: "",
    severity: "medium",
    files: [],
  });

  const [extensionForm, setExtensionForm] = useState({
    reason: "",
    extendedDate: "",
    daysRequested: 7,
    files: [],
  });

  // Get both sets of logs
  const caseLogs = detail?.activity_logs || [];
  const complaintLogs = detail?.case?.activity_logs || []; // or detail?.complaint?.activity_logs

  const mergedLogs = [...caseLogs, ...complaintLogs].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  // Add these handlers
  const handleIssueSubmit = async () => {
    if (!issueForm.title.trim() || !issueForm.reason.trim()) {
      setToast({
        open: true,
        message: "Please fill all required fields",
        type: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("complaint_id", complaint_id);
      formData.append("type", "issue");
      formData.append("title", issueForm.title);
      formData.append("content", issueForm.reason);
      formData.append("severity", issueForm.severity);

      issueForm.files.forEach((file) => {
        formData.append("files", file);
      });

      await chatService.createChat(formData);

      setToast({
        open: true,
        message: "Issue raised successfully",
        type: "success",
      });

      // Clear form
      setIssueForm({
        title: "",
        reason: "",
        severity: "medium",
        files: [],
      });

      // Refresh chats
      fetchChats();
    } catch (error) {
      console.error("Error raising issue:", error);
      setToast({
        open: true,
        message: "Failed to raise issue",
        type: "error",
      });
    }
  };

  const handleExtensionSubmit = async () => {

    try {
      const formData = new FormData();
      formData.append("complaint_id", complaint_id);
      formData.append("type", "extension");
      formData.append("title", extensionForm.title);
      formData.append("content", extensionForm.reason);
      formData.append("new_deadline", new Date());

      formData.append("days_requested", extensionForm.daysRequested);

      extensionForm.files.forEach((file) => {
        formData.append("files", file);
      });

      await chatService.createChat(formData);

      setToast({
        open: true,
        message: "Extension requested successfully",
        type: "success",
      });

      // Clear form
      setExtensionForm({
        title: "",
        reason: "",
        newDeadline: "",
        daysRequested: 7,
        files: [],
      });

      // Refresh chats
      fetchChats();
    } catch (error) {
      console.error("Error requesting extension:", error);
      setToast({
        open: true,
        message: "Failed to request extension",
        type: "error",
      });
    }
  };

  const handleApproveExtension = async (
    chatId,
    comments = "",
    daysRequested = 7
  ) => {
    try {
      // Find the chat
      const chat = extensionChats.find(
        (c) => c.chat_id === chatId || c.id === chatId
      );

      if (!chat) return;

      const chatIdToUse = chat.chat_id || chat.id;

      // Update local state immediately to reflect the change
      setExtensionChats((prev) =>
        prev.map((c) =>
          c.chat_id === chatIdToUse || c.id === chatIdToUse
            ? { ...c, status: "approved" }
            : c
        )
      );

      // Call the API
      const newDeadline = new Date();
      newDeadline.setDate(newDeadline.getDate() + daysRequested);

      await chatService.approveExtension(
        chatIdToUse,
        comments,
        newDeadline.toISOString()
      );

      setToast({
        open: true,
        message: `Extension approved. ${daysRequested} days added to deadline.`,
        type: "success",
      });

      // Optionally refresh to get server confirmation
      await fetchChats();
      await loadData();
    } catch (error) {
      console.error("Error approving extension:", error);
      setToast({
        open: true,
        message: error.response?.data?.message || "Failed to approve extension",
        type: "error",
      });

      // Revert state on error
      setExtensionChats((prev) =>
        prev.map((c) =>
          c.chat_id === chatId || c.id === chatId
            ? { ...c, status: "pending_review" }
            : c
        )
      );
    }
  };

  const handleRejectExtension = async (chatId, comments = "") => {
    try {
      // Find the chat
      const chat = extensionChats.find(
        (c) => c.chat_id === chatId || c.id === chatId
      );

      if (!chat) return;

      const chatIdToUse = chat.chat_id || chat.id;

      // Update local state immediately
      setExtensionChats((prev) =>
        prev.map((c) =>
          c.chat_id === chatIdToUse || c.id === chatIdToUse
            ? { ...c, status: "rejected" }
            : c
        )
      );

      // Call the API
      await chatService.rejectExtension(chatIdToUse, comments);

      setToast({
        open: true,
        message: "Extension rejected",
        type: "success",
      });

      // Refresh chats
      await fetchChats();
    } catch (error) {
      console.error("Error rejecting extension:", error);
      setToast({
        open: true,
        message: error.response?.data?.message || "Failed to reject extension",
        type: "error",
      });

      // Revert state on error
      setExtensionChats((prev) =>
        prev.map((c) =>
          c.chat_id === chatId || c.id === chatId
            ? { ...c, status: "pending_review" }
            : c
        )
      );
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
  const allAttachments = detail?.attachments
    ? Array.isArray(detail.attachments)
      ? detail.attachments
      : [detail.attachments]
    : [];

  const mediaCounts = {
    image: allAttachments.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file.file_name || file.filename || file.path || file.url)).length,
    video: allAttachments.filter(file => /\.(mp4|mov|avi|mkv)$/i.test(file.file_name || file.filename || file.path || file.url)).length,
    voice: allAttachments.filter(file => /\.(mp3|wav|ogg)$/i.test(file.file_name || file.filename || file.path || file.url)).length,
  };




  // Data
  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignMenuOpen, setAssignMenuOpen] = useState(false);
  const assignMenuRef = useRef(null);
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

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [selectedRejectionReason, setSelectedRejectionReason] = useState("");
  const [rejectionDescription, setRejectionDescription] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

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

  // Close assign menu when clicking outside
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
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext))
      return "image";
    if (["mp4", "avi", "mov", "wmv", "mkv", "webm"].includes(ext))
      return "video";
    if (["mp3", "wav", "m4a", "aac", "ogg"].includes(ext)) return "audio";
    if (["pdf", "doc", "docx", "xls", "xlsx"].includes(ext)) return "document";
    return "unknown";
  };



  const handleViewAttachment = (attachment) => {
    const filePath = getAttachmentUrl(
      attachment.file_path || attachment.file_name
    );
    const type = getAttachmentType(
      attachment.file_path || attachment.file_name
    );
    const url = getAttachmentUrl(filePath)
      .replace(/\\/g, "/")
      .replace(/\/public\//g, "/")
      .replace(/\/complaint\//g, "/");

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
  const [totalAttachments, setTotalAttachments] = useState(0);
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

  const token = localStorage.getItem("token");
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPermissions(decoded.permissions || []);
        setLoggedInUserHierarchy(decoded.organization_hierarchy_id);
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
          userService.getAllExperts(),
          userService.getOrganizationHierarchy(),
        ]);

        // Handle different response structures
        let usersData = [];
        if (usersRes) {
          if (Array.isArray(usersRes)) {
            usersData = usersRes;
          } else if (usersRes.data && Array.isArray(usersRes.data)) {
            usersData = usersRes.data;
          } else if (usersRes.data) {
          }
        }

        let hierarchyData = [];
        if (hierarchyRes) {
          if (Array.isArray(hierarchyRes)) {
            hierarchyData = hierarchyRes;
          } else if (hierarchyRes.data && Array.isArray(hierarchyRes.data)) {
            hierarchyData = hierarchyRes.data;
          } else if (hierarchyRes.data) {

          }
        }

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

  const filteredDepartments = departments
    ?.filter((d) =>
      d.name?.toLowerCase().includes(departmentSearch.toLowerCase())
    )
    .map((d) => ({ value: d.id, label: d.name }));

  const [isReportedFilesCollapsed, setIsReportedFilesCollapsed] = useState(false);
  const [isFeedbackCollapsed, setIsFeedbackCollapsed] = useState(true);
  const [isAttachmentsCollapsed, setIsAttachmentsCollapsed] = useState(true);
  const [isExtensionManagementCollapsed, setIsExtensionManagementCollapsed] =
    useState(false);

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
  const [selectedRegionCity, setSelectedRegionCity] = useState("");
  const [selectedSubcity, setSelectedSubcity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedSubcityZone, setSelectedSubcityZone] = useState("");
  const [selectedWoreda, setSelectedWoreda] = useState("");
  const getExperts = async () => {
    try {
      const res = await reportService.getExpertsByHierarchyId();
      setExperts(res);
      setRegionalExperts(res?.experts);
    } catch { }
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

  console.log(filteredCities, "filteredCities ")
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
    "closed",
  ];
  // Normalize function to compare statuses ignoring case
  const normalizeStatus = (status) => status?.toLowerCase() || "";

  // Determine current status index
  let currentStatusIndex = statusSteps.findIndex((step) => {
    // For Rejected, mark "Under Review" as the active step
    if (normalizeStatus(detail?.status) === "rejected" && step === "Under Review") {
      return true;
    }

    // For returned, mark "investigation_submitted" as active
    if (normalizeStatus(detail?.status) === "returned" && step === "investigation_submitted") {
      return true;
    }

    // Normal matching
    return normalizeStatus(step) === normalizeStatus(detail?.status);
  });

  // Fallback if not found
  if (currentStatusIndex === -1) currentStatusIndex = 0;

  if (
    detail?.status === "Verified" &&
    detail?.handling_unit === "temporary_team"
  ) {
    currentStatusIndex = statusSteps.indexOf("under_investigation");
  }

  const isRegionMode = !!formData?.region_id;
  const isCityMode = !!formData?.city_id;

  const handleSend = async () => {
    if (files.length === 0) {
      return setToast({
        open: true,
        type: "error",
        message: "Please attach at least one file.",
      });
    }

    if (!activity.trim()) {
      return setToast({
        open: true,
        type: "error",
        message: "Please enter your activity.",
      });
    }

    const reportData = { files, description: activity, isFinal };

    const result = await caseService.submitExpertReport(
      detail?.case?.case_id,
      reportData
    );

    if (!result.success) {
      return setToast({
        open: true,
        type: "error",
        message: "Failed to submit report.",
      });
    }

    setToast({
      open: true,
      type: "success",
      message: "Report submitted successfully!",
    });

    if (isFinal && detail?.status === "returned") {
      return navigate("/report-update-form", {
        state: {
          case_id: detail?.case?.case_id,
          report_type_id:
            detail?.sub_pollution_category?.report_types?.report_type_id,
          reportSubmission: detail?.case?.reportSubmissions, // OLD DATA
        },
      });
    }

    /* --------------------------------------------------
     🆕 NORMAL FLOW → CREATE NEW REPORT
  -------------------------------------------------- */

    if (isFinal && detail?.status !== "returned") {
      return navigate("/report-fill-form", {
        state: {
          report_type_id:
            detail?.sub_pollution_category?.report_types?.report_type_id,
          case_id: detail?.case?.case_id,
        },
      });
    }

    /* --------------------------------------------------
     RESET FORM (NON-FINAL)
  -------------------------------------------------- */

    setFiles([]);
    setActivity("");
    setIsFinal(false);
    await loadExpertData?.();
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

  // Keep leader selection in sync when users are removed
  useEffect(() => {
    if (leaderUserId && !teamFormData.expert.includes(leaderUserId)) {
      setLeaderUserId(null);
    }
  }, [teamFormData.expert, leaderUserId]);

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

    if (!leaderUserId || !validUsers.includes(leaderUserId)) {
      setToast({ open: true, type: "error", message: "Exactly one leader is required." });
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
      // Build users payload marking leader
      const usersPayload = validUsers.map((id) => ({ user_id: id, is_team_leader: id === leaderUserId }));

      const result = await caseService.createTeam({
        complaint_id,
        handling_unit: handlingUnit,
        is_Team_Formation_needed,
        users: usersPayload,
        formed_by: currentUserId,
      });

      if (result.success) {
        setToast({
          open: true,
          type: "success",
          message: result.message || "Team created successfully!",
        });

        setIsAssignTeamModalOpen(false);
        setTeamFormData({ department: "", expert: [], description: "" });
        setSubmitAttempted(false);
        setLeaderUserId(null);
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

      const response = await reportService.rejectComplaint(
        detail?.complaint_id,
        payload
      );

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
        console.log("reasons", reasons)
        setRejectionReasons(reasons);
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
  }, [isRejectModalOpen]);
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
      const res = await complaintService.chooseHandlingUnit(
        detail?.complaint_id,
        {
          handling_unit: handlingUnit,
          is_team_formation_needed: isTeamFormationNeeded,
        }
      );
      if (res?.success === true) {
        setToast({
          open: true,
          message: "Report verified and assigned!",
          type: "success",
        });
      }

      setIsModalOpen(false);
      loadData?.();
    } catch {
      setIsModalOpen(false);

      setToast({
        open: true,
        message:
          "Complaint cannot be verified because pollution subcategory is not assigned",
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
      type: "complaint_authorization",
    };

    return JSON.stringify(qrData);
  };
  const handleAuthorize = async () => {
    if (!complaint_id) {
      setToast({
        open: true,
        message: "Complaint ID is missing",
        type: "error",
      });
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
          message:
            response.message ||
            "Complaint authorized successfully. QR Code generated!",
          type: "success",
        });

        // Show QR code automatically
        setShowQRCode(true);

        // Refresh the data
        loadData?.();
      } else {
        setToast({
          open: true,
          message: response.message || "Failed to authorize complaint",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Authorization error:", error);
      setToast({
        open: true,
        message: "An error occurred while authorizing the complaint",
        type: "error",
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

  const investigationStatus = detail?.case?.case_investigation?.[0]?.status;

  const caseStatus = detail?.case?.status;

  const hasUploadPermission =
    permissions?.includes("expert:can-upload-investigation");
  const normalStatuses = [
    "under_investigation",
    "assigned_to_expert",
    "assigned_to_regional_expert",
    "assigned_to_woreda_expert",
    "assigned_to_zone_expert",
    "teamCase",
    "Returned",
  ];
  const expertStatuses = [
    "under_investigation",
    "assigned_to_expert",
    "assigned_to_regional_expert",
    "assigned_to_woreda_expert",
    "assigned_to_zone_expert",
    "teamCase",
  ];
  console.log("investigationStatus", investigationStatus)
  const canUpload =
    hasUploadPermission &&
    (normalStatuses.includes(caseStatus) || detail?.case?.is_opened) &&
    investigationStatus !== "final";
  console.log("currentUserId", currentUserId)
  console.log("detailllllllll", detail?.case?.teamCase)
  const canUploadForThisUnit =
    canUpload ||
    detail?.case?.teamCase.some(
      (member) => member.user_id === currentUserId && member.is_team_leader
    );
const handleClose = async () => {
  try {
    const formData = new FormData();

    if (closingFile) {
      formData.append("files", closingFile);
    }

    formData.append("description", closingDescription);

    await reportService.closeComplaint(
      detail?.complaint_id,
      formData
    );

    setToast({
      open: true,
      message: "Report closed successfully!",
      type: "success",
    });

    setOpenCloseModal(false);
    setClosingFile(null);
    setClosingDescription("");
    loadData?.();

  } catch (error) {
    console.error(error);
    setToast({
      open: true,
      message: "Failed to close report",
      type: "error",
    });
  }
};

  const currentMediaList = mediaFiles[mediaType] || [];
  const currentMedia = currentMediaList[currentMediaIndex];

  const isComplaintAuthorized = detail.status?.toLowerCase() === "authorized";
  const canShowQRCode = isComplaintAuthorized && qrCodeData;
  const isRegionalReturn =
    detail?.handling_unit === "regional_team" &&
    detail.status === "investigation_submitted" &&
    permissions.includes("region:can-review-investigation");

  console.log("latestReturn".latestReturn)


  const isExpert = permissions?.includes("expert:can-upload-investigation");

  const isTaskForce = permissions?.includes("taskForce:can-verify-complaint");

  const hasCaseAttachments = caseAttachment && caseAttachment.length > 0;
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignChatId, setReassignChatId] = useState(null);
  const [reassignFormData, setReassignFormData] = useState({
    detail: detail?.detail || "",
    location_url: detail?.location_url || "",
    specific_address: detail?.specific_address || "",

    pollution_category_id: detail.pollution_category_id || null,
    subpollution_category_id: detail.sub_pollution_category_id || null,
    region_id: isRegionMode ? detail.region_id || null : null,
    city_id: isCityMode ? detail.city_id || null : null,
    zone_id: isRegionMode ? detail.zone_id || null : null,
    subcity_id: isCityMode ? detail.subcity_id || null : null,
    woreda_id: detail.woreda_id || null,
  });
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
                      <div
                        ref={assignMenuRef}
                        className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg z-50"
                      >
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
                        <button
                          onClick={() => {
                            assignZoneOrCity("zone/city");
                            setAssignMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <MapPin className="w-4 h-4 text-slate-700" />
                          <span>Assign to Zone/city</span>
                        </button>
                        <button
                          onClick={() => {
                            setExpertType("regional");

                            const r =
                              formData?.region_id ??
                              detail?.case?.region_id ??
                              detail?.region_id ??
                              "";
                            const c =
                              formData?.city_id ??
                              detail?.case?.city_id ??
                              detail?.city_id ??
                              "";
                            const sc =
                              formData?.subcity_id ??
                              detail?.case?.subcity_id ??
                              detail?.subcity_id ??
                              "";
                            const z =
                              formData?.zone_id ??
                              detail?.case?.zone_id ??
                              detail?.zone_id ??
                              "";
                            const w =
                              formData?.woreda_id ??
                              detail?.case?.woreda_id ??
                              detail?.woreda_id ??
                              "";

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
              {!isComplaintAuthorized && (
                <>
                  {permissions.includes("deputyDirector:approve_and_reject") ||
                    (permissions.includes("region:can-review-investigation") &&
                      detail.status === "investigation_submitted" && (
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
                      ))}
                </>
              )}
            </div>
            {/* )} */}
            {detail?.case?.reportSubmissions?.penalitySubCategory?.issue_type &&
              detail?.status === "closed" && (
                <div className="flex items-center gap-3 bg-[gray-50] border border-[#387E53] rounded-lg px-4 py-2">
                  <span className="text-sm font-semibold  text-[#387E53] whitespace-nowrap">
                    Closed By
                  </span>

                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {
                      detail.case.reportSubmissions.penalitySubCategory
                        .issue_type
                    }
                  </span>
                </div>
              )}

            {permissions.includes("taskForce:can-verify-complaint") &&
              detail.status?.toLowerCase() === "authorized" && (
                <>
                  <button
                    onClick={() => setOpenCloseModal(true)}
                    className="bg-[#387E53] hover:bg-green-800 text-white px-6 py-3 rounded-md font-medium flex items-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" /> Close
                  </button>
                  <button
                    onClick={handleReturn}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Return
                  </button>

                </>)}
            {timeLeft &&
              (
                detail?.case?.status === "under_investigation" ||
                detail?.case?.status === "assigned_to_expert" ||
                detail?.case?.status === "assigned_to_woreda_expert" ||
                detail?.case?.status === "assigned_to_zone_city_expert" ||
                detail?.case?.status === "assigned_to_regional_expert" ||
                detail?.case?.status === "teamCase" ||
                detail?.case?.status === "Returned"
              ) && (
                <div className="mt-2 flex flex-col border rounded-2xl p-2 items-start">

                  <div className="flex justify-between items-center w-full ">
                    <span className="text-base font-medium text-gray-700">
                      Time left for investigation
                    </span>

                    {!timeLeft.isExpired && (
                      <div className="flex gap-3">
                        {[
                          { value: timeLeft.daysLeft || 0, label: "Days" },
                          { value: timeLeft.hoursLeft || 0, label: "Hours" },
                          { value: timeLeft.minutesLeft || 0, label: "Minutes" },
                          { value: timeLeft.secondsLeft || 0, label: "Seconds" },
                        ].map((unit, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col items-center justify-center bg-gray-100 text-gray-800 px-3 py-2 rounded-lg shadow-sm min-w-[3rem]"
                          >
                            <span className={`text-lg font-semibold ${unit.value <= 1 ? 'text-red-500' : 'text-gray-800'}`}>
                              {unit.value.toString().padStart(2, '0')}
                            </span>
                            <span className="text-xs uppercase tracking-wide text-gray-600">
                              {unit.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Original Days and Extension info */}
                  <div className="flex gap-2 mb-2">
                    {timeLeft.originalDays && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {timeLeft.originalDays} days total
                      </span>
                    )}
                    {detail?.case?.is_extended && detail?.case?.extended_days && (
                      <div className="flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-lg text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Extended by {detail.case.extended_days} days</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {!timeLeft.isExpired && timeLeft.originalDays && timeLeft.daysLeft !== undefined && (
                    <div className="w-full">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{timeLeft.daysLeft} days remaining</span>
                        <span>{timeLeft.originalDays} days total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${(timeLeft.daysLeft / timeLeft.originalDays) < 0.2
                              ? 'bg-red-500'
                              : (timeLeft.daysLeft / timeLeft.originalDays) < 0.5
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          style={{ width: `${Math.max(0, Math.min(100, (timeLeft.daysLeft / timeLeft.originalDays) * 100))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Expired message */}
                  {timeLeft.isExpired && (
                    <div className="flex items-center gap-2 text-red-600 font-semibold text-sm mt-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Investigation period has expired</span>
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
                  {detail?.rejection_reason?.reason && (
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

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-red-700 mb-1">
                            Complaint Rejected
                          </h3>

                          <div className="space-y-2 text-sm text-gray-700">
                            <p>
                              <span className="font-medium text-gray-900">
                                Rejection Reason:
                              </span>{" "}
                              {detail.rejection_reason.reason}
                            </p>

                            {detail.rejection_reason.description && (
                              <p className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-700">
                                <span className="font-medium text-gray-900">
                                  Description:
                                </span>{" "}
                                {detail.rejection_reason.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {detail?.case?.status === "Returned" && (
                    <div className="rounded-2xl p-4 border border-gray-300">
                      {/* Header */}
                      <div
                        className="flex items-center justify-between cursor-pointer group"
                        onClick={() => setIsReturnReasonCollapsed(!isReturnReasonCollapsed)}
                      >
                        <h3 className="font-medium text-gray-900">Return Reasons</h3>
                        <div
                          className={`transform transition-transform duration-200 ${isReturnReasonCollapsed ? "rotate-90" : "rotate-0"
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

                          // Handle special statuses
                          const isReturned =
                            detail?.status === "returned" && s === "investigation_submitted";

                          const isRejectedStep =
                            detail?.status === "Rejected" && s === "Verified";

                          return (
                            <div
                              key={s}
                              className="flex flex-col items-center w-24 text-center relative"
                            >
                              {/* Circle */}
                              <div
                                className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all
            ${isReturned
                                    ? "bg-red-500 border-red-500 text-white"
                                    : isRejectedStep
                                      ? "bg-red-700 border-red-700 text-white"
                                      : isActive
                                        ? "bg-[#387E53] border-[#387E53] text-white"
                                        : "bg-white border-gray-300"
                                  }`}
                              >
                                {isReturned || isRejectedStep || isActive ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                )}
                              </div>

                              {/* Label */}
                              <span
                                className={`mt-1 text-xs font-medium capitalize
            ${isReturned
                                    ? "text-red-500"
                                    : isRejectedStep
                                      ? "text-gray-700"
                                      : isActive
                                        ? "text-[#387E53]"
                                        : "text-gray-400"
                                  }`}
                              >
                                {isReturned
                                  ? "Returned"
                                  : isRejectedStep
                                    ? "Rejected"
                                    : s.replace("_", " ")}
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

                    {/* Report Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          {permissions.includes("taskForce:can-verify-complaint") && (
                            <div className="flex justify-between items-center px-6 py-3 text-sm">
                              <span className="text-gray-600">Phone Number</span>
                              <span className="font-medium text-gray-900">
                                {detail.customer?.phone_number || "0923282347"}
                              </span>
                            </div>
                          )}

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

                            ) : (
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
                          <div className="lg:col-span-2"></div>
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
                              {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                              {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                          <span className="text-gray-600">
                            {" "}
                            Region/City Adminstration
                          </span>
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
                                  {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                                  {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                                  {detail.region?.region_name ||
                                    detail?.city?.city_name ||
                                    "—"}
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
                                  {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                                  {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                                  {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
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
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          {canUploadForThisUnit && timeLeft?.isExpired && (
                            <div className="p-6 border rounded-xl bg-red-50 text-red-700 flex flex-col gap-4 mb-4">
                              <h2 className="text-xl font-semibold">Time is up!</h2>
                              <p>
                                The investigation period has expired. You cannot submit files or update activities.Request Extension
                              </p>

                            </div>
                          )}
                          {canUploadForThisUnit && !timeLeft?.isExpired && (
                            <>
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
                            </>
                          )}

                          {detail?.case?.case_investigation?.[0]?.status ===
                            "final" &&
                            normalStatuses.includes(caseStatus) && (
                              <button
                                className="px-6 py-2 bg-[#387E53] text-white rounded-xl"
                                onClick={() => {
                                  if (caseStatus === "Returned") {
                                    navigate("/report-update-form", {
                                      state: {
                                        case_id: detail?.case?.case_id,
                                        report_type_id:
                                          detail?.sub_pollution_category
                                            ?.report_types?.report_type_id,
                                        reportSubmission:
                                          detail?.case?.reportSubmissions,
                                      },
                                    });
                                  } else {
                                    navigate("/report-fill-form", {
                                      state: {
                                        report_type_id:
                                          detail?.sub_pollution_category
                                            ?.report_types?.report_type_id,
                                        case_id: detail?.case?.case_id,
                                      },
                                    });
                                  }
                                }}
                              >
                                {caseStatus === "Returned"
                                  ? "Update Form"
                                  : "Fill Form"}
                              </button>
                            )}
                        </div>

                        { }
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


              <div className="rounded-2xl p-4 border border-gray-300">
                <div
                  className="flex items-center justify-between cursor-pointer group"
                  onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`transform transition-transform duration-300 ${isChatCollapsed ? "rotate-0" : "rotate-90"
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
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isChatCollapsed
                      ? "max-h-0 opacity-0"
                      : "max-h-[2000px] opacity-100 mt-4"
                    }`}
                >
                  {/* Category Tabs */}
                  <div className="flex border-b border-gray-200 mb-4">
                    <button
                      className={`px-4 py-2 font-medium text-sm ${activeChatTab === "feedback"
                          ? "text-[#387E53] border-b-2 border-[#387E53]"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                      onClick={() => setActiveChatTab("feedback")}
                    >
                      Feedback ({feedbackChats.length})
                    </button>
                    <button
                      className={`px-4 py-2 font-medium text-sm ${activeChatTab === "issue"
                          ? "text-[#387E53] border-b-2 border-[#387E53]"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                      onClick={() => setActiveChatTab("issue")}
                    >
                      Issue Raise ({issueChats.length})
                    </button>
                    <button
                      className={`px-4 py-2 font-medium text-sm ${activeChatTab === "extension"
                          ? "text-[#387E53] border-b-2 border-[#387E53]"
                          : "text-gray-500 hover:text-gray-700"
                        }`}
                      onClick={() => setActiveChatTab("extension")}
                    >
                      Date Extension ({extensionChats.length})
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeChatTab === "feedback" && isExpert && detail?.case?.status === "under_investigation" && !hasCaseAttachments && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Submit Feedback
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Feedback Content
                            </label>
                            <textarea
                              value={feedbackContent}
                              onChange={(e) =>
                                setFeedbackContent(e.target.value)
                              }
                              placeholder="Enter your feedback here..."
                              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              rows={4}
                            />
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setFeedbackContent("");
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
                                    message: "Please enter feedback content",
                                    type: "error",
                                  });
                                  return;
                                }

                                try {
                                  const formData = new FormData();
                                  formData.append("complaint_id", complaint_id);
                                  formData.append("type", "feedback");
                                  formData.append("content", feedbackContent);

                                  selectedFiles.forEach((file, index) => {
                                    formData.append(`files`, file);
                                  });

                                  await chatService.createChat(formData);

                                  setToast({
                                    open: true,
                                    message: "Feedback submitted successfully",
                                    type: "success",
                                  });

                                  // Clear form
                                  setFeedbackContent("");
                                  setSelectedFiles([]);

                                  // Refresh chats
                                  fetchChats();
                                } catch (error) {
                                  console.error(
                                    "Error submitting feedback:",
                                    error
                                  );
                                  setToast({
                                    open: true,
                                    message: "Failed to submit feedback",
                                    type: "error",
                                  });
                                }
                              }}
                              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                              </svg>
                              Submit Feedback
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Issue Raise Form - Only for experts AND NO case attachments AND investigation started > 1 day */}
                    {activeChatTab === "issue" && isExpert &&
                      (expertStatuses.includes(caseStatus) || detail?.case?.is_opened) && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Raise an Issue
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Issue{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={issueContent}
                                onChange={(e) =>
                                  setIssueContent(e.target.value)
                                }
                                placeholder="Explain the issue in detail..."
                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                rows={4}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setIssueContent("");
                                  setSelectedFiles([]);
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                              >
                                Clear
                              </button>
                              <button
                                onClick={async () => {
                                  if (!issueContent.trim()) {
                                    setToast({
                                      open: true,
                                      message: "Please enter issue content",
                                      type: "error",
                                    });
                                    return;
                                  }

                                  try {
                                    const formData = new FormData();
                                    formData.append(
                                      "complaint_id",
                                      complaint_id
                                    );
                                    formData.append("type", "issue");
                                    formData.append("title", issueContent);
                                    formData.append("content", issueContent);

                                    selectedFiles.forEach((file, index) => {
                                      formData.append(`files`, file);
                                    });

                                    await chatService.createChat(formData);

                                    setToast({
                                      open: true,
                                      message:
                                        "Issue raised successfully",
                                      type: "success",
                                    });

                                    // Clear form
                                    setIssueContent("");
                                    setSelectedFiles([]);

                                    // Refresh chats
                                    fetchChats();
                                  } catch (error) {
                                    console.error(
                                      "Error raising issue:",
                                      error
                                    );
                                    setToast({
                                      open: true,
                                      message: "Failed to raise issue",
                                      type: "error",
                                    });
                                  }
                                }}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                              >
                                <svg
                                  className="w-4 h-4"
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
                                Raise Issue
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Date Extension Form - Only for experts */}
                    {activeChatTab === "extension" && canUploadForThisUnit && (expertStatuses.includes(caseStatus) || detail?.case?.is_opened) && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Request Date Extension
                        </h3>
                        <div className="space-y-4">


                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Reason for Extension{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={extensionForm.reason}
                              onChange={(e) => setExtensionForm({ ...extensionForm, reason: e.target.value })}
                              placeholder="Explain why you need an extension..."
                              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                              rows={4}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Days Requested{" "}
                              <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => setExtensionForm({ ...extensionForm, daysRequested: Math.max(1, extensionForm.daysRequested - 1) })}
                                className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                -
                              </button>
                              <span className="text-lg font-medium">
                                {extensionForm.daysRequested} days
                              </span>
                              <button
                                onClick={() => setExtensionForm({ ...extensionForm, daysRequested: extensionForm.daysRequested + 1 })}
                                className="px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              New deadline: {(() => {
                                const newDate = new Date();
                                newDate.setDate(newDate.getDate() + extensionForm.daysRequested);
                                return newDate.toLocaleDateString();
                              })()}
                            </p>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setExtensionForm({
                                title: "",
                                reason: "",
                                newDeadline: "",
                                daysRequested: 7,
                                files: [],
                              })}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleExtensionSubmit}
                              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${!extensionForm?.reason
                                  ? "bg-yellow-300 cursor-not-allowed text-white"
                                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
                                }`}
                            >
                              <Calendar className="w-4 h-4" />
                              Request Extension
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Taskforce Action Panel for Date Extension - Only for taskforce */}
                    {/* Taskforce Action Panel for Date Extension - Only for taskforce */}
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
                                    className={`px-2 py-1 text-xs rounded-full ${chat.status === "pending_review"
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
                        className={`transform transition-transform duration-300 ${isAttachmentsCollapsed ? "rotate-0" : "rotate-90"
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
                        Case Timeline With Attachments ({caseAttachment.length})
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isAttachmentsCollapsed
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
                                  <span
                                  
                                    className="text-md font-semibold text-gray-800"
                                  >
                                    {attachment.file_name ||
                                      `Attachment ${index + 1}`}{" "}
                                    <span className="text-green-600">
                                      ({type})
                                    </span>
                                  </span>

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
                        className={`transform transition-transform duration-300 ${isTeamMembersCollapsed ? "rotate-0" : "rotate-90"
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
                            <p className="font-medium text-gray-800">{team.user?.name}</p>
                            <p className="text-sm text-gray-500">{team.user?.email}</p>
                          </div>

                          <div className="flex gap-2">
                            {/* Role Badge */}
                            <span
                              className={`text-xs px-3 py-1 rounded-full ${team.user?.isRegional
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                                }`}
                            >
                              {team.user?.isRegional ? "Regional Expert" : "Expert"}
                            </span>

                            {/* Team Leader Badge */}
                            {team.is_team_leader && (
                              <span className="text-xs px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                Team Leader
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              )}
              {!permissions.includes("expert:can-upload-investigation") && (
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
                            className={`transform transition-transform duration-300 ${isTeamMembersCollapsed ? "rotate-0" : "rotate-90"
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
                              className={`text-xs px-3 py-1 rounded-full ${detail.case.expertCase.user?.isRegional
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


                </>)}
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
                    className={`overflow-hidden transition-all duration-300 ${isActivityLogCollapsed ? "max-h-0" : "max-h-[2000px]"
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
              <h3 className="text-xl font-bold">Assign Handling Unit</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-3 text-sm gap-4 mb-8">
              {[
                { value: "hq_expert", icon: User, label: "HQ Experts" },
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


      {/* Reassign Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Reassign Issue</h3>
              <button
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setReassignChatId(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Main Category *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Category"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    {showCategoryDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                        {filteredCategories.map((cat) => (
                          <div
                            key={cat.pollution_category_id}
                            onClick={() => {
                              handleReassignChange("pollution_category_id", cat.pollution_category_id);
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
                </div>

                {/* Subcategory */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Subcategory *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Subcategory"
                      value={subcategorySearch}
                      onChange={(e) => setSubcategorySearch(e.target.value)}
                      onFocus={() => setShowSubcategoryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSubcategoryDropdown(false), 200)}
                      disabled={!reassignFormData.pollution_category_id}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                    />
                    {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    {showSubcategoryDropdown && reassignFormData.pollution_category_id && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                        {filteredCategories
                          .find(cat => cat.pollution_category_id === reassignFormData.pollution_category_id)
                          ?.subcategories.map((sub) => (
                            <div
                              key={sub.sub_pollution_category_id}
                              onClick={() => {
                                handleReassignChange("subpollution_category_id", sub.sub_pollution_category_id);
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
                </div>

                {/* Region */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Region
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Region"
                      value={regionSearch}
                      onChange={(e) => setRegionSearch(e.target.value)}
                      onFocus={() => setShowRegionDropdown(true)}
                      onBlur={() => setTimeout(() => setShowRegionDropdown(false), 200)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    {showRegionDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                        {filteredRegions.map((r) => (
                          <div
                            key={r.region_id}
                            onClick={() => {
                              handleReassignLocationChange("region_id", r.region_id);
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
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select City"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onFocus={() => setShowCityDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    {showCityDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                        {filteredCities.map((c) => (
                          <div
                            key={c.city_id}
                            onClick={() => {
                              handleReassignLocationChange("city_id", c.city_id);
                              setCitySearch(c.city_name);
                              setSubcitySearch("");
                              setWoredaSearch("");
                              setShowCityDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {c.city_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Subcity */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Subcity</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Subcity"
                      value={subcitySearch}
                      onChange={(e) => setSubcitySearch(e.target.value)}
                      onFocus={() => setShowSubcityDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSubcityDropdown(false), 200)}
                      disabled={!reassignFormData.city_id}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                    />
                    {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    {showSubcityDropdown && reassignFormData.city_id && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                        {filteredCities
                          .find((c) => c.city_id === reassignFormData.city_id)
                          ?.subcities.map((sub) => (
                            <div
                              key={sub.subcity_id}
                              onClick={() => {
                                handleReassignLocationChange("subcity_id", sub.subcity_id);
                                setSubcitySearch(sub.subcity_name);
                                setWoredaSearch("");
                                setShowSubcityDropdown(false);
                              }}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {sub.subcity_name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Woreda */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Woreda</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Select Woreda"
                      value={woredaSearch}
                      onChange={(e) => setWoredaSearch(e.target.value)}
                      onFocus={() => setShowWoredaDropdown(true)}
                      onBlur={() => setTimeout(() => setShowWoredaDropdown(false), 200)}
                      disabled={!reassignFormData.subcity_id}
                      className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                    />
                    {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                    {showWoredaDropdown && reassignFormData.subcity_id && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                        {filteredCities
                          .find((c) => c.city_id === reassignFormData.city_id)
                          ?.subcities.find((s) => s.subcity_id === reassignFormData.subcity_id)
                          ?.woredas.map((w) => (
                            <div
                              key={w.woreda_id}
                              onClick={() => {
                                handleReassignLocationChange("woreda_id", w.woreda_id);
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
                </div>



                {/* Zone */}
                {isRegionMode && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Zone
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Select Zone"
                        value={zoneSearch}
                        onChange={(e) => setZoneSearch(e.target.value)}
                        onFocus={() => setShowZoneDropdown(true)}
                        onBlur={() => setTimeout(() => setShowZoneDropdown(false), 200)}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {/* <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" /> */}
                      {showZoneDropdown && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                          {filteredZones.map((z) => (
                            <div
                              key={z.zone_id}
                              onClick={() => {
                                handleReassignLocationChange("zone_id", z.zone_id);
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
                  </div>
                )}



              </div>






            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsReassignModalOpen(false);
                  setReassignChatId(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReassign}
                disabled={isReassigning || !reassignFormData.detail.trim() || !reassignFormData.pollution_category_id}
                className={`px-6 py-2 rounded-lg font-medium ${isReassigning || !reassignFormData.detail.trim() || !reassignFormData.pollution_category_id
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
              >
                {isReassigning ? "Reassigning..." : "Confirm Reassignment"}
              </button>
            </div>
          </div>
        </div>
      )}


      {isAssignTeamModalOpen && (
        <Modal
          open={isAssignTeamModalOpen}
          onClose={() => {
            setIsAssignTeamModalOpen(false);
            setTeamFormData({ department: "", expert: [], description: "" });
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
                  setSubmitAttempted(false);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTeam}
                disabled={teamFormData.expert.length < 2}
                className={`flex-1 px-8 py-3 rounded-lg font-medium shadow-md transition-colors ${teamFormData.expert.length < 2
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
              >
                {teamFormData.expert.length < 2
                  ? `Select ${2 - teamFormData.expert.length} more`
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
                      value={
                        selectedRegion && selectedCity
                          ? `${selectedRegion}|${selectedCity}`
                          : selectedRegion
                            ? `${selectedRegion}|`
                            : selectedCity
                              ? `|${selectedCity}`
                              : ""
                      }
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
                      <option value="">
                        {selectedCity
                          ? `All`
                          : selectedRegion
                            ? `All`
                            : "All Regions & Cities"}
                      </option>

                      {/* Regions standalone */}
                      {regionOptions.map((region) => (
                        <option
                          key={`region-${region.region_id}`}
                          value={`${region.region_id}|`}
                        >
                          {region.region_name}
                        </option>
                      ))}

                      {/* Cities (with region if linked) */}
                      {cityOptions.map((city) => {
                        const region = regionOptions.find(
                          (r) => r.region_id === city.region_id
                        );
                        const displayName = region
                          ? `${region.region_name} - ${city?.city_name}`
                          : `${city?.city_name}`;
                        return (
                          <option
                            key={`city-${city.city_id}`}
                            value={
                              city.region_id
                                ? `${city.region_id}|${city.city_id}`
                                : `|${city.city_id}`
                            }
                          >
                            {displayName}
                          </option>
                        );
                      })}
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

                      {/* Subcities - now shows city name too */}
                      {subcityOptions.map((subcity) => {
                        const cityName = subcity.city?.city_name || "Unknown City";
                        return (
                          <option key={`subcity-${subcity.subcity_id}`} value={`${subcity.subcity_id}|`}>
                            {subcity.name} - {cityName}
                          </option>
                        );
                      })}

                      {/* Zones (will appear if you add any for other regions) */}
                      {zoneOptions.map((zone) => (
                        <option key={`zone-${zone.zone_id}`} value={`|${zone.zone_id}`}>
                          {zone.name || zone.zone_name}
                        </option>
                      ))}
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
                      {woredaOptions.map((woreda) => (
                        <option key={woreda.woreda_id} value={woreda.woreda_id}>
                          {woreda.woreda_name || woreda.name}
                        </option>
                      ))}
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
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${expertType === "regional"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Regional Experts
              </button>
              <button
                onClick={() => setExpertType("hq")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${expertType === "hq"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                HQ Experts
              </button>
            </div>

            {/* Search and Selection Area */}
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
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-1 focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      <div className="sticky top-0 bg-white border-b px-2 py-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Available Users
                          </span>

                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {(() => {
                          let baseUsers = allUsers;

                          // HQ Experts: no hierarchy assignments OR isRegional === false
                          const hqUsers = allUsers.filter(user =>
                            !user.hierarchies?.length ||
                            user.hierarchies.every(h =>
                              !h.hierarchy?.region_id &&
                              !h.hierarchy?.city_id &&
                              !h.hierarchy?.subcity_id &&
                              !h.hierarchy?.zone_id &&
                              !h.hierarchy?.woreda_id
                            ) ||
                            user.isRegional === false
                          );

                          // Regional Experts: have at least one hierarchy assignment
                          const regionalUsers = allUsers.filter(user =>
                            user.hierarchies?.some(h =>
                              h.hierarchy?.region_id ||
                              h.hierarchy?.city_id ||
                              h.hierarchy?.subcity_id ||
                              h.hierarchy?.zone_id ||
                              h.hierarchy?.woreda_id
                            )
                          );

                          // Choose base list based on tab
                          if (expertType === "hq") {
                            baseUsers = hqUsers;
                          } else {
                            baseUsers = regionalUsers;
                          }

                          // Now apply your existing filters (region, city, subcity, zone, woreda, search)
                          const filteredUsers = baseUsers.filter(user => {
                            // Region filter
                            if (selectedRegion && !user.hierarchies?.some(h => h.hierarchy?.region_id === selectedRegion)) return false;
                            // City filter
                            if (selectedCity && !user.hierarchies?.some(h => h.hierarchy?.city_id === selectedCity)) return false;
                            // Subcity filter
                            if (selectedSubcity && !user.hierarchies?.some(h => h.hierarchy?.subcity_id === selectedSubcity)) return false;
                            // Zone filter
                            if (selectedZone && !user.hierarchies?.some(h => h.hierarchy?.zone_id === selectedZone)) return false;
                            // Woreda filter
                            if (selectedWoreda && !user.hierarchies?.some(h => h.hierarchy?.woreda_id === selectedWoreda)) return false;

                            // Search by name/email
                            if (userSearch.trim()) {
                              const search = userSearch.toLowerCase();
                              return user.name?.toLowerCase().includes(search) ||
                                user.email?.toLowerCase().includes(search);
                            }
                            return true;
                          });

                          return filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                              const isSelected = teamFormData.expert.includes(user.user_id);
                              return (
                                <div
                                  key={user.user_id}
                                  onClick={() => handleTeamFormChange("expert", user.user_id)}
                                  className={`px-2 py-1 cursor-pointer transition-colors ${isSelected ? "bg-green-50 hover:bg-green-100" : "hover:bg-gray-50"
                                    }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                        }`}>
                                        {isSelected ? <Check className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                      </div>
                                      <div>
                                        <div className="font-medium text-gray-900">
                                          {user.name}
                                          {isSelected && <span className="ml-2 text-xs font-normal text-green-600">✓ Selected</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                      </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isSelected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                      }`}>
                                      {isSelected ? "Remove" : "Add"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium">No {expertType === "hq" ? "HQ" : "regional"} experts found</p>
                              <p className="text-sm text-gray-400 mt-1">
                                {userSearch.trim()
                                  ? `No results for "${userSearch}"`
                                  : expertType === "hq"
                                    ? "No central experts available"
                                    : "Try adjusting your filters"}
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
                <div className="mt-6 ">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                     
                      <p className="text-xs text-gray-500 mt-1">
                    
                        {teamFormData.expert.length < 2 && (
                          <span className="ml-2 text-red-500 font-medium">
                            • Need {2 - teamFormData.expert.length} more
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setTeamFormData((prev) => ({ ...prev, expert: [] }))}
                      className="flex items-center gap-1 text-sm text-red-600 text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear all
                    </button>
                  </div>
  <span className="text-[15px] font-semibold text-slate-700">Select Team Leader</span>
                  <div className="flex  gap-3  p-4">
                    {teamFormData.expert.map((id) => {
                      const user = allUsers?.find((u) => u.user_id === id);
                      if (!user) return null;
                      return (
                        <div
                          key={id}
                          className="  flex gap-2 bg-green-50 rounded-lg items-center justify-between  group"
                        >

                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="teamLeader"
                                checked={leaderUserId === id}
                                onChange={() => setLeaderUserId(id)}
                                className="form-radio h-4 w-4 text-green-600"
                              />
                            
                            </label>
                            <div className="text-sm text-gray-900">{user.name}</div>
                          </div>

                          <button
                            onClick={() => removeUser(id)}
                            className=" group-hover:opacity-100 transition-opacity p-1 rounded"
                            title="Remove user"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State when no users selected */}
              {teamFormData.expert.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No team members selected yet
                  </h3>
                </div>
              )}
            </div>
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
                className={`px-4 py-2 rounded-lg transition-colors ${isReturning || !selectedRejectionReason
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
                    <h3 className="text-xl font-bold text-gray-900">
                      Reject Complaint
                    </h3>
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
                    <option value="" className="text-gray-400">
                      Choose a reason...
                    </option>
                    {rejectionReasons.map((reason) => (
                      <option
                        key={reason.rejection_reason_id}
                        value={reason.rejection_reason_id}
                      >
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
                  <span
                    className={`text-xs ${rejectionDescription.length < 20
                        ? "text-red-500"
                        : "text-green-600"
                      }`}
                  >
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
                  disabled={
                    isRejecting ||
                    !selectedRejectionReason ||
                    rejectionDescription.length < 20
                  }
                  className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isRejecting ||
                      !selectedRejectionReason ||
                      rejectionDescription.length < 20
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


            <>
              {/* Reassign Modal */}
              {isReassignModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto my-8">
                    {/* Header */}
                    <div className="border-b border-gray-200 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              Reassign Issue
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Update report information and reassign to make it editable
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setIsReassignModalOpen(false);
                            setReassignChatId(null);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={isReassigning}
                        >
                          <X className="h-6 w-6" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                      {/* Description */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-900">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={reassignFormData.detail}
                          onChange={(e) => handleReassignChange("detail", e.target.value)}
                          placeholder="Enter complaint description..."
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
                          rows={4}
                          disabled={isReassigning}
                        />
                      </div>


                      {/* Specific Address */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-900">
                          Specific Address
                        </label>
                        <input
                          type="text"
                          value={reassignFormData.specific_address}
                          onChange={(e) => handleReassignChange("specific_address", e.target.value)}
                          placeholder="Street name, building number, etc."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isReassigning}
                        />
                      </div>

                      {/* Pollution Category */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-900">
                          Main Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={reassignFormData.pollution_category_id}
                            onChange={(e) => handleReassignLocationChange("pollution_category_id", e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                            disabled={isReassigning}
                          >
                            <option value="">Select Category</option>
                            {pollutionCategories?.map((cat) => (
                              <option key={cat.pollution_category_id} value={cat.pollution_category_id}>
                                {cat.pollution_category}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <ChevronDown className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      {/* Sub Pollution Category */}
                      {reassignFormData.pollution_category_id && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            Subcategory <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              value={reassignFormData.subpollution_category_id}
                              onChange={(e) => handleReassignLocationChange("subpollution_category_id", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                              disabled={isReassigning}
                            >
                              <option value="">Select Subcategory</option>
                              {subPollutionCategories
                                ?.filter(sub => sub.pollution_category_id === reassignFormData.pollution_category_id)
                                .map((sub) => (
                                  <option key={sub.sub_pollution_category_id} value={sub.sub_pollution_category_id}>
                                    {sub.sub_pollution_category}
                                  </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                              <ChevronDown className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Region and City */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            Region
                          </label>
                          <div className="relative">
                            <select
                              value={reassignFormData.region_id}
                              onChange={(e) => handleReassignLocationChange("region_id", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                              disabled={isReassigning}
                            >
                              <option value="">Select Region</option>
                              {regions?.map((region) => (
                                <option key={region.region_id} value={region.region_id}>
                                  {region.region_name}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                              <ChevronDown className="h-5 w-5" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            City
                          </label>
                          <div className="relative">
                            <select
                              value={reassignFormData.city_id}
                              onChange={(e) => handleReassignLocationChange("city_id", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                              disabled={isReassigning}
                            >
                              <option value="">Select City</option>
                              {cities
                                ?.filter(city => !reassignFormData.region_id || city.region_id === reassignFormData.region_id)
                                .map((city) => (
                                  <option key={city.city_id} value={city.city_id}>
                                    {city.city_name}
                                  </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                              <ChevronDown className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Zone and Subcity (conditional based on region/city selection) */}
                      {reassignFormData.region_id && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            Zone
                          </label>
                          <div className="relative">
                            <select
                              value={reassignFormData.zone_id}
                              onChange={(e) => handleReassignLocationChange("zone_id", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                              disabled={isReassigning}
                            >
                              <option value="">Select Zone</option>
                              {zones
                                ?.filter(zone => zone.region_id === reassignFormData.region_id)
                                .map((zone) => (
                                  <option key={zone.zone_id} value={zone.zone_id}>
                                    {zone.zone_name}
                                  </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                              <ChevronDown className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {reassignFormData.city_id && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            Subcity
                          </label>
                          <div className="relative">
                            <select
                              value={reassignFormData.subcity_id}
                              onChange={(e) => handleReassignLocationChange("subcity_id", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                              disabled={isReassigning}
                            >
                              <option value="">Select Subcity</option>
                              {subcities
                                ?.filter(subcity => subcity.city_id === reassignFormData.city_id)
                                .map((subcity) => (
                                  <option key={subcity.subcity_id} value={subcity.subcity_id}>
                                    {subcity.subcity_name || subcity.name}
                                  </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                              <ChevronDown className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Woreda (conditional based on zone/subcity selection) */}
                      {(reassignFormData.zone_id || reassignFormData.subcity_id) && (
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-900">
                            Woreda
                          </label>
                          <div className="relative">
                            <select
                              value={reassignFormData.woreda_id}
                              onChange={(e) => handleReassignLocationChange("woreda_id", e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                              disabled={isReassigning}
                            >
                              <option value="">Select Woreda</option>
                              {filteredWoredas
                                ?.filter(woreda =>
                                  (reassignFormData.zone_id && woreda.zone_id === reassignFormData.zone_id) ||
                                  (reassignFormData.subcity_id && woreda.subcity_id === reassignFormData.subcity_id)
                                )
                                .map((woreda) => (
                                  <option key={woreda.woreda_id} value={woreda.woreda_id}>
                                    {woreda.woreda_name}
                                  </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                              <ChevronDown className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 p-6">
                      <div className="flex flex-col sm:flex-row justify-end gap-3">
                        <button
                          onClick={() => {
                            setIsReassignModalOpen(false);
                            setReassignChatId(null);
                          }}
                          disabled={isReassigning}
                          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmReassign}
                          disabled={isReassigning || !reassignFormData.detail.trim() || !reassignFormData.pollution_category_id || !reassignFormData.subpollution_category_id}
                          className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isReassigning || !reassignFormData.detail.trim() || !reassignFormData.pollution_category_id || !reassignFormData.subpollution_category_id
                              ? "bg-blue-300 cursor-not-allowed text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                            }`}
                        >
                          {isReassigning ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                />
                              </svg>
                              Confirm Reassign
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </>

          </div>
        </div>
      )}
{openCloseModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-semibold text-gray-800">
          Close Complaint
        </h3>
        <button
          onClick={() => setOpenCloseModal(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attachment <span className="text-red-500">*</span>
          </label>

          <label className="flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-[#387E53] transition">
            <input
              type="file"
              hidden
              onChange={(e) => setClosingFile(e.target.files[0])}
            />

            <span className="text-sm text-gray-600">
              {closingFile ? closingFile.name : "Click to upload file"}
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Closing Description
          </label>
          <textarea
            rows={4}
            value={closingDescription}
            onChange={(e) => setClosingDescription(e.target.value)}
            placeholder="Provide a brief explanation for closing this complaint"
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#387E53]"
          />
        </div>

      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setOpenCloseModal(false)}
          className="px-5 py-2 text-sm rounded-xl border border-gray-300 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={handleClose}
          disabled={!closingFile}
          className="px-5 py-2 text-sm rounded-xl bg-[#387E53] text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit & Close
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
}