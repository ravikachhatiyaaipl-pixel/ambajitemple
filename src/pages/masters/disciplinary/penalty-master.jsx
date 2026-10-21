/***
 *  I3EMS - AMT ERP  |  Disciplinary · Penalty Master   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/penalty-master
 *  Statutory disciplinary penalties (distinct from the financial penalty_master).
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "DPM_Code", label: "Code" },
  { key: "DPM_Name", label: "Penalty" },
  { key: "Penalty_Class", label: "Class" },
  { key: "Display_Order", label: "Order" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "DPM_Name", label: "Penalty Name", type: "text", required: true },
  { key: "Penalty_Class", label: "Class", type: "select", options: ["MINOR", "MAJOR"] },
  { key: "Display_Order", label: "Display Order", type: "number" },
  { key: "Is_Active", label: "Active", type: "bool" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const PenaltyMaster = () => (
  <ResourceManager title="Disciplinary Penalty Master" endpoint="disciplinary/penalty-master" idKey="DPM_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default PenaltyMaster;
