/***
 *  I3EMS - AMT ERP  |  Disciplinary · Inquiry Officer   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/inquiry-officer
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "DC_Id", label: "Case" },
  { key: "Officer_Emp_Id", label: "Inquiry Officer" },
  { key: "Presenting_Officer_Id", label: "Presenting Officer" },
  { key: "Appointed_Date", label: "Appointed", type: "date" },
  { key: "Inquiry_Type", label: "Type" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "DC_Id", label: "Disciplinary Case (ID)", type: "number", required: true },
  { key: "Officer_Emp_Id", label: "Inquiry Officer (Emp ID)", type: "number" },
  { key: "Presenting_Officer_Id", label: "Presenting Officer (Emp ID)", type: "number" },
  { key: "Appointed_Date", label: "Appointed Date", type: "date" },
  { key: "Inquiry_Type", label: "Inquiry Type", type: "select", options: ["DEPARTMENTAL", "COMMISSIONED"] },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Start", action: "start", tone: "primary" },
  { label: "Conclude", action: "conclude" },
  { label: "Recuse", action: "recuse", tone: "danger" },
];
const InquiryOfficer = () => (
  <ResourceManager title="Inquiry Officer" endpoint="disciplinary/inquiry-officer" idKey="IO_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default InquiryOfficer;
