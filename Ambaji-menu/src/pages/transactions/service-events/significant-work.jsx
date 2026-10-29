/***  I3EMS - AMT ERP  |  Employee Significant Work  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const SignificantWork = () => (
  <EntityManager
    title="Employee Significant Work"
    subtitle="Record notable / significant work done by employees · AMT"
    endpoint="svc/significant-work"
    idKey="ESW_Id"
    columns={[
      { key: "Emp_Id", label: "Employee" },
      { key: "Work_Title", label: "Work Title" },
      { key: "Work_Date", label: "Date", type: "date" },
      { key: "Recognition", label: "Recognition" },
      { key: "Status", label: "Status", type: "status" },
    ]}
    fields={[
      { key: "Emp_Id", label: "Employee", type: "lookup", endpoint: "svc/lookup/employees", required: true },
      { key: "SWM_Id", label: "Significant Work (master)", type: "lookup", endpoint: "svc/lookup/significant-work-master" },
      { key: "Work_Title", label: "Work Title", type: "text", required: true, full: true },
      { key: "Work_Date", label: "Work Date", type: "date" },
      { key: "Description", label: "Description", type: "textarea", full: true },
      { key: "Impact", label: "Impact / Outcome", type: "textarea", full: true },
      { key: "Recognition", label: "Recognition", type: "text" },
      { key: "Document_File", label: "Supporting Document", type: "file", accept: ".pdf,image/*", full: true },
    ]}
  />
);

export default SignificantWork;
