/***
 *  I3EMS - AMT ERP  |  Payroll · Loan / Advance Recovery   (Sprint 2, SOW)
 *  Endpoint: /payroll-extra/loan-recovery
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS=[{"key": "LAS_Id", "label": "Loan"}, {"key": "Emp_Id", "label": "Emp"}, {"key": "Installment_No", "label": "Inst#"}, {"key": "Recovery_Period", "label": "Period"}, {"key": "Total_Recovered", "label": "Amount", "type": "amount"}, {"key": "Balance", "label": "Balance", "type": "amount"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS=[{"key": "LAS_Id", "label": "Loan Sanction (ID)", "type": "number", "required": true}, {"key": "Emp_Id", "label": "Employee (ID)", "type": "number"}, {"key": "Installment_No", "label": "Installment No", "type": "number"}, {"key": "Recovery_Period", "label": "Period (YYYY-MM)"}, {"key": "Principal_Recovered", "label": "Principal", "type": "number"}, {"key": "Interest_Recovered", "label": "Interest", "type": "number"}, {"key": "Total_Recovered", "label": "Total", "type": "number"}, {"key": "Balance", "label": "Balance", "type": "number"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS=[{"label": "Recover", "action": "recover", "tone": "primary"}];
const LoanAdvanceRecovery = () => (
  <ResourceManager title="Loan / Advance Recovery" endpoint="payroll-extra/loan-recovery" idKey="LAR_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default LoanAdvanceRecovery;
