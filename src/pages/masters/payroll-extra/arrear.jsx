/***
 *  I3EMS - AMT ERP  |  Payroll · Arrear Calculation   (Sprint 2, SOW)
 *  Endpoint: /payroll-extra/arrear
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS=[{"key": "ARR_No", "label": "No"}, {"key": "Emp_Id", "label": "Emp"}, {"key": "Reason", "label": "Reason"}, {"key": "Component", "label": "Comp."}, {"key": "Months", "label": "Months"}, {"key": "Arrear_Amount", "label": "Arrear", "type": "amount"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS=[{"key": "Emp_Id", "label": "Employee (ID)", "type": "number", "required": true}, {"key": "FY_Id", "label": "Financial Year (ID)", "type": "number"}, {"key": "From_Period", "label": "From (YYYY-MM)"}, {"key": "To_Period", "label": "To (YYYY-MM)"}, {"key": "Reason", "label": "Reason", "type": "select", "options": [{"v": "DA_REVISION", "l": "DA Revision"}, {"v": "PAY_FIXATION", "l": "Pay Fixation"}, {"v": "INCREMENT", "l": "Increment"}, {"v": "OTHER", "l": "Other"}]}, {"key": "Component", "label": "Component", "type": "select", "options": [{"v": "BASIC", "l": "Basic"}, {"v": "DA", "l": "DA"}, {"v": "HRA", "l": "HRA"}, {"v": "TA", "l": "TA"}, {"v": "OTHER", "l": "Other"}]}, {"key": "Old_Amount", "label": "Old Amount / month", "type": "number", "required": true}, {"key": "New_Amount", "label": "New Amount / month", "type": "number", "required": true}, {"key": "Months", "label": "No. of Months", "type": "number", "required": true}, {"key": "Remarks", "label": "Remarks", "type": "textarea", "full": true}];
const ACTIONS=[{"label": "Submit", "action": "submit"}, {"label": "Approve", "action": "approve", "tone": "primary"}, {"label": "Reject", "action": "reject", "tone": "danger"}];
const ArrearCalculation = () => (
  <ResourceManager title="Arrear Calculation" endpoint="payroll-extra/arrear" idKey="ARR_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default ArrearCalculation;
