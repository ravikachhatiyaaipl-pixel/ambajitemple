/***
 *  I3EMS - AMT ERP  |  Recruitment · Appointment Order
 *  Sprint 1 (SOW). Endpoint: /recruitment/appointment-order
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";

const COLUMNS = [{"key": "APO_No", "label": "Order No"}, {"key": "APP_Id", "label": "Application"}, {"key": "Order_Date", "label": "Order Date", "type": "date"}, {"key": "Joining_By_Date", "label": "Join By", "type": "date"}, {"key": "Status", "label": "Status", "type": "status"}];
const FIELDS = [{"key": "APP_Id", "label": "Application (ID)", "type": "number", "required": true}, {"key": "Dpt_Id", "label": "Department (ID)", "type": "number"}, {"key": "Dsg_Id", "label": "Designation (ID)", "type": "number"}, {"key": "Order_Date", "label": "Order Date", "type": "date"}, {"key": "Joining_By_Date", "label": "Joining By Date", "type": "date"}, {"key": "Pay_Scale", "label": "Pay Scale"}, {"key": "Terms", "label": "Terms & Conditions", "type": "textarea", "full": true}];
const ACTIONS = [{"label": "Issue Order", "action": "issue_order"}];

const AppointmentOrder = () => (
  <ResourceManager
    title="Appointment Order"
    endpoint="recruitment/appointment-order"
    idKey="APO_Id"
    columns={COLUMNS}
    fields={FIELDS}
    actions={ACTIONS}
  />
);

export default AppointmentOrder;
