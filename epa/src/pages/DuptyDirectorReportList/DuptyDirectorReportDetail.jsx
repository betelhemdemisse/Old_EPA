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
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import ReportService from "../../services/report.service.js";
import complaintService from "../../services/complaint.service.js";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import PollutionServices from "../../services/PollutionCategory.service.js";
import service from "../../services/basedata.service.js";
import reportTypeService from "../../services/reportType.service.js";
import ReportDetailUI from "./DuptyDirectorReportDetailUI.jsx";
import { QRCodeSVG } from "qrcode.react";
import RejectionReasonService from "../../services/RejectionReason.service.js";
import CaseService from "../../services/case.service.js"
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

export default function DuptyDirectorReportDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { complaint_id } = location.state || {};

  const [detail, setDetail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null); // Store QR code data after authorization
  const qrCodeRef = useRef(null);

  const [handlingUnit, setHandlingUnit] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investigationDays, setInvestigationDays] = useState("");
  const [isTeamFormationNeeded, setIsTeamFormationNeeded] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  // Master data
  const [pollutionCategories, setPollutionCategories] = useState([]);
  const [subPollutionCategories, setSubPollutionCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [zones, setZones] = useState([]);
  const [subcities, setSubcities] = useState([]);
  const [allWoredas, setAllWoredas] = useState([]);
  const [filteredWoredas, setFilteredWoredas] = useState([]);
  const [reportTypes, setReportTypes] = useState([]);
  const [caseAttachment, setCaseAttachment] = useState([]);
  const [rejectionReasons, setRejectionReasons] = useState([]);
  const [selectedRejectionReason,setSelectedRejectionReason] = useState("")
  const [additionalDescription,setAdditionalDescription] = useState("")
  const [formData, setFormData] = useState({
    pollution_category_id: "",
    sub_pollution_category_id: "",
    region_id: "",
    city_id: "",
    zone_id: "",
    subcity_id: "",
    woreda_id: "",
  });

  // Determine location type (for conditional rendering)
  const isRegionMode = !!formData.region_id;
  const isCityMode = !!formData.city_id;

  // Load report
  const loadData = async () => {
    try {
      const res = await ReportService.getAssignedReportDetail(complaint_id);
      if (res?.data) {
        const d = res.data;
        console.log("dddddd",d)
        setDetail(d);
        setCaseAttachment(d?.case?.case_investigation[0]?.case_attachement || []);
        setFormData({
          pollution_category_id: d.pollution_category_id || "",
          subpollution_category_id: d.subpollution_category_id || d.sub_pollution_category_id || "",
          region_id: d.region_id || "",
          city_id: d.city_id || "",
          zone_id: d.zone_id || "",
          subcity_id: d.subcity_id || "",
          woreda_id: d.woreda_id || "",
        });

        // Check if complaint is already authorized to show QR code
        if (d.status?.toLowerCase() === "authorized") {
          generateAndStoreQRCode(d);
        }
      }
    } catch (err) {
      setToast({ open: true, message: "Failed to load report", type: "error" });
    }
  };
  const fetchRejectionReasons = async () => {
    const data = await RejectionReasonService.getAllRejectionReasons();
    setRejectionReasons(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchRejectionReasons();
  }, []);
const handleReasonChange = (e) => {
  const selectedId = e.target.value;
  setSelectedRejectionReason(selectedId);

  const selectedReason = rejectionReasons?.data?.find(
    (r) => r.rejection_reason_id === selectedId
  );

  setAdditionalDescription(selectedReason?.description || "");
};

  const loadMasterData = async () => {
    try {
      const [
        pollCats,
        regs,
        cits,
        allWoredas,
        reportTypesData,
      ] = await Promise.all([
        pollutionService.getAllPollutionCategories(),
        regionService.getAllRegions(),
        cityService.getAllCities(),
        woredaService.getAllWoredas(),
        reportTypeService.getAllReportTypes(),
      ]);

      setPollutionCategories(Array.isArray(pollCats) ? pollCats : []);
      setRegions(Array.isArray(regs) ? regs : []);
      setCities(Array.isArray(cits) ? cits : []);
      setAllWoredas(Array.isArray(allWoredas) ? allWoredas : []);
      setReportTypes(Array.isArray(reportTypesData) ? reportTypesData : []);
    } catch (err) {
      console.error("Master data failed:", err);
    }
  };

  const loadSubPollutionCategories = async (categoryId) => {
    if (!categoryId) {
      setSubPollutionCategories([]);
      return;
    }
    try {
      const res = await pollutionService.getPollutionCategoryById(categoryId);
      const subcats = res?.subcategories || [];
      setSubPollutionCategories(Array.isArray(subcats) ? subcats : []);
    } catch {
      setSubPollutionCategories([]);
    }
  };

  const loadZones = async (regionId) => {
    if (!regionId) {
      setZones([]);
      return;
    }
    try {
      const res = await zoneService.getZonesByRegion(regionId);
      setZones(Array.isArray(res) ? res : []);
    } catch {
      setZones([]);
    }
  };

  const loadSubcities = async (cityId) => {
    if (!cityId) {
      setSubcities([]);
      return;
    }
    try {
      const res = await subcityService.getSubcitiesByCity(cityId);
      const data = res?.subcities || res || [];
      setSubcities(Array.isArray(data) ? data : []);
    } catch {
      setSubcities([]);
    }
  };

  const updateFilteredWoredas = () => {
    const { zone_id, subcity_id } = formData;

    if (!zone_id && !subcity_id) {
      setFilteredWoredas([]);
      return;
    }

    const filtered = allWoredas.filter((w) => {
      return w.zone_id === zone_id || w.subcity_id === subcity_id;
    });

    setFilteredWoredas(filtered);
  };

  // Generate QR Code data
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

  // Store QR code data
  const generateAndStoreQRCode = (complaintDetail) => {
    const qrDataString = generateQRCodeData(complaintDetail);
    setQrCodeData(qrDataString);
  };


  const downloadQRCode = () => {
    const canvas = qrCodeRef.current.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `complaint-${complaint_id}-authorized-qrcode.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setToast({ 
        open: true, 
        message: "QR Code downloaded successfully", 
        type: "success" 
      });
    }
  };
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

    const response = await CaseService.returnCase(
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

  const handleAuthorize = async () => {
    if (!complaint_id) {
      setToast({ open: true, message: "Complaint ID is missing", type: "error" });
      return;
    }

    setIsAuthorizing(true);
    try {
      const response = await ReportService.authorizeComplaint(complaint_id);
      
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
        loadData();
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

  // Handle return action
  const handleReturn = () => {
    setIsReturnModalOpen(true);
  };

  // Handle confirm return



  useEffect(() => {
    if (complaint_id) {
      loadData();
      loadMasterData();
    }
  }, [complaint_id]);

  useEffect(() => {
    if (!detail) return;

    if (detail.pollution_category_id) {
      loadSubPollutionCategories(detail.pollution_category_id);
    }
    if (detail.region_id) {
      loadZones(detail.region_id);
    }
    if (detail.city_id) {
      loadSubcities(detail.city_id);
    }
  }, [detail]);

  useEffect(() => {
    updateFilteredWoredas();
  }, [formData.zone_id, formData.subcity_id, allWoredas]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };

      if (field === "region_id") {
        if (value) {
          updated.city_id = "";
          updated.subcity_id = "";
          updated.zone_id = "";
          updated.woreda_id = "";
          loadZones(value);
        } else {
          updated.zone_id = "";
          updated.woreda_id = "";
          setZones([]);
        }
      }

      if (field === "city_id") {
        if (value) {
          updated.region_id = "";
          updated.zone_id = "";
          updated.subcity_id = "";
          updated.woreda_id = "";
          loadSubcities(value);
        } else {
          updated.subcity_id = "";
          updated.woreda_id = "";
          setSubcities([]);
        }
      }

      if (field === "zone_id") {
        updated.woreda_id = "";
      }

      if (field === "subcity_id") {
        updated.woreda_id = "";
      }

      if (field === "pollution_category_id") {
        updated.sub_pollution_category_id = "";
        if (value) loadSubPollutionCategories(value);
      }

      updated[field] = value || "";

      return updated;
    });
  };

  if (!detail) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }
  const isComplaintAuthorized = detail.status?.toLowerCase() === "authorized";
  const canShowQRCode = isComplaintAuthorized && qrCodeData;
  return (
    <>
      {/* Header with buttons */}
      <div className="flex flex-wrap mt-4 justify-between items-center  gap-4">
        <h1 className="text-3xl font-bold" style={{ color: "#11255A" }}>Report Management</h1>
      
        {detail?.case?.status === "investigation_submitted" && (
        <div className="flex items-center gap-4">
          {/* Authorize Button - Only show if not already authorized */}
          {!isComplaintAuthorized && detail?.case?.status === "investigation_submitted" && (

          <button
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                isAuthorizing
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <ShieldCheck size={20} />
              {isAuthorizing ? "Authorizing..." : "Authorize"}
            </button>
          )}

          {/* Return Button */}
           {!isComplaintAuthorized && (
          <button
            onClick={handleReturn}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Return
          </button>
           )}
        </div>
        )}
      </div>

      {/* QR Code Display - Only show if authorized and QR code data exists */}
    

      {/* Success message after authorization */}
      {/* {isComplaintAuthorized && !showQRCode && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ShieldCheck size={16} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Complaint Successfully Authorized</p>
                <p className="text-sm text-green-600">
                  This complaint has been authorized. You can view the authorization QR code.
                </p>
              </div>
            </div>
          
          </div>
        </div>
      )} */}

      <ReportDetailUI 
        detail={detail}
        canShowQRCode={canShowQRCode}
        qrCodeRef={qrCodeRef}
        qrCodeData={qrCodeData}
        toast={toast}
        setIsTeamFormationNeeded={setIsTeamFormationNeeded}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        setCaseAttachment={setCaseAttachment}
        caseAttachment={caseAttachment}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handlingUnit={handlingUnit}
        pollutionCategories={pollutionCategories}
        regions={regions}
        subPollutionCategories={subPollutionCategories}
        formData={formData}
        cities={cities}
        zones={zones}
        filteredWoredas={filteredWoredas}
        handleChange={handleChange}
        subcities={subcities}
        setHandlingUnit={setHandlingUnit}
        investigationDays={investigationDays}
        setInvestigationDays={setInvestigationDays}
        complaint_id={complaint_id}
        loadData={loadData}
        chooseHandlingUnit={complaintService.chooseHandlingUnit}
        reportTypes={reportTypes}
        rejectionReasons={rejectionReasons}
      />
      
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


      {toast.open && (
        <ToastMessage
          open={toast.open}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, open: false })}
        />
      )}
    </>
  );
}
