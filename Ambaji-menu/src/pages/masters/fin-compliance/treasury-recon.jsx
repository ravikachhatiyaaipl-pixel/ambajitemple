/***  I3EMS - AMT ERP | Finance · Treasury Reconciliation (Sprint 8B) | endpoint /fin-compliance/treasury-recon
 *   Difference & reconciled flag are computed against the advice amount (server-side). */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "TRA_Id", label: "Advice" }, { key: "Bank_Statement_Ref", label: "Bank Ref" },
  { key: "Cleared_Date", label: "Cleared", type: "date" }, { key: "Cleared_Amount", label: "Cleared Amt", type: "amount" },
  { key: "Difference", label: "Difference", type: "amount" }, { key: "Reconciled", label: "Reconciled", type: "bool" },
];
const FIELDS = [
  { key: "TRA_Id", label: "Treasury Advice (TRA ID)", type: "number", required: true },
  { key: "Bank_Statement_Ref", label: "Bank Statement Ref" },
  { key: "Cleared_Date", label: "Cleared Date", type: "date" },
  { key: "Cleared_Amount", label: "Cleared Amount", type: "number" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const TreasuryRecon = () => (<ResourceManager title="Treasury Reconciliation" endpoint="fin-compliance/treasury-recon" idKey="TRC_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />);
export default TreasuryRecon;
