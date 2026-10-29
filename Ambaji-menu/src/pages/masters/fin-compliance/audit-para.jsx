/***  I3EMS - AMT ERP | Finance · Audit Paragraph (Sprint 8B) | endpoint /fin-compliance/audit-para */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "AP_No", label: "No" }, { key: "Audit_Type", label: "Type" }, { key: "Para_No", label: "Para" },
  { key: "Category", label: "Category" }, { key: "Amount_Involved", label: "Amount", type: "amount" },
  { key: "Compliance_Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Audit_Type", label: "Audit Type", type: "select", options: ["INTERNAL", "STATUTORY", "CAG", "LFA"], required: true },
  { key: "Audit_Year", label: "Audit Year" }, { key: "Para_No", label: "Paragraph No" },
  { key: "Dpt_Id", label: "Department (ID)", type: "number" },
  { key: "Category", label: "Category", type: "select", options: ["RECOVERY", "IRREGULAR", "PROCEDURAL", "LOSS"] },
  { key: "Amount_Involved", label: "Amount Involved", type: "number" },
  { key: "Target_Date", label: "Target Date", type: "date" },
  { key: "Observation", label: "Observation", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Reply", action: "reply" }, { label: "Settle", action: "settle", tone: "primary" }, { label: "Drop", action: "drop", tone: "danger" },
];
const AuditPara = () => (<ResourceManager title="Audit Paragraph" endpoint="fin-compliance/audit-para" idKey="AP_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />);
export default AuditPara;
