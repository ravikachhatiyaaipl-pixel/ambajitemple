/***  I3EMS - AMT ERP | HR · Deputation / Repatriation (Sprint FINAL) | endpoint /tp-extra/deputation */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "DEP_No", label: "No" }, { key: "Emp_Id", label: "Emp" }, { key: "Direction", label: "Dir" },
  { key: "Counterpart_Org", label: "Counterpart" }, { key: "Deputation_Date", label: "From", type: "date" },
  { key: "Period_Upto", label: "Upto", type: "date" }, { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Emp_Id", label: "Employee (ID)", type: "number", required: true },
  { key: "Direction", label: "Direction", type: "select", options: ["OUTWARD", "INWARD"] },
  { key: "Counterpart_Org", label: "Counterpart Organisation", full: true },
  { key: "From_Dpt_Id", label: "From Department (ID)", type: "number" },
  { key: "To_Dpt_Id", label: "To Department (ID)", type: "number" },
  { key: "Deputation_Date", label: "Deputation Date", type: "date" },
  { key: "Period_Upto", label: "Period Upto", type: "date" },
  { key: "Lien_Retained", label: "Lien Retained", type: "bool" },
  { key: "Order_Ref", label: "Order Reference" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Approve", action: "approve", tone: "primary" },
  { label: "Relieve", action: "relieve" },
  { label: "Repatriate", action: "repatriate", tone: "primary" },
  { label: "Cancel", action: "cancel", tone: "danger" },
];
const Deputation = () => (<ResourceManager title="Deputation / Repatriation" endpoint="tp-extra/deputation" idKey="DEP_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />);
export default Deputation;
