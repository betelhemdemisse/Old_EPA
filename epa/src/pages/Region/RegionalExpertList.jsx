import React from "react";
import ExpertGetCase from "../Expert/expert_case_get.jsx";

export default function RegionalExpertList() {
  // Consolidated: render the HQ Expert page in regional mode
  return <ExpertGetCase isRegional={true} />;
}