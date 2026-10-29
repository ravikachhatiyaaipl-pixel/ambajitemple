/***
 *  I3EMS - AMT ERP  |  Loan Management · Guarantor   (Sprint 6, SOW)
 *  Endpoint: /loan-mgmt/guarantor
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "LAS_Id", label: "Loan" },
  { key: "Guarantor_Name", label: "Guarantor" },
  { key: "Relation", label: "Relation" },
  { key: "Guaranteed_Amount", label: "Amount", type: "amount" },
  { key: "Status", label: "Status", type: "status" },
];
const FIELDS = [
  { key: "LAS_Id", label: "Loan Sanction (LAS ID)", type: "number", required: true },
  { key: "Guarantor_Emp_Id", label: "Guarantor (Emp ID, if internal)", type: "number" },
  { key: "Guarantor_Name", label: "Guarantor Name (if external)", type: "text" },
  { key: "Relation", label: "Relation" },
  { key: "Contact", label: "Contact" },
  { key: "ID_Proof", label: "ID Proof" },
  { key: "Guaranteed_Amount", label: "Guaranteed Amount", type: "number" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const ACTIONS = [{ label: "Release", action: "release", tone: "danger" }];
const Guarantor = () => (
  <ResourceManager title="Loan Guarantor" endpoint="loan-mgmt/guarantor" idKey="LG_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default Guarantor;
