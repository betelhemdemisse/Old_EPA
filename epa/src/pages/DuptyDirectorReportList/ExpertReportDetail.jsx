import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Users,
  MapPin,
  X,
  Pen,
  Check,
  ArrowLeft,
  ShieldCheck,
  QrCode,
  Calendar,
  FileText,
  AlertTriangle,
  Activity,
  Camera,
  Video,
  File,
  Droplets,
  Shield,
  Trash2,
  Flame,
  Bug,
  CloudRain,
  HeartPulse,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import ReportService from "../../services/report.service.js";
import complaintService from "../../services/complaint.service.js";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import PollutionServices from "../../services/PollutionCategory.service.js";
import service from "../../services/basedata.service.js";
import reportTypeService from "../../services/reportType.service.js";
import { QRCodeSVG } from "qrcode.react";
import Modal from "../../components/Modal/Modal.jsx";

const {
  PollutionCategoryService: pollutionService,
} = PollutionServices;

const {
  CityService: cityService,
  RegionService: regionService,
  SubcityService: subcityService,
  ZoneService: zoneService,
  WoredaService: woredaService,
} = service;

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
  const backendUrl = "http://196.188.240.103:4032/";

// Helper function to get color based on value
const getStatusColor = (value) => {
  if (value === "Yes") return "text-green-600 bg-green-100";
  if (value === "No") return "text-red-600 bg-red-100";
  return "text-gray-600 bg-gray-100";
};

export default function ExpertReportDetail() {
  const location = useLocation();
  const navigate = useNavigate();
const [selectedAttachment, setSelectedAttachment] = useState(null);

  const { case_id } = location.state || {};
  const [detail, setDetail] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const qrCodeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ----------------------------- LOAD ALL REPORTS ----------------------------- */
  useEffect(() => {
    if (!case_id) {
      console.log("⚠️ case_id missing from location.state");
      return;
    }
    loadAllReports();
  }, [case_id]);

const handleAttachmentSelect = (attachment) => {
  console.log("attachment",attachment)
  setSelectedAttachment(attachment);
  // open modal logic
};
  const loadAllReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await ReportService.GetExpertForm(case_id);

      const reportsArray = Array.isArray(res.data) ? res.data : [res.data];

      const sortedReports = reportsArray.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      );

      setAllReports(sortedReports);
      if (sortedReports.length > 0) {
        setSelectedReport(sortedReports[0]);
        setDetail(sortedReports[0]);
      }
    } catch (err) {
      console.error("Error loading reports:", err);
      setError("Failed to load reports. Please try again.");
      setToast({ open: true, message: "Failed to load reports", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
    setDetail(report);
  };
console.log("allReports",allReports[0]?.case?.closingAttachement)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Reports</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!allReports || allReports.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h2>
          <p className="text-gray-600">There are no reports to display for this case.</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Report Selected</h2>
          <p className="text-gray-600">Please select a report from the list.</p>
        </div>
      </div>
    );
  }

  // Helper to find value from form values
  const getFormValue = (reportFormId) => {
    const value = detail.values?.find(v => v.form.report_form_id === reportFormId)?.value || "";
    return value === "none" ? "" : value;
  };

  // Extract specific form values
  const incidentDetails = {
    date: getFormValue("a04f8da1-5d36-4b28-b1ca-d516a2b8eab7"),
    location: getFormValue("7a364a47-8edd-4e0a-9167-c47709e81959"),
    source: getFormValue("075c68ee-fc4e-4d6f-8a2a-981a7173138e"),
    description: getFormValue("d4a87532-9397-4791-a39f-9ce898e96197"),
    pollutionTypes: getFormValue("83d7ef3b-ea1c-4197-8c4e-cf436b218ca4")?.split(", ") || [],
  };

  const evidence = {
    photos: getFormValue("cbce9c14-fe31-487f-97e1-5a931a219f7b"),
    videos: getFormValue("8fb97339-456e-44d1-ae4c-691b083a80f0"),
    documents: getFormValue("1d96c4e4-f6c5-4b85-8a2f-6864ae929a49"),
    samples: getFormValue("9987c21a-16da-462c-a23d-a7a0085c1a92"),
  };

  const impacts = {
    environmental: getFormValue("a06bd6c4-883e-4965-bc36-cb297fa45532")?.split(", ") || [],
    affectedArea: getFormValue("97daf785-a542-4454-bf29-eb8c5e5dec5c"),
  };

  const actions = {
    immediate: getFormValue("a7b7bff3-cb36-4db4-b165-b0507b6b4322")?.split(", ") || [],
    otherActions: getFormValue("f84b1b12-32d2-4b1e-a8a2-6dd69a9f015a"),
    authorityActions: getFormValue("29d99f80-7d55-43c6-a129-db90876074bb")?.split(", ") || [],
    actionDetails: getFormValue("900013e6-3504-425f-954e-e38eea5ede29"),
  };
