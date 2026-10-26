import { useEffect, useState } from "react";
import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S01 - DONATION CATEGORY MASTER (Gold / Silver / Diamond)
 */
const DonationCategoryMaster = ({ user }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    DonationApi.getCategories()
      .then((r) => setCategories(r?.data?.data || r?.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <DonationMasterScreen
      title="Donation Category Master"
      subtitle="Gold, Silver and Diamond categories"
      addLabel="Add Category"
      api={{
        list: () => DonationApi.getCategories(),
        create: (d) => DonationApi.createCategory(d),
        update: (d) => DonationApi.updateCategory(d),
        remove: (id) => DonationApi.deleteCategory(id),
      }}
      columns={[
        { key: "category_id", label: "#", render: (r) => r.category_id },
        { key: "category_name", label: "Category Name" },
        {
          key: "category_desc",
          label: "Description",
          render: (r) => r.category_desc || "-",
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
          name: "category_name",
          label: "Category Name",
          key: "category_id",
          required: true,
          placeholder: "Gold",
        },
        {
          name: "category_desc",
          label: "Description",
          key: "category_desc",
          full: true,
          placeholder: "Gold donations - coins, biscuits, bars",
        },
        { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
      ]}
      stats={(rows) => [
        ["Total Categories", rows.length, "text-gray-900"],
        [
          "Active",
          rows.filter((r) => r.is_active).length,
          "text-emerald-600",
        ],
        [
          "Inactive",
          rows.filter((r) => !r.is_active).length,
          "text-gray-500",
        ],
        ["Types Mapped", categories.length ? categories.length : 0, "text-blue-600"],
      ]}
    />
  );
};

export default DonationCategoryMaster;
