/***  I3EMS - AMT ERP  |  New Recruit Posting  */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const Posting = () => (
  <EntityManager
    title="New Recruit Posting"
    subtitle="Issue first postings for newly recruited / joined employees · AMT"
    endpoint="svc/posting"
    idKey="EPS_Id"
    lockField="Status"
    lockValues={["JOINED", "CANCELLED"]}
    columns={[
      { key: "Candidate_Name", label: "Candidate" },
      { key: "Posting_Office", label: "Posting Office" },
      { key: "Order_No", label: "Order No" },
      { key: "Posting_Date", label: "Posting Date", type: "date" },
      { key: "Status", label: "Status", type: "status" },
    ]}
    actions={[
      { label: "Joined", action: "joined", tone: "primary" },
      { label: "Cancel", action: "cancelled", tone: "danger" },
    ]}
    fields={[
      { key: "Emp_Id", label: "Employee (if record created)", type: "lookup", endpoint: "svc/lookup/employees" },
      { key: "Candidate_Name", label: "Candidate Name (new recruit)", type: "text" },
      { key: "Desg_Id", label: "Designation", type: "lookup", endpoint: "svc/lookup/designations" },
      { key: "Dpt_Id", label: "Department", type: "lookup", endpoint: "svc/lookup/departments" },
      { key: "Posting_Office", label: "Posting Office", type: "text" },
      { key: "Order_No", label: "Order No", type: "text" },
      { key: "Order_Date", label: "Order Date", type: "date" },
      { key: "Posting_Date", label: "Posting Date", type: "date" },
      { key: "Reporting_Date", label: "Reporting Date", type: "date" },
      { key: "Remarks", label: "Remarks", type: "textarea", full: true },
      { key: "Document_File", label: "Posting Order", type: "file", accept: ".pdf,image/*", full: true },
    ]}
  />
);

export default Posting;
