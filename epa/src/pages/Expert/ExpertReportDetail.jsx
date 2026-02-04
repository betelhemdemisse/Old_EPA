import { useLocation } from "react-router-dom";
import { Upload, User, Users, MapPin, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReportService from "../../services/report.service.js";
import caseService from "../../services/case.service.js";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import ReportDetailUI from "../ReportList/ReportDetailUI.jsx";
import feedbackService from "../../services/feedback.service.js";

export default function ExpertReportDetail() {
  const location = useLocation();
  const { complaint_id } = location.state || {};
  console.log("Complaint ID:", complaint_id);
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    message: "",
    type: "success",
  });
    const [caseAttachment, setCaseAttachment] = useState([]);
  
  const [reportTypes, setReportTypes] = useState([]);
  const loadExpertData = async () => {
    try {
      const res = await caseService.getAssignedComplaintDetail(complaint_id);
      console.log("res?.data?.case?.case_investigation",res?.data?.case?.case_investigation)
      console.log("Expert Report Detail Response:", res?.data?.case?.case_investigation[0]?.case_attachement);
      setCaseAttachment(res?.data?.case?.case_investigation[0]?.case_attachement)
      setDetail(res?.data);
    } catch (err) {
      console.error("Error loading reports:", err);
    }
  };
    const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    loadExpertData();
  }, [complaint_id]);

  console.log(detail?.case?.case_id, "detailing case id ")

  useEffect(() => {
  const fetchFeedback = async () => {
    
      try {

        console.log("i am hereeeeeeeeeee")
        const feedbackRes = await feedbackService.getFeedbackByCase(detail.case.case_id);
        setFeedbackList(feedbackRes?.data?.feedbacks || feedbackRes?.feedbacks || feedbackRes?.data || feedbackRes || []);
      } catch (error) {
        console.error("Failed to load feedback:", error);
        setFeedbackList([]);
      }
  };
  fetchFeedback();
}, [detail?.case?.case_id]); 


console.log(feedbackList , "feedededede")
  const loadReportType = async () => {
    try {
      const res = await caseService.getReportType();
      setReportTypes(res || []);
    } catch {
      console.error("Error loading report type");
    }
  };
  useEffect(() => {
    loadReportType();
  }, []);
  console.log("caseAttachment",caseAttachment)
  const statusData = {
    currentStatus: detail?.status.toLowerCase() || "pending",
    steps: [
      { status: "pending", label: "Pending" },

      { status: "verified", label: "Verified" },
      { status: "under_investigation", label: "under investigation" },
      { status: "Authorized", label: "Authorized" },
    ],
  };
  return (
    <ReportDetailUI
      detail={detail}
      toast={toast}
      complaint_id={complaint_id}
      reportTypes={reportTypes}
      feedbackList={feedbackList}
      setFeedbackList={setFeedbackList}
      loadExpertData={loadExpertData}
      setCaseAttachment={setCaseAttachment}
      caseAttachment={caseAttachment}
    />
  );
}
