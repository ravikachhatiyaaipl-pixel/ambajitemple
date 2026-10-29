/***
 *  I3EMS - AMT ERP  |  Disciplinary · Penalty Order   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/penalty
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "DP_No", label: "No" },
  { key: "DC_Id", label: "Case" },
  { key: "DPM_Id", label: "Penalty" },
  { key: "Order_Date", label: "Order", type: "date" },
  { key: "Effective_Date", label: "Effective", type: "date" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "DC_Id", label: "Disciplinary Case (ID)", type: "number", required: true },
  { key: "DPM_Id", label: "Penalty (DPM ID)", type: "number", required: true },
  { key: "Order_Date", label: "Order Date", type: "date" },
  { key: "Effective_Date", label: "Effective Date", type: "date" },
  { key: "Order_Ref", label: "Order Reference" },
  { key: "Penalty_Details", label: "Penalty Details", type: "textarea", full: true },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Approve", action: "approve" },
  { label: "Impose", action: "impose", tone: "primary" },
  { label: "Stay", action: "stay" },
  { label: "Set Aside", action: "set_aside", tone: "danger" },
];
const DisciplinaryPenalty = () => (
  <ResourceManager title="Penalty Order" endpoint="disciplinary/penalty" idKey="DP_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default DisciplinaryPenalty;
