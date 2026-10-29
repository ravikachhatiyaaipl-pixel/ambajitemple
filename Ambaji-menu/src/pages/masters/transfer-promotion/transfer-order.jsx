/***
 *  I3EMS - AMT ERP  |  Transfer & Promotion · Transfer Order   (Sprint 3, SOW)
 *  Endpoint: /transfer-promotion/transfer-order
 *  On "Join", the server posts the employee to the new department and writes posting_history.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "TRO_No", label: "No" },
  { key: "Emp_Id", label: "Emp" },
  { key: "Transfer_Type", label: "Type" },
  { key: "To_Dpt_Id", label: "To Dept" },
  { key: "Order_Date", label: "Order Date", type: "date" },
  { key: "Join_Date", label: "Joined", type: "date" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "TRQ_Id", label: "From Transfer Request (ID, optional)", type: "number" },
  { key: "Emp_Id", label: "Employee (ID)", type: "number", required: true },
  { key: "Order_Date", label: "Order Date", type: "date" },
  { key: "Transfer_Type", label: "Transfer Type", type: "select", options: ["ADMINISTRATIVE", "REQUEST", "MUTUAL", "DEPUTATION"] },
  { key: "To_Dpt_Id", label: "To Department (ID)", type: "number", required: true },
  { key: "To_Office_Id", label: "To Office (ID)", type: "number" },
  { key: "To_Desig_Id", label: "To Designation (ID)", type: "number" },
  { key: "Order_Ref", label: "Order Reference" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Approve", action: "approve" },
  { label: "Issue", action: "issue", tone: "primary" },
  { label: "Relieve", action: "relieve" },
  { label: "Join", action: "join", tone: "primary" },
  { label: "Cancel", action: "cancel", tone: "danger" },
];
const TransferOrder = () => (
  <ResourceManager title="Transfer Order" endpoint="transfer-promotion/transfer-order" idKey="TRO_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default TransferOrder;
