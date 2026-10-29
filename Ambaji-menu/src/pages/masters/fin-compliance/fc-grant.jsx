/***  I3EMS - AMT ERP | Finance · FC Grant (Sprint 8B) | endpoint /fin-compliance/fc-grant */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "FCG_No", label: "No" }, { key: "FC_Type", label: "Type" }, { key: "Purpose", label: "Purpose" },
  { key: "Sanctioned_Amount", label: "Sanctioned", type: "amount" }, { key: "Received_Amount", label: "Received", type: "amount" },
  { key: "Valid_Upto", label: "Valid Upto", type: "date" }, { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "FC_Type", label: "FC Type", type: "select", options: ["SFC", "CFC", "15FC", "OTHER"], required: true },
  { key: "Tranche", label: "Tranche" },
  { key: "Purpose", label: "Purpose", type: "select", options: ["BASIC", "TIED", "PERFORMANCE"] },
  { key: "Sanction_No", label: "Sanction No" }, { key: "Sanction_Date", label: "Sanction Date", type: "date" },
  { key: "FY_Id", label: "Financial Year (ID)", type: "number" },
  { key: "Sanctioned_Amount", label: "Sanctioned Amount", type: "number", required: true },
  { key: "Received_Amount", label: "Received Amount", type: "number" },
  { key: "Received_Date", label: "Received Date", type: "date" },
  { key: "Valid_Upto", label: "Utilisation Valid Upto", type: "date" },
  { key: "Conditions", label: "Conditions", type: "textarea", full: true },
];
const ACTIONS = [
  { label: "Receive", action: "receive", tone: "primary" }, { label: "Utilise", action: "utilise" },
  { label: "Lapse", action: "lapse", tone: "danger" }, { label: "Close", action: "close" },
];
const FcGrant = () => (<ResourceManager title="Finance Commission Grant" endpoint="fin-compliance/fc-grant" idKey="FCG_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />);
export default FcGrant;
