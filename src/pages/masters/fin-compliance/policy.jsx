/***  I3EMS - AMT ERP | Finance · Accounting Policy (Sprint 8B) | endpoint /fin-compliance/policy */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "Policy_No", label: "No" }, { key: "Title", label: "Title" }, { key: "Category", label: "Category" },
  { key: "Sort_Order", label: "Order" }, { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "Title", label: "Policy Title", type: "text", required: true },
  { key: "Category", label: "Category" },
  { key: "Content", label: "Policy Content", type: "textarea", full: true },
  { key: "FY_Id", label: "Financial Year (ID)", type: "number" },
  { key: "Sort_Order", label: "Sort Order", type: "number" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const AccountingPolicy = () => (<ResourceManager title="Accounting Policy" endpoint="fin-compliance/policy" idKey="POL_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default AccountingPolicy;
