/***
 *  I3EMS - AMT ERP  |  Appraisal · APAR Representation   (Sprint 4, SOW)
 *  Endpoint: /appraisal/apar-representation
 *  Employee representation against disclosed grading; a GRADE_REVISED decision updates the APAR.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "ARP_No", label: "No" },
  { key: "APR_Id", label: "APAR" },
  { key: "Emp_Id", label: "Emp" },
  { key: "Representation_Date", label: "Date", type: "date" },
  { key: "Decision", label: "Decision" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "APR_Id", label: "APAR Record (ID)", type: "number", required: true },
  { key: "Emp_Id", label: "Employee (ID)", type: "number", required: true },
  { key: "Representation_Date", label: "Representation Date", type: "date" },
  { key: "Grounds", label: "Grounds", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Under Review", action: "review" },
  { label: "Decide", action: "decide", tone: "primary" },
];
const AparRepresentation = () => (
  <ResourceManager title="APAR Representation" endpoint="appraisal/apar-representation" idKey="ARP_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default AparRepresentation;