const closingAttachments = allReports[0]?.case?.closingAttachement || [];

  const renderPollutionBadges = (types) => {
    if (!types || types.length === 0) return null;
    
    const badgeColors = {
      "Illegal dumping": "bg-red-100 text-red-800 border-red-200",
      "Overflowing waste containers": "bg-orange-100 text-orange-800 border-orange-200",
      "Poor collection service": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Burning of municipal waste": "bg-purple-100 text-purple-800 border-purple-200",
      "Blocked drainage due to waste": "bg-blue-100 text-blue-800 border-blue-200",
      "Waste mismanagement at municipal landfill": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "Waste scattered by animals": "bg-pink-100 text-pink-800 border-pink-200",
    };

    return (
      <div className="flex flex-wrap gap-2">
        {types.map((type, index) => (
          <span
            key={index}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
              badgeColors[type] || "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {type}
          </span>
        ))}
      </div>
    );
  };

  const renderImpactBadges = (impacts) => {
    if (!impacts || impacts.length === 0) return null;
    
    const impactIcons = {
      "Foul odor": <Activity className="w-4 h-4" />,
      "Smoke from burning": <Flame className="w-4 h-4" />,
      "Water contamination": <Droplets className="w-4 h-4" />,
      "Soil contamination": <Trash2 className="w-4 h-4" />,
      "Blocked drainage / flooding": <CloudRain className="w-4 h-4" />,
      "Increased pests (flies, rats, dogs)": <Bug className="w-4 h-4" />,
      "Human health impact": <HeartPulse className="w-4 h-4" />,
    };

    const impactColors = {
      "Foul odor": "bg-amber-100 text-amber-800 border-amber-200",
      "Smoke from burning": "bg-red-100 text-red-800 border-red-200",
      "Water contamination": "bg-blue-100 text-blue-800 border-blue-200",
      "Soil contamination": "bg-brown-100 text-brown-800 border-brown-200",
      "Blocked drainage / flooding": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "Increased pests (flies, rats, dogs)": "bg-green-100 text-green-800 border-green-200",
      "Human health impact": "bg-pink-100 text-pink-800 border-pink-200",
    };

    return (
      <div className="flex flex-wrap gap-2">
        {impacts.map((impact, index) => (
          <span
            key={index}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-1.5 ${
              impactColors[impact] || "bg-gray-100 text-gray-800 border-gray-200"
            }`}
          >
            {impactIcons[impact]}
            {impact}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Municipal Waste Pollution Report
          </h1>
          <p className="text-gray-600 mt-1">
            Case ID: <span className="font-mono">{detail.case_id}</span>
          </p>
        </div>
        
      
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Report List */}
    

        {/* Right Column - Report Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Report Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Report Details</h2>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center flex-wrap gap-3">
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Submitted
                </div>
                <div className="text-sm text-gray-500">
                  Last updated: {formatDate(detail.updated_at)}
                </div>
              </div>
            </div>
          </div>

          {/* Incident Details Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Incident Details</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Incident</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-800">{incidentDetails.date || "Not specified"}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Exact Location</label>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-800">{incidentDetails.location || "Location not provided"}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Suspected Source</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-800">{incidentDetails.source || "Unknown"}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Type of Pollution Observed</label>
                {renderPollutionBadges(incidentDetails.pollutionTypes)}
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500 mb-3">Description</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">
                      {incidentDetails.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Evidence Collected</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${getStatusColor(evidence.photos)}`}>
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Photos</div>
                    <div className="text-sm opacity-80">{evidence.photos || "Not specified"}</div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${getStatusColor(evidence.videos)}`}>
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Videos</div>
                    <div className="text-sm opacity-80">{evidence.videos || "Not specified"}</div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${getStatusColor(evidence.documents)}`}>
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Documents</div>
                    <div className="text-sm opacity-80">{evidence.documents || "Not specified"}</div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${getStatusColor(evidence.samples)}`}>
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Samples</div>
                    <div className="text-sm opacity-80">{evidence.samples || "Not specified"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Assessment Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Environmental & Public Health Impact</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Observed Impacts</label>
                {renderImpactBadges(impacts.environmental)}
                {(!impacts.environmental || impacts.environmental.length === 0) && (
                  <p className="text-gray-500 italic">No impacts reported</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Affected Community/Area</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{impacts.affectedArea || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Taken Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Actions Taken</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Immediate Actions by Reporter</label>
                <div className="space-y-2">
                  {actions.immediate.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-800">{action}</span>
                    </div>
                  ))}
                  {(!actions.immediate || actions.immediate.length === 0) && (
                    <p className="text-gray-500 italic">No immediate actions reported</p>
                  )}
                </div>
                
                {actions.otherActions && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <label className="block text-sm font-medium text-yellow-700 mb-2">Additional Actions</label>
                    <p className="text-yellow-800">{actions.otherActions}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-3">Actions by Authority</label>
                <div className="space-y-2">
                  {actions.authorityActions.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-green-600" />
                      <span className="text-gray-800">{action}</span>
                    </div>
                  ))}
                  {(!actions.authorityActions || actions.authorityActions.length === 0) && (
                    <p className="text-gray-500 italic">No authority actions reported</p>
                  )}
                </div>
                
                {actions.actionDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Details</label>
                    <p className="text-gray-800">{actions.actionDetails}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reporter Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Reporter Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-700">Reporter</div>
                    <div className="text-gray-900 text-lg font-semibold">{detail.creator.name}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Email: {detail.creator.email}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-700">Report Timeline</div>
                    <div className="text-gray-900 text-lg font-semibold">{formatDate(detail.created_at)}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Last updated: {formatDate(detail.updated_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
{closingAttachments.length > 0 && (
  <div className="lg:col-span-1">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">Closing Attachments</h3>
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
        {closingAttachments.map((attachment, index) => (
          <div
            key={attachment.closing_attachement_id}
            onClick={() => handleAttachmentSelect(attachment)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              selectedAttachment?.closing_attachement_id === attachment.closing_attachement_id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                {/* Change the name display here */}
                <h4 className="font-medium text-gray-800">
                  {`Closing Attachment ${index + 1}`}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{formatDate(attachment.created_at)}</p>
              
              </div>

              {selectedAttachment?.closing_attachement_id === attachment.closing_attachement_id && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}
       
      </div>

{selectedAttachment && (
  <Modal
    open={!!selectedAttachment}
    onClose={() => setSelectedAttachment(null)}
    width="max-w-3xl"
  >
    <div className="p-4">

      {selectedAttachment.file_name?.toLowerCase().endsWith(".pdf") ? (
        <iframe
          src={`${backendUrl}${selectedAttachment?.file_path}`}
          className="w-full h-[500px]"
          title={selectedAttachment?.file_name}
        />
      ) : (
        <img
          src={`${backendUrl}${selectedAttachment?.file_path}`}
          alt={selectedAttachment?.file_name}
          className="w-full max-h-[500px] object-contain rounded"
        />
      )}

      <button
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => setSelectedAttachment(null)}
      >
        Close
      </button>
    </div>
  </Modal>
)}

      {toast.open && (
        <ToastMessage
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, open: false })}
        />
      )}
    </div>
  );
}