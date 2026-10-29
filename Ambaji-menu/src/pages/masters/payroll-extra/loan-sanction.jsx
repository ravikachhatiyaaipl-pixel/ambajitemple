/***
 *  I3EMS - AMT ERP  |  Payroll · Loan / Advance Sanction   (Sprint 2, SOW)
 *  Endpoint: /payroll-extra/loan-sanction
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS=[{"key": "LAS_No", "label": "No"}, {"key": "Emp_Id", "label": "Emp"}, {"key": "LT_Id", "label": "Type"}, {"key": "Principal", "label": "Principal", "type": "amount"}, {"key": "Interest_Rate", "label": "Rate %"}, {"key": "Tenure_Months", "label": "Tenure"}, {"key": "Installment_Amount", "label": "EMI", "type": "amount"}, {"key": "Outstanding", "label": "Outstanding", "type": "amount"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS=[{"key": "Emp_Id", "label": "Employee (ID)", "type": "number", "required": true}, {"key": "LT_Id", "label": "Loan/Advance Type (ID)", "type": "number", "required": true}, {"key": "RP_Id", "label": "Recovery Priority (ID)", "type": "number"}, {"key": "Sanction_Date", "label": "Sanction Date", "type": "date"}, {"key": "Principal", "label": "Principal", "type": "number", "required": true}, {"key": "Interest_Rate", "label": "Interest Rate %", "type": "number"}, {"key": "Tenure_Months", "label": "Tenure (months)", "type": "number", "required": true}, {"key": "Start_Period", "label": "Recovery Start (YYYY-MM)"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS=[{"label": "Appraise", "action": "appraise"}, {"label": "Sanction", "action": "sanction", "tone": "primary"}, {"label": "Disburse", "action": "disburse"}, {"label": "Gen. Schedule", "path": "schedule", "done": "Repayment schedule generated", "tone": "primary"}, {"label": "Reject", "action": "reject", "tone": "danger"}];
const LoanAdvanceSanction = () => (
  <ResourceManager title="Loan / Advance Sanction" endpoint="payroll-extra/loan-sanction" idKey="LAS_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default LoanAdvanceSanction;
