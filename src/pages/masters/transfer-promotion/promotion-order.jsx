/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion · Promotion Order   (Sprint 3, SOW)
 *  Endpoint: /transfer-promotion/promotion-order
 *  On "Join", the server updates the employee's designation/basic and writes posting_history.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "PRO_No", label: "No" },
  { key: "Emp_Id", label: "Emp" },
  { key: "Promotion_Type", label: "Type" },
  { key: "To_Desig_Id", label: "To Desig" },
  { key: "New_Basic", label: "New Basic", type: "amount" },
  { key: "Join_Date", label: "Joined", type: "date" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "PRP_Id", label: "From Promotion Proposal (ID, optional)", type: "number" },
  { key: "Emp_Id", label: "Employee (ID)", type: "number", required: true },
  { key: "Order_Date", label: "Order Date", type: "date" },
  { key: "Promotion_Type", label: "Promotion Type", type: "select", options: ["REGULAR", "MACP", "ADHOC", "INSITU"] },
  { key: "From_Desig_Id", label: "From Designation (ID)", type: "number" },
  { key: "To_Desig_Id", label: "To Designation (ID)", type: "number", required: true },
  { key: "Old_Basic", label: "Old Basic", type: "number" },
  { key: "New_Basic", label: "New Basic", type: "number" },
  { key: "Effective_Date", label: "Effective Date", type: "date" },
  { key: "Order_Ref", label: "Order Reference" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Approve", action: "approve" },
  { label: "Issue", action: "issue", tone: "primary" },
  { label: "Join", action: "join", tone: "primary" },
  { label: "Cancel", action: "cancel", tone: "danger" },
];
const PromotionOrder = () => (
  <ResourceManager title="Promotion Order" endpoint="transfer-promotion/promotion-order" idKey="PRO_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default PromotionOrder;
