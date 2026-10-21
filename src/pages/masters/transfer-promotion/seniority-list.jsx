/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion · Seniority List   (Sprint 3, SOW)
 *  Endpoint: /transfer-promotion/seniority-list
 *  "Generate" builds ranked entries from employee_master by the chosen criteria (server-side).
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "SNL_No", label: "No" },
  { key: "SNL_Title", label: "Title" },
  { key: "Dpt_Id", label: "Dept" },
  { key: "Cadre", label: "Cadre" },
  { key: "As_On_Date", label: "As On", type: "date" },
  { key: "Criteria", label: "Criteria" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "SNL_Title", label: "Title", type: "text", required: true },
  { key: "Dpt_Id", label: "Department (ID)", type: "number" },
  { key: "Desig_Id", label: "Designation / Cadre (ID)", type: "number" },
  { key: "Cadre", label: "Cadre (label)" },
  { key: "As_On_Date", label: "As On Date", type: "date" },
  { key: "Criteria", label: "Ranking Criteria", type: "select", options: ["JOINING_DATE", "DOB", "MERIT", "CUSTOM"] },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Generate", path: "generate", done: "Seniority list generated", tone: "primary" },
  { label: "Publish", action: "publish" },
  { label: "Finalize", action: "finalize", tone: "primary" },
];
const SeniorityList = () => (
  <ResourceManager title="Seniority List" endpoint="transfer-promotion/seniority-list" idKey="SNL_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default SeniorityList;
