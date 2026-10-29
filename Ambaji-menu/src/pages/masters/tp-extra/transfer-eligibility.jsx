/***  I3EMS - AMT ERP | HR · Transfer Eligibility Rule (Sprint FINAL) | endpoint /tp-extra/transfer-eligibility */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "Desig_Id", label: "Desig" }, { key: "Cadre", label: "Cadre" },
  { key: "Min_Tenure_Months", label: "Min Tenure (mo)" }, { key: "Min_Service_Years", label: "Min Svc (yr)" },
  { key: "Max_Postings", label: "Max Postings" }, { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "Desig_Id", label: "Designation (ID)", type: "number" }, { key: "Cadre", label: "Cadre" },
  { key: "Min_Tenure_Months", label: "Min Tenure at Posting (months)", type: "number" },
  { key: "Min_Service_Years", label: "Min Service (years)", type: "number" },
  { key: "Max_Postings", label: "Max Postings", type: "number" },
  { key: "Allow_Request", label: "Allow Request Transfer", type: "bool" },
  { key: "Is_Active", label: "Active", type: "bool" }, { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const TransferEligibility = () => (<ResourceManager title="Transfer Eligibility Rule" endpoint="tp-extra/transfer-eligibility" idKey="TER_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default TransferEligibility;
