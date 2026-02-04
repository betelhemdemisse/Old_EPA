
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import ToastMessage from "../../components/Alerts/ToastMessage.jsx";
import ReportDetailUI from "../ReportList/ReportDetailUI.jsx";
import regionalWorkflowService from "../../services/regionalWorkflow.service.js";

export default function RegionalReviewInvestigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { case_id, complaint_id } = location.state || {};

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
    setTimeout(() => setToast({ open: false }), 4000);
  };

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await regionalWorkflowService.getAllAssignedCasesForExpert(); // Reuse expert endpoint
      const all = Array.isArray(res.data) ? res.data : [];
      const found = all.find(c => c.case_id === case_id || c.complaint.complaint_id === complaint_id);
      if (found) setCaseData(found);
    } catch (err) {
      showToast("error", "Failed to load investigation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (case_id || complaint_id) fetchCase();
  }, [case_id, complaint_id]);

  const handleApprove = async () => {
    try {
      await regionalWorkflowService.reviewInvestigation({
        case_id: caseData.case_id,
        status: "approved_by_region_admin"
      });
      showToast("success", "Investigation approved successfully!");
      setTimeout(() => navigate("/regional/results"), 2000);
    } catch (err) {
      showToast("error", "Approval failed");
    }
  };

  const handleReturn = async () => {
    try {
      await regionalWorkflowService.reviewInvestigation({
        case_id: caseData.case_id,
        status: "rejected_by_region_admin",
        rejection_reason: "Please revise and resubmit" 
      });
      showToast("info", "Investigation returned for revision");
      setTimeout(() => navigate("/regional/results"), 2000);
    } catch (err) {
      showToast("error", "Return failed");
    }
  };

  if (loading) return <div className="p-12 text-center">Loading investigation...</div>;
  if (!caseData) return <div className="p-12 text-center text-red-600">Case not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            <ArrowLeft /> Back
          </button>
          <h1 className="text-4xl font-bold text-gray-800">Review Investigation</h1>
          <div className="flex gap-4">
            <button
              onClick={handleReturn}
              className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-3"
            >
              <XCircle /> Return for Revision
            </button>
            <button
              onClick={handleApprove}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center gap-3"
            >
              <CheckCircle /> Approve Investigation
            </button>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-center gap-4">
          <AlertCircle className="w-10 h-10 text-amber-600" />
          <div>
            <h3 className="font-bold text-amber-900">Final Review Required</h3>
            <p className="text-amber-700">You are reviewing a completed investigation. Please approve or return with feedback.</p>
          </div>
        </div>

        {/* Full Detail View */}
        <div className="bg-white rounded-3xl shadow-2xl border overflow-hidden">
          <ReportDetailUI
            detail={caseData}
            isRegional={true}
            isReviewMode={true}
            complaint_id={caseData.complaint.complaint_id}
            caseAttachment={caseData?.case?.case_investigation?.[0]?.case_attachement || []}
          />
        </div>
      </div>

      <ToastMessage open={toast.open} type={toast.type} message={toast.message} onClose={() => setToast({ open: false })} />
    </div>
  );
}