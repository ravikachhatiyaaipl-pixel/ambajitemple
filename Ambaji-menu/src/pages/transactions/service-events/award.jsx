/***  I3EMS - AMT ERP  |  Employee Award / Appreciation Record  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const Award = () => (
  <EntityManager
    title="Employee Award / Appreciation"
    subtitle="Record awards and appreciations conferred on employees · AMT"
    endpoint="svc/award"
    idKey="EAW_Id"
    columns={[
      { key: "Emp_Id", label: "Employee" },
      { key: "Award_Name", label: "Award" },
      { key: "Award_Date", label: "Date", type: "date" },
      { key: "Awarded_By", label: "Awarded By" },
      { key: "Cash_Amount", label: "Cash", type: "amount" },
      { key: "Status", label: "Status", type: "status" },
    ]}
    fields={[
      { key: "Emp_Id", label: "Employee", type: "lookup", endpoint: "svc/lookup/employees", required: true },
      { key: "AWM_Id", label: "Award (master)", type: "lookup", endpoint: "svc/lookup/award-master" },
      { key: "Award_Name", label: "Award Name", type: "text", required: true, full: true },
      { key: "Award_Date", label: "Award Date", type: "date" },
      { key: "Awarded_By", label: "Awarded By", type: "text" },
      { key: "Cash_Amount", label: "Cash Amount", type: "number" },
      { key: "Order_No", label: "Order No", type: "text" },
      { key: "Citation", label: "Citation", type: "textarea", full: true },
      { key: "Document_File", label: "Certificate / Document", type: "file", accept: ".pdf,image/*", full: true },
    ]}
  />
);

export default Award;
