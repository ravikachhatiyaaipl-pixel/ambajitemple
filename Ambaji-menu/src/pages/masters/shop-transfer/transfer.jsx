/***
 *  I3EMS - AMT ERP  |  Estate · Shop Transfer   (Sprint 9-11, SOW)
 *  Endpoint: /shop-transfer
 *  On "Complete", the source shop rent agreement is marked TRANSFERRED (server-side).
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "SPT_No", label: "No" },
  { key: "SPM_Id", label: "Shop" },
  { key: "From_Tenant_Name", label: "From" },
  { key: "To_Tenant_Name", label: "To" },
  { key: "Transfer_Date", label: "Date", type: "date" },
  { key: "Transfer_Fee", label: "Fee", type: "amount" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "SPRG_Id", label: "Shop Rent Agreement (SPRG ID)", type: "number", required: true },
  { key: "Transfer_Date", label: "Transfer Date", type: "date" },
  { key: "Transfer_Type", label: "Transfer Type", type: "select", options: ["SALE", "INHERITANCE", "PARTNERSHIP", "OTHER"] },
  { key: "From_Tenant_Name", label: "From Tenant" },
  { key: "To_Tenant_Name", label: "To Tenant", required: true },
  { key: "To_Contact", label: "To Contact" },
  { key: "To_Address", label: "To Address", full: true },
  { key: "To_ID_Proof", label: "To ID Proof" },
  { key: "Transfer_Fee", label: "Transfer Fee (blank = from agreement)", type: "number" },
  { key: "Fee_Paid", label: "Fee Paid", type: "bool" },
  { key: "Reason", label: "Reason", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Submit", action: "submit" },
  { label: "Recommend", action: "recommend" },
  { label: "Approve", action: "approve", tone: "primary" },
  { label: "Complete", action: "complete", tone: "primary" },
  { label: "Reject", action: "reject", tone: "danger" },
];
const ShopTransfer = () => (
  <ResourceManager title="Shop Transfer" endpoint="shop-transfer" idKey="SPT_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default ShopTransfer;
