/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion · Promotion Proposal   (Sprint 3, SOW)
 *  Endpoint: /transfer-promotion/promotion-proposal
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "PRP_No", label: "No" },
  { key: "Emp_Id", label: "Emp" },
  { key: "Promotion_Type", label: "Type" },
  { key: "To_Desig_Id", label: "To Desig" },
  { key: "Proposal_Date", label: "Date", type: "date" },
  { key: "Dpc_Cleared", label: "DPC", type: "bool" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Emp_Id", label: "Employee (ID)", type: "number", required: true },
  { key: "Proposal_Date", label: "Proposal Date", type: "date" },
  { key: "Promotion_Type", label: "Promotion Type", type: "select", options: ["REGULAR", "MACP", "ADHOC", "INSITU"] },
  { key: "From_Desig_Id", label: "From Designation (ID)", type: "number" },
  { key: "To_Desig_Id", label: "To Designation (ID)", type: "number", required: true },
  { key: "Dpt_Id", label: "Department (ID)", type: "number" },
  { key: "Present_Basic", label: "Present Basic", type: "number" },
  { key: "Proposed_Basic", label: "Proposed Basic", type: "number" },
  { key: "Seniority_Rank", label: "Seniority Rank", type: "number" },
  { key: "Vacancy_Ref", label: "Vacancy Reference" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Submit", action: "submit" },
  { label: "DPC Clear", action: "dpc_clear" },
  { label: "Approve", action: "approve", tone: "primary" },
  { label: "Reject", action: "reject", tone: "danger" },
];
const PromotionProposal = () => (
  <ResourceManager title="Promotion Proposal" endpoint="transfer-promotion/promotion-proposal" idKey="PRP_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default PromotionProposal;
