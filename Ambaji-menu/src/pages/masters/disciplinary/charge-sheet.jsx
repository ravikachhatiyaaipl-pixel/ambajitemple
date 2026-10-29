/***
 *  I3EMS - AMT ERP  |  Disciplinary · Charge Sheet   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/charge-sheet
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "CS_No", label: "No" },
  { key: "DC_Id", label: "Case" },
  { key: "Issue_Date", label: "Issued", type: "date" },
  { key: "Reply_Due_Date", label: "Reply Due", type: "date" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "DC_Id", label: "Disciplinary Case (ID)", type: "number", required: true },
  { key: "Issue_Date", label: "Issue Date", type: "date" },
  { key: "Articles_Of_Charge", label: "Articles of Charge", type: "textarea", full: true },
  { key: "Statement_Of_Imputation", label: "Statement of Imputation", type: "textarea", full: true },
  { key: "Reply_Due_Date", label: "Reply Due Date", type: "date" },
  { key: "Employee_Reply", label: "Employee Reply", type: "textarea", full: true },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Issue", action: "issue", tone: "primary" },
  { label: "Reply Received", action: "reply" },
  { label: "No Reply", action: "no_reply", tone: "danger" },
];
const ChargeSheet = () => (
  <ResourceManager title="Charge Sheet" endpoint="disciplinary/charge-sheet" idKey="CS_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default ChargeSheet;
