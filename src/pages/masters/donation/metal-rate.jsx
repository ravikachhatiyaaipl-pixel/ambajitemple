import { useEffect, useState } from "react";
import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S05 - DONATION METAL RATE MASTER (date-wise valuation rate)
 */
const DonationMetalRateMaster = ({ user }) => {
  const [categories, setCategories] = useState([]);
  const [purities, setPurities] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    DonationApi.getCategories()
      .then((r) => setCategories(r?.data?.data || r?.data || []))
      .catch(() => {});
    DonationApi.getPurity()
      .then((r) => setPurities(r?.data?.data || r?.data || []))
      .catch(() => {});
    DonationApi.getWeightUnits()
      .then((r) => setUnits(r?.data?.data || r?.data || []))
      .catch(() => {});
  }, []);

  const purityOptions = purities
    .filter((p) => !categories.length || true)
    .map((p) => ({
      value: p.purity_id,
      label: `${p.purity_name}${
        p.category?.category_name ? ` (${p.category.category_name})` : ""
      }`,
    }));

  return (
    <DonationMasterScreen
      title="Donation Metal Rate Master"
      subtitle="Date-wise metal rate used for donation valuation"
      addLabel="Add Rate"
      api={{
        list: () => DonationApi.getMetalRates(),
        create: (d) => DonationApi.createMetalRate(d),
        update: (d) => DonationApi.updateMetalRate(d),
        remove: (id) => DonationApi.deleteMetalRate(id),
      }}
      columns={[
        { key: "rate_id", label: "#", render: (r) => r.rate_id },
        { key: "rate_date", label: "Rate Date" },
        {
          key: "category_name",
          label: "Category",
          render: (r) => r.category?.category_name || "--",
        },
        {
          key: "purity_name",
          label: "Purity",
          render: (r) => r.purity?.purity_name || "--",
        },
        {
          key: "unit_name",
          label: "Unit",
          render: (r) => r.unit?.unit_name || "--",
        },
        {
          key: "rate_per_unit",
          label: "Rate / Unit",
          render: (r) => (
            <span className="font-semibold text-gray-900">
              Rs. {Number(r.rate_per_unit || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          ),
        },
        {
          key: "is_active",
          label: "Status",
          render: (r) => (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                r.is_active
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {r.is_active ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
      fields={[
        {
          name: "category_id",
          label: "Category",
          type: "select",
          key: "rate_id",
          required: true,
          options: categories.map((c) => ({
            value: c.category_id,
            label: c.category_name,
          })),
        },
        {
          name: "purity_id",
          label: "Purity",
          type: "select",
          required: true,
          options: purityOptions,
        },
        {
          name: "unit_id",
          label: "Unit",
          type: "select",
          required: true,
          options: units.map((u) => ({
            value: u.unit_id,
            label: `${u.unit_name} (${Number(u.conversion_factor).toFixed(4)} g)`,
          })),
        },
        {
          name: "rate_date",
          label: "Rate Date",
          type: "date",
          required: true,
        },
        {
          name: "rate_per_unit",
          label: "Rate Per Unit (Rs.)",
          type: "number",
          step: "0.01",
          min: "0",
          required: true,
          placeholder: "7250.00",
          help: "Per gram / per carat rate for this date",
        },
        { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
      ]}
      stats={(rows) => [
        ["Total Rates", rows.length, "text-gray-900"],
        ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
        ["Categories", categories.length, "text-blue-600"],
        ["Units", units.length, "text-indigo-600"],
      ]}
    />
  );
};

export default DonationMetalRateMaster;
