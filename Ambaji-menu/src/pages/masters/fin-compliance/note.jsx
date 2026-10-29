/***  I3EMS - AMT ERP | Finance · Notes to Accounts (Sprint 8B) | endpoint /fin-compliance/note */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "Note_No", label: "No" }, { key: "Statement", label: "Statement" }, { key: "Schedule_Ref", label: "Schedule" },
  { key: "Heading", label: "Heading" }, { key: "Sort_Order", label: "Order" }, { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "Statement", label: "Statement", type: "select", options: ["BALANCE_SHEET", "INCOME_EXPENDITURE", "RECEIPTS_PAYMENTS"], required: true },
  { key: "Schedule_Ref", label: "Schedule Reference" },
  { key: "Heading", label: "Heading", type: "text", full: true },
  { key: "Content", label: "Note Content", type: "textarea", full: true },
  { key: "FY_Id", label: "Financial Year (ID)", type: "number" },
  { key: "Sort_Order", label: "Sort Order", type: "number" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FinNote = () => (<ResourceManager title="Notes to Accounts" endpoint="fin-compliance/note" idKey="FSN_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default FinNote;
