/***  I3EMS - AMT ERP | HR · Promotion Eligibility Rule (Sprint FINAL) | endpoint /tp-extra/promotion-eligibility */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "From_Desig_Id", label: "From" }, { key: "To_Desig_Id", label: "To" },
  { key: "Min_Service_In_Grade_Years", label: "In-Grade (yr)" }, { key: "Min_Total_Service_Years", label: "Total (yr)" },
  { key: "Min_APAR_Grade", label: "Min APAR" }, { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "From_Desig_Id", label: "From Designation (ID)", type: "number" },
  { key: "To_Desig_Id", label: "To Designation (ID)", type: "number" },
  { key: "Min_Service_In_Grade_Years", label: "Min Service in Grade (years)", type: "number" },
  { key: "Min_Total_Service_Years", label: "Min Total Service (years)", type: "number" },
  { key: "Min_APAR_Grade", label: "Min APAR Grade", type: "select", options: ["", "AVERAGE", "GOOD", "VERY_GOOD", "OUTSTANDING"] },
  { key: "Dpc_Required", label: "DPC Required", type: "bool" },
  { key: "Is_Active", label: "Active", type: "bool" }, { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const PromotionEligibility = () => (<ResourceManager title="Promotion Eligibility Rule" endpoint="tp-extra/promotion-eligibility" idKey="PER_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default PromotionEligibility;
