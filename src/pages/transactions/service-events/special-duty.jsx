/***  I3EMS - AMT ERP  |  Employee Special Duty Assignment  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const SpecialDuty = () => (
  <EntityManager
    title="Employee Special Duty Assignment"
    subtitle="Assign special duties to employees, with order reference and allowance · AMT"
    endpoint="svc/special-duty"
    idKey="ESD_Id"
    lockField="Status"
    lockValues={["COMPLETED", "CANCELLED"]}
    columns={[
      { key: "Emp_Id", label: "Employee" },
      { key: "Duty_Name", label: "Special Duty" },
      { key: "From_Date", label: "From", type: "date" },
      { key: "To_Date", label: "To", type: "date" },
      { key: "Order_No", label: "Order No" },
      { key: "Status", label: "Status", type: "status" },
    ]}
    actions={[
      { label: "Complete", action: "completed", tone: "primary" },
      { label: "Cancel", action: "cancelled", tone: "danger" },
    ]}
    fields={[
      { key: "Emp_Id", label: "Employee", type: "lookup", endpoint: "svc/lookup/employees", required: true },
      { key: "SDM_Id", label: "Special Duty (master)", type: "lookup", endpoint: "svc/lookup/special-duty-master" },
      { key: "Duty_Name", label: "Duty Name / Description", type: "text", required: true, full: true },
      { key: "From_Date", label: "From Date", type: "date" },
      { key: "To_Date", label: "To Date", type: "date" },
      { key: "Assigned_Office", label: "Assigned Office", type: "text" },
      { key: "Order_No", label: "Order No", type: "text" },
      { key: "Order_Date", label: "Order Date", type: "date" },
      { key: "Allowance_Amount", label: "Allowance Amount", type: "number" },
      { key: "Remarks", label: "Remarks", type: "textarea", full: true },
      { key: "Document_File", label: "Order Document", type: "file", accept: ".pdf,image/*", full: true },
    ]}
  />
);

export default SpecialDuty;
