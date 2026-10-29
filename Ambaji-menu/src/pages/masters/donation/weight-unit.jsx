import DonationApi from "../../services/donationapi";
import DonationMasterScreen from "./DonationMasterScreen";

/**
 * S04 - DONATION WEIGHT UNIT MASTER (Gram / Kilogram / Tola / Carat)
 */
const DonationWeightUnitMaster = ({ user }) => (
  <DonationMasterScreen
    title="Donation Weight Unit Master"
    subtitle="Weight units and their gram conversion factor"
    addLabel="Add Unit"
    api={{
      list: () => DonationApi.getWeightUnits(),
      create: (d) => DonationApi.createWeightUnit(d),
      update: (d) => DonationApi.updateWeightUnit(d),
      remove: (id) => DonationApi.deleteWeightUnit(id),
    }}
    columns={[
      { key: "unit_id", label: "#", render: (r) => r.unit_id },
      { key: "unit_name", label: "Unit Name" },
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
        name: "unit_name",
        label: "Unit Name",
        key: "unit_id",
        required: true,
        placeholder: "Gram",
        help: "Weight unit ka naam (conversion factor automatically set hota hai)",
      },
      { name: "is_active", label: "Status", type: "checkbox", defaultValue: true },
    ]}
    stats={(rows) => [
      ["Total Units", rows.length, "text-gray-900"],
      ["Active", rows.filter((r) => r.is_active).length, "text-emerald-600"],
      [
        "Inactive",
        rows.filter((r) => !r.is_active).length,
        "text-gray-500",
      ],
      ["Base Unit", "Gram", "text-blue-600"],
    ]}
  />
);

export default DonationWeightUnitMaster;
