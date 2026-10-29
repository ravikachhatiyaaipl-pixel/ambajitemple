/***
 *  I3EMS - AMT ERP  |  Disciplinary · Case   (Sprint 5, SOW)
 *  Endpoint: /disciplinary/case
 *  Case status advances automatically as charge/inquiry/findings/penalty/appeal are added.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "DC_No", label: "No" },
  { key: "Emp_Id", label: "Emp" },
  { key: "Case_Type", label: "Type" },
  { key: "Case_Date", label: "Date", type: "date" },
  { key: "Is_Suspended", label: "Suspended", type: "bool" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Emp_Id", label: "Charged Officer (Emp ID)", type: "number", required: true },
  { key: "Case_Date", label: "Case Date", type: "date" },
  { key: "Case_Type", label: "Proceeding Type", type: "select", options: ["MINOR", "MAJOR"] },
  { key: "Reported_By", label: "Reported By (Emp ID)", type: "number" },
  { key: "Allegation", label: "Allegation", type: "textarea", full: true },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Suspend", action: "suspend", tone: "danger" },
  { label: "Revoke Susp.", action: "revoke_suspension" },
  { label: "Close", action: "close", tone: "primary" },
  { label: "Drop", action: "drop", tone: "danger" },
];
const DisciplinaryCase = () => (
  <ResourceManager title="Disciplinary Case" endpoint="disciplinary/case" idKey="DC_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default DisciplinaryCase;
