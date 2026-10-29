/***  I3EMS - AMT ERP  |  Deputation / Repatriation  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const Deputation = () => (
  <EntityManager
    title="Deputation / Repatriation"
    subtitle="Record employee deputation to / repatriation from other organizations · AMT"
    endpoint="svc/deputation"
    idKey="EDP_Id"
    lockField="Status"
    lockValues={["COMPLETED", "CANCELLED"]}
    columns={[
      { key: "Emp_Id", label: "Employee" },
      { key: "Event_Type", label: "Type" },
      { key: "To_Organization", label: "Organization" },
      { key: "From_Date", label: "From", type: "date" },
      { key: "To_Date", label: "To", type: "date" },
      { key: "Status", label: "Status", type: "status" },
    ]}
    actions={[
      { label: "Complete", action: "completed", tone: "primary" },
      { label: "Cancel", action: "cancelled", tone: "danger" },
    ]}
    fields={[
      { key: "Emp_Id", label: "Employee", type: "lookup", endpoint: "svc/lookup/employees", required: true },
      { key: "Event_Type", label: "Event Type", type: "select", options: [{ v: "DEPUTATION", l: "Deputation" }, { v: "REPATRIATION", l: "Repatriation" }], required: true },
      { key: "From_Office", label: "From Office", type: "text" },
      { key: "To_Organization", label: "To Organization", type: "text" },
      { key: "From_Date", label: "From Date", type: "date" },
      { key: "To_Date", label: "To Date", type: "date" },
      { key: "Order_No", label: "Order No", type: "text" },
      { key: "Order_Date", label: "Order Date", type: "date" },
      { key: "Terms", label: "Terms / Conditions", type: "textarea", full: true },
      { key: "Document_File", label: "Order Document", type: "file", accept: ".pdf,image/*", full: true },
    ]}
  />
);

export default Deputation;
