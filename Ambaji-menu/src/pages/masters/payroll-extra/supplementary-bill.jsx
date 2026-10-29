/***
 *  I3EMS - AMT ERP  |  Payroll · Supplementary Bill   (Sprint 2, SOW)
 *  Endpoint: /payroll-extra/supplementary-bill
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS=[{"key": "SB_No", "label": "No"}, {"key": "Emp_Id", "label": "Emp"}, {"key": "Dpt_Id", "label": "Dept"}, {"key": "Bill_Date", "label": "Date", "type": "date"}, {"key": "Bill_Type", "label": "Type"}, {"key": "Gross_Amount", "label": "Gross", "type": "amount"}, {"key": "Net_Amount", "label": "Net", "type": "amount"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS=[{"key": "Emp_Id", "label": "Employee (ID)", "type": "number"}, {"key": "Dpt_Id", "label": "Department (ID)", "type": "number"}, {"key": "FY_Id", "label": "Financial Year (ID)", "type": "number"}, {"key": "Bill_Date", "label": "Bill Date", "type": "date"}, {"key": "Bill_Type", "label": "Bill Type", "type": "select", "options": [{"v": "ARREAR", "l": "Arrear"}, {"v": "SUPPLEMENTARY", "l": "Supplementary"}, {"v": "MISC", "l": "Misc"}]}, {"key": "Gross_Amount", "label": "Gross Amount", "type": "number", "required": true}, {"key": "Deductions", "label": "Deductions", "type": "number"}, {"key": "Reference", "label": "Reference"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS=[{"label": "Approve", "action": "approve", "tone": "primary"}, {"label": "Pay", "action": "pay"}, {"label": "Reject", "action": "reject", "tone": "danger"}];
const SupplementaryBill = () => (
  <ResourceManager title="Supplementary Bill" endpoint="payroll-extra/supplementary-bill" idKey="SB_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default SupplementaryBill;
