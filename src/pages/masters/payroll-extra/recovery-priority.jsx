/***
 *  I3EMS - AMT ERP  |  Payroll · Recovery Priority Master   (Sprint 2, SOW)
 *  Endpoint: /payroll-extra/recovery-priority
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS=[{"key": "RP_Code", "label": "Code"}, {"key": "RP_Name", "label": "Name"}, {"key": "Priority_Order", "label": "Order"}, {"key": "Is_Active", "label": "Active", "type": "bool"}];
const FIELDS=[{"key": "RP_Code", "label": "Code"}, {"key": "RP_Name", "label": "Name", "required": true}, {"key": "Priority_Order", "label": "Priority Order", "type": "number", "required": true}, {"key": "Is_Active", "label": "Active", "type": "bool"}];
const ACTIONS=[];
const RecoveryPriorityMaster = () => (
  <ResourceManager title="Recovery Priority Master" endpoint="payroll-extra/recovery-priority" idKey="RP_Id" columns={COLUMNS} fields={FIELDS} actions={ACTIONS} />
);
export default RecoveryPriorityMaster;
