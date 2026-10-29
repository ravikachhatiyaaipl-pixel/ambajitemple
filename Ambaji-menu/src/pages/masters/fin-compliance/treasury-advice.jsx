/***  I3EMS - AMT ERP | Finance · Treasury / IFMS Advice (Sprint 8B) | endpoint /fin-compliance/treasury-advice */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "TRA_No", label: "No" }, { key: "PV_Id", label: "Voucher" }, { key: "IFMS_Ref", label: "IFMS Ref" },
  { key: "Advice_Date", label: "Date", type: "date" }, { key: "Amount", label: "Amount", type: "amount" },
  { key: "Mode", label: "Mode" }, { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "PV_Id", label: "Payment Voucher (PV ID)", type: "number" },
  { key: "Treasury_Ref", label: "Treasury Ref" }, { key: "IFMS_Ref", label: "IFMS Ref" },
  { key: "Advice_Date", label: "Advice Date", type: "date" },
  { key: "Amount", label: "Amount", type: "number", required: true },
  { key: "Mode", label: "Mode", type: "select", options: ["RTGS", "NEFT", "CHEQUE", "ECS"] },
  { key: "Bank_Account_Id", label: "Bank Account (ID)", type: "number" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Send", action: "send", tone: "primary" }, { label: "Ack", action: "ack" },
  { label: "Paid", action: "pay", tone: "primary" }, { label: "Return", action: "return", tone: "danger" },
];
const TreasuryAdvice = () => (<ResourceManager title="Treasury / IFMS Advice" endpoint="fin-compliance/treasury-advice" idKey="TRA_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />);
export default TreasuryAdvice;
