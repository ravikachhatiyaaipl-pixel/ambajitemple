/***  I3EMS - AMT ERP  |  Transfer Criteria Configuration  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const TransferCriteria = () => (
  <EntityManager
    title="Transfer Criteria Configuration"
    subtitle="Eligibility rules governing employee transfers · AMT"
    endpoint="svc/transfer-criteria"
    idKey="TCC_Id"
    columns={[
      { key: "TCC_Name", label: "Criteria" },
      { key: "Min_Tenure_Months", label: "Min Tenure (mo)" },
      { key: "Max_Stay_Years", label: "Max Stay (yr)" },
      { key: "Zone_Policy", label: "Zone Policy" },
      { key: "Is_Active", label: "Active", type: "bool" },
    ]}
    fields={[
      { key: "TCC_Name", label: "Criteria Name", type: "text", required: true, full: true },
      { key: "Desg_Id", label: "Applicable Designation (optional)", type: "lookup", endpoint: "svc/lookup/designations" },
      { key: "Min_Tenure_Months", label: "Minimum Tenure (months)", type: "number" },
      { key: "Max_Stay_Years", label: "Maximum Stay at Posting (years)", type: "number" },
      { key: "Zone_Policy", label: "Zone Policy", type: "text" },
      { key: "Requires_Vigilance_Clearance", label: "Requires Vigilance Clearance", type: "bool" },
      { key: "Description", label: "Description / Rule Notes", type: "textarea", full: true },
      { key: "Is_Active", label: "Active", type: "bool", default: true },
    ]}
  />
);

export default TransferCriteria;
