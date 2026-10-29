/***
 *  I3EMS - AMT ERP  |  Appraisal · APAR Record   (Sprint 4, SOW)
 *  Endpoint: /appraisal/apar-record
 *  Attribute scores are captured via /appraisal/apar-record/{id}/scores; grades are
 *  computed server-side on Reporting/Reviewing assessment and on Accept.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "APR_No", label: "No" },
  { key: "ACY_Id", label: "Cycle" },
  { key: "Emp_Id", label: "Emp" },
  { key: "RO_Grade", label: "RO Grade" },
  { key: "Rev_Grade", label: "Rev Grade" },
  { key: "Final_Grade", label: "Final" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "ACY_Id", label: "Appraisal Cycle (ID)", type: "number", required: true },
  { key: "Emp_Id", label: "Employee / Appraisee (ID)", type: "number", required: true },
  { key: "Reporting_Officer_Id", label: "Reporting Officer (Emp ID)", type: "number" },
  { key: "Reviewing_Officer_Id", label: "Reviewing Officer (Emp ID)", type: "number" },
  { key: "Accepting_Authority_Id", label: "Accepting Authority (Emp ID)", type: "number" },
  { key: "Self_Appraisal", label: "Self Appraisal", type: "textarea", full: true },
  { key: "RO_Remarks", label: "Reporting Officer Remarks", type: "textarea", full: true },
  { key: "Rev_Remarks", label: "Reviewing Officer Remarks", type: "textarea", full: true },
  { key: "Integrity_Certified", label: "Integrity Certified", type: "bool" },
];
const ACTIONS = [
  { label: "Self Submit", action: "self_submit" },
  { label: "RO Assess", action: "ro_assess" },
  { label: "Review", action: "review" },
  { label: "Accept", action: "accept", tone: "primary" },
  { label: "Disclose", action: "disclose" },
  { label: "Finalize", action: "finalize", tone: "primary" },
];
const AparRecord = () => (
  <ResourceManager title="APAR Record" endpoint="appraisal/apar-record" idKey="APR_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default AparRecord;
