import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import ReportDetailUI from "../ReportList/ReportDetailUI.jsx";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";

export default function RegionalExpertCase() {
  const location = useLocation();
  const navigate = useNavigate();
  const { complaint_id } = location.state || {};

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false }), 4000);
  };

  const fetchCase = async () => {
    if (!complaint_id && !location.state) {
      showToast("error", "No case selected");
      navigate("/regional/expert/cases");
      return;
    }

    try {
      setLoading(true);
      // If a specific complaint_id was provided use it (try to find among assigned cases),
      // otherwise get the next queued case for the expert.
      if (complaint_id) {
        const allRes = await regionalWorkflowService.getAllAssignedCasesForExpert();
        const allPayload = allRes?.data ?? allRes;
        const all = Array.isArray(allPayload) ? allPayload : allPayload ? [allPayload] : [];
        const found = all.find((c) => c.complaint && c.complaint.complaint_id === complaint_id);
        if (found) {
          setCaseData(found);
        } else {
          // Fallback to next case if the specific one isn't found
          const res = await regionalWorkflowService.getNextCaseForExpert();
          const payload = res?.data ?? res;
          setCaseData(payload);
        }
      } else {
        const res = await regionalWorkflowService.getNextCaseForExpert();
        const payload = res?.data ?? res;
        setCaseData(payload);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load case";
      showToast("error", msg);
      if (err.response?.status === 404) {
        navigate("/regional/expert/cases");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-700">Loading your investigation case...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
          <AlertTriangle className="w-24 h-24 text-amber-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">No Active Case</h2>
          <p className="text-xl text-gray-600 mb-8">
            You currently have no investigation case assigned.
          </p>
          <button
            onClick={() => navigate("/regional/expert/cases")}
            className="px-12 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-xl shadow-xl transition transform hover:scale-105"
          >
            ← Back to My Cases
          </button>
        </div>
      </div>
    );
  }

  const remainingDays = caseData.remaining_days || 0;
  const isUrgent = remainingDays <= 2;
  const isOverdue = remainingDays < 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">

      {/* Urgent/Overdue Top Banner */}
      <div className={`w-full py-6 px-8 shadow-2xl flex items-center justify-between ${isOverdue ? "bg-red-700" : isUrgent ? "bg-orange-600" : "bg-gradient-to-r from-emerald-700 to-teal-700"} text-white`}>
        <div className="flex items-center gap-6">
          <Clock className="w-12 h-12" />
          <div>
            <h2 className="text-4xl font-black">Case #{caseData.case_no || "—"}</h2>
            <p className="text-2xl opacity-90 mt-2">{caseData.complaint?.title || "Environmental Complaint"}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xl opacity-90">Time Remaining</p>
          <p className={`text-6xl font-black ${isOverdue || isUrgent ? "animate-pulse" : ""}`}>
            {isOverdue ? "OVERDUE!" : `${Math.abs(remainingDays)} ${Math.abs(remainingDays) === 1 ? "DAY" : "DAYS"}`}
          </p>
          {(isUrgent || isOverdue) && (
            <p className="text-yellow-200 text-2xl font-bold mt-3 animate-pulse">
              {isOverdue ? "IMMEDIATE ACTION REQUIRED!" : "URGENT!"}
            </p>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-[1500px] mx-auto px-6 pt-8">
        <button
          onClick={() => navigate("/regional/expert/cases")}
          className="flex items-center gap-3 text-gray-700 hover:text-emerald-700 font-semibold text-lg mb-8 transition"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to My Cases
        </button>

        
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <ReportDetailUI
            detail={caseData}
            isRegional={true}
            complaint_id={caseData.complaint.complaint_id}
            caseAttachment={caseData?.case?.case_investigation?.[0]?.case_attachement || []}
            onSubmitSuccess={() => {
              showToast("success", "Investigation submitted successfully!");
              setTimeout(() => navigate("/regional/expert/cases"), 1500);
            }}
            
            loadData={fetchCase}
            loadExpertData={fetchCase}
          />
        </div>
      </div>

      <ToastMessage
        open={toast.open}
        type={toast.type}
        message={toast.message}
        duration={4000}
        onClose={() => setToast({ open: false })}
      />
    </div>
  );
}