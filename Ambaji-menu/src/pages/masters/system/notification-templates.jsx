/***
 *  I3EMS - AMT ERP  |  System · Notification Templates   (Sprint 12, SOW)
 *  Endpoint: /notification-templates
 *  Templates power the reusable NotificationService (SMS/email). Use {tokens} in the body.
 */
import React from "react";
import ResourceManager from "../../../components/resourcemanager";
const COLUMNS = [
  { key: "NT_Code", label: "Code" },
  { key: "NT_Name", label: "Name" },
  { key: "Channel", label: "Channel" },
  { key: "Provider_Template_Id", label: "DLT/Provider Id" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const FIELDS = [
  { key: "NT_Code", label: "Template Code", type: "text", required: true },
  { key: "NT_Name", label: "Template Name", type: "text" },
  { key: "Channel", label: "Channel", type: "select", options: ["SMS", "EMAIL", "BOTH"] },
  { key: "Subject", label: "Subject (email)", type: "text", full: true },
  { key: "Body", label: "Body — use {name}, {date} … tokens", type: "textarea", full: true },
  { key: "Placeholders", label: "Available Tokens (comma-separated)", type: "text", full: true },
  { key: "Provider_Template_Id", label: "DLT / Provider Template Id", type: "text" },
  { key: "Is_Active", label: "Active", type: "bool" },
];
const NotificationTemplates = () => (
  <ResourceManager title="Notification Templates" endpoint="notification-templates" idKey="NT_Id" columns={COLUMNS} fields={FIELDS} actions={[]} />
);
export default NotificationTemplates;
