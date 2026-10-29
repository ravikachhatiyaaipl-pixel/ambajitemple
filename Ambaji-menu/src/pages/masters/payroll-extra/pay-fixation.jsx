/***
 *  I3EMS - AMT ERP  |  Payroll · Pay Fixation   (Sprint 2, SOW)
 *  Endpoint: /payroll-extra/pay-fixation
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS=[{"key": "PF_No", "label": "No"}, {"key": "Emp_Id", "label": "Emp"}, {"key": "Fixation_Date", "label": "Date", "type": "date"}, {"key": "Reason", "label": "Reason"}, {"key": "Old_Basic", "label": "Old Basic", "type": "amount"}, {"key": "New_Basic", "label": "New Basic", "type": "amount"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS=[{"key": "Emp_Id", "label": "Employee (ID)", "type": "number", "required": true}, {"key": "Fixation_Date", "label": "Fixation Date", "type": "date"}, {"key": "Reason", "label": "Reason", "type": "select", "options": [{"v": "PAY_COMMISSION", "l": "Pay Commission"}, {"v": "PROMOTION", "l": "Promotion"}, {"v": "MACP", "l": "MACP"}, {"v": "OTHER", "l": "Other"}]}, {"key": "Old_Pay_Band", "label": "Old Pay Band"}, {"key": "Old_Grade_Pay", "label": "Old Grade Pay", "type": "number"}, {"key": "Old_Basic", "label": "Old Basic", "type": "number"}, {"key": "New_Pay_Band", "label": "New Pay Band"}, {"key": "New_Grade_Pay", "label": "New Grade Pay", "type": "number"}, {"key": "New_Basic", "label": "New Basic", "type": "number"}, {"key": "Effective_Date", "label": "Effective Date", "type": "date"}, {"key": "Order_No", "label": "Order No"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS=[{"label": "Submit", "action": "submit"}, {"label": "Approve", "action": "approve", "tone": "primary"}, {"label": "Reject", "action": "reject", "tone": "danger"}];
const PayFixation = () => (
  <ResourceManager title="Pay Fixation" endpoint="payroll-extra/pay-fixation" idKey="PF_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default PayFixation;
