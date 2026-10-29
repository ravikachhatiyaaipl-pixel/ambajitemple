/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion · Transfer Request   (Sprint 3, SOW)
 *  Endpoint: /transfer-promotion/transfer-request
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "TRQ_No", label: "No" },
  { key: "Emp_Id", label: "Emp" },
  { key: "Transfer_Type", label: "Type" },
  { key: "From_Dpt_Id", label: "From Dept" },
  { key: "To_Dpt_Id", label: "To Dept" },
  { key: "Request_Date", label: "Date", type: "date" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "Emp_Id", label: "Employee (ID)", type: "number", required: true },
  { key: "Request_Date", label: "Request Date", type: "date" },
  { key: "Transfer_Type", label: "Transfer Type", type: "select", options: ["REQUEST", "ADMINISTRATIVE", "MUTUAL", "DEPUTATION"] },
  { key: "To_Dpt_Id", label: "To Department (ID)", type: "number" },
  { key: "To_Office_Id", label: "To Office (ID)", type: "number" },
  { key: "Mutual_Emp_Id", label: "Mutual Counterpart Emp (ID)", type: "number" },
  { key: "Reason", label: "Reason", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Submit", action: "submit" },
  { label: "Recommend", action: "recommend" },
  { label: "Approve", action: "approve", tone: "primary" },
  { label: "Reject", action: "reject", tone: "danger" },
];
const TransferRequest = () => (
  <ResourceManager title="Transfer Request" endpoint="transfer-promotion/transfer-request" idKey="TRQ_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default TransferRequest;
