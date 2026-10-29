import { useEffect, useState } from "react";
import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S03 - DONATION PURITY MASTER (18K/20K/24K, 999/958/925/900, Flawless)
 */
const DonationPurityMaster = ({ user }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    DonationApi.getCategories()
      .then((r) => setCategories(r?.data?.data || r?.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <DonationMasterScreen
      title="Donation Purity Master"
      subtitle="Category-wise purity (18K, 999, Flawless ...)"
      addLabel="Add Purity"
      api={{
        list: () => DonationApi.getPurity(),
        create: (d) => DonationApi.createPurity(d),
        update: (d) => DonationApi.updatePurity(d),
        remove: (id) => DonationApi.deletePurity(id),
      }}
      columns={[
        { key: "purity_id", label: "#", render: (r) => r.purity_id },
        { key: "purity_name", label: "Purity" },
        {
          key: "purity_value",
          label: "Value (%)",
          render: (r) => Number(r.purity_value || 0).toFixed(2),
        },
        {
          key: "category_name",
          label: "Category",
          render: (r) => r.category?.category_name || "--",
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
          key: "purity_id",
          required: true,
          options: categories.map((c) => ({
            value: c.category_id,
            label: c.category_name,
          })),
        },
        {
          name: "purity_name",
          label: "Purity Name",
          required: true,
          placeholder: "18K",
        },
        {
          name: "purity_value",
          label: "Purity Value (%)",
          type: "number",
          step: "0.01",
          min: "0",
          placeholder: "75.00",
          help: "Pure metal percentage (18K = 75.00)",
        },
        { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
      ]}
      stats={(rows) => [
        ["Total Purities", rows.length, "text-gray-900"],
        ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
        ["Categories", categories.length, "text-blue-600"],
        [
          "Avg Purity",
          rows.length
            ? `${(
                rows.reduce((s, r) => s + Number(r.purity_value || 0), 0) /
                rows.length
              ).toFixed(2)}%`
            : "0%",
          "text-amber-600",
        ],
      ]}
    />
  );
};

export default DonationPurityMaster;
