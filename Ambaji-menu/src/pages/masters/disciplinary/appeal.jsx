/***
 *  I3EMS - AMT ERP  |  Disciplinary · Appeal / Review   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/appeal
 *  A SET_ASIDE / MODIFIED decision reflects onto the linked penalty order.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "DA_No", label: "No" },
  { key: "DC_Id", label: "Case" },
  { key: "DP_Id", label: "Penalty" },
  { key: "Appeal_Date", label: "Date", type: "date" },
  { key: "Decision", label: "Decision" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "DC_Id", label: "Disciplinary Case (ID)", type: "number", required: true },
  { key: "DP_Id", label: "Penalty Order (ID)", type: "number" },
  { key: "Appeal_Date", label: "Appeal Date", type: "date" },
  { key: "Appeal_Type", label: "Type", type: "select", options: ["APPEAL", "REVIEW", "REVISION"] },
  { key: "Appellate_Authority_Id", label: "Appellate Authority (Emp ID)", type: "number" },
  { key: "Appeal_Grounds", label: "Grounds of Appeal", type: "textarea", full: true },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Under Review", action: "review" },
  { label: "Decide", action: "decide", tone: "primary" },
];
const DisciplinaryAppeal = () => (
  <ResourceManager title="Appeal / Review" endpoint="disciplinary/appeal" idKey="DA_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default DisciplinaryAppeal;
