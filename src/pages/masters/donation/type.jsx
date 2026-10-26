import { useEffect, useState } from "react";
import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S02 - DONATION TYPE MASTER (Coin / Biscuit / Bar / Other)
 */
const DonationTypeMaster = ({ user }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    DonationApi.getCategories()
      .then((r) => setCategories(r?.data?.data || r?.data || []))
      .catch(() => setCategories([]));
  }, []);

  const catOptions = categories.map((c) => ({
    value: c.category_id,
    label: c.category_name,
  }));

  return (
    <DonationMasterScreen
      title="Donation Type Master"
      subtitle="Category-wise donation types (Coin, Biscuit, Bar, Other)"
      addLabel="Add Type"
      api={{
        list: () => DonationApi.getTypes(),
        create: (d) => DonationApi.createType(d),
        update: (d) => DonationApi.updateType(d),
        remove: (id) => DonationApi.deleteType(id),
      }}
      columns={[
        { key: "type_id", label: "#", render: (r) => r.type_id },
        { key: "type_name", label: "Type Name" },
        {
          key: "category_name",
          label: "Category",
          source: "category.category_name",
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
          key: "type_id",
          required: true,
          options: catOptions,
        },
        {
          name: "type_name",
          label: "Type Name",
          required: true,
          placeholder: "Coin",
        },
        { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
      ]}
      stats={(rows) => [
        ["Total Types", rows.length, "text-gray-900"],
        ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
        ["Categories", categories.length, "text-blue-600"],
        [
          "Inactive",
          rows.filter((r) => !r.is_active).length,
          "text-gray-500",
        ],
      ]}
    />
  );
};

export default DonationTypeMaster;
