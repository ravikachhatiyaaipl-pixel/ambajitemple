/***
 *  I3EMS - AMT ERP  |  Finance · Financial Report Mapping   (Sprint 8, SOW)
 *  Endpoint: /fin-mapping
 *  Classifies ledgers / groups / budget heads into statement schedules (needed for Balance Sheet).
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "Statement", label: "Statement" },
  { key: "Side", label: "Side" },
  { key: "Schedule", label: "Schedule" },
  { key: "Lg_Id", label: "Ledger" },
  { key: "Bh_Id", label: "Budget Head" },
  { key: "Sort_Order", label: "Order" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "Statement", label: "Statement", type: "select", options: ["RECEIPTS_PAYMENTS", "INCOME_EXPENDITURE", "BALANCE_SHEET"], required: true },
  { key: "Side", label: "Side", type: "select", options: ["RECEIPT", "PAYMENT", "INCOME", "EXPENDITURE", "ASSET", "LIABILITY"], required: true },
  { key: "Schedule", label: "Schedule Label" },
  { key: "Lg_Id", label: "Ledger (Lg ID)", type: "number" },
  { key: "GT_Id", label: "Ledger Group Type (GT ID)", type: "number" },
  { key: "Bh_Id", label: "Budget Head (Bh ID)", type: "number" },
  { key: "Sort_Order", label: "Sort Order", type: "number" },
  { key: "Is_Active", label: "Active", type: "bool" },
  { key: "Remarks", label: "Remarks", type: "textarea", full: true },
];
const FinMapping = () => (
  <ResourceManager title="Financial Report Mapping" endpoint="fin-mapping" idKey="FRM_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default FinMapping;
