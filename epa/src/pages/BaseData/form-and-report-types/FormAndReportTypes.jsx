import { useState } from "react";
import FilterTab from "../../../components/Form/FilterTab.jsx";

import FormTypesList from "../FormTypes/FormTypesList.jsx";
import ReportTypesList from "../ReportTypes/ReportTypesList.jsx";
import ReportingFormsList from "../ReportingForms/ReportingFormsList.jsx";
import Button from "../../../components/Buttons/Buttons.jsx";
import { ArrowLeft } from "lucide-react";

export default function FormAndReportTypes() {
  const [activeTab, setActiveTab] = useState("reportTypes");

  return (
    <>
      {activeTab === "reportTypes" && (
        <ReportTypesList activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {activeTab === "formTypes" && (
        <FormTypesList activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {activeTab === "reportingForms" && (
        <ReportingFormsList activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </>
  );
}

