/***
 *  I3EMS - AMT ERP
 *  Reusable filter inputs for report filter bars (consistent styling).
 */
import React from "react";

const cls =
  "w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm";

export const SelectField = ({ label, value, onChange, options = [], valueKey, labelKey, placeholder = "All" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select className={cls} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o[valueKey]} value={o[valueKey]}>
          {o[labelKey]}
        </option>
      ))}
    </select>
  </div>
);

export const DateField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input type="date" className={cls} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export const NumberField = ({ label, value, onChange, placeholder = "" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="number"
      className={cls}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
