/***
 *  I3EMS - AMT ERP  |  Loan Management · Eligibility Rule   (Sprint 6, SOW)
 *  Endpoint: /loan-mgmt/eligibility-rule   (extends loan_type_master policy)
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "LT_Id", label: "Loan Type" },
  { key: "Min_Service_Years", label: "Min Svc Yrs" },
  { key: "Max_Multiple_Of_Basic", label: "x Basic" },
  { key: "Min_Gap_Months", label: "Gap (mo)" },
  { key: "Guarantors_Required", label: "Guarantors" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "LT_Id", label: "Loan Type (LT ID)", type: "number", required: true },
  { key: "Min_Service_Years", label: "Minimum Service Years", type: "number" },
  { key: "Max_Age", label: "Maximum Age", type: "number" },
  { key: "Max_Multiple_Of_Basic", label: "Max Multiple of Basic (e.g. 10)", type: "number" },
  { key: "Max_Amount_Override", label: "Max Amount Override", type: "number" },
  { key: "Min_Gap_Months", label: "Min Gap Months (re-loan)", type: "number" },
  { key: "Gender_Restriction", label: "Gender Restriction", type: "select", options: [{ v: "", l: "None" }, { v: "M", l: "Male" }, { v: "F", l: "Female" }] },
  { key: "Guarantors_Required", label: "Guarantors Required", type: "number" },
  { key: "Is_Active", label: "Active", type: "bool" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const EligibilityRule = () => (
  <ResourceManager title="Loan Eligibility Rule" endpoint="loan-mgmt/eligibility-rule" idKey="LER_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default EligibilityRule;
