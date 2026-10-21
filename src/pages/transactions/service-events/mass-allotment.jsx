/***  I3EMS - AMT ERP  |  Mass Transfer Allotment
 *  Rows sharing the same Allotment No form one batch (leave Allotment No blank on the
 *  first row to auto-generate, then reuse it for the rest of the batch).
 */
import React from "react";
import EntityManager from "../../../components/amt/entitymanager";

const MassAllotment = () => (
  <EntityManager
    title="Mass Transfer Allotment"
    subtitle="Batch transfer allotment — rows sharing an Allotment No form one order · AMT"
    endpoint="svc/mass-allotment"
    idKey="TAL_Id"
    lockField="Status"
    lockValues={["JOINED", "CANCELLED"]}
    columns={[
      { key: "Allotment_No", label: "Allotment No" },
      { key: "Emp_Id", label: "Employee" },
      { key: "From_Office", label: "From" },
      { key: "To_Office", label: "To" },
      { key: "Order_No", label: "Order No" },
      { key: "Status", label: "Status", type: "status" },
    ]}
    actions={[
      { label: "Relieved", action: "relieved", tone: "info" },
      { label: "Joined", action: "joined", tone: "primary" },
      { label: "Cancel", action: "cancelled", tone: "danger" },
    ]}
    fields={[
      { key: "Allotment_No", label: "Allotment No (blank = auto)", type: "text" },
      { key: "Allotment_Date", label: "Allotment Date", type: "date" },
      { key: "Emp_Id", label: "Employee", type: "lookup", endpoint: "svc/lookup/employees", required: true },
      { key: "From_Office", label: "From Office", type: "text" },
      { key: "To_Office", label: "To Office", type: "text" },
      { key: "Desg_Id", label: "Designation", type: "lookup", endpoint: "svc/lookup/designations" },
      { key: "TCC_Id", label: "Transfer Criteria Applied", type: "lookup", endpoint: "svc/lookup/transfer-criteria" },
      { key: "Order_No", label: "Order No", type: "text" },
      { key: "Order_Date", label: "Order Date", type: "date" },
      { key: "Relieve_Date", label: "Relieve Date", type: "date" },
      { key: "Join_Date", label: "Join Date", type: "date" },
      { key: "Remarks", label: "Remarks", type: "textarea", full: true },
    ]}
  />
);

export default MassAllotment;
