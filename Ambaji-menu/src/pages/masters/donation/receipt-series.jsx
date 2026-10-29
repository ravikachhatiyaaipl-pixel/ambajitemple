import { useEffect, useState } from "react";
import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S09 - DONATION RECEIPT SERIES MASTER (category wise running number)
 */
const DonationReceiptSeriesMaster = ({ user }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    DonationApi.getCategories()
      .then((r) => setCategories(r?.data?.data || r?.data || []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <DonationMasterScreen
      title="Donation Receipt Series Master"
      subtitle="Category wise receipt numbering (GLD/2026/0001)"
      addLabel="Add Series"
      api={{
        list: () => DonationApi.getReceiptSeries(),
        create: (d) => DonationApi.createReceiptSeries(d),
        update: (d) => DonationApi.updateReceiptSeries(d),
        remove: async () => ({
          success: false,
          message: "Receipt series cannot be deleted - deactivate it instead",
        }),
      }}
      columns={[
        { key: "series_id", label: "#", render: (r) => r.series_id },
        {
          key: "category_name",
          label: "Category",
          render: (r) => r.category?.category_name || "--",
        },
        {
          key: "series_prefix",
          label: "Prefix",
          render: (r) => (
            <span className="font-mono text-sm font-semibold text-gray-900">
              {r.series_prefix}
            </span>
          ),
        },
        { key: "start_no", label: "Start No" },
        { key: "current_no", label: "Current No" },
        {
          key: "next_receipt",
          label: "Next Receipt",
          render: (r) => (
            <span className="font-mono text-xs text-blue-600">
              {r.series_prefix}
              {String(
                Math.max(Number(r.start_no || 1), Number(r.current_no || 0) + 1)
              ).padStart(4, "0")}
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
          key: "series_id",
          required: true,
          options: categories.map((c) => ({
            value: c.category_id,
            label: c.category_name,
          })),
        },
        {
          name: "series_prefix",
          label: "Series Prefix",
          required: true,
          placeholder: "GLD/2026/",
          help: "Receipt number is prefix + 4 digit running number",
        },
        {
          name: "start_no",
          label: "Start No",
          type: "number",
          min: "1",
          defaultValue: 1,
        },
        {
          name: "current_no",
          label: "Current No",
          type: "number",
          min: "0",
          defaultValue: 0,
        },
        { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
      ]}
      stats={(rows) => [
        ["Total Series", rows.length, "text-gray-900"],
        ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
        [
          "Total Receipts",
          rows.reduce((s, r) => s + Number(r.current_no || 0), 0),
          "text-blue-600",
        ],
        ["Categories", categories.length, "text-indigo-600"],
      ]}
    />
  );
};

export default DonationReceiptSeriesMaster;
