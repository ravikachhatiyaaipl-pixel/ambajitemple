/***
 *  I3EMS - AMT ERP  |  Disciplinary · Inquiry Finding   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/finding
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "IF_No", label: "No" },
  { key: "DC_Id", label: "Case" },
  { key: "Report_Date", label: "Report", type: "date" },
  { key: "Finding", label: "Finding" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "DC_Id", label: "Disciplinary Case (ID)", type: "number", required: true },
  { key: "IO_Id", label: "Inquiry Officer (ID)", type: "number" },
  { key: "Report_Date", label: "Report Date", type: "date" },
  { key: "Finding", label: "Finding", type: "select", options: ["PROVED", "NOT_PROVED", "PARTIALLY_PROVED"] },
  { key: "Findings_Summary", label: "Findings Summary", type: "textarea", full: true },
  { key: "Recommended_DPM_Id", label: "Recommended Penalty (DPM ID)", type: "number" },
  { key: "Disagreement_Note", label: "Authority Disagreement Note", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Submit", action: "submit", tone: "primary" },
  { label: "Accept", action: "accept", tone: "primary" },
  { label: "Remand", action: "remand", tone: "danger" },
];
const InquiryFinding = () => (
  <ResourceManager title="Inquiry Finding" endpoint="disciplinary/finding" idKey="IF_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default InquiryFinding;
