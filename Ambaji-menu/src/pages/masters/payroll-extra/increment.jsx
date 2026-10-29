/***
 *  I3EMS - AMT ERP  |  Payroll · Increment Entry   (Sprint 2, SOW)
 *  Endpoint: /payroll-extra/increment
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS=[{"key": "INC_No", "label": "No"}, {"key": "Emp_Id", "label": "Emp"}, {"key": "Increment_Date", "label": "Date", "type": "date"}, {"key": "Increment_Type", "label": "Type"}, {"key": "Old_Basic", "label": "Old Basic", "type": "amount"}, {"key": "Increment_Amount", "label": "Increment", "type": "amount"}, {"key": "New_Basic", "label": "New Basic", "type": "amount"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS=[{"key": "Emp_Id", "label": "Employee (ID)", "type": "number", "required": true}, {"key": "FY_Id", "label": "Financial Year (ID)", "type": "number"}, {"key": "Increment_Date", "label": "Increment Date", "type": "date"}, {"key": "Increment_Type", "label": "Type", "type": "select", "options": [{"v": "ANNUAL", "l": "Annual"}, {"v": "PROMOTIONAL", "l": "Promotional"}, {"v": "ADVANCE", "l": "Advance"}]}, {"key": "Old_Basic", "label": "Old Basic", "type": "number", "required": true}, {"key": "Increment_Amount", "label": "Increment Amount", "type": "number", "required": true}, {"key": "Order_No", "label": "Order No"}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS=[{"label": "Submit", "action": "submit"}, {"label": "Approve", "action": "approve", "tone": "primary"}, {"label": "Reject", "action": "reject", "tone": "danger"}];
const EmpIncrement = () => (
  <ResourceManager title="Increment Entry" endpoint="payroll-extra/increment" idKey="INC_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default EmpIncrement;
