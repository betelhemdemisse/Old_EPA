import { useLocation } from "react-router-dom";
import {
  User,
  Users,
  MapPin,
  X,
  Pen,
  Check,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import ReportService from "../../services/report.service.js";
import complaintService from "../../services/complaint.service.js";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import PollutionServices from "../../services/PollutionCategory.service.js";
import service from "../../services/basedata.service.js";
import reportTypeService from "../../services/reportType.service.js";
import ReportDetailUI from "./ReportDetailUI.jsx";
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

export default function ReportDetail() {
  const location = useLocation();
  const { complaint_id } = location.state || {};

  const [detail, setDetail] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  const [caseAttachment, setCaseAttachment] = useState([]);


  const [handlingUnit , setHandlingUnit]=useState("")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investigationDays  , setInvestigationDays]=useState("")
  const [isTeamFormationNeeded, setIsTeamFormationNeeded] = useState(false);

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

  // Form state
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
        setDetail(d);
        console.log("Report Detail Data:", d.case?.case_investigation);
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
      }
    } catch (err) {
      setToast({ open: true, message: "Failed to load report", type: "error" });
    }
  };

console.log("CaseAttachmenttt",caseAttachment)
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

  // Handle change with smart cascading
  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev };

      if (field === "region_id") {
        if (value) {
          // Switch to Region mode
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
          // Switch to City mode
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

  const statusSteps = ["pending", "verified", "under investigation", "authorized", "closed"];
  const currentStatusIndex = statusSteps.indexOf(detail.status?.toLowerCase() || "pending");

  return (<>
   <ReportDetailUI 
    detail={detail}
      toast={toast}
      setIsTeamFormationNeeded={setIsTeamFormationNeeded}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      handlingUnit={handlingUnit}
      pollutionCategories={pollutionCategories}
      regions={regions}
      subPollutionCategories={subPollutionCategories}
      formData={formData}
      cities={cities}
      zones={zones}
     caseAttachment={caseAttachment}
      filteredWoredas={filteredWoredas}
      handleChange ={handleChange}
      subcities={subcities}
      setHandlingUnit={setHandlingUnit}
      investigationDays={investigationDays}
      setInvestigationDays={setInvestigationDays}
      complaint_id={complaint_id}
      
      loadData={loadData}
      chooseHandlingUnit={complaintService.chooseHandlingUnit}/>
  {toast.open && (
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, open: false })}
      />
    )}</> );
}
