/***  I3EMS - AMT ERP  |  Departmental Inquiry Type Master  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const InquiryTypeMaster = () => (
  <EntityManager
    title="Departmental Inquiry Type Master"
    subtitle="Types of departmental inquiry (minor / major) used in disciplinary proceedings · AMT"
    endpoint="svc/inquiry-type"
    idKey="ITM_Id"
    columns={[
      { key: "ITM_Code", label: "Code" },
      { key: "ITM_Name", label: "Inquiry Type" },
      { key: "Category", label: "Category" },
      { key: "Is_Active", label: "Active", type: "bool" },
    ]}
    fields={[
      { key: "ITM_Code", label: "Code", type: "text" },
      { key: "ITM_Name", label: "Inquiry Type", type: "text", required: true },
      { key: "Category", label: "Category", type: "select", options: [{ v: "MINOR", l: "Minor" }, { v: "MAJOR", l: "Major" }, { v: "OTHER", l: "Other" }], required: true },
      { key: "Description", label: "Description", type: "textarea", full: true },
      { key: "Is_Active", label: "Active", type: "bool", default: true },
    ]}
  />
);

export default InquiryTypeMaster;
