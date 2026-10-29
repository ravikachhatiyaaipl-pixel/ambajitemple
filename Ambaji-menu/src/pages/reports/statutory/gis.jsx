/***
 *  I3EMS - AMT ERP  |  Group Insurance Scheme (GIS) Register
 */
import React from "react";
import StatutoryRegister from "../../../components/amt/statutoryregister";

const cols = [
  { key: "Emp_Code", label: "Emp Code" },
  { key: "Employee", label: "Employee" },
  { key: "Employee_Share", label: "GIS Deducted", type: "amount" },
  { key: "Total_Amount", label: "Total", type: "amount" },
  { key: "Bank_AcNo", label: "Bank A/c" },
  { key: "Bank_Name", label: "Bank" },
];

const GisRegister = () => (
  <StatutoryRegister endpoint="statutory-reports/gis" title="GIS Register" menuLink="/reports/statutory/gis" reportCode="STAT-GIS" columns={cols} />
);

export default GisRegister;
