/***
 *  I3EMS - AMT ERP  |  Appraisal · Appraisal Cycle   (Sprint 4, SOW)
 *  Endpoint: /appraisal/appraisal-cycle
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "ACY_Code", label: "Code" },
  { key: "ACY_Name", label: "Cycle" },
  { key: "Period_From", label: "From", type: "date" },
  { key: "Period_To", label: "To", type: "date" },
  { key: "Applicable_Cadre", label: "Cadre" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "ACY_Name", label: "Cycle Name", type: "text", required: true },
  { key: "FY_Id", label: "Financial Year (ID)", type: "number" },
  { key: "Period_From", label: "Period From", type: "date" },
  { key: "Period_To", label: "Period To", type: "date" },
  { key: "Applicable_Cadre", label: "Applicable Cadre", type: "text" },
  { key: "Self_Due_Date", label: "Self-Appraisal Due", type: "date" },
  { key: "RO_Due_Date", label: "Reporting Officer Due", type: "date" },
  { key: "Review_Due_Date", label: "Reviewing Officer Due", type: "date" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "In Progress", action: "progress" },
  { label: "Close", action: "close", tone: "danger" },
];
const AppraisalCycle = () => (
  <ResourceManager title="Appraisal Cycle" endpoint="appraisal/appraisal-cycle" idKey="ACY_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default AppraisalCycle;
