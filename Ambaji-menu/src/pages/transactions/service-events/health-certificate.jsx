/***  I3EMS - AMT ERP  |  Employee Health Certificate  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const HealthCertificate = () => (
  <EntityManager
    title="Employee Health Certificate"
    subtitle="Medical fitness / periodic health certificates on employee record · AMT"
    endpoint="svc/health-certificate"
    idKey="EHC_Id"
    columns={[
      { key: "Emp_Id", label: "Employee" },
      { key: "Certificate_Type", label: "Type" },
      { key: "Certificate_No", label: "Certificate No" },
      { key: "Issue_Date", label: "Issued", type: "date" },
      { key: "Valid_Upto", label: "Valid Upto", type: "date" },
      { key: "Fitness_Status", label: "Fitness", type: "status" },
    ]}
    fields={[
      { key: "Emp_Id", label: "Employee", type: "lookup", endpoint: "svc/lookup/employees", required: true },
      { key: "Certificate_Type", label: "Certificate Type", type: "select", options: [
        { v: "MEDICAL_FITNESS", l: "Medical Fitness" }, { v: "PERIODIC", l: "Periodic" },
        { v: "PRE_EMPLOYMENT", l: "Pre-employment" }, { v: "DISABILITY", l: "Disability" }, { v: "OTHER", l: "Other" }], required: true },
      { key: "Certificate_No", label: "Certificate No", type: "text" },
      { key: "Issuing_Authority", label: "Issuing Authority / Hospital", type: "text" },
      { key: "Issue_Date", label: "Issue Date", type: "date" },
      { key: "Valid_Upto", label: "Valid Upto", type: "date" },
      { key: "Fitness_Status", label: "Fitness Status", type: "select", options: [
        { v: "FIT", l: "Fit" }, { v: "UNFIT", l: "Unfit" }, { v: "CONDITIONAL", l: "Conditional" }, { v: "PENDING", l: "Pending" }] },
      { key: "Remarks", label: "Remarks", type: "textarea", full: true },
      { key: "Document_File", label: "Certificate Document", type: "file", accept: ".pdf,image/*", full: true },
    ]}
  />
);

export default HealthCertificate;
